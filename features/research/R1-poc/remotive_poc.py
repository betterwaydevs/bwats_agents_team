#!/usr/bin/env python3
"""
Remotive API — Proof of Concept
================================
Fetches remote job listings from Remotive's free public REST API.
No authentication required. Supports category, search, and company_name filters.

API Docs: https://github.com/remotive-com/remote-jobs-api
Endpoint: https://remotive.com/api/remote-jobs
Rate Limit: Max 2 requests/minute, recommended max 4 requests/day

Usage:
    python remotive_poc.py
"""

import json
import sys
import urllib.request
import urllib.error
import urllib.parse
import time

BASE_URL = "https://remotive.com/api/remote-jobs"
CATEGORIES_URL = "https://remotive.com/api/remote-jobs/categories"


def fetch_jobs(category=None, search=None, company_name=None, limit=None):
    """Fetch jobs from Remotive API with optional filters."""
    params = {}
    if category:
        params["category"] = category
    if search:
        params["search"] = search
    if company_name:
        params["company_name"] = company_name
    if limit:
        params["limit"] = limit

    url = BASE_URL
    if params:
        url += "?" + urllib.parse.urlencode(params)

    req = urllib.request.Request(url, headers={"User-Agent": "BWATS-Research/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            return data
    except urllib.error.HTTPError as e:
        print(f"HTTP Error {e.code}: {e.reason}")
        return None
    except urllib.error.URLError as e:
        print(f"Connection Error: {e.reason}")
        return None
    except json.JSONDecodeError:
        print("Error: Invalid JSON response")
        return None


def fetch_categories():
    """Fetch available job categories from Remotive."""
    req = urllib.request.Request(CATEGORIES_URL, headers={"User-Agent": "BWATS-Research/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            return data.get("jobs", [])
    except Exception:
        return []


def display_job(job, index):
    """Display a single job listing in a readable format."""
    salary = job.get("salary", "")
    salary_str = f"  Salary: {salary}" if salary else ""

    tags = job.get("tags", [])
    tags_str = ", ".join(tags) if tags else "N/A"

    print(f"\n{'='*70}")
    print(f"  [{index}] {job.get('title', 'N/A')}")
    print(f"  Company: {job.get('company_name', 'N/A')}")
    print(f"  Category: {job.get('category', 'N/A')}")
    print(f"  Job Type: {job.get('job_type', 'N/A')}")
    print(f"  Location: {job.get('candidate_required_location', 'N/A')}")
    if salary_str:
        print(salary_str)
    print(f"  Tags: {tags_str}")
    print(f"  Published: {job.get('publication_date', 'N/A')}")
    print(f"  URL: {job.get('url', 'N/A')}")


def main():
    print("=" * 70)
    print("  REMOTIVE API — Proof of Concept")
    print("  No authentication required | Free public API")
    print("=" * 70)

    # Step 1: Fetch categories
    print("\n[1] Fetching available categories...")
    categories = fetch_categories()
    if categories:
        print(f"    Found {len(categories)} categories:")
        for cat in categories:
            name = cat.get("name", cat) if isinstance(cat, dict) else cat
            print(f"      - {name}")

    # Step 2: Fetch all jobs (no filter)
    print("\n[2] Fetching all active jobs (no filter)...")
    data = fetch_jobs()
    if not data:
        print("FAILED: Could not fetch jobs")
        sys.exit(1)

    total = data.get("job-count", 0)
    jobs = data.get("jobs", [])
    print(f"    Total active jobs: {total}")
    print(f"    Jobs returned: {len(jobs)}")

    # Step 3: Display first 10 jobs
    print("\n[3] Displaying first 10 job listings:")
    for i, job in enumerate(jobs[:10], 1):
        display_job(job, i)

    time.sleep(1)  # Respect rate limits

    # Step 4: Filter by category (Software Development)
    print(f"\n\n[4] Filtering by category: software-dev")
    filtered = fetch_jobs(category="software-dev")
    if filtered:
        f_jobs = filtered.get("jobs", [])
        print(f"    Software dev jobs: {len(f_jobs)}")
        for j in f_jobs[:3]:
            print(f"      - {j.get('title')} @ {j.get('company_name')} [{j.get('candidate_required_location')}]")

    time.sleep(1)  # Respect rate limits

    # Step 5: Search for "python"
    print(f"\n[5] Searching for 'python'...")
    search_data = fetch_jobs(search="python")
    if search_data:
        s_jobs = search_data.get("jobs", [])
        print(f"    Python jobs found: {len(s_jobs)}")
        for j in s_jobs[:3]:
            print(f"      - {j.get('title')} @ {j.get('company_name')} [{j.get('candidate_required_location')}]")

    # Step 6: Geographic coverage analysis
    print(f"\n[6] Geographic coverage analysis (from all {len(jobs)} jobs):")
    location_counts = {}
    for j in jobs:
        loc = j.get("candidate_required_location", "Unknown")
        location_counts[loc] = location_counts.get(loc, 0) + 1

    sorted_locs = sorted(location_counts.items(), key=lambda x: -x[1])
    print("    Top locations:")
    for loc, count in sorted_locs[:15]:
        print(f"      {loc}: {count}")

    # LATAM check
    latam_terms = ["latin", "latam", "brazil", "mexico", "colombia", "argentina", "south america"]
    latam_jobs = [j for j in jobs if any(t in j.get("candidate_required_location", "").lower() for t in latam_terms)]
    # Also count "Worldwide" as LATAM-accessible
    worldwide = [j for j in jobs if "worldwide" in j.get("candidate_required_location", "").lower()]
    print(f"\n    LATAM-specific jobs: {len(latam_jobs)}")
    print(f"    Worldwide (LATAM-accessible): {len(worldwide)}")

    # Step 7: Salary data analysis
    print(f"\n[7] Salary data analysis:")
    with_salary = [j for j in jobs if j.get("salary")]
    print(f"    Jobs with salary info: {len(with_salary)} out of {len(jobs)} ({100*len(with_salary)//max(len(jobs),1)}%)")
    for j in with_salary[:5]:
        print(f"      - {j.get('title')}: {j.get('salary')}")

    # Step 8: Summary
    print(f"\n{'='*70}")
    print("  SUMMARY")
    print(f"{'='*70}")
    print(f"  API Status: WORKING")
    print(f"  Total Jobs: {total}")
    print(f"  Auth Required: No")
    print(f"  Rate Limit: 2 req/min, recommended 4/day")
    print(f"  Filters: category, search, company_name, limit")
    print(f"  Data Quality: Good (salary strings, categories, tags)")
    print(f"  24h Delay: Yes (jobs delayed by 24 hours)")
    print(f"  LATAM Coverage: {'Present' if latam_jobs else 'Limited'} ({len(latam_jobs)} specific + {len(worldwide)} worldwide)")
    print(f"  Salary Coverage: {100*len(with_salary)//max(len(jobs),1)}% of listings")


if __name__ == "__main__":
    main()
