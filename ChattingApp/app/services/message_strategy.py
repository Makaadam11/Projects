from abc import ABC, abstractmethod

class SentimentStrategy(ABC):
    @abstractmethod
    def predict(self, text):
        pass

class BertSentimentStrategy(SentimentStrategy):
    def __init__(self, model):
        self.model = model

    def predict(self, text):
        return self.model.predict(text)