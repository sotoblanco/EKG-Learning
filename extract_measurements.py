import os
import json
import argparse
import time
from google import genai
from typing import Dict, Any


def extract_ekg_report(metadata: Dict[str, Any], image_bytes: bytes, mime_type: str, client) -> Dict[str, str]:
    """Uses Gemini to infer structured measurements from EKG metadata and image."""

    prompt = f"""
    Analyze the following EKG case history, diagnosis, and the actual EKG image to extract structured measurements.

    Clinical History: {metadata.get('clinical_history', 'N/A')}
    Diagnosis: {metadata.get('diagnosis', 'N/A')}

    Extract the following fields in a concise manner:
    - Rhythm: e.g., "Normal Sinus Rhythm"
    - Rate: e.g., "75 bpm"
    - Axis: e.g., "Normal axis"
    - Intervals: Include PR, QRS, and QTc measurements if available.
    - Findings: e.g., "ST-segment elevation," "LVH by voltage"
    - Comparison: Note any changes from a previous EKG if mentioned.
    - Impression: The clinical "bottom line."
    
    IMPORTANT: If any of these values (Rate, Rhythm, Axis, Intervals, Findings) are not explicitly mentioned in the text, you MUST look at the provided EKG image and calculate/interpret them yourself. Do your best to extract all metrics. Use "N/A" only if absolutely impossible to determine from both text and image.

    Return the result as a JSON object with these exact keys:
    "rhythm", "rate", "axis", "intervals", "findings", "comparison", "impression"

    Return ONLY a valid JSON object. No markdown, no extra text.
    """

    from google.genai import types
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model="gemini-3-flash-preview",
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                    prompt
                ]
            )

            report_text = response.text.strip()
            # Strip markdown code fences if present
            if report_text.startswith("```"):
                parts = report_text.split("```")
                report_text = parts[1]
                if report_text.startswith("json"):
                    report_text = report_text[4:]
            return json.loads(report_text)

        except Exception as e:
            err_str = str(e)
            if "429" in err_str and attempt < max_retries - 1:
                wait = 2 ** (attempt + 2)  # 4s, 8s, 16s
                print(f"\n  ⏳ Rate limited. Waiting {wait}s before retry ({attempt + 1}/{max_retries - 1})...", end=" ", flush=True)
                time.sleep(wait)
                continue
            print(f"\n  ⚠  Error: {e}")
            return {
                "rhythm": "N/A",
                "rate": "N/A",
                "axis": "N/A",
                "intervals": "N/A",
                "findings": "N/A",
                "comparison": "N/A",
                "impression": f"Extraction failed: {str(e)}"
            }



def main():
    parser = argparse.ArgumentParser(description="Extract structured EKG measurements using AI.")
    parser.add_argument("--limit", type=int, default=None, help="Limit the number of cases processed.")
    parser.add_argument("--case", type=str, default=None, help="Process a specific case (e.g., case_1).")
    parser.add_argument("--force", action="store_true", default=False,
                        help="Force re-extraction even if report already exists.")
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: GEMINI_API_KEY environment variable not set.")
        return

    client = genai.Client(api_key=api_key)
    cases_dir = "data/cases"

    if args.case:
        case_folders = [args.case]
    else:
        case_folders = sorted(
            [f for f in os.listdir(cases_dir) if os.path.isdir(os.path.join(cases_dir, f))],
            key=lambda x: int(x.split('_')[1]) if '_' in x else 0
        )

    total = len(case_folders)
    skipped = 0
    updated = 0
    errors = 0

    print(f"📋 Found {total} cases to process...")
    if not args.force:
        print("   (skipping cases that already have a report — use --force to re-extract all)\n")

    for i, case_folder in enumerate(case_folders, 1):
        case_path = os.path.join(cases_dir, case_folder)
        metadata_path = os.path.join(case_path, "metadata.json")

        if not os.path.exists(metadata_path):
            print(f"[{i}/{total}] ⚠  Skipping {case_folder}: metadata.json not found.")
            skipped += 1
            continue

        with open(metadata_path, 'r') as f:
            metadata = json.load(f)

        # Skip if already has a VALID report (not a failed one)
        existing_report = metadata.get('report')
        if not args.force and existing_report:
            impression = existing_report.get('impression', '')
            if 'Extraction failed' not in impression:
                print(f"[{i}/{total}] ✓  Skipping {case_folder} (already has report)")
                skipped += 1
                continue
            else:
                print(f"[{i}/{total}] 🔄 Retrying {case_folder} (previous extraction failed)...", end=" ", flush=True)
        else:
            print(f"[{i}/{total}] 🔍 Processing {case_folder}...", end=" ", flush=True)

        image_filename = metadata.get('image')
        ekg_image_path = None
        mime_type = "image/png"
        
        # Try metadata image first, then common names
        potential_names = []
        if image_filename:
            potential_names.append(image_filename)
        potential_names.extend(["ekg.png", "ekg.jpg", "ekg.jpeg", "ekg.gif", "image.png", "image.jpg", "image.jpeg"])
        
        for name in potential_names:
            p = os.path.join(case_path, name)
            if os.path.exists(p):
                ekg_image_path = p
                ext = name.split('.')[-1].lower()
                if ext in ['jpg', 'jpeg']: mime_type = "image/jpeg"
                elif ext == 'gif': mime_type = "image/gif"
                elif ext == 'webp': mime_type = "image/webp"
                else: mime_type = "image/png"
                break

        if not ekg_image_path:
            # Last ditch attempt: finding any image file
            for f in os.listdir(case_path):
                if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.webp')):
                    ekg_image_path = os.path.join(case_path, f)
                    ext = f.split('.')[-1].lower()
                    if ext in ['jpg', 'jpeg']: mime_type = "image/jpeg"
                    elif ext == 'gif': mime_type = "image/gif"
                    elif ext == 'webp': mime_type = "image/webp"
                    else: mime_type = "image/png"
                    break

        if not ekg_image_path:
            print(f"\n[{i}/{total}] ⚠ Skipping {case_folder}: image not found.")
            skipped += 1
            continue

        with open(ekg_image_path, "rb") as img_file:
            image_bytes = img_file.read()

        report = extract_ekg_report(metadata, image_bytes, mime_type, client)

        if "Extraction failed" in report.get("impression", ""):
            errors += 1
        else:
            updated += 1

        metadata['report'] = report

        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=4)

        print(f"✔  Done  ({report.get('rhythm', 'N/A')})")

        if args.limit and (updated + errors) >= args.limit:
            print(f"\n[!] Reached limit of {args.limit} new cases processed.")
            break


    print(f"\n{'=' * 50}")
    print(f"✅ Finished! Updated: {updated}  |  Skipped: {skipped}  |  Errors: {errors}")


if __name__ == "__main__":
    main()
