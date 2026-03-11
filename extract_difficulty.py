import os
import json
import re

def process_difficulty():
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
                        print(f"Error reading {metadata_path}: {e}")
                        continue

                history = metadata.get('clinical_history', '')
                
                # Normalize spaces
                norm_history = history.replace('\xa0', ' ').replace('\u00a0', ' ')
                
                # Regex to find asterisks followed by Difficulty rating
                # e.g. "   * * *  Difficulty rating"
                match = re.search(r'([\s\*]*Difficulty\s*rating[^\.]*)', norm_history, re.IGNORECASE)
                
                if match:
                    matched_text = match.group(1)
                    difficulty = matched_text.count('*')
                    
                    # Remove from original history
                    # We can use the start index from the normalized string to slice the original
                    new_history = history[:match.start()].strip()
                    
                    metadata['clinical_history'] = new_history
                    metadata['difficulty'] = difficulty
                    
                    with open(metadata_path, 'w', encoding='utf-8') as f:
                        json.dump(metadata, f, indent=4)
                else:
                    if 'difficulty' not in metadata:
                        metadata['difficulty'] = 0
                        with open(metadata_path, 'w', encoding='utf-8') as f:
                            json.dump(metadata, f, indent=4)

if __name__ == "__main__":
    process_difficulty()
    print("Done")
