import React, { useState, useEffect } from "react";

export default function Game() {
  const [players, setPlayers] = useState([]);
  const playOrder = [2, 3, 0, 1];
  const [startingOrderIndex, setStartingOrderIndex] = useState(0);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [roundWinner, setRoundWinner] = useState(null);
  const [teamScores, setTeamScores] = useState({ team1: 0, team2: 0 });
  const [gameScores, setGameScores] = useState({ team1: 0, team2: 0 });
  const [trumpSuit, setTrumpSuit] = useState("");
  const [lastTrumpSuit, setLastTrumpSuit] = useState("");

  useEffect(() => {
    startNewGame();
  }, []);

  function startNewGame() {
    const deck = generateDeck();
    const shuffledDeck = shuffleDeck(deck);

    const suits = ["♣️", "♦️", "♥️", "♠️"];

    let availableSuits = suits;
    if (lastTrumpSuit) {
      availableSuits = suits.filter((suit) => suit !== lastTrumpSuit);
    }

    const chosenTrump =
      availableSuits[Math.floor(Math.random() * availableSuits.length)];

    setLastTrumpSuit(trumpSuit);
    setTrumpSuit(chosenTrump);

    const initialPlayers = dealCards(shuffledDeck, [
      { name: "Alex", team: 1 },
      { name: "Lisa", team: 2 },
      { name: "John", team: 1 },
      { name: "Marie", team: 2 },
    ]);

    setPlayers(initialPlayers);
    setTeamScores({ team1: 0, team2: 0 });
    setGameScores({ team1: 0, team2: 0 });
    setStartingOrderIndex(0);
    setCurrentTurnIndex(0);
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
    const newPlayers = [...players];
    const totalPlayers = playOrder.length;
    const currentPlayerIndex =
      playOrder[(startingOrderIndex + currentTurnIndex) % totalPlayers];
    const player = { ...newPlayers[currentPlayerIndex] };
    const hand = [...player.hand];

    const playedCard = hand.splice(cardIndex, 1)[0];
    player.hand = hand;
    player.playedCard = playedCard;
    newPlayers[currentPlayerIndex] = player;
    setPlayers(newPlayers);

    setCurrentTurnIndex(currentTurnIndex + 1);

    if (newPlayers.every((p) => p.playedCard !== null)) {
      determineRoundWinner();
    }
  }

  function determineRoundWinner() {
    const activePlayers = players.filter((p) => p.playedCard !== null);

    const trumpCards = activePlayers.filter(
      (p) => p.playedCard.suit === trumpSuit
    );

    let winner;

    if (trumpCards.length > 0) {
      winner = trumpCards.reduce((prev, curr) => {
        return prev.playedCard.value > curr.playedCard.value ? prev : curr;
      });
    } else {
      const suitRank = {
        "♣️": 1,
        "♦️": 2,
        "♥️": 3,
        "♠️": 4,
      };

      const highestSuitRank = Math.max(
        ...activePlayers.map((p) => suitRank[p.playedCard.suit])
      );

      const playersWithHighestSuit = activePlayers.filter(
        (p) => suitRank[p.playedCard.suit] === highestSuitRank
      );

      winner = playersWithHighestSuit.reduce((prev, curr) => {
        return prev.playedCard.value > curr.playedCard.value ? prev : curr;
      });
    }

    setRoundWinner(winner.name);

    const winningTeam = winner.team;
    const updatedTeamScores = { ...teamScores };
    updatedTeamScores[`team${winningTeam}`] += 20;
    setTeamScores(updatedTeamScores);

    setTimeout(() => {
      if (updatedTeamScores[`team${winningTeam}`] >= 100) {
        const updatedGameScores = { ...gameScores };
        updatedGameScores[`team${winningTeam}`] += 1;
        setGameScores(updatedGameScores);

        setTeamScores({ team1: 0, team2: 0 });

        if (updatedGameScores[`team${winningTeam}`] >= 2) {
          alert(`Team ${winningTeam} wins the game!`);
          setGameScores({ team1: 0, team2: 0 });
          startNewGame();
        } else {
          alert(`Team ${winningTeam} wins this set! Starting a new set.`);
          startNewSet();
        }
      } else {
        resetRound();
      }
    }, 3000);
  }

  function startNewSet() {
    const deck = generateDeck();
    const shuffledDeck = shuffleDeck(deck);
    const newPlayers = dealCards(shuffledDeck, players);
    setPlayers(newPlayers);

    const suits = ["♣️", "♦️", "♥️", "♠️"];
    let availableSuits = suits;
    if (lastTrumpSuit) {
      availableSuits = suits.filter((suit) => suit !== lastTrumpSuit);
    }

    const chosenTrump =
      availableSuits[Math.floor(Math.random() * availableSuits.length)];

    setLastTrumpSuit(trumpSuit);
    setTrumpSuit(chosenTrump);

    setStartingOrderIndex((startingOrderIndex + 1) % playOrder.length);
    setCurrentTurnIndex(0);
    setRoundWinner(null);
  }

  function resetRound() {
    const newPlayers = players.map((player) => ({
      ...player,
      playedCard: null,
    }));
    setPlayers(newPlayers);

    setStartingOrderIndex((startingOrderIndex + 1) % playOrder.length);
    setCurrentTurnIndex(0);
    setRoundWinner(null);
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
      <div className="flex items-center justify-between p-4 bg-green-800">
        <h1 className="text-3xl font-bold">MyBridge</h1>
        <div className="text-3xl cursor-pointer">☰</div>
      </div>

      <div className="flex flex-1 relative">
        {roundWinner && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white text-black p-8 rounded-lg">
              <h2 className="text-3xl font-bold mb-4">Round Winner!</h2>
              <p className="text-2xl">{roundWinner} wins the round!</p>
            </div>
          </div>
        )}

        <div className="relative flex flex-col items-center justify-center flex-1 bg-green-700 border-4 border-yellow-500 rounded-lg p-4 mx-4">
          {players.map((player, index) => (
            <PlayerArea
              key={index}
              player={player}
              position={getPosition(index)}
              isCurrent={
                index ===
                playOrder[
                  (startingOrderIndex + currentTurnIndex) % playOrder.length
                ]
              }
              onPlayCard={playCard}
              isBottomPlayer={index === 0}
              trumpSuit={trumpSuit}
            />
          ))}

          <div className="bg-green-600 p-4 rounded-lg flex items-center justify-center">
            <div className="grid grid-cols-2 gap-4">
              {players.map((player, i) => (
                <div
                  key={i}
                  className="bg-white text-black w-10 h-14 rounded border border-gray-400 flex items-center justify-center"
                >
                  {player.playedCard
                    ? `${cardDisplay(player.playedCard)}`
                    : "🂠"}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-1/4 bg-gray-100 text-gray-900 rounded-lg shadow-lg p-4">
          <div className="bg-yellow-500 text-center text-xl font-bold py-2 rounded mb-4">
            {roundWinner ? `Winner: ${roundWinner}` : `Round in Progress`}
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold">Team Scores:</h3>
            <p>Team 1: {teamScores.team1}</p>
            <p>Team 2: {teamScores.team2}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold">Game Scores:</h3>
            <p>Team 1: {gameScores.team1}</p>
            <p>Team 2: {gameScores.team2}</p>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-semibold">Trump Suit:</h3>
            <p>{trumpSuit || "No Trump Yet"}</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center p-2 bg-green-800 text-gray-300 text-sm">
        <span>© 2024 MyBridge Copyright</span>
        <span className="cursor-pointer hover:text-white">
          Terms and Services
        </span>
      </div>
    </div>
  );
}

function PlayerArea({
  player,
  position,
  isCurrent,
  onPlayCard,
  isBottomPlayer,
  trumpSuit,
}) {
  const positionClasses = getPositionClasses(position);

  const handleCardClick = (i) => {
    if (!isCurrent) {
      alert("It's not your turn!");
      return;
    }

    if (trumpSuit) {
      const hasTrump = player.hand.some((card) => card.suit === trumpSuit);
      const selectedCard = player.hand[i];
      if (hasTrump && selectedCard.suit !== trumpSuit) {
        alert(`You must play a card of the trump suit (${trumpSuit})`);
        return;
      }
    }

    onPlayCard(i);
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
            className={`bg-white text-black w-6 h-10 rounded border border-gray-400 cursor-pointer flex items-center justify-center text-sm ${
              trumpSuit && card.suit === trumpSuit
                ? "border-yellow-500"
                : ""
            }`}
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
  switch (index) {
    case 0:
      return "bottom";
    case 1:
      return "left";
    case 2:
      return "top";
    case 3:
      return "right";
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