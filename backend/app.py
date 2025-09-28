import os
import cv2
from flask import Flask, request, jsonify, render_template
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
    if request.accept_mimetypes.best == "application/json" or request.is_json:
        return jsonify({"models": MODEL_LIST})
    return render_template("index.html", model_list=MODEL_LIST)


@app.route("/upload", methods=["POST"])
def upload():
    # Parse inputs (works for JSON or FormData)
    data = request.get_json(silent=True) or request.form

    if "image" not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    # Decode image
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    # Extract parameters
    model_name = data.get("models")
    conf_threshold = float(data.get("conf"))
    font_scale = float(data.get("scale"))
    img_width = int(data.get("img_width"))
    img_height = int(data.get("img_height"))

    # Run detection
    boxes_xyxy, labels, confidences = run_model(
        model=model_name,
        w=img_width,
        h=img_height,
        img=img,
        thresholds=conf_threshold,
    )

    result_img, detection_items = draw_bboxes(img, font_scale, boxes_xyxy, labels, confidences)

    # Encode result
    _, buffer = cv2.imencode(".jpg", result_img)
    image_base64 = base64.b64encode(buffer).decode("utf-8")
    image_url = f"data:image/jpeg;base64,{image_base64}"

    # Decide response
    if request.accept_mimetypes.best == "application/json" or request.is_json:
        return jsonify({
            "image_base64": image_base64,
            "detections": detection_items,
            "model_name": model_name,
            "thresholds": conf_threshold,
            "font_scale": font_scale,
            "width": img_width,
            "height": img_height,
        })
    
    else:
        return render_template(
            "result.html",
            image_url=image_url,
            detections=detection_items,
            model_name=model_name,
            thresholds=conf_threshold,
            font_scale=font_scale,
        )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
