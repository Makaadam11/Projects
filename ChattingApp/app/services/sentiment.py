class SentimentService:
    def __init__(self, model):
        self.model = model

    def analyze(self, text):
        return self.model.predict(text)