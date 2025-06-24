import time
from datetime import datetime
import cv2
from deepface import DeepFace

class DeepFaceModel:
    def __init__(self):
        self.isCapturing = False
        self.recording = False
        self.frames = []  # Poprawka: inicjalizujemy jako pustą listę

    def process_frame(self, frame):
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = []
        try:
            emotion_predictions = DeepFace.analyze(frame, actions=['emotion'], enforce_detection=False)
            if isinstance(emotion_predictions, list):
                emotion = emotion_predictions[0]['emotion']
            else:
                emotion = emotion_predictions['emotion']
            results.append({'emotion': emotion})
        except Exception as e:
            print(f"Error processing frame: {e}")
            return []
        return results

    def record_screen(self):
        interval = 0.15
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            print("Camera could not be opened.")
            return

        self.frames = []
        self.recording = True
        print("Recording started...")

        while self.recording:
            ret, frame = cap.read()
            if not ret:
                print("Failed to grab frame.")
                break
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")
            emotion_result = self.process_frame(frame)
            self.frames.append({
                'timestamp': timestamp,
                'emotion': emotion_result
            })
            time.sleep(interval)

        cap.release()
        print("Recording stopped.")

    def stop_screen_recording(self):
        self.recording = False
        self.save_to_excel()

    def save_to_excel(self, filename="emotion_log.xlsx"):
        import pandas as pd
        if not self.frames:
            print("No frames to save.")
            return
        data = []
        for entry in self.frames:
            timestamp = entry['timestamp']
            emotions = {}
            if entry['emotion'] and isinstance(entry['emotion'], list) and entry['emotion'][0] is not None:
                emotions = entry['emotion'][0]['emotion'] if entry['emotion'] else {}
            row = {'timestamp': timestamp}
            row.update(emotions)
            data.append(row)
        df = pd.DataFrame(data)
        df.to_excel(filename, index=False)
        print(f"Saved log to {filename}")