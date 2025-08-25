#!/usr/bin/env python3
"""
Test script for real document extraction using LlamaIndex
"""

import sys
import os
import json
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from fastapi import UploadFile
from io import BytesIO
from app.features.fuel.fuel_bid_extractor import extract_fuel_bid
from app.utils import get_logger

logger = get_logger(__name__)

def test_with_real_document(file_path: str):
    """Test extraction with a real document file"""
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return False
    
    print(f"🔍 Testing extraction with: {file_path}")
    
    try:
        # Read the file
        with open(file_path, 'rb') as f:
            file_content = f.read()
        
        # Determine content type based on extension
        if file_path.lower().endswith('.pdf'):
            content_type = 'application/pdf'
        elif file_path.lower().endswith('.docx'):
            content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        else:
            content_type = 'application/octet-stream'
        
        # Create UploadFile object with proper content_type
        file_obj = UploadFile(
            filename=os.path.basename(file_path),
            file=BytesIO(file_content),
            size=len(file_content),
            headers={"content-type": content_type}
        )
        
        print("📄 Starting real document extraction...")
        result = extract_fuel_bid(file_obj)
        
        print("✅ Extraction completed successfully!")
        print(f"📊 Result type: {type(result)}")
        
        # Save result to test/temp_result.json
        output_dir = Path(__file__).parent / "test"
        output_dir.mkdir(exist_ok=True)
        output_file = output_dir / "temp_result.json"
        
        try:
            # Convert result to dict for JSON serialization
            if hasattr(result, 'data'):
                result_data = result.data
            else:
                result_data = result
            
            # Handle different data types
            if hasattr(result_data, 'dict'):
                # Pydantic model
                json_data = result_data.dict()
            elif hasattr(result_data, '__dict__'):
                # Regular object
                json_data = result_data.__dict__
            else:
                # Already a dict or primitive
                json_data = result_data
            
            # Save to JSON file
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(json_data, f, indent=2, default=str, ensure_ascii=False)
            
            print(f"💾 Result saved to: {output_file}")
            
        except Exception as e:
            print(f"⚠️ Could not save result to JSON: {e}")
            # Try to save as string representation
            try:
                with open(output_file, 'w', encoding='utf-8') as f:
                    f.write(str(result))
                print(f"💾 Result saved as string to: {output_file}")
            except Exception as e2:
                print(f"❌ Failed to save result: {e2}")
        
        # Print summary of extracted data
        if hasattr(result, 'data'):
            data = result.data
            print(f"📋 Extracted data type: {type(data)}")
            
            if hasattr(data, 'dict'):
                data_dict = data.dict()
            elif hasattr(data, '__dict__'):
                data_dict = data.__dict__
            elif isinstance(data, dict):
                data_dict = data
            else:
                data_dict = {}
            
            if data_dict:
                print(f"📋 Extracted data keys: {list(data_dict.keys())}")
                
                # Print some key fields if they exist
                title = data_dict.get('title', 'N/A')
                vendor_info = data_dict.get('vendor', {})
                vendor_name = vendor_info.get('name', 'N/A') if isinstance(vendor_info, dict) else 'N/A'
                price = data_dict.get('base_unit_price', 'N/A')
                currency = data_dict.get('currency', 'N/A')
                
                print(f"📝 Title: {title}")
                print(f"🏢 Vendor: {vendor_name}")
                print(f"💰 Price: {price} {currency}")
        
        return True
        
    except Exception as e:
        print(f"❌ Extraction failed: {str(e)}")
        logger.exception("Detailed error:")
        return False

def main():
    """Main test function"""
    print("🚀 Fleet AI Real Document Extraction Test")
    print("=" * 50)
    
    # Check for test document
    test_files = [
        "notebooks/model_testing/doc_extract/BP Athens Bid Submission.pdf",
        "notebooks/model_testing_doc_extractor/BP Athens Bid Submission.pdf",
        "test_document.pdf",
        "sample_bid.pdf"
    ]
    
    found_file = None
    for test_file in test_files:
        if os.path.exists(test_file):
            found_file = test_file
            break
    
    if found_file:
        success = test_with_real_document(found_file)
        if success:
            print("\n🎉 Real document extraction test completed!")
            return 0
        else:
            print("\n❌ Real document extraction test failed!")
            return 1
    else:
        print("📁 No test documents found. Please provide a PDF or DOCX file.")
        print("   Expected locations:")
        for test_file in test_files:
            print(f"   - {test_file}")
        print("\nTo test with your own file:")
        print("   python test_real_extraction.py your_document.pdf")
        return 1

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Use provided file path
        file_path = sys.argv[1]
        success = test_with_real_document(file_path)
        sys.exit(0 if success else 1)
    else:
        sys.exit(main())
