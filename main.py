from fastapi import FastAPI, UploadFile, File, HTTPException
import os
from scene_graph_builder import generate_scene_graph
from metadata_exporter import export_lobby_metadata
import uuid

app = FastAPI(title="TMI Procedural Lobby Scanner", version="2.4.0")

SUPPORTED_FILES = [".png", ".jpg", ".jpeg", ".webp", ".pdf", ".svg"]

def validate_input_file(filename: str):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in SUPPORTED_FILES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

@app.post("/api/v1/scan-lobby")
async def scan_lobby_image(file: UploadFile = File(...)):
    """
    Ingests a stock image of a venue/lobby and orchestrates the
    MiDaS (depth) and SAM (segmentation) pipelines to output a Scene Graph.
    """
    validate_input_file(file.filename)

    # Generate a unique ID for this generated lobby
    lobby_id = f"gen_lobby_{uuid.uuid4().hex[:8]}"
    
    # 1. Process image through pipeline
    scene_graph = generate_scene_graph(lobby_id, file.filename)
    
    # 2. Export to shared web data directory
    export_path = export_lobby_metadata(scene_graph)
    
    return {"status": "success", "lobbyId": lobby_id, "exportPath": export_path, "graph": scene_graph}