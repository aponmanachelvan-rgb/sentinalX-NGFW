#!/usr/bin/env python3
"""Quick test to verify the /api/home-traffic endpoint is working."""

import requests
import sys

API_URL = "http://localhost:3000/api/home-traffic"

test_payload = {
    "source_ip": "192.168.1.100",
    "dest_port": 443,
    "protocol": "TCP",
}

print(f"Testing API endpoint: {API_URL}")
print(f"Sending test payload: {test_payload}")

try:
    response = requests.post(API_URL, json=test_payload, timeout=5)
    print(f"\n✓ Response Status: {response.status_code}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        print("\n✓ API is working! Traffic should appear on the dashboard.")
    else:
        print(f"\n✗ API returned error status {response.status_code}")
        sys.exit(1)
except Exception as e:
    print(f"\n✗ Failed to connect: {e}")
    print("Make sure the app is running on http://localhost:3000")
    sys.exit(1)
