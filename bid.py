import pygame
import sys
import random

# Initialize pygame
pygame.init()
screen = pygame.display.set_mode((1000, 800))
pygame.display.set_caption("Bridge Bidding System")
font = pygame.font.Font(None, 18)  # Smaller font size for better layout

# Define Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GREEN = (0, 128, 0)

# Define bridge bid levels and suits
levels = list(range(1, 8))  # 1 to 7
suits = ["Clubs", "Diamonds", "Hearts", "Spades", "No Trump"]
bids = []  # List to store the history of bids
current_player = 0  # Start with player 1
bid_selected = None  # Track the current selected bid

# Card and Deck Classes
class Card:
    def __init__(self, rank, suit):
        self.rank = rank
        self.suit = suit

    def __str__(self):
        return f"{self.rank} of {self.suit}"

class Deck:
    def __init__(self):
        self.cards = [Card(rank, suit) for suit in ["Clubs", "Diamonds", "Hearts", "Spades"]
                      for rank in ["2", "3", "4", "5", "6", "7", "8", "9", "10", "Jack", "Queen", "King", "Ace"]]
        random.shuffle(self.cards)

    def draw(self, num):
        """Draw `num` cards from the deck."""
        return [self.cards.pop() for _ in range(num)]

# Initialize a deck and deal hands to 4 players
deck = Deck()
hands = [deck.draw(13) for _ in range(4)]  # Draw 13 cards for each player

# Helper functions
def draw_bidding_box():
    """Draws a grid of bidding options for player selection."""
    y_offset = 80
    for level in levels:
        x_offset = 50
        for suit in suits:
            bid_text = font.render(f"{level} {suit}", True, BLACK)
            pygame.draw.rect(screen, GREEN, (x_offset, y_offset, 120, 40))  # Increased width for each bid box
            screen.blit(bid_text, (x_offset + 10, y_offset + 10))  # Added padding for better alignment
            x_offset += 130  # Increase spacing between columns
        y_offset += 50  # Increase spacing between rows

def display_bids():
    """Displays the list of bids made so far."""
    y_offset = 400
    for i, (player, bid) in enumerate(bids):
        bid_text = font.render(f"Player {player + 1}: {bid}", True, BLACK)
        screen.blit(bid_text, (50, y_offset + i * 30))

def display_hand(player_hand):
    """Displays the current player's hand of cards on the screen."""
    x_offset, y_offset = 50, 500
    for card in player_hand:
        card_text = font.render(str(card), True, BLACK)
        screen.blit(card_text, (x_offset, y_offset))
        x_offset += 60  # Adjusted spacing to avoid overlap

def get_bid_from_click(position):
    """Converts a mouse click position to a specific bid."""
    x, y = position
    level_index = (y - 80) // 50
    suit_index = (x - 50) // 130
    if 0 <= level_index < len(levels) and 0 <= suit_index < len(suits):
        return f"{levels[level_index]} {suits[suit_index]}"
    return None

def is_valid_bid(bid):
    """Checks if a bid is valid based on bridge bidding rules."""
    if not bids:
        return True  # Any bid is valid if no bid has been made
    last_bid_level, last_bid_suit = bids[-1][1].split(" ", 1)
    new_bid_level, new_bid_suit = bid.split(" ", 1)
    
    # Convert bid levels to integers for comparison
    last_bid_level, new_bid_level = int(last_bid_level), int(new_bid_level)
    
    # Check if the new bid is higher than the last bid
    if new_bid_level > last_bid_level:
        return True
    elif new_bid_level == last_bid_level:
        return suits.index(new_bid_suit) > suits.index(last_bid_suit)
    return False

# Main Game Loop
running = True
while running:
    screen.fill(WHITE)
    draw_bidding_box()
    display_bids()
    display_hand(hands[current_player])  # Show current player's hand
    
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
            pygame.quit()
            sys.exit()

        elif event.type == pygame.MOUSEBUTTONDOWN:
            pos = pygame.mouse.get_pos()
            selected_bid = get_bid_from_click(pos)
            if selected_bid:
                # Check if the bid is valid before recording
                if is_valid_bid(selected_bid):
                    bids.append((current_player, selected_bid))  # Record the bid
                    current_player = (current_player + 1) % 4  # Rotate to the next player
                else:
                    print("Invalid bid. Please select a higher bid.")

    pygame.display.flip()
