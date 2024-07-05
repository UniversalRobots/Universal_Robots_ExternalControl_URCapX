import flask
from flask import Flask
from flask_cors import CORS
import request_program
import socket

command = "request_program\n"

# Create a simple rest api with Flask (https://flask.palletsprojects.com/en/2.0.x/)
app = Flask(__name__)
CORS(app)

@app.route('/<int:port>/<robotIP>/', methods=["GET"])
def read_params(port, robotIP):
    resp = create_response()
    con = request_program.RequestProgram(port, robotIP)
    program = con.send_command(command)
    resp.data = program
    return resp

def create_response():
    resp = flask.make_response()
    resp.headers['Content-Type'] = 'text/plain'
    return resp