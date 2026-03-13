# EKG Learning Application

A web-based interactive platform for learning EKG interpretation through clinical cases, theoretical lessons, and progressive practice.

## 🚀 Live Demo
The application is deployed to GitHub Pages: [https://<your-username>.github.io/ekg/](https://<your-username>.github.io/ekg/)

## Features

### Browse Mode
Explore a library of over 500 EKG cases. Filter by category (Fundamentals, Rhythm, Axis, etc.), specific clinical topics, or difficulty level. Each case includes:
- High-resolution EKG image
- Clinical history
- Correct diagnosis
- Source links for deeper study

### Quiz Mode
Test your knowledge with customizable quizzes. Select your preferred categories and topics, or take a random shuffle.

### Learning Path & Interactive Fundamentals
A structured curriculum designed to take you from fundamentals to advanced interpretations.
- **Interactive Fundamentals**: A rich, standalone clinical guide with scroll-spy navigation, EKG paper simulations, and interactive waveform tooltips.
- **Theory Sessions**: Focused lesson content integrated into the main app.
- **Walkthrough Cases**: Annotated cases that illustrate core concepts.
- **Practice Quizzes**: Progressive difficulty cases to reinforce learning.

## Technical Architecture

### Frontend
- **Core**: Vanilla HTML5, CSS3, and JavaScript.
- **Interactions**: Chart.js for waveform visualizations and Tailwind CSS for the interactive guide.
- **Design**: Modern, responsive interface with a slate-based clinical aesthetic.

### Data Structure
- `data/cases/`: Individual clinical cases stored with `metadata.json` and images.
- `data/lessons/`: Educational content stored as Markdown (.md) files.
- `cases_index.json`: Automated index for core application functionality.

### AI & Automation
- `generate_index.py`: Python script that rebuilds the global case index.
- **GitHub Actions**: Automated pipeline that rebuilds the index and deploys the site on every push to `main`.

## Setup and Development

### Prerequisites
- Python 3.x
- WSL (Windows Subsystem for Linux) recommended for development.

### Local Development
1. **Rebuild the case index** (if you added new data):
   ```bash
   python generate_index.py
   ```
2. **Run locally**:
   Since it's a static site, you can use any server:
   ```bash
   python3 -m http.server 8000
   ```
   Then visit `http://localhost:8000/`.

## Deployment
This repository is configured for **GitHub Pages**. Simply push to the `main` branch, and the `.github/workflows/deploy.yml` action will:
1. Rebuild the case index automatically.
2. Deploy the updated static site.
