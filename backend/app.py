from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS

app = Flask(__name__)
app.config["SECRET_KEY"] = "your_secret_key"

CORS(app)

socketio = SocketIO(app, cors_allowed_origins="*")

lobby = {
    "code": "ABCD",
    "players": [],
    "bids": {
        "highest_bid": {"suit": None, "trick": 0},
        "player": None
    },
    "current_turn": 0,
    "passed_players": []
}


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

    lobby["players"].append(name)
    join_room(lobby["code"])

    emit("update_players", {"players": lobby["players"]}, to=lobby["code"])

    if len(lobby["players"]) == 4:
        emit("start_game", {
             "message": "All players connected! Starting game..."}, to=lobby["code"])


@socketio.on("place_bid")
def handle_place_bid(data):
    player = data.get("player")
    bid = data.get("bid")

    if not player or not bid or "suit" not in bid or "trick" not in bid:
        emit("bid_error", {"error": "Invalid bid data."})
        return

    if player != lobby["players"][lobby["current_turn"]]:
        emit("bid_error", {"error": "It's not your turn."})
        return

    current_highest = lobby["bids"]["highest_bid"]

    def is_higher_bid(new_bid, current_bid):
        suits_order = ["♣", "♦", "♥", "♠", "NT"]
        new_suit_value = suits_order.index(new_bid["suit"])
        current_suit_value = suits_order.index(
            current_bid["suit"]) if current_bid["suit"] else -1

        return (
            new_bid["trick"] > current_bid["trick"] or
            (new_bid["trick"] == current_bid["trick"]
             and new_suit_value > current_suit_value)
        )

    if is_higher_bid(bid, current_highest):
        lobby["bids"]["highest_bid"] = bid
        lobby["bids"]["player"] = player
        emit("new_highest_bid", {"highest_bid": bid,
             "player": player}, to=lobby["code"])
    else:
        emit("bid_error", {
             "error": "Your bid must be higher than the current highest bid."})
        return

    next_turn()


@socketio.on("pass")
def handle_pass(data):
    player = data.get("player")

    if player != lobby["players"][lobby["current_turn"]]:
        emit("pass_error", {"error": "It's not your turn."})
        return

    if player not in lobby["passed_players"]:
        lobby["passed_players"].append(player)

    next_turn()


def next_turn():
    active_players = [
        player for player in lobby["players"] if player not in lobby["passed_players"]
    ]
    if len(active_players) == 1:
        emit("bidding_ended", {
            "highest_bid": lobby["bids"]["highest_bid"],
            "player": lobby["bids"]["player"]
        }, to=lobby["code"])
        return

    while True:
        lobby["current_turn"] = (
            lobby["current_turn"] + 1) % len(lobby["players"])
        next_player = lobby["players"][lobby["current_turn"]]
        if next_player not in lobby["passed_players"]:
            break

    emit("next_turn", {"player": lobby["players"]
         [lobby["current_turn"]]}, to=lobby["code"])


def update_player_index():
    lobby["current_turn"] = lobby["current_turn"] + 1


if __name__ == "__main__":
    socketio.run(app, debug=True)
