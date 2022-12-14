from flask import Flask, jsonify, request
import pickle as pkl
import pandas as pd
import numpy as np
import os
import json
from datetime import datetime
import requests
import re
import nltk
import textblob 
from textblob import TextBlob
import pickle as pkl
from IPython.display import display
from IPython.core.magic import register_line_cell_magic
nltk.download('wordnet')
nltk.download('omw-1.4')
nltk.download('punkt')
from nltk.stem import WordNetLemmatizer
from nltk.corpus import wordnet
from nltk.stem import PorterStemmer
from nltk.tokenize import word_tokenize
import lightgbm 
from lightgbm import LGBMRegressor
from sklearn.linear_model import LinearRegression
from sklearn.linear_model import ElasticNet
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score
import xgboost

app = Flask(__name__)

# Getting stock price changes (by percent of change), keys are stock tickers
lgbm_model = pkl.load(open('lgbm.pkl', 'rb'))
lr_model = pkl.load(open('LR.pkl', 'rb'))
rf_model = pkl.load(open('RF.pkl', 'rb'))
xgb_model = pkl.load(open('xgb.pkl', 'rb'))

'''
STATIC HELPERS
'''
# Lemmatizing the text
def lemmatize(text):
    words = nltk.word_tokenize(text)
    lem_words = [WordNetLemmatizer().lemmatize(s.lower()) for s in words]
    result = ' '.join(lem_words)
    return result

# Remove everything but the word stems for each word in the text
def stem(text):
    ps = PorterStemmer()
    words = nltk.word_tokenize(text)
    stemmed_words = [ps.stem(s) for s in words]
    result = ' '.join(stemmed_words)
    return result

# Remove Punctuation from the text
def removePunc(text):
    return re.sub(r'[^\w\s]', '', text)

def removeBreaks(text):
    text = text.replace('\\n', '')
    text = text.replace('\\t', '')
    text = text.replace('\\r', '')
    return text

def compute_finbert_probabilities(text):
  """
  Uses FinBERT via REST to compute the sentiment analysis logits
  given a string of text

  Return format:
  {"POSITIVE": number, "NEGATIVE": number, "NEUTRAL": number}
  """
  url = "https://finbert3.p.rapidapi.com/sentiment/en"

  payload = {"text": text}
  headers = {
    "content-type": "application/json",
    "X-RapidAPI-Key": os.environ.get('RAPID_API_KEY'),
    "X-RapidAPI-Host": "finbert3.p.rapidapi.com"
  }

  response = requests.request("POST", url, json=payload, headers=headers)

  res_dict = json.loads(response.text)
  return res_dict["sentiment_probabilities"]


# need to tokenize into sentences, feed that into textblob
# get sentences with < 2000 characters
def most_subjective(text):
  sentences = nltk.sent_tokenize(text)
  scores = []
  for sentence in sentences:
    subjectivity = TextBlob(sentence).sentiment.subjectivity
    scores.append((sentence, subjectivity))
  scores.sort(key = lambda x : x[1], reverse = True)
  total_char = 0
  text_sents = []
  for tup in scores:
    total_char += len(tup[0])
    if total_char < 2000:
      text_sents.append(tup[0])
    elif len(text_sents) > 0:
      break
  result = ' '.join(text_sents)
  return result

@app.route('/api/inference', methods=["POST"])
def inference():
    req = request.get_json(force=True)
    text = req.get('text', None) 
    model_type = req.get('modelType', None)

    nlp_text = most_subjective(text)
    nlp_text = lemmatize(text)
    nlp_text = stem(text)
    nlp_text = removePunc(text)
    sentiment_scores = compute_finbert_probabilities(nlp_text)
    positivity = sentiment_scores['POSITIVE']
    neutral = sentiment_scores['NEUTRAL']
    negativity = sentiment_scores['NEGATIVE']
    data = dict(positivity=positivity, neutral=neutral, negativity=negativity)
    df = pd.DataFrame(data, index=[0])
    print('NLP Analysis of 10-K Text')
    print(df)

    model = None
    print('Model: ' + model_type)
    if (model_type == 'Linear Regression'):
        model = lr_model
    elif (model_type == 'Random Forest'):
        model = rf_model
    elif (model_type == 'XGBoost'):
        model = xgb_model
    elif (model_type == 'Light Gradient Boosting Machine'):
        model = lgbm_model

    preds = model.predict(df).tolist()
    print(preds)
    return jsonify(data=preds)