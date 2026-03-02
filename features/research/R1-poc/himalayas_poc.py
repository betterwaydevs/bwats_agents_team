#!/usr/bin/env python3
"""
Himalayas.app API — Proof of Concept
=====================================
Fetches remote job listings from Himalayas' free public JSON API.
No authentication required. Max 20 results per request, paginated via offset.

API Docs: https://himalayas.app/api
Total listings: ~110,000+

Usage:
    python himalayas_poc.py
"""

import json
import sys
import urllib.request
import urllib.error
import urllib.parse
from datetime import datetime

BASE_URL = "https://himalayas.app/jobs/api"


def fetch_jobs(limit=20, offset=0):
    """Fetch job listings from Himalayas API with pagination."""
    params = urllib.parse.urlencode({"limit": limit, "offset": offset})
    url = f"{BASE_URL}?{params}"

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


def display_job(job, index):
    """Display a single job listing in a readable format."""
    salary = ""
    if job.get("minSalary") and job.get("maxSalary"):
        currency = job.get("currency", "USD")
        salary = f"  Salary: {job['minSalary']:,.0f} - {job['maxSalary']:,.0f} {currency}"
    elif job.get("minSalary"):
        salary = f"  Salary: {job['minSalary']:,.0f}+ {job.get('currency', 'USD')}"

    locations = job.get("locationRestrictions", [])
    loc_str = ", ".join(locations) if locations else "Worldwide"

    categories = job.get("parentCategories", [])
    cat_str = ", ".join(categories) if categories else "N/A"

    seniority = job.get("seniority", [])
    sen_str = ", ".join(seniority) if seniority else "N/A"

    print(f"\n{'='*70}")
    print(f"  [{index}] {job.get('title', 'N/A')}")
    print(f"  Company: {job.get('companyName', 'N/A')}")
    print(f"  Location: {loc_str}")
    print(f"  Employment: {job.get('employmentType', 'N/A')}")
    print(f"  Seniority: {sen_str}")
    print(f"  Categories: {cat_str}")
    if salary:
        print(salary)
    print(f"  Posted: {job.get('pubDate', 'N/A')}")
    print(f"  Apply: {job.get('applicationLink', 'N/A')}")


def filter_by_location(jobs, country_keyword):
    """Filter jobs where locationRestrictions contains a keyword."""
    matched = []
    for job in jobs:
        locations = job.get("locationRestrictions", [])
        for loc in locations:
            if country_keyword.lower() in loc.lower():
                matched.append(job)
                break
    return matched


def main():
    print("=" * 70)
    print("  HIMALAYAS.APP API — Proof of Concept")
    print("  No authentication required | Free public API")
    print("=" * 70)

    # Step 1: Fetch first page of jobs
    print("\n[1] Fetching first 20 job listings...")
    data = fetch_jobs(limit=20, offset=0)
    if not data:
        print("FAILED: Could not fetch jobs")
        sys.exit(1)

    total_count = data.get("totalCount", 0)
    jobs = data.get("jobs", [])
    print(f"    Total jobs available: {total_count:,}")
    print(f"    Jobs returned: {len(jobs)}")

    # Step 2: Display first 10 jobs
    print("\n[2] Displaying first 10 job listings:")
    for i, job in enumerate(jobs[:10], 1):
        display_job(job, i)

    # Step 3: Fetch second page to show pagination
    print(f"\n\n[3] Testing pagination (offset=20)...")
    page2 = fetch_jobs(limit=20, offset=20)
    if page2:
        page2_jobs = page2.get("jobs", [])
        print(f"    Page 2 returned: {len(page2_jobs)} jobs")
        if page2_jobs:
            print(f"    First job on page 2: {page2_jobs[0].get('title')} @ {page2_jobs[0].get('companyName')}")

    # Step 4: Demonstrate location filtering
    # Collect more jobs to have a larger pool for filtering
    print("\n[4] Demonstrating location filter (collecting 100 jobs)...")
    all_jobs = list(jobs)
    for offset in range(20, 100, 20):
        batch = fetch_jobs(limit=20, offset=offset)
        if batch:
            all_jobs.extend(batch.get("jobs", []))

    us_jobs = filter_by_location(all_jobs, "United States")
    print(f"    US jobs found: {len(us_jobs)} out of {len(all_jobs)}")
    for j in us_jobs[:3]:
        print(f"      - {j.get('title')} @ {j.get('companyName')} [{', '.join(j.get('locationRestrictions', []))}]")

    latam_keywords = ["Brazil", "Mexico", "Colombia", "Argentina", "Latin America", "LATAM"]
    latam_jobs = []
    for kw in latam_keywords:
        latam_jobs.extend(filter_by_location(all_jobs, kw))
    # Deduplicate by title
    seen = set()
    unique_latam = []
    for j in latam_jobs:
        key = j.get("title", "") + j.get("companyName", "")
        if key not in seen:
            seen.add(key)
            unique_latam.append(j)

    print(f"    LATAM jobs found: {len(unique_latam)} out of {len(all_jobs)}")
    for j in unique_latam[:5]:
        print(f"      - {j.get('title')} @ {j.get('companyName')} [{', '.join(j.get('locationRestrictions', []))}]")

    # Step 5: Salary data analysis
    print("\n[5] Salary data analysis:")
    with_salary = [j for j in all_jobs if j.get("minSalary") or j.get("maxSalary")]
    print(f"    Jobs with salary data: {len(with_salary)} out of {len(all_jobs)} ({100*len(with_salary)//len(all_jobs)}%)")
    for j in with_salary[:3]:
        currency = j.get("currency", "USD")
        print(f"      - {j.get('title')}: {j.get('minSalary', '?'):,} - {j.get('maxSalary', '?'):,} {currency}")

    # Step 6: Summary
    print(f"\n{'='*70}")
    print("  SUMMARY")
    print(f"{'='*70}")
    print(f"  API Status: WORKING")
    print(f"  Total Jobs: {total_count:,}")
    print(f"  Auth Required: No")
    print(f"  Rate Limit: No explicit limit (be respectful)")
    print(f"  Pagination: limit + offset (max 20 per request)")
    print(f"  Data Quality: Excellent (structured categories, seniority, salary)")
    print(f"  LATAM Coverage: {'Yes' if unique_latam else 'Limited'} ({len(unique_latam)} jobs in sample)")
    print(f"  Salary Coverage: {100*len(with_salary)//len(all_jobs)}% of listings")


if __name__ == "__main__":
    main()
