import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


HOST = "127.0.0.1"
PORT = 8765


class HealthHandler(BaseHTTPRequestHandler):
    def _send_json(self, status_code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status_code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path != "/health":
            self._send_json(404, {"status": "error", "error": "Not found"})
            return

        self._send_json(
            200,
            {
                "status": "ok",
                "service": "aleks-math-assistant",
                "capabilities": {
                    "math_engine": "not_implemented",
                    "graphing_engine": "not_implemented",
                },
            },
        )

    def do_OPTIONS(self):
        if self.path != "/health":
            self._send_json(404, {"status": "error", "error": "Not found"})
            return

        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "600")
        self.end_headers()

    def do_POST(self):
        self._send_json(405, {"status": "error", "error": "POST is not supported"})

    def log_message(self, format_string, *args):
        print(f"{self.address_string()} - {format_string % args}")


def create_server(host=HOST, port=PORT):
    return ThreadingHTTPServer((host, port), HealthHandler)


def main():
    server = create_server()
    print(f"ALEKS Math Assistant backend listening on http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping ALEKS Math Assistant backend")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
