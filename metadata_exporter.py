import json
import os

def export_lobby_metadata(scene_graph):
    """
    Writes the resulting Scene Graph JSON into the Next.js data directory
    for immediate consumption by the LobbyMetadataLoader.
    """
    export_root = os.getenv("TMI_EXPORT_ROOT", os.path.abspath(os.path.join(os.path.dirname(__file__), '../web/src/data')))
    export_dir = os.path.join(export_root, 'lobbies/generated')
    os.makedirs(export_dir, exist_ok=True)
    
    file_path = os.path.join(export_dir, f"{scene_graph['lobbyId']}.metadata.json")
    with open(file_path, "w") as f:
        json.dump(scene_graph, f, indent=2)
        
    return file_path