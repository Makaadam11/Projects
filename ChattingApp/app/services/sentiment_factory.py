from app.services.message_strategy import BertSentimentStrategy

class SentimentStrategyFactory:
    @staticmethod
    def get_strategy(strategy_type, model=None):
        if strategy_type == "bert":
            return BertSentimentStrategy(model)
        else:
            raise ValueError("Unknown strategy type")