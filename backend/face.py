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

