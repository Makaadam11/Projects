from flask_socketio import Namespace, emit
from flask import request
from app.utils.translator_service import TranslatorService
import json

class ChatNamespace(Namespace):
    def __init__(self, namespace, sentiment_service, recording_service, translator_service: TranslatorService):
        super().__init__(namespace)
        self.sentiment_service = sentiment_service
        self.recording_service = recording_service
        self.translator_service = translator_service

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
        user_id = int(obj.get("userID"))
        is_typing = bool(obj.get("isTyping"))
        data = {"pred": False, "values": {}, "isTyping": is_typing, "msg": msg, "userID": user_id}

        if len(msg.split()) > 1:
            pred = self.sentiment_service.analyze(msg)
            values = {
                "neg": float(pred[0][0]),
                "neu": float(pred[0][1]),
                "pos": float(pred[0][2]),
                "predicted": ["negative", "neutral", "positive"][int(pred[1])]
            }
            data.update({"pred": True, "values": values})
            self.recording_service.update_sentiment(user_id, values)
            if values["predicted"] == "negative":
                emit("alert_user_typing", json.dumps({"msg": "You are typing negative words!"}), broadcast=True)

        emit("user_typing", json.dumps(data), broadcast=True)

    def alert_user_typing(self, alert):
        emit('alert_message', json.dumps(alert), broadcast=True)
        
    def sentiment_update(self, user_id, sentiment_data):
        self.recording_service.update_sentiment(user_id, sentiment_data)
        print(f"Updated sentiment for user {user_id}: {sentiment_data}")