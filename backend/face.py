import os
import numpy as np
from PIL import Image
from insightface.app import FaceAnalysis

# Configurable via env so the model and device can be swapped without code changes.
#   FACE_MODEL     — InsightFace model pack (e.g. buffalo_s, buffalo_l for higher accuracy)
#   FACE_CTX_ID    — -1 for CPU, 0+ to use a GPU (requires onnxruntime-gpu). The single
#                    biggest latency win for production is moving inference to a GPU.
#   FACE_DET_SIZE  — detector input size (square)
#   FACE_MIN_DET_SCORE / FACE_MIN_PX — quality gate thresholds (see get_primary_face)
MODEL_NAME = os.environ.get("FACE_MODEL", "buffalo_s")
CTX_ID = int(os.environ.get("FACE_CTX_ID", "-1"))
DET_SIZE = int(os.environ.get("FACE_DET_SIZE", "640"))
MIN_DET_SCORE = float(os.environ.get("FACE_MIN_DET_SCORE", "0.5"))
MIN_FACE_PX = int(os.environ.get("FACE_MIN_PX", "40"))

app = FaceAnalysis(name=MODEL_NAME)
app.prepare(ctx_id=CTX_ID, det_size=(DET_SIZE, DET_SIZE))


def get_embedding(image: Image.Image):
    faces = app.get(np.array(image))
    if not faces:
        return None
    return faces[0].embedding


def get_primary_face(image: Image.Image):
    """Return the largest face plus quality signals, or None if no face.

    Result dict: {embedding, det_score, width, height, quality_ok}.
    quality_ok is False when the detection confidence is low or the face is
    too small to embed reliably — callers can warn "photo too low quality"
    instead of returning empty/garbage matches.
    """
    faces = app.get(np.array(image))
    if not faces:
        return None
    # Pick the largest face by bbox area (most likely the subject).
    def area(f):
        x1, y1, x2, y2 = f.bbox
        return max(0, x2 - x1) * max(0, y2 - y1)
    face = max(faces, key=area)
    x1, y1, x2, y2 = face.bbox.astype(int).tolist()
    w, h = x2 - x1, y2 - y1
    det_score = float(getattr(face, "det_score", 1.0))
    quality_ok = det_score >= MIN_DET_SCORE and min(w, h) >= MIN_FACE_PX
    return {
        "embedding": face.embedding,
        "det_score": det_score,
        "width": w,
        "height": h,
        "quality_ok": quality_ok,
    }


def get_all_face_embeddings(image: Image.Image):
    """Detect ALL faces in an image and return their embeddings + bounding boxes."""
    faces = app.get(np.array(image))
    results = []
    for i, face in enumerate(faces):
        bbox = face.bbox.astype(int).tolist()  # [x1, y1, x2, y2]
        results.append({
            "face_index": i,
            "bbox": bbox,
            "embedding": face.embedding,
        })
    return results
