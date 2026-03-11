import os
import json
import re

TOPIC_RULES = {
    "Acute Coronary Syndrome": [r'\bacs\b', r'acute coronary syndrome'],
    "Myocardial Infarction": [r'\bmi\b', r'myocardial infarction', r'stemi', r'nstemi'],
    "Pericarditis": [r'pericarditis'],
    "Atrial Fibrillation": [r'atrial fibrillation', r'\bafib\b'],
    "Atrial Flutter": [r'atrial flutter'],
    "Ventricular Tachycardia": [r'ventricular tachycardia', r'\bvt\b', r'\bvtach\b'],
    "Ventricular Fibrillation": [r'ventricular fibrillation', r'\bvf\b', r'\bvfib\b'],
    "Hyperkalemia": [r'hyperkalemia'],
    "Hypokalemia": [r'hypokalemia'],
    "Long QT Syndrome": [r'long qt', r'lqts'],
    "Left Bundle Branch Block": [r'lbbb', r'left bundle branch block'],
    "Right Bundle Branch Block": [r'rbbb', r'right bundle branch block'],
    "AV Block": [r'av block', r'wenckebach', r'mobitz'],
    "Wolff-Parkinson-White": [r'wpw', r'wolff-parkinson-white'],
    "Supraventricular Tachycardia": [r'svt', r'supraventricular', r'psvt'],
    "Premature Ventricular Contractions": [r'pvc', r'pvcs', r'premature ventricular'],
    "Premature Atrial Contractions": [r'pac', r'pacs', r'premature atrial'],
    "Left Ventricular Hypertrophy": [r'lvh', r'left ventricular hypertrophy'],
    "Right Ventricular Hypertrophy": [r'rvh', r'right ventricular hypertrophy'],
    "Normal Sinus Rhythm": [r'normal sinus rhythm', r'\bnsr\b']
}

def classify_topics():
    cases_dir = 'data/cases'
    if not os.path.exists(cases_dir):
        return

    for case_folder in os.listdir(cases_dir):
        case_path = os.path.join(cases_dir, case_folder)
        if os.path.isdir(case_path):
            metadata_path = os.path.join(case_path, 'metadata.json')
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    try:
                        metadata = json.load(f)
                    except Exception as e:
                        print(f"Error {metadata_path}: {e}")
                        continue
                
                diagnosis = metadata.get('diagnosis', '').lower()
                history = metadata.get('clinical_history', '').lower()
                text_to_search = diagnosis + " " + history
                
                topics = []
                for topic, patterns in TOPIC_RULES.items():
                    for pattern in patterns:
                        if re.search(pattern, text_to_search):
                            topics.append(topic)
                            break
                
                if not topics:
                    topics.append("Uncategorized")
                    
                metadata['topics'] = topics
                
                with open(metadata_path, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, indent=4)

if __name__ == "__main__":
    classify_topics()
    print("Topic extraction complete.")
