from fastapi import FastAPI, UploadFile, File, HTTPException
import os
import uuid

app = FastAPI(title="TMI Asset Reconstruction Engine", version="2.4.1A")

SUPPORTED_FILES = [".png", ".jpg", ".jpeg", ".webp", ".pdf", ".svg", ".psd", ".gif", ".mp4"]

def validate_input_file(filename: str):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in SUPPORTED_FILES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

@app.post("/api/v1/scan-host")
async def scan_host(file: UploadFile = File(...)):
    validate_input_file(file.filename)
    asset_id = f"host_{uuid.uuid4().hex[:8]}"
    return {"status": "success", "assetId": asset_id, "type": "HOST"}

@app.post("/api/v1/scan-avatar")
async def scan_avatar(file: UploadFile = File(...)):
    validate_input_file(file.filename)
    asset_id = f"avatar_{uuid.uuid4().hex[:8]}"
    return {"status": "success", "assetId": asset_id, "type": "AVATAR"}

@app.post("/api/v1/scan-prop")
async def scan_prop(file: UploadFile = File(...)):
    validate_input_file(file.filename)
    asset_id = f"prop_{uuid.uuid4().hex[:8]}"
    return {"status": "success", "assetId": asset_id, "type": "PROP"}

@app.post("/api/v1/scan-ui")
async def scan_ui(file: UploadFile = File(...)):
    validate_input_file(file.filename)
    return {"status": "success", "type": "UI_ELEMENT"}

@app.post("/api/v1/reconstruct-asset")
async def reconstruct_asset(file: UploadFile = File(...)):
    validate_input_file(file.filename)
    asset_id = f"recon_{uuid.uuid4().hex[:8]}"
    return {"status": "success", "assetId": asset_id, "type": "GENERAL_RECONSTRUCTION"}