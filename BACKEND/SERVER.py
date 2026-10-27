import socket
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

FRONTEND = Path(__file__).resolve().parent.parent / "FRONTEND"
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5500


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".js": "text/javascript"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


class Server(ThreadingHTTPServer):
    allow_reuse_address = False


def port_in_use(port):
    for family, address in ((socket.AF_INET, "127.0.0.1"), (socket.AF_INET6, "::1")):
        with socket.socket(family, socket.SOCK_STREAM) as probe:
            probe.settimeout(0.5)
            if probe.connect_ex((address, port)) == 0:
                return True
    return False


try:
    if port_in_use(PORT):
        raise OSError
    server = Server(("127.0.0.1", PORT), partial(Handler, directory=str(FRONTEND)))
except OSError:
    sys.exit(f"Port {PORT} is already in use. Stop the old server (or close its terminal) and try again.")

print(f"Serving HTTP on http://localhost:{PORT}/INDEX.html", flush=True)
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
