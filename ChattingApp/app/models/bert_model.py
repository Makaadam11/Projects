import numpy as np
import re
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from transformers import BertTokenizerFast, TFBertModel
import tensorflow as tf
import emoji

from app.models.base_model import BaseModel

def model_builder(bert_model, max_):
    options_ = tf.keras.optimizers.legacy.Adam(learning_rate=1e-5, decay=1e-7)
    loss = tf.keras.losses.CategoricalCrossentropy()
    accuracy = tf.keras.metrics.CategoricalAccuracy()

    input_ids = tf.keras.Input(shape=(max_,), dtype='int32')
    attention_masks = tf.keras.Input(shape=(max_,), dtype='int32')
    embeddings = bert_model([input_ids, attention_masks])[1]

    output = tf.keras.layers.Dense(3, activation="softmax")(embeddings)

    model = tf.keras.models.Model(inputs=[input_ids, attention_masks], outputs=output)
    model.compile(options_, loss=loss, metrics=accuracy, run_eagerly=True)

    return model

class BertModel(BaseModel):
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self, model_path, tokenizer_path, max_len=50):
        self.bert_model = TFBertModel.from_pretrained('bert-base-uncased')
        self.lametizer = WordNetLemmatizer()
        self.MAX_LEN = max_len
        self.loaded_model = model_builder(self.bert_model, self.MAX_LEN)
        self.loaded_model.load_weights(model_path)
        self.tokenizer = BertTokenizerFast.from_pretrained(tokenizer_path)

    def convert_emoji(self, text_):
        try:
            text_ = emoji.demojize(text_)
            text_ = text_.replace(":", "")
            text_ = text_.replace("_", " ")
            return text_
        except Exception:
            return text_

    def clean_text(self, text_: str):
        try:
            text_ = re.sub('http\S+', '', text_)
            text_ = re.sub('@\S+', '', text_)
            text_ = re.sub('\\n', '', text_)
            text_ = text_.replace("RT ", "").strip()
            text_ = self.convert_emoji(text_)
            return text_
        except Exception:
            return text_

    def tokenize_2(self, data):
        input_id = []
        attention_mask = []
        for i in range(len(data)):
            encode = self.tokenizer.encode_plus(
                data[i], max_length=self.MAX_LEN, add_special_tokens=True,
                padding='max_length', return_attention_mask=True
            )
            input_id.append(encode["input_ids"])
            attention_mask.append(encode["attention_mask"])
        return np.array(input_id), np.array(attention_mask)

    def predict(self, chat_text: str):
        chat_text = self.clean_text(chat_text)
        chat_text = self.convert_emoji(chat_text)
        chat_text = word_tokenize(chat_text)
        chat_text = [self.lametizer.lemmatize(token) for token in chat_text]
        chat_text = " ".join(chat_text)
        txt_, txt_mask = self.tokenize_2([chat_text])
        text_clf = self.loaded_model.predict([txt_, txt_mask])
        y_pred_raveled = text_clf.ravel()[:3]
        predicted_class = np.argmax(y_pred_raveled)
        return list((y_pred_raveled, predicted_class))