
import pygame
import socket
import threading

HOST = '127.0.0.1'
PORT = 8005

pygame.init()
WIDTH, HEIGHT = 800, 600
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("MyBridge Login")


DARK_GREEN = (13, 56, 19)
WHITE = (255, 255, 255)
BUTTON_GREEN = (0, 100, 0)
BLACK = (0, 0, 0)
GRAY = (200, 200, 200)

title_font = pygame.font.SysFont("Arial", 50, bold=True)
input_font = pygame.font.SysFont("Arial", 24)
button_font = pygame.font.SysFont("Arial", 28, bold=True)


username_text = ""
code_text = ""
active_input = None
response_message = ""

username_box = pygame.Rect(300, 220, 200, 40)
code_box = pygame.Rect(300, 280, 200, 40)
button_box = pygame.Rect(300, 340, 200, 50)

def send_to_server(message):
    """Send a message to the server and receive a response."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.connect((HOST, PORT))
        s.sendall(message.encode())
        response = s.recv(1024).decode()
    return response

def draw_login_screen():
    
    screen.fill(DARK_GREEN)
    title_surf = title_font.render("MyBridge", True, WHITE)
    screen.blit(title_surf, (50, 20))

    
    pygame.draw.rect(screen, WHITE, username_box, border_radius=5)
    pygame.draw.rect(screen, WHITE, code_box, border_radius=5)

    
    username_surface = input_font.render(username_text, True, BLACK)
    code_surface = input_font.render(code_text, True, BLACK)
    screen.blit(username_surface, (username_box.x + 10, username_box.y + 5))
    screen.blit(code_surface, (code_box.x + 10, code_box.y + 5))

    
    pygame.draw.rect(screen, BUTTON_GREEN, button_box, border_radius=5)
    button_text = button_font.render("Join Game", True, WHITE)
    screen.blit(button_text, (button_box.x + 30, button_box.y + 10))

    
    response_surface = input_font.render(response_message, True, WHITE)
    screen.blit(response_surface, (300, 400))


running = True
while running:
    draw_login_screen()
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False

        
        elif event.type == pygame.MOUSEBUTTONDOWN:
            if username_box.collidepoint(event.pos):
                active_input = "username"
            elif code_box.collidepoint(event.pos):
                active_input = "code"
            elif button_box.collidepoint(event.pos):
                
                if username_text and code_text:
                    message = f"VALIDATE:{username_text},{code_text}"
                    response = send_to_server(message)
                    if response.startswith("SUCCESS"):
                        response_message = "Login Successful!"
                    else:
                        response_message = "Invalid room code. Please try again."

        
        elif event.type == pygame.KEYDOWN:
            if active_input == "username":
                if event.key == pygame.K_BACKSPACE:
                    username_text = username_text[:-1]
                else:
                    username_text += event.unicode
            elif active_input == "code":
                if event.key == pygame.K_BACKSPACE:
                    code_text = code_text[:-1]
                else:
                    code_text += event.unicode

    pygame.display.flip()

pygame.quit()
