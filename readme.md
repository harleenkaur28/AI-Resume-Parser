# AI Resume Analyzer & Job Matching Platform

<div align="center">
  <img src="./frontend/logo.svg" alt="Project Logo" width="150"/>
</div>

<p align="center">
  <strong>Connecting talent to opportunity, intelligently.</strong>
</p>

<p align="center">
  <a href="#introduction">Introduction</a> •
  <a href="#key-features">Key Features</a> •
  <a href="#live-demo">Live Demo</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
</p>

---

## Introduction

In today's competitive job market, the hiring process is broken for everyone. Recruiters are inundated with an average of **49 applications per job**, making manual screening impossible. Meanwhile, job seekers face the "ATS black box," where **93% of employers** use systems that often reject qualified candidates based on simple formatting.

This project is an AI-powered, dual-sided platform designed to solve this problem. It provides job seekers with powerful tools for resume analysis and career path prediction, while simultaneously offering employers a curated dashboard of perfectly matched, pre-vetted talent. We transform a chaotic process into an intelligent and efficient ecosystem.

## Key Features

### For Job Seekers (Empowering Your Career)

- **AI-Powered Resume Analysis:** Get instant, actionable feedback on your resume to optimize it for both Applicant Tracking Systems (ATS) and human recruiters.
- **Career Path Prediction:** Our machine learning models analyze your skills and experience to predict the job fields where you'll be most successful.
- **Multi-Format & Bulk Upload:** Upload a single PDF, TXT, or even a **ZIP file** containing multiple resumes—perfect for managing different versions.
- **Unlimited & Free Access:** Our core analysis tools are free and unlimited to ensure every job seeker has the resources to succeed.

### For Employers (Streamlining Your Hiring)

- **Intuitive Talent Dashboard:** Access a centralized dashboard of pre-analyzed and ranked candidates, turning a pile of resumes into a prioritized shortlist.
- **Efficient Bulk Processing:** Save countless hours by uploading hundreds of resumes at once via a single ZIP file. Our system handles the unpacking, parsing, and analysis automatically.
- **Reduced Time-to-Hire:** Quickly identify the most relevant, high-quality talent to drastically shorten your recruitment cycle and improve the quality of hires.

## Live Demo

<!--
  TODO: Add a link to your live deployed application.
  For example:
  [Check out the live platform here!](https://your-app-url.com)
-->

<a href="#" target="_blank">
  <img src=".github/screenshot-dashboard.png" alt="Application Screenshot" />
</a>

## Technical Architecture

Our platform is built on a modern, scalable microservices architecture to ensure high performance, security, and maintainability.

<div align="center">
  <img src=".github/architecture-diagram.png" alt="Architecture Diagram" width="800"/>
</div>

- **Frontend:** A responsive and interactive web application built with **Next.js** and **Tailwind CSS**, providing a seamless user experience.
- **Backend:** A high-performance API built with **FastAPI (Python)** handles business logic, user authentication, and data processing.
- **AI/ML Service:** A dedicated microservice orchestrates our AI pipeline using **LangChain**. It leverages **NLP** models (like spaCy) for information extraction, **Machine Learning** models (Scikit-learn) for prediction, and **Generative AI** for nuanced analysis.
- **Database:** A robust **PostgreSQL** database securely stores all user data, extracted resume information, and predictions.
- **Deployment:** The entire application is containerized using **Docker** and deployed on a cloud platform like AWS for scalability and reliability.

## Tech Stack

- **Frontend:** Next.js, React, Tailwind CSS, Framer Motion, Chart.js
- **Backend & Database:** Python, FastAPI, PostgreSQL, SQLAlchemy
- **AI/ML:** scikit-learn, spaCy, LangChain
- **Deployment:** Docker, AWS

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your system:

- [Git](https://git-scm.com/)
- [Python 3.9+](https://www.python.org/downloads/)
- [bun.sh](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/download/)
- [Docker Desktop (adviced for better DX)]()

### Installation & Setup

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/harleenkaur28/AI-Resume-Parser.git
    cd AI-Resume-Parser
    ```

2.  **Setup the Backend (FastAPI):**

    ```sh
    # Navigate to the backend directory
    cd backend

    # Create and activate a virtual environment
    python -m venv venv
    source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

    # Install dependencies
    pip install .

    # Create a .env file from the example
    cp .env.example .env
    ```

    Now, open the `.env` file and add your PostgreSQL database URL and other environment variables.

3.  **Setup the Frontend (Next.js):**

    ```sh
    # Navigate to the frontend directory from the root
    cd frontend

    # Install dependencies
    npm install
    ```

### Running the Application

1.  **Start the Backend Server:**
    From the `/backend` directory, with your virtual environment activated:

    ```sh
    uvicorn app.main:app --reload
    ```

    The backend API will be running on `http://127.0.0.1:8000`.

2.  **Start the Frontend Development Server:**
    From the `/frontend` directory:
    ```sh
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Team & Acknowledgments

This project was proudly developed by:

- **Harleen Kaur** - ([GitHub](https://github.com/harleenkaur28)) - Lead, Machine Learning, Backend Development
- **Tashif Ahmad Khan** - ([GitHub](https://github.com/tashifkhan)) - Full-Stack Development, Designer
