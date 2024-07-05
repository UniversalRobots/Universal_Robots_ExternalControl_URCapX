import socket

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
            Exception: If the connection to the remote PC could not be established.
        """

        program = ""
        timeout = 5
        # Create a socket connection with the robot IP and port number defined above
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.connect((self.robotIP, self.port))
        s.sendall(command.encode('us-ascii'))
        s.settimeout(timeout)  # Set timeout for receiving data
        
        #Receive script code
        raw_data = b""
        while True:
            try:
                data = s.recv(1024)
                if not data:
                    break
                
                raw_data += data
            
            except socket.timeout:
                break

        program = raw_data.decode("us-ascii")

        # Close the connection
        s.close()

        return program