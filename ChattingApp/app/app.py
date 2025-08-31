from flask import Flask, app, render_template, request, jsonify
from flask_socketio import SocketIO
from app.services.recording import RecordingService
from app.services.sentiment import SentimentService
from app.services.sentiment_factory import SentimentStrategyFactory
from app.utils.translator_service import TranslatorService
from app.models import bert_model
from app.config.config import Config
from app.sockets.chat import ChatNamespace
from app.sockets.recording import RecordingNamespace
from app.sockets.events import EventsNamespace

def create_app():
    app = Flask(__name__)
    
    @app.route('/')
    def index():
        return render_template('index.html')
    
    return app

app = create_app()
socketio = SocketIO(app, cors_allowed_origins="*")

bert_model_instance = bert_model.BertModel(Config.MODEL_PATH, Config.TOKENIZER_PATH)
strategy = SentimentStrategyFactory.get_strategy("bert", model=bert_model_instance)
sentiment_service = SentimentService(strategy)

recording_service = RecordingService()
chat_manager = recording_service.chat_manager

translator_service = TranslatorService()

chat_namespace = ChatNamespace('/chat', sentiment_service, recording_service, translator_service)
recording_namespace = RecordingNamespace('/recording', recording_service)
events_namespace = EventsNamespace('/events', recording_service)

socketio.on_namespace(chat_namespace)
socketio.on_namespace(recording_namespace)
socketio.on_namespace(events_namespace)
translate_client = None


    
# if __name__ == '__main__':
#     socketio.run(app, debug=True, host='0.0.0.0', port=5000)