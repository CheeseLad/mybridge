import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function MyBridgeLogin() {
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
      navigate("/bidding"); 
    }, 3000);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-green-900">
      <div className="bg-green-800 p-8 rounded-lg shadow-lg relative">

        <h1 className="absolute top-4 left-4 text-3xl font-bold text-white">
          MyBridge
        </h1>

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
            className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <input
            type="text"
            placeholder="Enter Lobby Code"
            className="w-full mb-4 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-300"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-green-700 text-white font-bold py-2 rounded-lg hover:bg-green-800 transition"
          >
            Join Game
          </button>
        </div>

        {showPopup && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg text-center">
              <p className="text-lg font-semibold text-green-700">
                Login successful, connecting to server...
              </p>
            </div>
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
  );
}
