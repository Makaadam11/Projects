from flask import Flask, render_template
from flask_socketio import SocketIO
from chat.services.recording import RecordingService
from chat.services.sentiment import SentimentService
from chat.services.sentiment_factory import SentimentStrategyFactory
from chat.models import bert_model
from chat.config.config import Config
from chat.sockets.chat import ChatNamespace
from chat.sockets.recording import RecordingNamespace
from chat.sockets.events import EventsNamespace

def create_app():
    app = Flask(__name__)
    
    @app.route('/')
    def index():
        return render_template('index.html')
    
    return app

app = create_app()
socketio = SocketIO(app, cors_allowed_origins="*")

# Tylko sentiment dla chat
bert_model_instance = bert_model.BertModel(Config.MODEL_PATH, Config.TOKENIZER_PATH)
strategy = SentimentStrategyFactory.get_strategy("bert", model=bert_model_instance)
sentiment_service = SentimentService(strategy)

# Globalne serwisy (singleton)
recording_service = RecordingService()
chat_manager = recording_service.chat_manager

# Przekaż serwisy do namespace'ów
chat_namespace = ChatNamespace('/chat', sentiment_service, recording_service)
recording_namespace = RecordingNamespace('/recording', recording_service)
events_namespace = EventsNamespace('/events', recording_service)

# Rejestruj
socketio.on_namespace(chat_namespace)
socketio.on_namespace(recording_namespace)
socketio.on_namespace(events_namespace)

if __name__ == '__main__':
    socketio.run(app, debug=True, host='0.0.0.0', port=5000)