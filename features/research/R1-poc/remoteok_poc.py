#!/usr/bin/env python3
"""
RemoteOK API — Proof of Concept
=================================
Fetches remote job listings from RemoteOK's free public JSON API.
No authentication required. Returns all current listings in a single call.

API Docs: https://remoteok.com/api
Note: First element in array is a legal notice, not a job.

Usage:
    python remoteok_poc.py
"""

import json
import sys
import urllib.request
import urllib.error

API_URL = "https://remoteok.com/api"


def fetch_all_jobs():
    """Fetch all job listings from RemoteOK API.
    Returns the full array. Note: first element is legal/metadata, not a job."""
    req = urllib.request.Request(
        API_URL,
        headers={
            "User-Agent": "BWATS-Research/1.0",
            "Accept": "application/json",
        },
    )
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


def display_job(job, index):
    """Display a single job listing in a readable format."""
    salary = ""
    if job.get("salary_min") and job.get("salary_max") and job["salary_min"] > 0:
        salary = f"  Salary: ${job['salary_min']:,} - ${job['salary_max']:,}/yr"
    elif job.get("salary_min") and job["salary_min"] > 0:
        salary = f"  Salary: ${job['salary_min']:,}+/yr"

    tags = job.get("tags", [])
    tags_str = ", ".join(tags[:8]) if tags else "N/A"

    print(f"\n{'='*70}")
    print(f"  [{index}] {job.get('position', 'N/A')}")
    print(f"  Company: {job.get('company', 'N/A')}")
    print(f"  Location: {job.get('location', 'Remote')}")
    if salary:
        print(salary)
    print(f"  Tags: {tags_str}")
    print(f"  Date: {job.get('date', 'N/A')}")
    print(f"  URL: {job.get('url', 'N/A')}")
    print(f"  Apply: {job.get('apply_url', 'N/A')}")


def filter_by_tag(jobs, tag):
    """Filter jobs that contain a specific tag."""
    return [j for j in jobs if tag.lower() in [t.lower() for t in j.get("tags", [])]]


def filter_by_location(jobs, keyword):
    """Filter jobs by location keyword (case-insensitive partial match)."""
    return [j for j in jobs if keyword.lower() in j.get("location", "").lower()]


def main():
    print("=" * 70)
    print("  REMOTEOK API — Proof of Concept")
    print("  No authentication required | Free public API")
    print("=" * 70)

    # Step 1: Fetch all jobs
    print("\n[1] Fetching all job listings...")
    data = fetch_all_jobs()
    if not data:
        print("FAILED: Could not fetch jobs")
        sys.exit(1)

    # First element is legal notice, skip it
    legal = data[0] if data else {}
    jobs = data[1:] if len(data) > 1 else []
    print(f"    Legal notice: {legal.get('legal', 'N/A')[:80]}...")
    print(f"    Total jobs returned: {len(jobs)}")

    # Step 2: Display first 10 jobs
    print("\n[2] Displaying first 10 job listings:")
    for i, job in enumerate(jobs[:10], 1):
        display_job(job, i)

    # Step 3: Filter by tag (e.g., "python")
    print(f"\n\n[3] Filtering by tag: 'python'")
    python_jobs = filter_by_tag(jobs, "python")
    print(f"    Python-tagged jobs: {len(python_jobs)}")
    for j in python_jobs[:5]:
        print(f"      - {j.get('position')} @ {j.get('company')} [{j.get('location', 'Remote')}]")

    # Step 4: Filter by tag "react"
    print(f"\n[4] Filtering by tag: 'react'")
    react_jobs = filter_by_tag(jobs, "react")
    print(f"    React-tagged jobs: {len(react_jobs)}")
    for j in react_jobs[:5]:
        print(f"      - {j.get('position')} @ {j.get('company')} [{j.get('location', 'Remote')}]")

    # Step 5: Filter by location
    print(f"\n[5] Filtering by location containing 'United States'")
    us_jobs = filter_by_location(jobs, "United States")
    print(f"    US jobs: {len(us_jobs)}")
    for j in us_jobs[:3]:
        print(f"      - {j.get('position')} @ {j.get('company')} [{j.get('location')}]")

    # Step 6: Geographic coverage
    print(f"\n[6] Geographic coverage analysis:")
    location_counts = {}
    for j in jobs:
        loc = j.get("location", "") or "Unspecified (Remote)"
        location_counts[loc] = location_counts.get(loc, 0) + 1

    sorted_locs = sorted(location_counts.items(), key=lambda x: -x[1])
    print("    Top locations:")
    for loc, count in sorted_locs[:15]:
        display_loc = loc if loc else "Unspecified (Remote)"
        print(f"      {display_loc}: {count}")

    # LATAM check
    latam_terms = ["latin", "latam", "brazil", "mexico", "colombia", "argentina", "south america"]
    latam_jobs = [j for j in jobs if any(t in j.get("location", "").lower() for t in latam_terms)]
    print(f"\n    LATAM-specific jobs: {len(latam_jobs)}")

    # Step 7: Salary data analysis
    print(f"\n[7] Salary data analysis:")
    with_salary = [j for j in jobs if j.get("salary_min") and j["salary_min"] > 0]
    print(f"    Jobs with salary: {len(with_salary)} out of {len(jobs)} ({100*len(with_salary)//max(len(jobs),1)}%)")
    for j in with_salary[:5]:
        print(f"      - {j.get('position')}: ${j['salary_min']:,} - ${j.get('salary_max', 0):,}/yr")

    # Step 8: Tag analysis
    print(f"\n[8] Most common tags:")
    tag_counts = {}
    for j in jobs:
        for tag in j.get("tags", []):
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
    sorted_tags = sorted(tag_counts.items(), key=lambda x: -x[1])[:20]
    for tag, count in sorted_tags:
        print(f"      {tag}: {count}")

    # Step 9: Summary
    print(f"\n{'='*70}")
    print("  SUMMARY")
    print(f"{'='*70}")
    print(f"  API Status: WORKING")
    print(f"  Total Jobs: {len(jobs)}")
    print(f"  Auth Required: No")
    print(f"  Rate Limit: Not documented (be respectful)")
    print(f"  Filters: None (client-side only — tags, location)")
    print(f"  Data Quality: Moderate (tags-based, HTML descriptions)")
    print(f"  LATAM Coverage: {'Present' if latam_jobs else 'Very limited'} ({len(latam_jobs)} jobs)")
    print(f"  Salary Coverage: {100*len(with_salary)//max(len(jobs),1)}% of listings")
    print(f"  Note: No pagination or server-side search. All jobs in single response.")


if __name__ == "__main__":
    main()
