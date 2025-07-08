from flask_socketio import Namespace
import json
from app.services.recording import RecordingService

class EventsNamespace(Namespace):
    def __init__(self, namespace):
        super().__init__(namespace)
        self.recording_service = RecordingService()

    def on_start_viewing(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        user_id = data.get('userID')
        
        emotions = {}
        
        self.recording_service.logger_manager.log_chat_event(
            user_id=user_id,
            event_type="start_viewing",
            individual_emotions=emotions,
            status="receiver",  # Zawsze receiver - oglądasz wiadomość partnera
            start_viewing_time=data.get('startViewingTime', ''),
            message=data.get('completeMessage', ''),  # Wiadomość partnera którą oglądasz
            action_by=user_id  # Kto wykonuje akcję
        )

    def on_end_viewing(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        user_id = data.get('userID')
        
        emotions = {}
        
        self.recording_service.logger_manager.log_chat_event(
            user_id=user_id,
            event_type="end_viewing",
            individual_emotions=emotions,
            status="receiver",  # Zawsze receiver - skończyłeś oglądać wiadomość partnera
            end_viewing_time=data.get('endViewingTime', ''),
            receiver_total_viewing_time=data.get('totalViewingTime', ''),
            message=data.get('message', ''),  # Aktualnie pisana wiadomość
            action_by=user_id
        )

    def on_start_sending(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        user_id = data.get('userID')
        
        emotions = {}
        
        self.recording_service.logger_manager.log_chat_event(
            user_id=user_id,
            event_type="start_sending",
            individual_emotions=emotions,
            status="sender",  # Zawsze sender - zaczynasz pisać wiadomość
            start_sending_time=data.get('startSendingTime', ''),
            message=data.get('message', ''),  # Aktualnie pisana wiadomość
            action_by=user_id
        )

    def on_end_sending(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        user_id = data.get('userID')
        
        emotions = {}
        
        self.recording_service.logger_manager.log_chat_event(
            user_id=user_id,
            event_type="end_sending",
            individual_emotions=emotions,
            status="sender",  # Zawsze sender - wysyłasz wiadomość
            end_sending=data.get('endSendingTime', ''),
            sender_total_sending_time=data.get('totalSendingTime', ''),
            complete_message=data.get('completeMessage', ''),
            message=data.get('completeMessage', ''),
            action_by=user_id
        )