#!/usr/bin/env python3
"""Simulation mode: generates realistic home-network traffic and sends to the dashboard."""

import os
import random
import sys
import time
from typing import Literal

import requests

API_URL = os.getenv("SENTINELX_API_URL", "http://localhost:3000/api/home-traffic")
SLEEP_SECONDS = float(os.getenv("SENTINELX_SLEEP_SECONDS", "1"))

# Realistic home network IPs
HOME_IPS = [
    "192.168.1.10",
    "192.168.1.15",
    "192.168.1.20",
    "192.168.1.25",
    "192.168.1.30",
]

# Common ports
COMMON_PORTS = [80, 443, 22, 53, 123, 445, 3389, 8080, 5432, 3306, 27017]

# Protocols
PROTOCOLS: list[Literal["TCP", "UDP", "ICMP"]] = ["TCP", "UDP", "ICMP"]


def send_event(source_ip: str, dest_port: int, protocol: str) -> bool:
    payload = {
        "source_ip": source_ip,
        "dest_port": dest_port,
        "protocol": protocol,
    }
    try:
        response = requests.post(API_URL, json=payload, timeout=5)
        if response.status_code == 200:
            print(f"✓ {source_ip}:{dest_port} {protocol}")
            return True
        else:
            print(f"✗ Status {response.status_code}: {response.text}", file=sys.stderr)
            return False
    except Exception as e:
        print(f"✗ Request failed: {e}", file=sys.stderr)
        return False


def generate_traffic() -> None:
    print(f"[INFO] Sending traffic to: {API_URL}")
    print(f"[INFO] Interval: {SLEEP_SECONDS}s")
    print(f"[INFO] Starting simulation mode...")
    print()

    try:
        while True:
            source_ip = random.choice(HOME_IPS)
            dest_port = random.choice(COMMON_PORTS)
            protocol = random.choice(PROTOCOLS)

            send_event(source_ip, dest_port, protocol)
            time.sleep(SLEEP_SECONDS)
    except KeyboardInterrupt:
        print("\n[INFO] Stopped.")


if __name__ == "__main__":
    generate_traffic()
