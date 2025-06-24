import numpy as np

import re
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer, PorterStemmer
from nltk import pos_tag, ne_chunk, wsd
from collections import Counter

# Transformers
from transformers import BertTokenizer, BertTokenizerFast
from transformers import TFBertModel

# tensorflow
import tensorflow as tf

import spacy
import emoji


def model_builder(bert_model, max_):
    options_ = tf.keras.optimizers.legacy.Adam(learning_rate=1e-5, decay=1e-7)
    loss = tf.keras.losses.CategoricalCrossentropy()
    accuracy = tf.keras.metrics.CategoricalAccuracy()

    input_ids = tf.keras.Input(shape=(max_,), dtype='int32')
    attention_masks = tf.keras.Input(shape=(max_,), dtype='int32')
    embeddings = bert_model([input_ids, attention_masks])[1]

    output = tf.keras.layers.Dense(3, activation="softmax")(embeddings)

    model = tf.keras.models.Model(inputs=[input_ids, attention_masks], outputs=output)
    model.compile(options_, loss=loss, metrics=accuracy)

    return model


class PredictorModel:
    def __init__(self, max_: int = 50):
        # initialize BERT
        self.bert_model = TFBertModel.from_pretrained('bert-base-uncased')
        # initialize lematizer
        self.lametizer = WordNetLemmatizer()
        # initialize max length
        self.MAX_LEN = max_
        # Load the saved model weights for prediction
        self.loaded_model = model_builder(self.bert_model, self.MAX_LEN)
        self.loaded_model.load_weights('saved_model_weights.h5')
        # Load tokenizer
        self.tokenizer = BertTokenizerFast.from_pretrained('tokenizer_1')

    def convert_emoji(self, text_):
        try:
            text_ = emoji.demojize(text_)
            text_ = text_.replace(":", "")
            text_ = text_.replace("_", " ")
            return text_
        except:
            return text_

    def clean_text(self, text_: str):
        try:
            text_ = re.sub('http\S+', '', text_)
            text_ = re.sub('@\S+', '', text_)
            text_ = re.sub('\\n', '', text_)
            text_ = text_.replace("RT ", "").strip()
            text_ = self.convert_emoji(text_)
            return text_
        except Exception as error:
            return text_

    def tokenize_2(self, data):
        input_id = []
        attention_mask = []
        for i in range(len(data)):
            encode = self.tokenizer.encode_plus(data[i], max_length=self.MAX_LEN, add_special_tokens=True,
                                           padding='max_length', return_attention_mask=True)
            input_id.append(encode["input_ids"])
            attention_mask.append(encode["attention_mask"])
        return np.array(input_id), np.array(attention_mask)

    # create predictor function using model and tokenizer
    def predict_chat_text_2(self, chat_text: str) -> list:
        # clean the text
        chat_text = self.clean_text(chat_text)
        # convert emoji
        chat_text = self.convert_emoji(chat_text)
        # break sentence into tokens
        chat_text = word_tokenize(chat_text)
        # lametize
        chat_text = [self.lametizer.lemmatize(token) for token in chat_text]
        # join list into sentence
        chat_text = " ".join(chat_text)
        # convert into number tokens
        txt_, txt_mask = self.tokenize_2([chat_text])
        text_clf = self.loaded_model.predict([txt_, txt_mask])
        y_pred_raveled = text_clf.ravel()[:3]
        predicted_class = np.argmax(y_pred_raveled)
        return list((y_pred_raveled, predicted_class))


# pred_ = PredictorModel().predict_chat_text_2("You are not showing the right attitude 😠")
#
# print(pred_)