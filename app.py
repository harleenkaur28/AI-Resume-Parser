import streamlit as st
import pickle
import re
import os
import pandas as pd
import nltk
import spacy
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from PyPDF2 import PdfReader

nltk.download('punkt')
nltk.download('stopwords')
nlp = spacy.load('en_core_web_sm')
stop_words = set(stopwords.words('english'))

# Load classifier and transformer
clf = pickle.load(open('clf.pkl', 'rb'))
tfidfd = pickle.load(open('tfidf.pkl', 'rb'))


# Function to clean resume text
def cleanResume(txt):
    cleantxt = re.sub('https\S+', '', txt)
    cleantxt = re.sub(r'@\S+|#\S+', '', cleantxt)
    cleantxt = re.sub(r'[^\w\s]', '', cleantxt)

    doc = nlp(cleantxt)
    tokens = [token.lemma_.lower() for token in doc if token.text.lower() not in stop_words]

    return ' '.join(tokens)


# Function to extract text from a PDF file
def extract_text_from_pdf(uploaded_file):
    pdf_reader = PdfReader(uploaded_file)
    text = ''
    for page in pdf_reader.pages:
        text += page.extract_text()
    return text


# Function to predict category for each resume
def predict_category(cleaned_resume):
    input_features = tfidfd.transform([cleaned_resume])
    prediction_id = clf.predict(input_features)[0]

    category_mapping = {
        15: "Java Developer", 23: "Testing", 8: "DevOps Engineer", 20: "Python Developer",
        24: "Web Designing", 12: "HR", 13: "Hadoop", 3: "Blockchain", 10: "ETL Developer",
        18: "Operations Manager", 6: "Data Science", 22: "Sales", 16: "Mechanical Engineer",
        1: "Arts", 7: "Database", 11: "Electrical Engineering", 14: "Health and fitness",
        19: "PMO", 4: "Business Analyst", 9: "DotNet Developer", 2: "Automation Testing",
        17: "Network Security Engineer", 21: "SAP Developer", 5: "Civil Engineer", 0: "Advocate",
    }

    return category_mapping.get(prediction_id, "Unknown")


def main():
    cnt = 1
    st.title("Resume Analyser")

    st.markdown(
        """
        <style>
        .center-table {
            display: flex;
            justify-content: center;
        }
        </style>
        """, unsafe_allow_html=True
    )
    st.subheader("Upload Your Resume and get the Predicted Category")
    st.write("")
    uploaded_files = st.file_uploader('Upload Multiple Resume Files', type=['txt', 'pdf'],
                                      accept_multiple_files=True)

    if uploaded_files:
        st.write('')
        results = []

        for uploaded_file in uploaded_files:
            if uploaded_file.type == 'application/pdf':
                resume_text = extract_text_from_pdf(uploaded_file)
            else:
                try:
                    resume_bytes = uploaded_file.read()
                    resume_text = resume_bytes.decode('utf-8')
                except UnicodeDecodeError:
                    resume_text = resume_bytes.decode('latin-1')

            cleaned_resume = cleanResume(resume_text)
            predicted_category = predict_category(cleaned_resume)

            results.append({
                'S.No ': cnt,
                'File Name': uploaded_file.name,
                'Predicted Category': predicted_category
            })
            cnt += 1

        df = pd.DataFrame(results)
        st.markdown('<div class="center-table">', unsafe_allow_html=True)
        st.dataframe(df.reset_index(drop=True))
        st.markdown('</div>', unsafe_allow_html=True)


if __name__ == "__main__":
    main()