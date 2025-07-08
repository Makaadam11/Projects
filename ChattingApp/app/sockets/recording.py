from flask_socketio import Namespace, emit
import json
from app.services.recording import RecordingService

class RecordingNamespace(Namespace):
    def __init__(self, namespace):
        super().__init__(namespace)
        self.recording_service = RecordingService()

    def on_start_recording(self, data):
        user_id = data.get('userID')
        username = data.get('username')
        
        # Stwórz logger dla tego usera
        logger = self.recording_service.logger_manager.get_logger(user_id, username)
        
        if not self.recording_service.recording:
            import threading
            self.recording_service.recording = True
            # Przekaż user_id i username do record_screen
            threading.Thread(
                target=self.recording_service.record_screen, 
                args=(user_id, username), 
                daemon=True
            ).start()
            emit('recording_started', json.dumps({"status": "Recording started"}))
        else:
            emit('recording_started', json.dumps({"status": "Already recording"}))

    def on_stop_recording(self, data=None):
        if data is None:
            data = {}
        user_id = data.get('userID')
        
        if self.recording_service.recording:
            self.recording_service.stop_screen_recording(user_id)
            emit('recording_stopped', json.dumps({"status": "Recording stopped"}))
        else:
            emit('recording_stopped', json.dumps({"status": "Not recording"}))

    def on_current_message(self, data):
        user_id = data.get('userID')
        message = data.get('message', '')
        self.recording_service.update_current_message(user_id, message)