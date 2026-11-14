import base64
import json
import cv2
import numpy as np
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from core.vision_engine import NeuroVisionEngine

router = APIRouter()
engine = NeuroVisionEngine()


@router.websocket("/ws/analyze")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            frame_data = payload.get("image")

            if not frame_data:
                continue

            encoded_data = frame_data.split(",")[1] if "," in frame_data else frame_data
            np_arr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if frame is None:
                continue

            result = engine.process_frame(frame)

            if result:
                await websocket.send_text(json.dumps({
                    "status": "success",
                    "scores": result["scores"],
                    "feedback": result["feedback"]
                }))
            else:
                await websocket.send_text(json.dumps({
                    "status": "no_face_detected"
                }))

    except WebSocketDisconnect:
        print("Client disconnected.")