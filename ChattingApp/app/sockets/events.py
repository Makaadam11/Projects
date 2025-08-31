from flask_socketio import Namespace
import json

class EventsNamespace(Namespace):
    def __init__(self, namespace, recording_service):
        super().__init__(namespace)
        self.recording_service = recording_service

    def on_start_viewing(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        user_id = data.get('userID')
        
        emotions = {}
        
        self.recording_service.logger_manager.log_chat_event(
            user_id=user_id,
            individual_emotions=emotions,
            status="receiver",  # Zawsze receiver - oglądasz wiadomość partnera
            start_viewing_time=data.get('startViewingTime', ''),
            message=data.get('completeMessage', ''),  # Wiadomość partnera którą oglądasz
        )

    def on_end_viewing(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        user_id = data.get('userID')
        
        emotions = {}
        
        self.recording_service.logger_manager.log_chat_event(
            user_id=user_id,
            individual_emotions=emotions,
            status="receiver",  # Zawsze receiver - skończyłeś oglądać wiadomość partnera
            end_viewing_time=data.get('endViewingTime', ''),
            total_viewing_time=data.get('totalViewingTime', 0),
            message=data.get('message', ''),  # Aktualnie pisana wiadomość
        )

    def on_start_sending(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        user_id = data.get('userID')
        
        emotions = {}
        
        self.recording_service.logger_manager.log_chat_event(
            user_id=user_id,
            individual_emotions=emotions,
            status="sender",  # Zawsze sender - zaczynasz pisać wiadomość
            start_sending_time=data.get('startSendingTime', ''),
            message=data.get('message', ''),  # Aktualnie pisana wiadomość
        )

    def on_end_sending(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        user_id = data.get('userID')
        
        emotions = {}
        
        self.recording_service.logger_manager.log_chat_event(
            user_id=user_id,
            individual_emotions=emotions,
            status="sender",  # Zawsze sender - wysyłasz wiadomość
            end_sending_time=data.get('endSendingTime', ''),
            total_sending_time=data.get('totalSendingTime', 0),
            complete_message=data.get('completeMessage', ''),
            message=data.get('completeMessage', ''),
        )