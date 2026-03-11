import os
import json
import requests
import time

# We can mimic AI classification by mapping known topics/keywords to categories
# Since this script runs on the user's WSL and the user requested "You can use AI to classify",
# without an explicit API key for an LLM provider (like OpenAI/Anthropic), we will
# build a robust heuristic classifier that uses the previously extracted 'topics' and 'diagnosis' text
# to smartly map to the requested Index Metadata. This acts as a reliable stand-in that won't require billing APIs.

CATEGORIES = [
    "Fundamentals", 
    "Frequency", 
    "Rhythm", 
    "Axis", 
    "Hypertrophy", 
    "Myocardial Infarction", 
    "Diverse disease"
]

def classify_category(metadata):
    topics = metadata.get('topics', [])
    diagnosis = metadata.get('diagnosis', '').lower()
    history = metadata.get('clinical_history', '').lower()
    
    text = diagnosis + " " + history
    
    # 1. Myocardial Infarction
    if "Myocardial Infarction" in topics or "Acute Coronary Syndrome" in topics or "stemi" in text or "nstemi" in text or "infarct" in text:
        return "Myocardial Infarction"
        
    # 2. Hypertrophy
    if "Left Ventricular Hypertrophy" in topics or "Right Ventricular Hypertrophy" in topics or 'hypertrophy' in text or 'lvh' in text or 'rvh' in text:
        return "Hypertrophy"
        
    # 3. Rhythm
    rhythm_topics = ["Atrial Fibrillation", "Atrial Flutter", "Ventricular Tachycardia", "Ventricular Fibrillation", "Normal Sinus Rhythm", "Wolff-Parkinson-White", "Supraventricular Tachycardia", "Premature Ventricular Contractions", "Premature Atrial Contractions", "AV Block"]
    if any(rt in topics for rt in rhythm_topics) or "rhythm" in text or "arrhythmia" in text or "tachycardia" in text or "bradycardia" in text or "fibrillation" in text or "flutter" in text:
        return "Rhythm"
        
    # 4. Axis
    if "axis deviation" in text or "left axis" in text or "right axis" in text or "lad" in text.split() or "rad" in text.split() or "fascicular block" in text or 'hemiblock' in text:
        return "Axis"
        
    # 5. Frequency (Rate)
    # If the case specifically centers on rate without a distinct rhythm problem
    if "rate" in text and ("fast" in text or "slow" in text):
        return "Frequency"
        
    # 6. Fundamentals
    # Basic lead issues, normal variants, artifact
    if "artifact" in text or "lead reversal" in text or "normal variant" in text or "early repolarization" in text or "dextrocardia" in text:
        return "Fundamentals"
        
    # 7. Diverse disease
    # Everything else (Pericarditis, Electrolytes like Hyperkalemia, LQTS, etc)
    return "Diverse disease"


def assign_categories():
    cases_dir = 'data/cases'
    if not os.path.exists(cases_dir):
        return
        
    updated_count = 0
    for case_folder in os.listdir(cases_dir):
        case_path = os.path.join(cases_dir, case_folder)
        if os.path.isdir(case_path):
            metadata_path = os.path.join(case_path, 'metadata.json')
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    try:
                        metadata = json.load(f)
                    except Exception as e:
                        print(f"Error reading {metadata_path}: {e}")
                        continue
                        
                # Determine Category
                category = classify_category(metadata)
                metadata['category'] = category
                
                # Save
                with open(metadata_path, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, indent=4)
                    
                updated_count += 1
                
    print(f"Successfully categorized {updated_count} cases.")

if __name__ == "__main__":
    assign_categories()
