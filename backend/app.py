from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit, join_room

app = Flask(__name__)
app.config["SECRET_KEY"] = "your_secret_key"
socketio = SocketIO(app, cors_allowed_origins="*")

# Global lobby state
lobby = {
    "code": "ABCD",  # Static lobby code for simplicity
    "players": [],    # List to track player names
    "bids": {         # Track the highest bid and its owner
        "highest_bid": {"suit": None, "trick": 0},
        "player": None
    },
    "current_turn": 0  # Index of the player whose turn it is
}

# Endpoint to fetch the current lobby state
@app.route("/lobby", methods=["GET"])
def get_lobby():
    return jsonify({"lobby": lobby})

@socketio.on("join_lobby")
def handle_join_lobby(data):
    name = data.get("name")
    code = data.get("code")

    if not name or not code:
        emit("join_error", {"error": "Name and lobby code are required."})
        return

    if code != lobby["code"]:
        emit("join_error", {"error": "Invalid lobby code."})
        return

    if len(lobby["players"]) >= 4:
        emit("join_error", {"error": "Lobby is full."})
        return

    if name in lobby["players"]:
        emit("join_error", {"error": "Name already taken."})
        return

    # Add the player to the lobby
    lobby["players"].append(name)
    join_room(lobby["code"])  # Join the room identified by the lobby code

    # Notify all players in the lobby about the new player list
    emit("update_players", {"players": lobby["players"]}, to=lobby["code"])

    # If the lobby is full, notify all players to start the game
    if len(lobby["players"]) == 4:
        emit("start_game", {"message": "All players connected! Starting game..."}, to=lobby["code"])

@socketio.on("place_bid")
def handle_place_bid(data):
    player = data.get("player")
    bid = data.get("bid")  # Expecting {"suit": "♠", "trick": 5}

    if not player or not bid or "suit" not in bid or "trick" not in bid:
        emit("bid_error", {"error": "Invalid bid data."})
        return

    if player != lobby["players"][lobby["current_turn"]]:
        emit("bid_error", {"error": "It's not your turn."})
        return

    current_highest = lobby["bids"]["highest_bid"]

    # Validate the bid is higher than the current highest
    def is_higher_bid(new_bid, current_bid):
        suits_order = ["♣", "♦", "♥", "♠", "NT"]
        new_suit_value = suits_order.index(new_bid["suit"])
        current_suit_value = suits_order.index(current_bid["suit"]) if current_bid["suit"] else -1

        return (
            new_bid["trick"] > current_bid["trick"] or
            (new_bid["trick"] == current_bid["trick"] and new_suit_value > current_suit_value)
        )

    if is_higher_bid(bid, current_highest):
        # Update the highest bid
        lobby["bids"]["highest_bid"] = bid
        lobby["bids"]["player"] = player

        # Notify all players about the new highest bid
        emit("new_highest_bid", {"highest_bid": bid, "player": player}, to=lobby["code"])
    else:
        emit("bid_error", {"error": "Your bid must be higher than the current highest bid."})
        return

    # Move to the next player's turn
    next_turn()

def next_turn():
    lobby["current_turn"] = (lobby["current_turn"] + 1) % len(lobby["players"])

    # Check if all players except one have passed
    if all(player == lobby["bids"]["player"] for player in lobby["players"] if player != None):
        # End bidding round
        emit("bidding_ended", {
            "highest_bid": lobby["bids"]["highest_bid"],
            "player": lobby["bids"]["player"]
        }, to=lobby["code"])
    else:
        # Notify the next player
        emit("next_turn", {"player": lobby["players"][lobby["current_turn"]]}, to=lobby["code"])

if __name__ == "__main__":
    socketio.run(app, debug=True)
