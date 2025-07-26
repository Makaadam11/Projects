from abc import ABC, abstractmethod

class BaseModel(ABC):
    @abstractmethod
    def predict(self, text):
        """Predict sentiment or emotion for the given text."""
        pass