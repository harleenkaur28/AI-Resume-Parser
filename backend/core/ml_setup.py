import os
import pickle
import spacy
import nltk
from nltk.corpus import stopwords
from core.config import settings


nlp = None
stop_words = None
clf = None
tfidf_vectorizer = None


def load_ml_models():
    global nlp, stop_words, clf, tfidf_vectorizer

    if not os.path.exists(settings.NLTK_DATA_PATH):
        os.makedirs(settings.NLTK_DATA_PATH, exist_ok=True)
        print(f"Created NLTK data directory: {settings.NLTK_DATA_PATH}")

    if settings.NLTK_DATA_PATH not in nltk.data.path:
        nltk.data.path.append(settings.NLTK_DATA_PATH)

    try:
        nlp = spacy.load("en_core_web_sm")
        print("Spacy model 'en_core_web_sm' loaded successfully.")

    except OSError:
        print("Spacy model 'en_core_web_sm' not found. Downloading...")
        spacy.cli.download("en_core_web_sm")
        nlp = spacy.load("en_core_web_sm")
        print("Spacy model 'en_core_web_sm' downloaded and loaded successfully.")

    try:
        stopwords.words("english")

    except LookupError:
        print("NLTK stopwords not found. Downloading...")
        nltk.download("stopwords", download_dir=settings.NLTK_DATA_PATH)
        print("NLTK stopwords downloaded.")

    try:
        nltk.tokenize.punkt.PunktSentenceTokenizer()

    except LookupError:
        print("NLTK punkt not found. Downloading...")
        nltk.download("punkt", download_dir=settings.NLTK_DATA_PATH)
        print("NLTK punkt downloaded.")

    stop_words = set(stopwords.words("english"))
    print("NLTK resources loaded.")

    model_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "model")

    try:
        with open(os.path.join(model_dir, "best_model.pkl"), "rb") as f_clf:
            clf = pickle.load(f_clf)
        print("Classifier model 'best_model.pkl' loaded successfully.")

    except FileNotFoundError:

        print(
            f"Error: Classifier model 'best_model.pkl' not found in {model_dir}. Predictions will not work."
        )

    except Exception as e:

        print(f"Error loading classifier model: {e}. Predictions will not work.")

    try:
        with open(os.path.join(model_dir, "tfidf.pkl"), "rb") as f_tfidf:
            tfidf_vectorizer = pickle.load(f_tfidf)

        print("TF-IDF vectorizer 'tfidf.pkl' loaded successfully.")

    except FileNotFoundError:

        print(
            f"Error: TF-IDF vectorizer 'tfidf.pkl' not found in {model_dir}. Predictions will not work."
        )

    except Exception as e:

        print(f"Error loading TF-IDF vectorizer: {e}. Predictions will not work.")

    print("Finished loading all ML models and resources.")
