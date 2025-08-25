#!/usr/bin/env python3
"""
Simple test script to verify the fuel bid extraction workflow
"""

import sys
import os
from pathlib import Path

# Add the app directory to Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.schemas.fuel_bid import FuelBid
from app.schemas.vendor import Vendor
from app.shared.schemas.response import ResponseEnvelope
import json

def test_schema_validation():
    """Test that our Pydantic schemas work correctly"""
    print("🧪 Testing Pydantic schema validation...")
    
    # Test Vendor schema
    vendor_data = {
        "name": "Test Aviation Fuel Co.",
        "address": "123 Airport Blvd, Aviation City, AC 12345",
        "contact_name": "John Smith",
        "contact_email": "john.smith@testaviation.com",
        "contact_phone": "+1-555-0123"
    }
    
    try:
        vendor = Vendor(**vendor_data)
        print(f"✅ Vendor schema validation passed: {vendor.name}")
    except Exception as e:
        print(f"❌ Vendor schema validation failed: {e}")
        return False
    
    # Test FuelBid schema
    fuel_bid_data = {
        "vendor": vendor,
        "title": "Fuel Supply Bid for JFK Airport",
        "supplier_comments": "Best price guaranteed for long-term contract",
        "bid_submitted_at": "2024-01-15",
        "ai_summary": "Competitive fuel bid with fixed pricing at $2.45/gallon for Jet A-1 fuel with 30-day payment terms.",
        "price_type": "fixed",
        "uom": "USG",
        "currency": "USD",
        "payment_terms": "Net 30 days",
        "base_unit_price": 2.45,
        "includes_taxes": False,
        "includes_airport_fees": True,
        "fuel_type": "Jet A-1",
        "validity_start_date": "2024-02-01",
        "validity_end_date": "2024-12-31",
        "minimum_order_quantity": 1000.0,
        "minimum_order_unit": "USG"
    }
    
    try:
        fuel_bid = FuelBid(**fuel_bid_data)
        print(f"✅ FuelBid schema validation passed: {fuel_bid.title}")
    except Exception as e:
        print(f"❌ FuelBid schema validation failed: {e}")
        return False
    
    # Test ResponseEnvelope
    try:
        response = ResponseEnvelope(data=fuel_bid_data)
        print(f"✅ ResponseEnvelope validation passed")
    except Exception as e:
        print(f"❌ ResponseEnvelope validation failed: {e}")
        return False
    
    return True

def test_llama_agent_initialization():
    """Test that the LlamaIndex agent can be initialized (without API calls)"""
    print("🧪 Testing LlamaIndex agent initialization setup...")
    
    try:
        from app.core.agents.document_extractor import initialize_llama_extractor_agent
        from app.config.agent_variables import FUEL_BID_LLAMA_EXTRACTOR_AGENT_NAME
        
        # Test that the function exists and can be imported
        print("✅ LlamaIndex agent initializer imported successfully")
        print(f"✅ Agent name configured: {FUEL_BID_LLAMA_EXTRACTOR_AGENT_NAME}")
        return True
        
    except ImportError as e:
        print(f"❌ Failed to import LlamaIndex components: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error in agent initialization test: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Fleet AI Backend Extraction Tests")
    print("=" * 50)
    
    tests = [
        test_schema_validation,
        test_llama_agent_initialization,
    ]
    
    passed = 0
    for test in tests:
        try:
            if test():
                passed += 1
            print()
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
            print()
    
    print("=" * 50)
    print(f"📊 Test Results: {passed}/{len(tests)} passed")
    
    if passed == len(tests):
        print("🎉 All tests passed! Your backend extraction setup looks good.")
        return 0
    else:
        print("⚠️ Some tests failed. Please review the issues above.")
        return 1

if __name__ == "__main__":
    sys.exit(main())
