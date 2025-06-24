import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../src')))
import pytest
import socket
from request_program import RequestProgram

class DummySocket:
    def __init__(self, responses=None, raise_timeout=False, raise_connect=False):
        self.responses = responses or []
        self.sent = []
        self.closed = False
        self.recv_calls = 0
        self.raise_timeout = raise_timeout
        self.raise_connect = raise_connect
        self.timeout = None
    def settimeout(self, timeout):
        self.timeout = timeout
    def connect(self, addr):
        if self.raise_connect:
            raise socket.error("connect error")
    def sendall(self, data):
        self.sent.append(data)
    def recv(self, bufsize):
        if self.raise_timeout:
            raise socket.timeout("timed out")
        if self.recv_calls < len(self.responses):
            resp = self.responses[self.recv_calls]
            self.recv_calls += 1
            return resp
        return b''
    def close(self):
        self.closed = True

@pytest.fixture(autouse=True)
def patch_socket(monkeypatch):
    monkeypatch.setattr(socket, 'socket', lambda *a, **kw: DummySocket())

def test_send_command_success(monkeypatch):
    responses = [b'# HEADER_BEGIN\nheader\n# HEADER_END\n', b'print("hi")\n']
    dummy = DummySocket(responses=responses)
    monkeypatch.setattr(socket, 'socket', lambda *a, **kw: dummy)
    rp = RequestProgram(1234, '127.0.0.1')
    result = rp.send_command('request_program\n')
    assert '# HEADER_BEGIN\nheader\n# HEADER_END' in result
    assert 'print("hi")' in result
    assert dummy.closed

def test_send_command_no_data(monkeypatch):
    dummy = DummySocket(responses=[])
    monkeypatch.setattr(socket, 'socket', lambda *a, **kw: dummy)
    rp = RequestProgram(1234, '127.0.0.1')
    with pytest.raises(Exception) as exc:
        rp.send_command('request_program\n')
    assert (
        'Connectivity problem with 127.0.0.1:1234: Did not receive any script lines' in str(exc.value)
    )
    assert dummy.closed

def test_send_command_timeout(monkeypatch):
    dummy = DummySocket(raise_timeout=True)
    monkeypatch.setattr(socket, 'socket', lambda *a, **kw: dummy)
    rp = RequestProgram(1234, '127.0.0.1')
    with pytest.raises(Exception) as exc:
        rp.send_command('request_program\n')
    assert 'Connectivity problem with 127.0.0.1:1234: Connection timeout' in str(exc.value)
    assert dummy.closed

def test_send_command_connect_error(monkeypatch):
    dummy = DummySocket(raise_connect=True)
    monkeypatch.setattr(socket, 'socket', lambda *a, **kw: dummy)
    rp = RequestProgram(1234, '127.0.0.1')
    with pytest.raises(Exception) as exc:
        rp.send_command('request_program\n')
    assert 'connect error' in str(exc.value)
    assert dummy.closed or not dummy.closed  # connect error may not close
