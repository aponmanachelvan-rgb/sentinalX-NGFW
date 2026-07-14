# Wireshark-based traffic collector

This project can receive live traffic events from a laptop using tshark/wireshark.

## Requirements
- Install Wireshark and tshark on your laptop.
- Make sure the app is running locally at http://localhost:3000.

## Windows example
1. Install Wireshark from the official site.
2. Open PowerShell.
3. Install the Python dependency:
   ```powershell
   pip install requests
   ```
4. Run the collector:
   ```powershell
   $env:SENTINELX_API_URL="http://localhost:3000/api/home-traffic"
   $env:SENTINELX_INTERFACE="<your network adapter>"
   python .\scripts\wireshark_collector.py
   ```

## Notes
- The script uses tshark to inspect traffic on the selected interface.
- It sends simplified events to the dashboard ingestion endpoint.
- For a more reliable setup, you may want to run it as an administrator.
