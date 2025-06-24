import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
import pytest
from unittest.mock import patch
from simple_rest_api import app, program_cache

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

@patch('request_program.RequestProgram')
def test_cache_miss_and_split(mock_reqprog, client):
    program = '# HEADER_BEGIN\nheader\n# HEADER_END\nprint("hi")\n'
    instance = mock_reqprog.return_value
    instance.send_command.return_value = program
    program_cache.clear()
    resp = client.get('/1234/192.168.0.1/')
    data = resp.get_json()
    assert '# HEADER_BEGIN\nheader\n# HEADER_END' in data['preamble']
    assert 'print("hi")' not in data['preamble']
    assert 'print("hi")' in data['program_node']
    assert '# HEADER_BEGIN\nheader\n# HEADER_END' not in data['program_node']
    assert data['valid'] is True
    assert data['status'] == 'ok'
    resp2 = client.get('/1234/192.168.0.1/')
    data2 = resp2.get_json()
    assert data2 == data

@patch('request_program.RequestProgram')
def test_no_header_all_program_node(mock_reqprog, client):
    program = 'print("no header")\n'
    instance = mock_reqprog.return_value
    instance.send_command.return_value = program
    program_cache.clear()
    resp = client.get('/4321/10.0.0.2/')
    data = resp.get_json()
    assert data['preamble'] == ''
    assert 'no header' in data['program_node']
    assert data['valid'] is True
    assert data['status'] == 'ok'

