# ALEKS Math Assistant

Firefox-first local educational assistant. The current build implements Stage 1
(the extension status dashboard and ALEKS page detection bridge) and Stage 2
(the local backend health endpoint). It does not scan questions, solve math, or
generate graphs yet, and it does not submit answers.

ALEKS integration has not been tested against a live ALEKS account or page.

## Requirements

- macOS with Python 3.9 or newer
- Mozilla Firefox 128 or newer

The Stage 2 backend uses only the Python standard library; no packages need to
be installed.

## Start the backend on a school MacBook

1. Open Terminal and change to this project folder, for example:

   ```sh
   cd ~/Downloads/aleks
   ```

2. Start the backend:

   ```sh
   ./start.sh
   ```

   If macOS reports that the script is not executable, run
   `chmod +x start.sh` once, then start it again. The backend listens only on
   `127.0.0.1:8765`.

3. Check that it is running by opening
   <http://127.0.0.1:8765/health> in Firefox. A JSON response with
   `"status": "ok"` means the health check passed.

4. To stop the backend, return to its Terminal window and press **Control-C**.

## Load the Firefox extension temporarily

1. In Firefox, open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on…**.
3. Select `extension/manifest.json` from this project.
4. Pin or open the ALEKS Math Assistant toolbar button to view the dashboard.
5. Visit an ALEKS page and refresh the dashboard. The page bridge detects
   `aleks.com` and its subdomains. A page may need a reload after first loading
   the temporary add-on.

Firefox temporary add-ons are removed when Firefox closes. Repeat these steps
after restarting Firefox.

## Dashboard status

- **Local backend** is marked ready only after `/health` returns the expected
  healthy response.
- **Page detection** is marked working only after the ALEKS content-script
  bridge responds to a health ping.
- The HTML scanner, math engine, and graphing engine are explicitly marked
  **Not implemented** until their later development stages are complete.
- The activity log records extension initialization and ALEKS page detection.

The extension requests access only to ALEKS pages and the local backend health
URL. It does not read passwords, authentication tokens, or unrelated pages.

## Troubleshooting

- **Backend error:** Start `./start.sh` and verify the health URL. If port 8765
  is already in use, stop the other process using it before restarting.
- **Not connected to ALEKS:** Confirm the current tab is on `aleks.com` or a
  subdomain, reload that tab, and refresh the dashboard.
- **Unsupported webpage:** Page detection is intentionally limited to ALEKS
  domains.
- **Temporary add-on disappeared:** Load `extension/manifest.json` again via
  `about:debugging`.

## Run backend checks

```sh
cd backend
python3 -m unittest
```
