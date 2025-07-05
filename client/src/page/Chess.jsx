import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { Chessboard } from "react-chessboard";
import { Chess } from "chess.js";
import { auth } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import {
  Crown,
  Copy,
  Download,
  RotateCcw,
  LogOut,
  Clock,
  Users,
} from "lucide-react";
import toast, { Toaster } from 'react-hot-toast';

const initialTime = 300;
const game = new Chess();

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8);
}

export function Chat({ username }) {
  const [fen, setFen] = useState(game.fen());
  const [playerColor, setPlayerColor] = useState(null);
  const [roomId, setRoomId] = useState("");
  const [inputRoom, setInputRoom] = useState("");
  const [status, setStatus] = useState("🔗 Enter or create a Room");
  const [whiteTime, setWhiteTime] = useState(initialTime);
  const [blackTime, setBlackTime] = useState(initialTime);
  const [timerRunning, setTimerRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [whiteMoves, setWhiteMoves] = useState([]);
  const [blackMoves, setBlackMoves] = useState([]);
  const [paused, setPaused] = useState(false);
  const [opponentConnected, setOpponentConnected] = useState(false);

  const socketRef = useRef(null);
  const timerRef = useRef(null);

  // ✅ Firebase auth guard
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) window.location.href = "/login";
    });
    return () => unsubscribe();
  }, []);

  // ✅ Setup socket and listeners
  useEffect(() => {
    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.on("match-found", ({ color, roomId, timers }) => {
      setPlayerColor(color);
      setRoomId(roomId);
      setStatus(`🎮 Match started in room ${roomId}. You are ${color}`);
      if (timers) {
        setWhiteTime(timers.white);
        setBlackTime(timers.black);
      }
      setTimerRunning(true);
    });

    // ✅ New: opponent is connected
    socket.on("opponent-connected", () => {
      setOpponentConnected(true);
    });

    socket.on("opponent-move", ({ from, to, whiteTime, blackTime }) => {
      const move = game.move({ from, to, promotion: "q" });
      if (!move) return;
      setFen(game.fen());

      if (game.turn() === "w") setBlackMoves((prev) => [...prev, move.san]);
      else setWhiteMoves((prev) => [...prev, move.san]);

      if (typeof whiteTime === "number") setWhiteTime(whiteTime);
      if (typeof blackTime === "number") setBlackTime(blackTime);

      switchTimer();
      checkGameOver();
    });

    socket.on("pause-game", () => {
      setPaused(true);
      setTimerRunning(false);
    });

    socket.on("resume-game", ({ whiteTime, blackTime }) => {
      setPaused(false);
      if (typeof whiteTime === "number") setWhiteTime(whiteTime);
      if (typeof blackTime === "number") setBlackTime(blackTime);
      setTimerRunning(true);
    });

    socket.on("room-full", () => 
    
      toast.error("Room is full! Please create or join another room." ));


    // Rematch: reset board and timers for both players immediately
    socket.on("rematch-request", () => {
      game.reset();
      setFen(game.fen());
      setWhiteTime(initialTime);
      setBlackTime(initialTime);
      setWhiteMoves([]);
      setBlackMoves([]);
      setGameOver(false);
      setStatus(`🔁 Rematch in room ${roomId}. You are ${playerColor}`);
      setTimerRunning(true); // Ensure timer resumes
    });

    return () => socket.disconnect();
  }, []);

  // ✅ Timer ticking logic
  useEffect(() => {
    if (!timerRunning || paused || gameOver || !opponentConnected) return;

    const id = setInterval(() => {
      if (game.turn() === "w") {
        setWhiteTime((t) => {
          if (t <= 1) {
            clearInterval(id);
            endGame("Black wins on time!");
            return 0;
          }
          return t - 1;
        });
      } else {
        setBlackTime((t) => {
          if (t <= 1) {
            clearInterval(id);
            endGame("White wins on time!");
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);

    timerRef.current = id;
    return () => clearInterval(id);
  }, [timerRunning, paused, gameOver, opponentConnected]);

  const onDrop = (src, dst) => {
    if (!playerColor || !roomId || gameOver) return false;
    if ((playerColor === "white" && game.turn() !== "w") || (playerColor === "black" && game.turn() !== "b")) return false;

    const move = game.move({ from: src, to: dst, promotion: "q" });
    if (!move) return false;

    setFen(game.fen());

    socketRef.current.emit("move", {
      from: src,
      to: dst,
      roomId,
      whiteTime,
      blackTime,
    });

    if (playerColor === "white") setWhiteMoves((p) => [...p, move.san]);
    else setBlackMoves((p) => [...p, move.san]);

    switchTimer();
    checkGameOver();
    return true;
  };

  const switchTimer = () => {
    setTimerRunning(false);
    setTimeout(() => setTimerRunning(true), 100);
  };

  const checkGameOver = () => {
    if (game.isGameOver()) {
      setGameOver(true);
      setTimerRunning(false);
      if (game.isCheckmate()) {
        const winner = game.turn() === "w" ? "Black" : "White";
        endGame(`${winner} wins by checkmate!`);
      } else if (game.isDraw()) {
        endGame("Game drawn by stalemate or insufficient material.");
      } else if (game.isThreefoldRepetition()) {
        endGame("Game drawn by threefold repetition.");
      } else if (game.isInsufficientMaterial()) {
        endGame("Game drawn due to insufficient material.");
      }
    }
  };

  const endGame = (msg) => {
    setGameOver(true);
    setTimerRunning(false);
    toast.error(msg);
  };

  const joinRoom = (id) => {
    if (!id || id.trim() === "") {
      toast.error("Please enter a valid Room ID.");
      return;
    }
    setRoomId(id);
    socketRef.current.emit("join-room", id);
  };

  const handleRematch = () => {
    // Reset board and timers for the player who clicks rematch
    game.reset();
    setFen(game.fen());
    setWhiteTime(initialTime);
    setBlackTime(initialTime);
    setWhiteMoves([]);
    setBlackMoves([]);
    setGameOver(false);
    setStatus(`🔁 Rematch in room ${roomId}. You are ${playerColor}`);
    setTimerRunning(true);
    // Notify opponent
    socketRef.current.emit("rematch", { roomId });
  };

  const handleDownloadPGN = () => {
    const pgn = game.pgn();
    const blob = new Blob([pgn], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `chess-${roomId}.pgn`;
    a.click();
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/";
    } catch {
      toast.error("Failed to log out. Please try again.");
      console.error("Logout error:", error);
    }
  };

  const formatTime = (s) => {
    if (typeof s !== "number" || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  // UI code remains the same..
  // ✅ UI (abbreviated for brevity)
  return (
   <div className="min-h-screen bg-gray-900 text-white">
   <Toaster />
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="h-8 w-8 text-yellow-400" />
            <span className="text-2xl font-bold">ChessMax</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <Users className="h-4 w-4" />
              <span className="text-sm">Welcome, {username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md transition-colors duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Room Setup */}
          {!roomId && (
            <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center mb-8">
              <Crown className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-2">Ready to Play Chess?</h1>
              <p className="text-gray-400 mb-6">Create a new room or join an existing one</p>

              <div className="max-w-md mx-auto space-y-4">
                <input
                  type="text"
                  placeholder="Enter Room ID"
                  value={inputRoom}
                  onChange={(e) => setInputRoom(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white placeholder-gray-400"
                />
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => {
                      const newId = generateRoomId()
                      setRoomId(newId)
                      joinRoom(newId)
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-md transition-colors duration-200"
                  >
                    Create Room
                  </button>
                  <button
                    onClick={() => {
                      if (inputRoom.trim()) {
                        setRoomId(inputRoom.trim())
                        joinRoom(inputRoom.trim())
                      }else {
                        toast.error("Please enter a valid Room ID.")
                      }
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-md transition-colors duration-200"
                  >
                    Join Room
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Game Interface */}
          {roomId && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Panel - Game Info */}
              <div className="space-y-6">
                {/* Room Info */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Crown className="h-5 w-5 text-yellow-400 mr-2" />
                    Game Room
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-400 text-sm">Room ID</p>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono bg-gray-700 px-3 py-1 rounded text-yellow-400">{roomId}</span>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(roomId)
                            toast.success("Room ID copied to clipboard!")
                          }}
                          className="text-gray-400 hover:text-white transition-colors duration-200"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <p className="text-white">{status}</p>
                    </div>
                  </div>
                </div>

                {/* Timer */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Clock className="h-5 w-5 text-yellow-400 mr-2" />
                    Timer
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">White</span>
                      <span className={`font-mono text-lg ${whiteTime <= 30 ? "text-red-400" : "text-white"}`}>
                        {formatTime(whiteTime)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Black</span>
                      <span className={`font-mono text-lg ${blackTime <= 30 ? "text-red-400" : "text-white"}`}>
                        {formatTime(blackTime)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Game Actions */}
                {gameOver && (
                  <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                    <h2 className="text-xl font-semibold mb-4">Game Over</h2>
                    <div className="space-y-3">
                      <button
                        onClick={handleRematch}
                        className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        <span>Rematch</span>
                      </button>
                      <button
                        onClick={handleDownloadPGN}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-md transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download PGN</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Center - Chess Board */}
              <div className="flex justify-center">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <Chessboard
                    position={fen}
                    onPieceDrop={onDrop}
                    boardWidth={400}
                    boardOrientation={playerColor === "black" ? "black" : "white"}
                  />
                </div>
              </div>

              {/* Right Panel - Move History */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Move History</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center">
                      <div className="w-4 h-4 bg-white rounded mr-2"></div>
                      White
                    </h3>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {whiteMoves.map((move, i) => (
                        <div key={i} className="text-gray-300 text-sm font-mono">
                          {`${i + 1}. ${move}`}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold mb-3 flex items-center">
                      <div className="w-4 h-4 bg-gray-900 border border-gray-400 rounded mr-2"></div>
                      Black
                    </h3>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {blackMoves.map((move, i) => (
                        <div key={i} className="text-gray-300 text-sm font-mono">
                          {`${i + 1}. ${move}`}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}