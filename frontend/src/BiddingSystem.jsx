import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BiddingSystem({ playerName }) {

  const { state } = useLocation(); // Access passed player data through the state prop
  const { playerName: passedPlayerName } = state || {}; // Destructure the playerName
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [highestBid, setHighestBid] = useState({ suit: "None", trick: 0 });
  const [selectedSuit, setSelectedSuit] = useState(null);
  const [selectedTrick, setSelectedTrick] = useState(null);
  const [isUserTurn, setIsUserTurn] = useState(false);
  const [biddingMessage, setBiddingMessage] = useState("Starting Bidding...");
  const [passCount, setPassCount] = useState(0);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [userHasWon, setUserHasWon] = useState(false);
  const [hasBid, setHasBid] = useState(false);
  const navigate = useNavigate();

  const suits = ["♣", "♦", "♥", "♠", "NT"];
  const tricks = [1, 2, 3, 4, 5, 6, 7];

  // Fetch players from backend
  useEffect(() => {
    async function fetchPlayers() {
      try {
        const response = await fetch("http://localhost:5000/lobby"); // Replace with your actual API endpoint
        const data = await response.json();
        setPlayers(data.lobby.players);
        console.log("Players fetched:", data.lobby.players);
      } catch (error) {
        console.error("Error fetching players:", error);
      }
    }
    fetchPlayers();
  }, []);

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
        setHighestBid({ suit: selectedSuit, trick: selectedTrick });
        setBiddingMessage("Bid placed successfully!");
        setUserHasWon(true);
      } else {
        setBiddingMessage("Your bid must be higher than the current highest bid.");
      }
      setHasBid(true);
      setTimeout(() => {
        setBiddingMessage(`${playerName} passes.`);
        setPassCount((prevPassCount) => prevPassCount + 1);
        nextPlayer();
      }, 1500); // Adjusted timeout to remove randomness
    }
  };

  const simulateAIBid = () => {
    if (userHasWon) {
      setBiddingMessage(`${players[currentPlayerIndex]} passes...`);
      setTimeout(() => {
        setBiddingMessage(`${players[currentPlayerIndex]} passes`);
        setPassCount((prevPassCount) => prevPassCount + 1);
        nextPlayer();
      }, 1500); // Adjusted timeout

      return;
    }

    setBiddingMessage(`${players[currentPlayerIndex]} is choosing...`);

    setTimeout(() => {
      let bidPlaced = false;
      // Simulate AI bid logic (you can replace this with real logic)
      const aiBidSuit = suits[1]; // Replace with your AI logic
      const aiBidTrick = highestBid.trick + 1; // Increment trick for AI

      if (isHigherBid(aiBidTrick, aiBidSuit)) {
        setHighestBid({ suit: aiBidSuit, trick: aiBidTrick });
        bidPlaced = true;
        setPassCount(0);
      }

      if (!bidPlaced) {
        setBiddingMessage(`${players[currentPlayerIndex]} passes`);
        setPassCount((prevPassCount) => prevPassCount + 1);
      }

      nextPlayer();
    }, 1500); // Adjusted timeout
  };

  const nextPlayer = () => {
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextIndex);
    setSelectedSuit(null);
    setSelectedTrick(null);

    setHasBid(false);

    if (passCount >= players.length) {
      setBiddingMessage("Bidding has ended.");
      setShowWinPopup(true);
      return;
    }

    if (nextIndex === 2 && userHasWon) {
      setBiddingMessage("You won the round!");
      setShowWinPopup(true);
      return;
    }

    if (nextIndex === 2) {
      setIsUserTurn(true);
      setBiddingMessage("It's your turn to bid!");
    } else {
      setIsUserTurn(false);
    }
  };

  useEffect(() => {
    if (!isUserTurn && currentPlayerIndex !== 2) {
      simulateAIBid();
    }
  }, [currentPlayerIndex]);

  useEffect(() => {
    if (showWinPopup) {
      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            clearInterval(countdownInterval);
            resetGame();
            return 3;
          }
          return prevCountdown - 1;
        });
      }, 1000);
    }
  }, [showWinPopup]);

  const resetGame = () => {
    setShowWinPopup(false);
    navigate("/game");
    setHighestBid({ suit: "♣", trick: 1 });
    setCurrentPlayerIndex(0);
    setPassCount(0);
    setBiddingMessage("Starting Bidding...");
  };

  // Use playerName from the prop or from the state
  const activePlayer = playerName || passedPlayerName;

  return (
    <div className="flex items-center justify-center h-screen bg-green-900">
      <div className="flex flex-row bg-green-800 rounded-lg p-4 shadow-lg">
        <div className="bg-green-600 rounded-lg relative p-24">
          <h1 className="absolute top-2 left-4 text-2xl font-bold text-white">
            MyBridge: {playerName}
          </h1>
          {players.map((player, index) => (
            <div
              key={player}
              className={`absolute ${
                player === "Alex"
                  ? "top-4 left-1/2 transform -translate-x-1/2"
                  : ""
              } ${
                player === "Lisa"
                  ? "left-2 top-1/2 transform -translate-y-1/2"
                  : ""
              } ${
                player === "John"
                  ? "bottom-4 left-1/2 transform -translate-x-1/2"
                  : ""
              } ${
                player === "Marie"
                  ? "right-2 top-1/2 transform -translate-y-1/2"
                  : ""
              }`}
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
            <p className="text-lg text-gray-700">
              Starting the game in {countdown} seconds...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
