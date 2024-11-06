import socket
import threading
import random
import string

HOST = '127.0.0.1'  
PORT = 8005  
room_code = None

def generate_room_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))

def handle_client(conn, addr):
    print(f"Connected by {addr}")
    global room_code

    while True:
        data = conn.recv(1024).decode()
        if not data:
            break

        command, value = data.split(":", 1)

        if command == "REQUEST_CODE":
            conn.sendall(room_code.encode())

        elif command == "VALIDATE":
            name, entered_code = value.split(",")
            if entered_code == room_code:
                response = f"SUCCESS: Welcome {name}!"
            else:
                response = "FAILURE: Invalid room code."
            conn.sendall(response.encode())

    conn.close()

def start_server():
    global room_code
    
    room_code = generate_room_code()
    print(f"Server started with room code: {room_code}")

    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, PORT))
        s.listen()
        print("Waiting for client connections...")
        while True:
            conn, addr = s.accept()
            threading.Thread(target=handle_client, args=(conn, addr)).start()

if __name__ == "__main__":
    start_server()