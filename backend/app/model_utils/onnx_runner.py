import os
import cv2 as cv
import onnxruntime as ort
import numpy as np

from .coco_labels import cocolabels
from .nms_filter import nms_numpy

MODEL_FOLDER = os.path.join(os.path.dirname(__file__), "models")
MODEL_DIR = os.listdir(MODEL_FOLDER)
# print(MODEL_DIR)

def run_model(model, thresholds, w,h, img=None):
    if model in MODEL_DIR:
        model = os.path.join(MODEL_FOLDER, model)

    if img is not None:
        image = img.copy()
    else:
        raise ValueError("Either img_path or img must be provided")
    
    # img_resized = cv.resize(image, (640, 640))
    img_resized = cv.resize(image, (w, h))

    input_img = img_resized / 255.0
    input_img = input_img.transpose(2, 0, 1)
    input_tensor = input_img[np.newaxis, :, :, :].astype(np.float32)

    # session = ort.InferenceSession(model, providers=ort.get_available_providers())
    session = ort.InferenceSession(model, providers=["CPUExecutionProvider"])
    input_name = session.get_inputs()[0].name
    results = session.run(None, {input_name: input_tensor})
    predictions = results[0]
    predictions = np.squeeze(predictions)

    # --- Split boxes and scores ---
    boxes_xywh = predictions[:4, :].T   # (8400, 4)
    scores_all = predictions[4:, :].T   # (8400, num_classes)

    # Best class per prediction
    class_ids = np.argmax(scores_all, axis=1)
    confidences = np.max(scores_all, axis=1)

    # Apply confidence threshold before NMS
    conf_thresh = thresholds
    mask = confidences > conf_thresh
    boxes_xywh = boxes_xywh[mask]
    class_ids = class_ids[mask]
    confidences = confidences[mask]

    # Convert xywh → xyxy (needed for NMS)
    boxes_xyxy_temp = np.zeros_like(boxes_xywh)
    boxes_xyxy_temp[:, 0] = boxes_xywh[:, 0] - boxes_xywh[:, 2] / 2
    boxes_xyxy_temp[:, 1] = boxes_xywh[:, 1] - boxes_xywh[:, 3] / 2
    boxes_xyxy_temp[:, 2] = boxes_xywh[:, 0] + boxes_xywh[:, 2] / 2
    boxes_xyxy_temp[:, 3] = boxes_xywh[:, 1] + boxes_xywh[:, 3] / 2

    # --- Run NMS ---
    keep = nms_numpy(boxes_xyxy_temp, confidences, thresholds)

    boxes_xywh = boxes_xywh[keep]
    class_ids = class_ids[keep]
    confidences = confidences[keep]

    # Debugging: Print class_ids that are out of range
    coco_labels = cocolabels()
    out_of_range_indices = [i for i, cls_id in enumerate(class_ids) if cls_id >= len(coco_labels)]
    if out_of_range_indices:
        print("Class IDs out of range:", [class_ids[i] for i in out_of_range_indices])


    # Scale bbox to original img shape
    img_height, img_width = image.shape[:2]
    input_height, input_width = img_resized.shape[:2]

    scale_x = img_width / input_width
    scale_y = img_height / input_height

    # Convert to xyxy
    boxes_xyxy = np.zeros_like(boxes_xywh)
    boxes_xyxy[:, 0] = (boxes_xywh[:, 0] - boxes_xywh[:, 2] / 2) * scale_x # x1
    boxes_xyxy[:, 1] = (boxes_xywh[:, 1] - boxes_xywh[:, 3] / 2) * scale_y # y1
    boxes_xyxy[:, 2] = (boxes_xywh[:, 0] + boxes_xywh[:, 2] / 2) * scale_x # x2
    boxes_xyxy[:, 3] = (boxes_xywh[:, 1] + boxes_xywh[:, 3] / 2) * scale_y # y2

    # Draw boxesE
    labels = [coco_labels[cls_id] for cls_id in class_ids]
    
    return boxes_xyxy, labels, confidences


