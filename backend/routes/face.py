from fastapi import APIRouter, UploadFile, File
from services.face_engine_client import match_face

router = APIRouter(prefix="/face", tags=["Face"])

@router.post("/search")
async def search_face(file: UploadFile = File(...)):
    image_bytes = await file.read()
    result = match_face(image_bytes)
    return result