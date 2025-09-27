def draw_bboxes(img, font_scaler, boxes_xyxy, labels, confidences):
    from collections import defaultdict
    import cv2

    h, w = img.shape[:2]
    thickness = max(2, int(min(h, w) / 200))
    font_scale = min(h, w) / font_scaler
    font_thickness = max(1, thickness // 2)

    label_counts = defaultdict(int)
    detection_items = []

    for i, ((x1, y1, x2, y2), label, conf) in enumerate(zip(boxes_xyxy, labels, confidences)):
        x1, y1, x2, y2 = map(int, [x1, y1, x2, y2])
        label_counts[label] += 1
        idx = label_counts[label]

        # convert conf to Python float
        detection_items.append({
            "label": label,
            "idx": idx,
            "confidence": float(conf)
        })

        text = f"{label} {idx}: {conf:.2f}"
        # compute text size
        (text_width, text_height), baseline = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, font_scale, font_thickness)
        padding = max(5, thickness)

        # position text inside top-left of box
        text_x = x1 + padding
        text_y = y1 + padding + text_height

        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), thickness)
        cv2.putText(img, text, (text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 0, 0), font_thickness)
        
    return img, detection_items
