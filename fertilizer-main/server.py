from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
import os

def run_server():
    # Set the port number
    port = 8000
    
    # Create the server
    server_address = ('', port)
    httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
    
    print(f"Server running at http://localhost:{port}")
    
    # Open the website in the default browser
    webbrowser.open(f'http://localhost:{port}')
    
    # Start the server
    httpd.serve_forever()

if __name__ == '__main__':
    run_server() 