from flask_socketio import Namespace
import json

class EventsNamespace(Namespace):
    def __init__(self, namespace, recording_service):
        super().__init__(namespace)
        self.recording_service = recording_service
        self._sending_active = set()  # int user_id
        self._viewing_active = set()  # int user_id

    def on_start_viewing(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        viewer_id = int(data.get('userID'))
        if viewer_id in self._viewing_active:
            return
        self._viewing_active.add(viewer_id)
        self.recording_service.logger_manager.log_chat_event(
            user_id=viewer_id,
            status="receiver",
            start_viewing_time=data.get('startViewingTime', ''),
            message=data.get('completeMessage', ''),
        )

    def on_end_viewing(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        viewer_id = int(data.get('userID'))
        self._viewing_active.discard(viewer_id)
        self.recording_service.logger_manager.log_chat_event(
            user_id=viewer_id,
            status="receiver",
            end_viewing_time=data.get('endViewingTime', ''),
            total_viewing_time=data.get('totalViewingTime', 0),
            message=data.get('message', ''),
        )

    def on_start_sending(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        sender_id = int(data.get('userID'))
        if sender_id in self._sending_active:
            return
        self._sending_active.add(sender_id)
        self.recording_service.logger_manager.log_chat_event(
            user_id=sender_id,
            status="sender",
            start_sending_time=data.get('startSendingTime', ''),
            message=data.get('message', ''),
        )

    def on_end_sending(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        sender_id = int(data.get('userID'))
        self._sending_active.discard(sender_id)
        self.recording_service.logger_manager.log_chat_event(
            user_id=sender_id,
            status="sender",
            end_sending_time=data.get('endSendingTime', ''),
            total_sending_time=data.get('totalSendingTime', 0),
            complete_message=data.get('completeMessage', ''),
            message=data.get('completeMessage', ''),
        )
    def on_cancel_sending(self, data):
        obj = json.loads(data) if isinstance(data, str) else data
        sender_id = int(obj.get('userID'))
        # zwolnij guard wysyłania (pojedyncza wiadomość została anulowana)
        self._sending_active.discard(sender_id)

        # zaloguj “zakończenie bez complete_message”
        self.recording_service.logger_manager.log_chat_event(
            user_id=sender_id,
            status="sender",
            end_sending_time=obj.get('endSendingTime', ''),
            total_sending_time=obj.get('totalSendingTime', 0),
            cancelled=True  # flaga pomocnicza w raporcie
        )