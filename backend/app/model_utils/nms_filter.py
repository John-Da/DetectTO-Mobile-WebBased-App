import numpy as np

def nms_numpy(boxes, scores, iou_thres=0.5):
    """
    Perform Non-Maximum Suppression (NMS) using pure NumPy.

    Args:
        boxes (ndarray): (N, 4) array of boxes in [x1, y1, x2, y2] format.
        scores (ndarray): (N,) confidence scores.
        iou_thres (float): IoU threshold for suppression.

    Returns:
        keep (list): indices of boxes to keep.
    """
    if len(boxes) == 0:
        return []

    x1 = boxes[:, 0]
    y1 = boxes[:, 1]
    x2 = boxes[:, 2]
    y2 = boxes[:, 3]

    areas = (x2 - x1 + 1) * (y2 - y1 + 1)
    order = scores.argsort()[::-1]  # sort by confidence (desc)

    keep = []
    while order.size > 0:
        i = order[0]
        keep.append(i)

        # compute IoU of the rest with the best box
        xx1 = np.maximum(x1[i], x1[order[1:]])
        yy1 = np.maximum(y1[i], y1[order[1:]])
        xx2 = np.minimum(x2[i], x2[order[1:]])
        yy2 = np.minimum(y2[i], y2[order[1:]])

        w = np.maximum(0.0, xx2 - xx1 + 1)
        h = np.maximum(0.0, yy2 - yy1 + 1)
        inter = w * h

        iou = inter / (areas[i] + areas[order[1:]] - inter)

        inds = np.where(iou <= iou_thres)[0]
        order = order[inds + 1]

    return keep