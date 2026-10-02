# 개발용 정적 서버 — 캐시를 끄고 서빙해서 코드 수정이 새로고침만으로 반영되도록 함
import http.server
import socketserver
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8123


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map, '.js': 'text/javascript'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()


socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('', PORT), NoCacheHandler) as httpd:
    print(f'Serving on http://localhost:{PORT}')
    httpd.serve_forever()
