import numpy as np
from PIL import Image
from insightface.app import FaceAnalysis

app = FaceAnalysis(name="buffalo_s")
app.prepare(ctx_id=-1, det_size=(640, 640))

def get_embedding(image: Image.Image):
    faces = app.get(np.array(image))
    if not faces:
        return None
    return faces[0].embedding

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

