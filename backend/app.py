import os
import glob, cv2
from flask import Flask, request, render_template, url_for, jsonify
from app import run_model, draw_bboxes

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


# @app.route("/upload", methods=["POST"])
# def upload():
#     if "image" not in request.files:
#         return "No file part", 400
    
#     file = request.files["image"]
#     if file.filename == "":
#         return "No selected file", 400

#     # Clear previous uploads
#     if os.path.exists(UPLOAD_DIR):
#         for f in glob.glob(os.path.join(UPLOAD_DIR, "*")):
#             os.remove(f)
#     else:
#         os.makedirs(UPLOAD_DIR, exist_ok=True)

#     # Save new file
#     save_path = os.path.join(UPLOAD_DIR, file.filename)
#     file.save(save_path)

#     # RUN MODEL 
#     model_name = request.form.get("models")
#     conf_threshold = float(request.form.get("conf", 0.2))
#     font_scale = float(request.form.get("scale", 100))
#     img_width = float(request.form.get("img_width", 640))
#     img_height = float(request.form.get("img_height", 640))

#     boxes_xyxy, labels, confidences = run_model(model=model_name, w=img_width, h=img_height, img_path=save_path, thresholds=conf_threshold)

#     # Read image with OpenCV
#     img = cv2.imread(save_path)

#     # Draw bboxes
#     result_img, detection_items = draw_bboxes(img, font_scale, boxes_xyxy, labels, confidences)

#     # Save processed image to static/uploads
#     result_filename = "result_" + file.filename
#     result_path = os.path.join(UPLOAD_DIR, result_filename)
#     cv2.imwrite(result_path, result_img)

#     # Make it accessible to frontend
#     image_url = url_for("static", filename=f"uploads/{result_filename}")
#     return render_template("result.html", font_scale=font_scale, image_url=image_url, detections=detection_items, model_name=model_name, thresholds=conf_threshold)


@app.route("/upload", methods=["POST"])
def upload():
    if "image" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["image"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if os.path.exists(UPLOAD_DIR):
        for f in glob.glob(os.path.join(UPLOAD_DIR, "*")):
            os.remove(f)
    else:
        os.makedirs(UPLOAD_DIR, exist_ok=True)

    save_path = os.path.join(UPLOAD_DIR, file.filename)
    file.save(save_path)

    model_name = request.form.get("models")
    conf_threshold = float(request.form.get("conf", 0.2))
    font_scale = float(request.form.get("scale", 100))
    img_width = int(request.form.get("img_width", 640))
    img_height = int(request.form.get("img_height", 640))


    boxes_xyxy, labels, confidences = run_model(
        model=model_name,
        w=img_width,
        h=img_height,
        img_path=save_path,
        thresholds=conf_threshold
    )

    img = cv2.imread(save_path)
    result_img, detection_items = draw_bboxes(img, font_scale, boxes_xyxy, labels, confidences)

    result_filename = "result_" + file.filename
    result_path = os.path.join(UPLOAD_DIR, result_filename)
    cv2.imwrite(result_path, result_img)

    image_url = url_for("static", filename=f"uploads/{result_filename}", _external=True)

    return jsonify({
        "image_url": image_url,
        "detections": detection_items,
        "model_name": model_name,
        "thresholds": conf_threshold,
        "font_scale": font_scale,
        "width": img_width,
        "height": img_height,
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
