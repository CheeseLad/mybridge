import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import BiddingSystem from "./BiddingSystem";

const socket = io("http://127.0.0.1:5000");

export default function MyBridgeLogin() {
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [lobbyCode, setLobbyCode] = useState("");
  const [players, setPlayers] = useState([]);
  const [inLobby, setInLobby] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [playingGame, setPlayingGame] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("update_players", (data) => {
      setPlayers(data.players);
    });

    socket.on("start_game", () => {
      setPlayingGame(true);
    });

    socket.on("join_error", (data) => {
      setError(data.error);
      setShowPopup(false);
    });

    return () => {
      socket.off("update_players");
      socket.off("start_game");
      socket.off("join_error");
    };
  }, [navigate, playerName]);

  const handleLogin = () => {
    setError("");
    setShowPopup(true);

    socket.emit("join_lobby", { name, code: lobbyCode });
    setPlayerName(name);
    setInLobby(true);
  };

  return (
    <div>
      {playingGame ? (
        <div>
          <BiddingSystem playerName={playerName} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen bg-green-900">
          <div className="bg-green-800 p-8 rounded-lg shadow-lg relative">
            <h1 className="absolute top-4 left-4 text-3xl font-bold text-white">
              MyBridge
            </h1>

            {!inLobby ? (
              <div>
                <div className="flex justify-center mb-8 py-4">
                  <img
                    src="/cards.png"
                    alt="Playing Cards"
                    className="w-48 h-48"
                  />
                </div>
                <div className="bg-green-600 p-6 rounded-lg shadow-md mb-4">
                  <h2 className="text-white text-2xl font-bold text-center mb-4">
                    Join Existing Lobby
                  </h2>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                  <input
                    type="text"
                    placeholder="Enter Lobby Code"
                    value={lobbyCode}
                    onChange={(e) => setLobbyCode(e.target.value)}
                    className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300"
                  />
                  <button
                    onClick={handleLogin}
                    className="w-full bg-green-700 text-white font-bold py-2 rounded-lg hover:bg-green-800 transition"
                  >
                    Join Game
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-white text-center">
                <h2 className="text-2xl font-bold mb-4">Waiting Room</h2>
                <p className="mb-4">Waiting for other players to join...</p>
                <ul className="mb-4">
                  {players.map((player, index) => (
                    <li key={index} className="text-lg">
                      {player}
                    </li>
                  ))}
                </ul>
                <p className="text-sm">Players connected: {players.length}/4</p>
              </div>
            )}

            {showPopup && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-lg text-center">
                  <p className="text-lg font-semibold text-green-700">
                    Connecting to server...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-500 text-white p-4 rounded-lg mt-4">
                {error}
              </div>
            )}

            <div className="absolute bottom-4 left-4 text-sm text-gray-300">
              2024 MyBridge Copyright
            </div>
            <div className="absolute bottom-4 right-4 text-sm text-gray-300">
              Terms and Services
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
