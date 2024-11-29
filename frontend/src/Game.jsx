import React, { useState, useEffect } from "react";

export default function Game() {
  const [players, setPlayers] = useState([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [roundWinner, setRoundWinner] = useState(null);
  const [teamScores, setTeamScores] = useState({ team1: 0, team2: 0 });

  // Initialize the game state once when the component mounts
  useEffect(() => {
    startNewGame();
  }, []);

  function startNewGame() {
    const deck = generateDeck();
    const shuffledDeck = shuffleDeck(deck);
    const initialPlayers = dealCards(shuffledDeck, [
      { name: "Alex", team: 1 },
      { name: "Lisa", team: 2 },
      { name: "John", team: 1 },
      { name: "Marie", team: 2 },
    ]);
    setPlayers(initialPlayers);
    setTeamScores({ team1: 0, team2: 0 });
    setCurrentPlayerIndex(0);
  }

  function generateDeck() {
    const suits = ["♣️", "♦️", "♥️", "♠️"];
    const values = Array.from({ length: 13 }, (_, i) => i + 2);
    const deck = [];

    suits.forEach((suit) => {
      values.forEach((value) => {
        deck.push({ suit, value });
      });
    });

    return deck;
  }

  function shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function dealCards(deck, playerInfos) {
    const players = playerInfos.map((info) => ({
      ...info,
      hand: [],
      playedCard: null,
    }));

    deck.forEach((card, index) => {
      players[index % players.length].hand.push(card);
    });

    return players;
  }

  function playCard(cardIndex) {
    // Clone the players array
    const newPlayers = [...players];

    // Clone the player object to avoid mutating state directly
    const player = { ...newPlayers[currentPlayerIndex] };

    // Clone the player's hand
    const hand = [...player.hand];

    // Remove the played card from the hand
    const playedCard = hand.splice(cardIndex, 1)[0];

    // Update player's hand and playedCard
    player.hand = hand;
    player.playedCard = playedCard;

    // Update the players array with the updated player
    newPlayers[currentPlayerIndex] = player;

    // Update the state
    setPlayers(newPlayers);

    // Advance to the next player
    const nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    setCurrentPlayerIndex(nextPlayerIndex);

    // Check if all players have played
    if (newPlayers.every((p) => p.playedCard !== null)) {
      determineRoundWinner();
    }
  }

  function determineRoundWinner() {
    const suitRank = {
      "♣️": 1,
      "♦️": 2,
      "♥️": 3,
      "♠️": 4,
    };

    const activePlayers = players.filter((p) => p.playedCard !== null);

    // Find the highest suit rank among the played cards
    const highestSuitRank = Math.max(
      ...activePlayers.map((p) => suitRank[p.playedCard.suit])
    );

    // Filter players who played the highest suit
    const playersWithHighestSuit = activePlayers.filter(
      (p) => suitRank[p.playedCard.suit] === highestSuitRank
    );

    // Determine the winner among those players
    let winner = playersWithHighestSuit.reduce((prev, curr) => {
      return prev.playedCard.value > curr.playedCard.value ? prev : curr;
    });

    setRoundWinner(winner.name);

    // Update team scores
    const winningTeam = winner.team;
    const updatedTeamScores = { ...teamScores };
    updatedTeamScores[`team${winningTeam}`] += 20;
    setTeamScores(updatedTeamScores);

    // Introduce a delay before resetting for the next round
    setTimeout(() => {
      // Check for game over condition
      if (updatedTeamScores[`team${winningTeam}`] >= 100) {
        // Reset game
        alert(`Team ${winningTeam} wins the game!`);
        startNewGame();
      } else {
        // Reset played cards for the next round
        const newPlayers = players.map((player) => ({
          ...player,
          playedCard: null,
        }));
        setPlayers(newPlayers);

        // Set current player to the winner
        const winnerIndex = players.findIndex((p) => p.name === winner.name);
        setCurrentPlayerIndex(winnerIndex);

        // Clear the round winner after the delay
        setRoundWinner(null);
      }
    }, 3000);
  }

  function cardDisplay(card) {
    const valueMap = {
      11: "J",
      12: "Q",
      13: "K",
      14: "A",
    };
    const valueDisplay = valueMap[card.value] || card.value;
    return `${valueDisplay}${card.suit}`;
  }

  return (
    <div className="flex flex-col h-screen bg-green-900 text-white font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-green-800">
        <h1 className="text-3xl font-bold">MyBridge</h1>
        <div className="text-3xl cursor-pointer">☰</div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 relative">
        {/* Winner Announcement */}
        {roundWinner && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white text-black p-8 rounded-lg">
              <h2 className="text-3xl font-bold mb-4">Round Winner!</h2>
              <p className="text-2xl">{roundWinner} wins the round!</p>
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="relative flex flex-col items-center justify-center flex-1 bg-green-700 border-4 border-yellow-500 rounded-lg p-4 mx-4">
          {/* Players */}
          {players.map((player, index) => (
            <PlayerArea
              key={index}
              player={player}
              position={getPosition(index)}
              isCurrent={currentPlayerIndex === index}
              onPlayCard={playCard}
              isBottomPlayer={index === 0} // Assuming the bottom player is at index 0
            />
          ))}

          {/* Center Cards */}
          <div className="bg-green-600 p-4 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4">
              {players.map((player, i) => (
                <div
                  key={i}
                  className="bg-white text-black w-10 h-14 rounded border border-gray-400 flex items-center justify-center"
                >
                  {player.playedCard ? `${cardDisplay(player.playedCard)}` : "🂠"}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-1/4 bg-gray-100 text-gray-900 rounded-lg shadow-lg p-4">
          <div className="bg-yellow-500 text-center text-xl font-bold py-2 rounded mb-4">
            {roundWinner ? `Winner: ${roundWinner}` : `Round in Progress`}
          </div>
          {/* Team Scores */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold">Team Scores:</h3>
            <p>Team 1: {teamScores.team1}</p>
            <p>Team 2: {teamScores.team2}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center p-2 bg-green-800 text-gray-300 text-sm">
        <span>© 2024 MyBridge Copyright</span>
        <span className="cursor-pointer hover:text-white">Terms and Services</span>
      </div>
    </div>
  );
}

function PlayerArea({ player, position, isCurrent, onPlayCard, isBottomPlayer }) {
  const positionClasses = getPositionClasses(position);

  const handleCardClick = (i) => {
    if (isCurrent) {
      onPlayCard(i);
    } else {
      alert("It's not your turn!");
    }
  };

  return (
    <div className={positionClasses.wrapper}>
      <div className="bg-blue-600 text-white px-2 py-1 rounded">
        {player.name} (Team {player.team})
      </div>
      <div className={positionClasses.hand}>
        {player.hand.map((card, i) => (
          <div
            key={`${card.suit}${card.value}${i}`}
            className="bg-white text-black w-6 h-10 rounded border border-gray-400 cursor-pointer flex items-center justify-center text-sm"
            onClick={() => handleCardClick(i)}
          >
            {isBottomPlayer ? `${cardDisplay(card)}` : ""}
          </div>
        ))}
      </div>
    </div>
  );
}

function getPosition(index) {
  // Map player index to positions around the table in clockwise order
  switch (index) {
    case 0:
      return "bottom"; // Player 0 at the bottom
    case 1:
      return "left"; // Player 1 to the left
    case 2:
      return "top"; // Player 2 at the top
    case 3:
      return "right"; // Player 3 to the right
    default:
      return "";
  }
}

function getPositionClasses(position) {
  switch (position) {
    case "top":
      return {
        wrapper: "absolute top-4 text-center",
        hand: "flex space-x-1 mt-2",
      };
    case "bottom":
      return {
        wrapper: "absolute bottom-4 text-center",
        hand: "flex space-x-1 mt-2",
      };
    case "left":
      return {
        wrapper: "absolute left-4 flex flex-col items-center",
        hand: "flex flex-col space-y-1 mt-2",
      };
    case "right":
      return {
        wrapper: "absolute right-4 flex flex-col items-center",
        hand: "flex flex-col space-y-1 mt-2",
      };
    default:
      return {};
  }
}

function cardDisplay(card) {
  const valueMap = {
    11: "J",
    12: "Q",
    13: "K",
    14: "A",
  };
  const valueDisplay = valueMap[card.value] || card.value;
  return `${valueDisplay}${card.suit}`;
}