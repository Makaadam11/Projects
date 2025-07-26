from chat.models.bert_model import BertModel
from chat.models.deepface_model import DeepFaceModel
from chat.config.config import Config

class ModelFactory:
    @staticmethod
    def create_model(model_type):
        if model_type == "bert":
            return BertModel(Config.MODEL_PATH, Config.TOKENIZER_PATH)
        elif model_type == "deepface":
            return DeepFaceModel()
        else:
            raise ValueError(f"Unknown model type: {model_type}")