import json
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import urlopen

from app import create_server


class HealthEndpointTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = create_server(port=0)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_port}"

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def test_health_endpoint_reports_only_initialized_capabilities(self):
        with urlopen(f"{self.base_url}/health") as response:
            payload = json.load(response)

        self.assertEqual(response.status, 200)
        self.assertEqual(payload["status"], "ok")
        self.assertEqual(payload["service"], "aleks-math-assistant")
        self.assertEqual(payload["capabilities"]["math_engine"], "not_implemented")
        self.assertEqual(payload["capabilities"]["graphing_engine"], "not_implemented")

    def test_unknown_route_returns_json_404(self):
        with self.assertRaises(HTTPError) as error:
            urlopen(f"{self.base_url}/unknown")

        self.assertEqual(error.exception.code, 404)
        payload = json.load(error.exception)
        self.assertEqual(payload["status"], "error")


if __name__ == "__main__":
    unittest.main()
