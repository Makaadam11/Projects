import nltk
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from check_sentiment_data import PredictorModel as BERT_model
import json
from datetime import datetime
from gevent.pywsgi import WSGIServer
from utils.deepface import DeepFaceModel
import threading


'''
import nltk
nltk.download('punkt')
nltk.download('wordnet')
nltk.download('omw-1.4')
'''
app = Flask(__name__)
socketio = SocketIO(app)

model = BERT_model()
preds_ = model.predict_chat_text_2("This is an initialization text !!!")

deepface_model = DeepFaceModel()

def check_sentiment(txt:str):
    # 0==Negative, 1==Neutral, 2==Positive
    prediction = model.predict_chat_text_2(txt)
    map_prediction = ["negative", "neutral", "positive"]
    data = {
        "neg": float(prediction[0][0]),
        "neu": float(prediction[0][1]),
        "pos": float(prediction[0][2]),
        "predicted": map_prediction[int(prediction[1])]
    }
    return data

@app.route('/')
def index():
    # return render_template('app.html')
    return render_template('index.html')

@socketio.on('message')
def handle_message(message):
    message = json.loads(message)
    msg = str(message["msg"])
    userID = int(message["userID"])
    pred_ = check_sentiment(msg)
    data = {"pred": True, "values": pred_, "isTyping": False, "msg": msg, "userID":userID, "msgTime": str(datetime.today().time()).split(".")[0]}

    # uncomment this if you want it to block negative messages from delivering
    # if pred_["predicted"] != "negative":
    #     emit('message', json.dumps(data), broadcast=True)
    emit('message', json.dumps(data), broadcast=True)  # comment this out if you uncomment the above

@socketio.on('typing')
def handle_typing(typing):
    typing = json.loads(typing)
    msg = str(typing["msg"])
    userID = int(typing["userID"])
    wordcount = msg.split(" ")
    data = {"pred": False, "values": {}, "isTyping": typing["isTyping"], "msg": msg, "userID":userID}
    if len(wordcount) > 2:
        pred_ = check_sentiment(msg)
        data = {"pred": True, "values": pred_, "isTyping": typing["isTyping"], "msg": msg, "userID":userID}
    # print(data)
    if pred_["predicted"] == "negative" and userID == userID:
        emit('alert_user_typing', json.dumps({"msg": "You are typing negative words!"}), broadcast=True)
    emit('user_typing', json.dumps(data), broadcast=True)

@socketio.on('alert_user_typing')
def alert_user_typing(alert):
    emit('alert_message', json.dumps(alert), broadcast=True)

@socketio.on('start_recording')
def start_recording():
    if not deepface_model.recording:
        deepface_model.recording = True
        threading.Thread(target=deepface_model.record_screen, daemon=True).start()
        emit('recording_started', json.dumps({"status": "Recording started"}))
    else:
        emit('recording_started', json.dumps({"status": "Already recording"}))

@socketio.on('stop_recording')
def stop_recording():
    if deepface_model.recording:
        deepface_model.stop_screen_recording()
        emit('recording_stopped', json.dumps({"status": "Recording stopped"}))
    else:
        emit('recording_stopped', json.dumps({"status": "Not recording"}))

if __name__ == '__main__':
    socketio.run(app, debug=True)
    #http_server = WSGIServer(('', 5000), app)
    #http_server.serve_forever()
