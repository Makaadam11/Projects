from flask_socketio import Namespace, emit
from flask import request
import json
from app.services.recording import RecordingService

class RecordingNamespace(Namespace):
    def __init__(self, namespace, recording_service: RecordingService):
        super().__init__(namespace)
        self.recording_service = recording_service
        self.waiting = []

    def on_start_recording(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        user_id = int(data.get('userID'))
        username = data.get('username') or f'User-{user_id}'
        print(f'[recording] start_recording user={user_id} sid={request.sid}')
        self.recording_service.start_session(user_id, request.sid)

        self.waiting = [w for w in self.waiting if w.get('sid') != request.sid]
        if self.waiting:
            partner = self.waiting.pop(0)
            print(f'[recording] pairing {user_id} <-> {partner["user_id"]}')
            self.recording_service.pair_users(user_id, username, partner['user_id'], partner['username'])
            emit('paired', {'partnerID': partner['user_id'], 'partnerName': partner['username']}, room=request.sid)
            emit('paired', {'partnerID': user_id, 'partnerName': username}, room=partner['sid'])
            emit('recording_started', {'userID': user_id}, room=request.sid)
            emit('recording_started', {'userID': partner['user_id']}, room=partner['sid'])
        else:
            self.waiting.append({'sid': request.sid, 'user_id': user_id, 'username': username})
            print(f'[recording] queued user={user_id}; waiting size={len(self.waiting)}')
            emit('waiting_for_partner', {'message': 'Waiting for another user to join...'}, room=request.sid)

    def on_frame(self, data):
        obj = json.loads(data) if isinstance(data, str) else data
        user_id = int(obj.get('userID'))
        frame_b64 = obj.get('frame', '')
        self.recording_service.ingest_frame_b64(user_id, request.sid, frame_b64)

    def on_stop_recording(self, data):
        data = json.loads(data) if isinstance(data, str) else data
        user_id = int(data.get('userID'))
        print(f'[recording] stop_recording user={user_id} sid={request.sid}')

        saved = self.recording_service.stop_session(user_id)

        partner_id = self.recording_service.logger_manager.partners.get(user_id)
        partner_sid = None
        if partner_id:
            sess = self.recording_service.sessions.get(partner_id)
            partner_sid = (sess or {}).get('sid')
            try:
                self.recording_service.stop_session(partner_id)
            except Exception:
                pass

        emit('recording_stopped', {'userID': user_id, 'saved_files': saved}, room=request.sid)
        if partner_sid:
            emit('recording_stopped', {'userID': partner_id, 'saved_files': []}, room=partner_sid)

    def on_current_message(self, data):
        user_id = data.get('userID')
        message = data.get('message', '')
        self.recording_service.update_current_message(user_id, message)

    def on_disconnect(self):
        self.waiting = [w for w in self.waiting if w.get('sid') != request.sid]
        print(f'[recording] disconnect sid={request.sid}, waiting size={len(self.waiting)}')