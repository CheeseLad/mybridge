import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

export default function BiddingSystem({ playerName }) {
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [highestBid, setHighestBid] = useState({ suit: "None", trick: 0 });
  const [selectedSuit, setSelectedSuit] = useState(null);
  const [selectedTrick, setSelectedTrick] = useState(null);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [biddingMessage, setBiddingMessage] = useState("Starting Bidding...");
  const passCount = useState(0);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [userHasWon, setUserHasWon] = useState(false);
  const [hasBid, setHasBid] = useState(false);
  const [socket, setSocket] = useState(null);

  const navigate = useNavigate();

  const suits = ["♣", "♦", "♥", "♠", "NT"];
  const tricks = [1, 2, 3, 4, 5, 6, 7];

  const getSuitValue = (suit) => suits.indexOf(suit);

  const isHigherBid = (newTrick, newSuit) => {
    return (
      newTrick > highestBid.trick ||
      (newTrick === highestBid.trick &&
        getSuitValue(newSuit) > getSuitValue(highestBid.suit))
    );
  };

  const handleUserBid = () => {
    if (selectedSuit && selectedTrick) {
      if (isHigherBid(selectedTrick, selectedSuit)) {
        socket.emit("place_bid", {
          player: playerName,
          bid: { suit: selectedSuit, trick: selectedTrick },
        });
        setBiddingMessage("Bid placed successfully!");
        nextPlayer();
        setHasBid(true);
      } else {
        setBiddingMessage(
          "Your bid must be higher than the current highest bid."
        );
      }
    }
  };

  const nextPlayer = () => {
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
    socket.emit("update_player_index");
    setSelectedSuit(null);
    setSelectedTrick(null);
    setHasBid(false);

    if (passCount >= players.length) {
      setBiddingMessage("Bidding has ended.");
      setShowWinPopup(true);
      setUserHasWon(true);
      navigate("/game");
      return;
    }
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch("http://localhost:5000/lobby");
        if (response.ok) {
          const data = await response.json();
          setPlayers(data.lobby.players);
        } else {
          console.error("Failed to fetch players data.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchPlayers();
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    setSocket(socket);

    socket.on("new_highest_bid", (data) => {
      setHighestBid(data.highest_bid);
      setBiddingMessage(`${data.player} placed a new highest bid.`);
    });

    socket.on("bid_error", (data) => {
      setBiddingMessage(data.error);
    });

    socket.on("pass_error", (data) => {
      setBiddingMessage(data.error);
    });

    socket.on("next_turn", (data) => {
      if (data.player === playerName) {
        setIsUserTurn(true);
        setBiddingMessage("It's your turn to bid!");
      } else {
        setIsUserTurn(false);
        setBiddingMessage(`${data.player} is bidding...`);
      }
    });

    socket.on("bidding_ended", (data) => {
      setBiddingMessage("Bidding has ended.");
      setShowWinPopup(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [playerName]);

  useEffect(() => {
    if (playerName === players[currentPlayerIndex]) {
      setIsUserTurn(true);
      setBiddingMessage("It's your turn to bid!");
    } else {
      setIsUserTurn(false);
      setBiddingMessage(players[currentPlayerIndex] + " is bidding...");
    }
  }, [currentPlayerIndex, players, playerName]);

  return (
    <div className="flex items-center justify-center h-screen bg-green-900">
      <div className="flex flex-row bg-green-800 rounded-lg p-4 shadow-lg">
        <div className="bg-green-600 rounded-lg relative p-24">
          <h1 className="absolute top-2 left-4 text-2xl font-bold text-white">
            MyBridge
          </h1>
          {players.map((player, index) => (
            <div
              key={player}
              style={{
                position: "absolute",
                ...(index === 0
                  ? { top: "4%", left: "50%", transform: "translateX(-50%)" }
                  : {}),
                ...(index === 1
                  ? { left: "2%", top: "50%", transform: "translateY(-50%)" }
                  : {}),
                ...(index === 2
                  ? { bottom: "4%", left: "50%", transform: "translateX(-50%)" }
                  : {}),
                ...(index === 3
                  ? { right: "2%", top: "50%", transform: "translateY(-50%)" }
                  : {}),
              }}
            >
              <div
                className={`px-4 py-1 rounded-full ${
                  currentPlayerIndex === index ? "bg-yellow-400" : "bg-blue-400"
                } text-white`}
              >
                {player}
              </div>
            </div>
          ))}

          <div className="bg-green-700 p-6 rounded-lg flex flex-col items-center mt-8">
            <div className="text-white text-xl font-semibold mb-4">
              {biddingMessage}
            </div>
            {isUserTurn && !hasBid && (
              <>
                <div className="flex justify-around w-full mb-4">
                  <div className="text-center text-white font-semibold">
                    SUITS
                  </div>
                  <div className="text-center text-white font-semibold">
                    TRICKS
                  </div>
                </div>
                <div className="flex justify-around w-full mb-6 m-4">
                  <div className="flex gap-4">
                    {suits.map((suit) => (
                      <button
                        key={suit}
                        onClick={() => setSelectedSuit(suit)}
                        className={`text-2xl px-4 py-2 rounded ${
                          selectedSuit === suit
                            ? "bg-green-400"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {suit}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    {tricks.map((trick) => (
                      <button
                        key={trick}
                        onClick={() => setSelectedTrick(trick)}
                        className={`text-xl px-4 py-2 rounded ${
                          selectedTrick === trick
                            ? "bg-green-400"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {trick}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={nextPlayer}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                  >
                    PASS
                  </button>
                  <button
                    onClick={handleUserBid}
                    className="bg-blue-500 text-white px-6 py-2 rounded-lg"
                  >
                    CONFIRM
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-gray-100 p-6 ml-4 rounded-lg shadow-lg w-48">
          <div className="text-lg font-bold text-yellow-600 mb-2">Round 1</div>
          <div className="bg-green-500 text-white text-center py-2 rounded-lg mb-4">
            Current Highest Bid
          </div>
          <div className="text-center text-3xl mb-2">{highestBid.suit}</div>
          <div className="text-center text-3xl">{highestBid.trick}</div>
        </div>
      </div>

      {showWinPopup && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold text-green-700 mb-4">
              {userHasWon ? "You won the bidding!" : "The bidding has ended!"}
            </p>
            <p className="text-lg text-gray-700">Starting the game...</p>
          </div>
        </div>
      )}
    </div>
  );
}
