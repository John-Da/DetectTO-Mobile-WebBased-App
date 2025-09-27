import os
import cv2
from flask import Flask, request, jsonify
from app import run_model, draw_bboxes
import numpy as np
import base64

app = Flask(__name__, template_folder="app/templates", static_folder="app/static")

UPLOAD_DIR = os.path.join(app.static_folder, "uploads")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "app", "model_utils", "models")
if os.path.exists(MODEL_DIR):
    MODEL_LIST = os.listdir(MODEL_DIR)
else:
    MODEL_LIST = []


@app.route("/")
def home():
    # return render_template("index.html", model_list=MODEL_LIST)
    return jsonify({
        "models": MODEL_LIST,
    })

@app.route("/upload", methods=["POST"])
def upload():
    if "image" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Read file directly into memory
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)  # decode image

    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    # Get parameters
    model_name = request.form.get("models")
    conf_threshold = float(request.form.get("conf", 0.2))
    font_scale = float(request.form.get("scale", 100))
    img_width = int(request.form.get("img_width", 640))
    img_height = int(request.form.get("img_height", 640))

    # Run your model (you can pass the image directly if your model supports it)
    boxes_xyxy, labels, confidences = run_model(
        model=model_name,
        w=img_width,
        h=img_height,
        img=img,  # pass in-memory image
        thresholds=conf_threshold
    )

    result_img, detection_items = draw_bboxes(img, font_scale, boxes_xyxy, labels, confidences)

    _, buffer = cv2.imencode(".jpg", result_img)
    image_base64 = base64.b64encode(buffer).decode("utf-8")

    return jsonify({
        "image_base64": image_base64,
        "detections": detection_items,
        "model_name": model_name,
        "thresholds": conf_threshold,
        "font_scale": font_scale,
        "width": img_width,
        "height": img_height,
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
