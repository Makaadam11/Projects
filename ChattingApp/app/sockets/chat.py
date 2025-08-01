
from flask_socketio import Namespace, emit
import json

class ChatNamespace(Namespace):
    def __init__(self, namespace, sentiment_service, recording_service):
        super().__init__(namespace)
        self.sentiment_service = sentiment_service
        self.recording_service = recording_service

    def on_message(self, message):
        message = json.loads(message)
        msg = str(message["msg"])
        userID = int(message["userID"])
        pred_ = self.sentiment_service.analyze(msg)
        data = {
            "pred": True,
            "values": {
                "neg": float(pred_[0][0]),
                "neu": float(pred_[0][1]),
                "pos": float(pred_[0][2]),
                "predicted": ["negative", "neutral", "positive"][int(pred_[1])]
            },
            "isTyping": False,
            "msg": msg,
            "userID": userID
        }
        emit('message', json.dumps(data), broadcast=True)

    def on_typing(self, typing):
        typing = json.loads(typing)
        msg = str(typing["msg"])
        userID = int(typing["userID"])
        wordcount = msg.split(" ")
        data = {"pred": False, "values": {}, "isTyping": typing["isTyping"], "msg": msg, "userID": userID}
        if len(wordcount) > 1:
            pred_ = self.sentiment_service.analyze(msg)
            data = {
                "pred": True,
                "values": {
                    "neg": float(pred_[0][0]),
                    "neu": float(pred_[0][1]),
                    "pos": float(pred_[0][2]),
                    "predicted": ["negative", "neutral", "positive"][int(pred_[1])]
                },
                "isTyping": typing["isTyping"],
                "msg": msg,
                "userID": userID
            }
            self.sentiment_update(userID, data["values"])
            if data["values"]["predicted"] == "negative":
                emit('alert_user_typing', json.dumps({"msg": "You are typing negative words!"}), broadcast=True)
        emit('user_typing', json.dumps(data), broadcast=True)

    def alert_user_typing(self, alert):
        emit('alert_message', json.dumps(alert), broadcast=True)
        
    def sentiment_update(self, user_id, sentiment_data):
        self.recording_service.update_sentiment(user_id, sentiment_data)
        print(f"Updated sentiment for user {user_id}: {sentiment_data}")