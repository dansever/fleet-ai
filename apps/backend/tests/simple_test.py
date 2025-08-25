#!/usr/bin/env python3
"""
Simple test to check file paths and basic setup without dependencies
"""

import os
from pathlib import Path

def check_files():
    """Check if test files exist"""
    print("🚀 Fleet AI Simple Setup Check")
    print("=" * 50)
    
    # Check for test documents
    test_files = [
        "notebooks/model_testing/doc_extract/BP Athens Bid Submission.pdf",
        "notebooks/model_testing_doc_extractor/BP Athens Bid Submission.pdf",
    ]
    
    print("📁 Looking for test documents...")
    found_files = []
    for test_file in test_files:
        if os.path.exists(test_file):
            size = os.path.getsize(test_file)
            print(f"✅ Found: {test_file} ({size:,} bytes)")
            found_files.append(test_file)
        else:
            print(f"❌ Not found: {test_file}")
    
    # Check app structure
    print("\n🏗️ Checking app structure...")
    app_files = [
        "app/main.py",
        "app/schemas/fuel_bid.py", 
        "app/features/fuel/fuel_bid_extractor.py",
        "app/api/v1/endpoints/fuel_bids.py",
        "requirements.txt"
    ]
    
    for app_file in app_files:
        if os.path.exists(app_file):
            print(f"✅ Found: {app_file}")
        else:
            print(f"❌ Missing: {app_file}")
    
    # Check test directory
    test_dir = Path("test")
    if test_dir.exists():
        print(f"✅ Test directory exists: {test_dir}")
    else:
        test_dir.mkdir(exist_ok=True)
        print(f"✅ Created test directory: {test_dir}")
    
    print("\n📋 Summary:")
    if found_files:
        print(f"✅ Found {len(found_files)} test document(s)")
        print(f"📄 Will use: {found_files[0]}")
        return found_files[0]
    else:
        print("❌ No test documents found")
        return None

def main():
    found_file = check_files()
    
    if found_file:
        print(f"\n🎯 Ready to test extraction with: {found_file}")
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Set environment variables:")
        print("   - LLAMA_CLOUD_API_KEY")
        print("   - LLAMA_EXTRACT_PROJECT_ID") 
        print("   - LLAMA_ORGANIZATION_ID")
        print("3. Run: python test_real_extraction.py")
        return 0
    else:
        print("\n❌ Cannot proceed without test documents")
        return 1

if __name__ == "__main__":
    exit(main())
