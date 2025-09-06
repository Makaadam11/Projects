from itertools import count
from flask_socketio import Namespace, emit
from flask import request
from app.services.recording import RecordingService
from app.utils.translator_service import TranslatorService
import json

class ChatNamespace(Namespace):
    def __init__(self, namespace, sentiment_service, recording_service: RecordingService, translator_service: TranslatorService):
        super().__init__(namespace)
        self.sentiment_service = sentiment_service
        self.recording_service = recording_service
        self.translator_service = translator_service
        self._warn_counts = {}
        self._corr_counts = {}

    def on_set_language(self, payload):
        try:
            data = json.loads(payload) if isinstance(payload, str) else payload
        except Exception:
            data = {}
        user_id = data.get("userID")
        lang = (data.get("language") or "").lower()
        if isinstance(user_id, int):
            self.translator_service.set_language(user_id, lang)
            emit("language_set", json.dumps({
                "userID": user_id,
                "language": self.translator_service.get_language(user_id)
            }), room=request.sid)

    def on_message(self, message):
        msg_obj = json.loads(message) if isinstance(message, str) else message
        msg = str(msg_obj.get("msg", ""))
        user_id = int(msg_obj.get("userID"))
        username = str(msg_obj.get("username", ""))
        msg_time = str(msg_obj.get("msgTime", ""))
        pred = self.sentiment_service.analyze(msg)
        translations = self.translator_service.build_translations_map(msg)
        payload = {
            "pred": True,
            "values": {
                "neg": float(pred[0][0]),
                "neu": float(pred[0][1]),
                "pos": float(pred[0][2]),
                "predicted": ["negative", "neutral", "positive"][int(pred[1])]
            },
            "isTyping": False,
            "msg": msg,
            "userID": user_id,
            "username": username,
            "msgTime": msg_time,
            "translations": translations
        }
        emit("message", json.dumps(payload), broadcast=True)

    def on_typing(self, raw):
        obj = json.loads(raw) if isinstance(raw, str) else raw
        msg = str(obj.get("msg", ""))
        if not msg.strip():
            return
        text_en = self.translator_service.text_for_bert(msg)
        final_msg = text_en if text_en and text_en != "PLEASE SELECT TWO DISTINCT LANGUAGES" else msg
        user_id = int(obj.get("userID"))
        is_typing = bool(obj.get("isTyping"))
        print(f"[typing] user={user_id} isTyping={is_typing} msg='{final_msg}'")
        data = {"pred": False, "values": {}, "isTyping": is_typing, "msg": final_msg, "userID": user_id}

        pred = self.sentiment_service.analyze(final_msg)
        values = {
            "neg": float(pred[0][0]),
            "neu": float(pred[0][1]),
            "pos": float(pred[0][2]),
            "predicted": ["negative", "neutral", "positive"][int(pred[1])]
        }
        data.update({"pred": True, "values": values})
        self.recording_service.update_sentiment(user_id, values)
        if float(values["neg"]) >= 0.31:
            print(f"[typing] user={user_id} sentiment={values}")
            self._warn_counts[user_id] = self._warn_counts.get(user_id, 0) + 1
            self.recording_service.logger_manager.log_chat_event(
                user_id=user_id,
                warnings_count=self._warn_counts[user_id],
            )
            emit("alert_user_typing", json.dumps({"msg": "You are typing negative words!"}), room=request.sid)
        emit("user_typing", json.dumps(data), broadcast=True)

    def on_correction(self, raw):
        obj = json.loads(raw) if isinstance(raw, str) else raw
        user_id = int(obj.get("userID"))
        self._corr_counts[user_id] = int(obj.get("correctionsCount"))
        self.recording_service.logger_manager.log_chat_event(
            user_id=user_id,
            corrections_count=self._corr_counts[user_id],
        )
        emit("correction_acknowledged", json.dumps({"msg": "Correction noted. Warning count reset."}), room=request.sid)
    
    def on_enable_analysis(self, raw):
        data = json.loads(raw) if isinstance(raw, str) else raw or {}
        try:
            user_id = int(data.get('userID'))
        except Exception:
            return

        v = data.get('enabled', False)
        enabled = v if isinstance(v, bool) else str(v).strip().lower() in ("1", "true", "yes", "on")

        partner_id = self.recording_service.chat_manager.get_partner_id(user_id)
        print(f'[chat] enable_analysis enable={enabled} user={user_id} partner={partner_id} sid={request.sid}')

        if partner_id:
            emit('enable_analysis', {'userID': partner_id, 'enabled': enabled}, broadcast=True)
        else:
            print(f'[chat] enable_analysis no partner for user={user_id}')

    def alert_user_typing(self, alert):
        emit('alert_message', json.dumps(alert), broadcast=True)
        
    def sentiment_update(self, user_id, sentiment_data):
        self.recording_service.update_sentiment(user_id, sentiment_data)
        print(f"Updated sentiment for user {user_id}: {sentiment_data}")