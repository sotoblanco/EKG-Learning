# EKG Learning Application

A web-based interactive platform for learning EKG interpretation through clinical cases, theoretical lessons, and progressive practice.

## Features

### Browse Mode
Explore a library of over 500 EKG cases. Filter by category (Fundamentals, Rhythm, Axis, etc.), specific clinical topics, or difficulty level. Each case includes:
- High-resolution EKG image
- Clinical history
- Correct diagnosis
- Source links for deeper study

### Quiz Mode
Test your knowledge with customizable quizzes. Select your preferred categories and topics, or take a random shuffle. Track your progress with a question-by-question breakdown.

### Learning Path
A structured curriculum designed to take you from fundamentals to advanced interpretations.
- Theory Sessions: Focused markdown-based lessons on specific EKG principles.
- Walkthrough Cases: Annotated cases that illustrate core concepts.
- Practice Quizzes: Progressive difficulty cases to reinforce learning within each topic.

## Technical Architecture

### Frontend
- Core: Vanilla HTML5, CSS3, and JavaScript.
- Markdown Rendering: Integrated with Marked.js for educational content.
- Design: Modern, responsive interface with a dark-mode aesthetic.

### Data Structure
- cases/: Individual clinical cases stored with metadata.json and EKG images.
- lessons/: Educational content stored as Markdown (.md) files organized by category.
- indices: JSON-based index files (cases_index.json, lessons.json) for fast frontend lookups.

### Data Pipeline
- generate_index.py: Rebuilds the global case index by scanning the data directory.
- classify_*.py: Utility scripts for automated categorization and topic extraction.

## Setup and Development

### Prerequisites
- Python 3.x
- WSL (Windows Subsystem for Linux) recommended

### Installation
1. Activate the virtual environment:
   ```bash
   source .venv/bin/activate
   ```
2. Rebuild the case index if you added new data:
   ```bash
   python generate_index.py
   ```

### Running the Application
The frontend is a static application. You can serve it using any local web server, for example:
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000/frontend/` in your browser.

## Project Structure
- .venv/: Local Python virtual environment.
- data/: Clinical cases and educational markdown files.
- frontend/: User interface assets (HTML, CSS, JS).
- generate_index.py: Script to maintain case indexing.
- classify_categories.py: Script for case classification.
- SKILL.md: AI Assistant guidance.
