from app.models.base_model import BaseModel
from deepface import DeepFace

class DeepFaceModel(BaseModel):
    def __init__(self):
        pass

    def predict(self, image):
        # image: numpy array (frame)
        emotion_predictions = DeepFace.analyze(image, actions=['emotion'], enforce_detection=False)
        if isinstance(emotion_predictions, list):
            emotion = emotion_predictions[0]['emotion']
        else:
            emotion = emotion_predictions['emotion']
        return emotion