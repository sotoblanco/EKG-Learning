import os
import json

def generate_index():
    cases_dir = 'data/cases'
    index_file = 'data/cases_index.json'
    cases = []
    
    if not os.path.exists(cases_dir):
        print(f"Directory {cases_dir} does not exist.")
        return
        
    for case_folder in sorted(os.listdir(cases_dir)):
        case_path = os.path.join(cases_dir, case_folder)
        if os.path.isdir(case_path):
            metadata_path = os.path.join(case_path, 'metadata.json')
            if os.path.exists(metadata_path):
                with open(metadata_path, 'r', encoding='utf-8') as f:
                    try:
                        metadata = json.load(f)
                        # Find image file
                        image_file = 'ekg.gif' # Default
                        for f_name in os.listdir(case_path):
                            if f_name.startswith('ekg.'):
                                image_file = f_name
                                break

                        # We just need minimal info for the list
                        cases.append({
                            'case_id': metadata.get('case_id', case_folder),
                            'folder': case_folder,
                            'difficulty': metadata.get('difficulty', 0),
                            'topics': metadata.get('topics', []),
                            'category': metadata.get('category', 'Diverse disease'),
                            'image': image_file
                        })
                    except Exception as e:
                        print(f"Error reading {metadata_path}: {e}")
                        
    # Sort cases numerically if possible
    try:
        cases.sort(key=lambda x: int(x['case_id']))
    except ValueError:
        pass
        
    with open(index_file, 'w', encoding='utf-8') as f:
        json.dump(cases, f, indent=4)
        
    print(f"Generated index with {len(cases)} cases at {index_file}")

if __name__ == "__main__":
    generate_index()
