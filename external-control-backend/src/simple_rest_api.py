import flask
from flask import Flask, jsonify
from flask_cors import CORS
import request_program
import socket
import time
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

command = "request_program\n"

# Create a simple rest api with Flask (https://flask.palletsprojects.com/en/2.0.x/)
app = Flask(__name__)
CORS(app)

# Log startup message
logger.info("Starting Flask application...")
logger.info(f"Server hostname: {socket.gethostname()}")
logger.info(f"Server IP: {socket.gethostbyname(socket.gethostname())}")

# Simple in-memory cache: {(port, robotIP): (timestamp, program)}
program_cache = {}
CACHE_TTL = 2  # seconds

def split_program_sections(program_text):
    preamble = ''
    program_node = ''
    header_start = '# HEADER_BEGIN'
    header_end = '# HEADER_END'
    start_idx = program_text.find(header_start)
    end_idx = program_text.find(header_end)
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        end_idx += len(header_end)
        preamble = program_text[start_idx:end_idx]
        # Everything after header_end is the program node
        program_node = program_text[end_idx:].lstrip('\n')
    else:
        # If no header, treat all as program_node
        program_node = program_text
    return preamble, program_node

def get_cached_response(cache_key, now):
    if cache_key in program_cache:
        ts, json_str = program_cache[cache_key]
        if now - ts < CACHE_TTL:
            return flask.Response(json_str, mimetype='application/json')
    return None

def build_json_response(program, valid, status_text):
    preamble, program_node = split_program_sections(program)
    json_obj = {
        "preamble": preamble,
        "program_node": program_node,
        "valid": valid,
        "status": status_text
    }
    return flask.json.dumps(json_obj)

def store_in_cache(cache_key, now, json_str, valid):
    if valid:
        program_cache[cache_key] = (now, json_str)

@app.route('/<int:port>/<robotIP>/', methods=["GET"])
def read_params(port, robotIP):
    logger.info(f"Received request for port {port} and robot IP {robotIP}")
    cache_key = (port, robotIP)
    now = time.time()
    cached_resp = get_cached_response(cache_key, now)
    if cached_resp:
        logger.info(f"Returning cached response for port {port} and robot IP {robotIP}")
        return cached_resp
    status = None
    try:
        logger.info(f"Connecting to robot at {robotIP}:{port}")
        con = request_program.RequestProgram(port, robotIP)
        program = con.send_command(command)
        valid = bool(program and program.strip())
        status = "ok"
        logger.info(f"Successfully retrieved program from robot at {robotIP}:{port}")
    except Exception as e:
        program = ''
        valid = False
        status = str(e)
        logger.error(f"Error connecting to robot at {robotIP}:{port}: {str(e)}")
    json_str = build_json_response(program, valid, status)
    store_in_cache(cache_key, now, json_str, valid)
    return flask.Response(json_str, mimetype='application/json')

if __name__ == '__main__':
    logger.info("Flask application is ready to serve requests")
    app.run(host='0.0.0.0', port=5000)
