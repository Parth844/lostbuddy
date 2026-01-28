import requests
import os

FACE_ENGINE_URL = os.getenv("FACE_ENGINE_URL")

def match_face(image_bytes):
    response = requests.post(
        f"{FACE_ENGINE_URL}/match",
        files={"file": image_bytes}
    )
    response.raise_for_status()
    return response.json()