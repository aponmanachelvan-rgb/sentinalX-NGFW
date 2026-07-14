import json
import os
import subprocess
import sys
import time
from typing import Optional

import requests

API_URL = os.getenv("SENTINELX_API_URL", "http://localhost:3000/api/home-traffic")
INTERFACE = os.getenv("SENTINELX_INTERFACE", "")
SLEEP_SECONDS = int(os.getenv("SENTINELX_SLEEP_SECONDS", "2"))


def find_tshark() -> Optional[str]:
    """Find tshark executable on Windows or Unix systems."""
    common_paths = [
        "tshark",
        "C:\\Program Files\\Wireshark\\tshark.exe",
        "C:\\Program Files (x86)\\Wireshark\\tshark.exe",
    ]

    for path in common_paths:
        try:
            result = subprocess.run(
                [path, "-v"],
                capture_output=True,
                text=True,
                check=False,
                timeout=None,
            )
            if result.returncode == 0:
                return path
        except (FileNotFoundError, subprocess.TimeoutExpired):
            pass

    return None


def detect_interface(tshark_path: str) -> Optional[str]:
    if INTERFACE:
        return INTERFACE

    try:
        result = subprocess.run(
            [tshark_path, "-D"],
            capture_output=True,
            text=True,
            check=False,
            timeout=5,
        )
        if result.returncode == 0:
            lines = [line for line in result.stdout.splitlines() if "\t" in line]
            if lines:
                return lines[0].split(".", 1)[1].split(" ", 1)[0].strip()
    except (FileNotFoundError, subprocess.TimeoutExpired):
        pass

    return None


def send_event(source_ip: str, dest_port: int, protocol: str) -> None:
    payload = {
        "source_ip": source_ip,
        "dest_port": dest_port,
        "protocol": protocol,
    }
    try:
        response = requests.post(API_URL, json=payload, timeout=5)
        if response.status_code >= 400:
            print(f"[ERROR] Status {response.status_code}: {response.text}", file=sys.stderr)
        else:
            print(f"[OK] {source_ip}:{dest_port} {protocol} -> {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Request failed: {e}", file=sys.stderr)


def sniff_loop(tshark_path: str, interface: str) -> None:
    cmd = [
        tshark_path,
        "-i",
        interface,
        "-T",
        "fields",
        "-e",
        "ip.src",
        "-e",
        "tcp.dstport",
        "-e",
        "udp.dstport",
        "-e",
        "frame.protocols",
        "-Y",
        "ip",
    ]

    last_sent = {}
    process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    try:
        while True:
            line = process.stdout.readline()
            if not line:
                if process.poll() is not None:
                    break
                continue

            parts = [part for part in line.strip().split("\t") if part]
            if len(parts) < 2:
                continue

            source_ip = parts[0]
            protocol = "TCP"
            port = None
            for part in parts[1:]:
                if part.isdigit():
                    port = int(part)
                    break
            if port is None:
                continue

            event_key = (source_ip, port, protocol)
            now = time.time()
            if now - last_sent.get(event_key, 0) >= SLEEP_SECONDS:
                send_event(source_ip, port, protocol)
                last_sent[event_key] = now
    finally:
        process.terminate()
        try:
            process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            process.kill()


def main() -> None:
    tshark_path = find_tshark()
    if not tshark_path:
        print("tshark not found. Make sure Wireshark is installed and in your PATH.", file=sys.stderr)
        sys.exit(1)

    interface = detect_interface(tshark_path)
    if not interface:
        print("No Wireshark/tshark interface found. Provide SENTINELX_INTERFACE.", file=sys.stderr)
        sys.exit(1)

    print(f"[INFO] API URL: {API_URL}")
    print(f"[INFO] Interface: {interface}")
    print(f"[INFO] Sleep between events: {SLEEP_SECONDS}s")
    print(f"[INFO] Starting packet capture...")
    sniff_loop(tshark_path, interface)


if __name__ == "__main__":
    main()
