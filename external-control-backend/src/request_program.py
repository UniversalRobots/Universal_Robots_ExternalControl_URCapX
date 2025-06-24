import socket
import time

class RequestProgram(object):
    def __init__(self, port, robotIP):
        """
        Initializes a new instance of the RequestProgram class.

        Args:
            port (int): The port number for the socket connection.
            robotIP (str): The IP address of the robot.

        Attributes:
            robotIP (str): The IP address of the robot.
            port (int): The port number for the socket connection.
            header (str): The header of the program code.
            control_loop (str): The control loop of the program code.
        """
        self.robotIP = robotIP
        self.port = port
        self.header = ""
        self.control_loop = ""

    def set_port(self, port):
        """
        Sets the port number for the socket connection.

        Args:
            port (int): The port number for the socket connection.
        """
        self.port = port

    def set_robotIP(self, robotIP):
        """
        Sets the IP address of the robot.

        Args:
            robotIP (str): The IP address of the robot.
        """
        self.robotIP = robotIP
        
    def send_command(self, command: str):
        """
        Sends a command to the robot and receives the program code in response.

        Args:
            command (str): The command to send to the robot.

        Returns:
            str: The program code received from the robot.

        Raises:
            Exception: If the connection to the remote PC could not be established or no data is received.
        """
        program = ""
        timeout = 5
        try:
            # Create a socket connection with the robot IP and port number defined above
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            s.settimeout(0.1)
            s.connect((self.robotIP, self.port))
            s.sendall(command.encode('us-ascii'))
            # Receive script code
            raw_data = b""
            begin = time.time()
            while True:
                try:
                    data = s.recv(5)
                    raw_data += data
                except socket.timeout:
                    print("No data received from the server")
                    if raw_data != b"":
                        print(raw_data)
                        break
                    elif time.time() - begin > timeout:
                        s.close()
                        raise Exception(f"Connection timeout")
            program = raw_data.decode("us-ascii")
            s.close()
            if not bool(program and program.strip()):
                raise Exception(f"Did not receive any script lines")
            return program
        except Exception as e:
            raise Exception(f"Connectivity problem with {self.robotIP}:{self.port}: {e}")