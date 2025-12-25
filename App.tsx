import React, { useState, useEffect, useCallback } from 'react';
import GoBoard from './components/GoBoard';
import Scoreboard from './components/Scoreboard';
import { BoardState, Player, GameStats, BOARD_SIZE, KOMI } from './types';
import { createEmptyBoard, isValidMove, placeStone, getAIMove, estimateTerritory } from './utils/goLogic';
import { RotateCcw, SkipForward, Play, RefreshCw } from 'lucide-react';

function App() {
  const [board, setBoard] = useState<BoardState>(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.Black);
  const [prisoners, setPrisoners] = useState<{ [key: number]: number }>({
    [Player.Black]: 0,
    [Player.White]: 0,
  });
  const [history, setHistory] = useState<string[]>([]);
  const [passes, setPasses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [lastMove, setLastMove] = useState<{ r: number, c: number } | null>(null);
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [aiThinking, setAiThinking] = useState(false);

  // Derived state for territory (computed on every render for simplicity, or we could memoize)
  const territory = estimateTerritory(board);

  const stats: GameStats = {
    prisoners,
    territory,
    score: {
      [Player.Black]: 0, // Calculated in Scoreboard
      [Player.White]: 0,
    }
  };

  const handleMove = useCallback((r: number, c: number) => {
    if (gameOver) return;

    // Validate logic
    if (!isValidMove(board, r, c, currentPlayer, history)) {
      // Could add visual feedback shake here
      return;
    }

    // Update History for Ko rule
    const currentBoardStr = JSON.stringify(board);
    setHistory(prev => [...prev, currentBoardStr]);

    // Place stone logic
    const { newBoard, captured } = placeStone(board, r, c, currentPlayer);
    
    setBoard(newBoard);
    setLastMove({ r, c });
    setPrisoners(prev => ({
      ...prev,
      [currentPlayer]: prev[currentPlayer] + captured
    }));
    setPasses(0); // Reset passes on valid move

    // Switch turn
    setCurrentPlayer(prev => prev === Player.Black ? Player.White : Player.Black);
  }, [board, currentPlayer, gameOver, history]);

  const handlePass = useCallback(() => {
    if (gameOver) return;
    
    const newPasses = passes + 1;
    setPasses(newPasses);
    
    if (newPasses >= 2) {
      setGameOver(true);
    } else {
      setCurrentPlayer(prev => prev === Player.Black ? Player.White : Player.Black);
      setLastMove(null); // No move to highlight on pass
    }
  }, [gameOver, passes]);

  const resetGame = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(Player.Black);
    setPrisoners({ [Player.Black]: 0, [Player.White]: 0 });
    setHistory([]);
    setPasses(0);
    setGameOver(false);
    setLastMove(null);
  };

  // AI Effect
  useEffect(() => {
    if (isAIEnabled && currentPlayer === Player.White && !gameOver) {
      setAiThinking(true);
      
      const timer = setTimeout(() => {
        const move = getAIMove(board, Player.White, history);
        
        if (move) {
          handleMove(move.r, move.c);
        } else {
          // AI Passes if no valid moves
          handlePass();
        }
        setAiThinking(false);
      }, 1000); // 1 second delay for realism

      return () => clearTimeout(timer);
    }
  }, [currentPlayer, isAIEnabled, gameOver, board, history, handleMove, handlePass]);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center py-8 font-sans">
      <header className="mb-6 text-center">
        <h1 className="text-4xl font-extrabold text-stone-800 tracking-tight flex items-center justify-center gap-3">
          <span className="text-5xl">碁</span> Zen Go
        </h1>
        <p className="text-stone-500 mt-2 text-sm">Japanese Rules • Komi {KOMI} • 9x9</p>
      </header>

      <main className="flex flex-col xl:flex-row gap-8 items-start justify-center w-full px-4 max-w-6xl">
        {/* Left Column: Board */}
        <div className="flex flex-col items-center">
          <div className="relative">
             <GoBoard 
               board={board} 
               onIntersectionClick={handleMove} 
               lastMove={lastMove}
               disabled={gameOver || (isAIEnabled && currentPlayer === Player.White)}
             />
             
             {aiThinking && (
               <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full shadow-lg text-xs font-semibold text-stone-600 animate-pulse border border-stone-200">
                 AI Thinking...
               </div>
             )}
          </div>

          {/* Action Bar */}
          <div className="flex gap-4 mt-8 w-full justify-center">
            <button
              onClick={handlePass}
              disabled={gameOver || (isAIEnabled && currentPlayer === Player.White)}
              className="flex items-center gap-2 px-6 py-3 bg-stone-800 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md font-medium"
            >
              <SkipForward size={18} />
              Pass
            </button>
            
            <button
              onClick={resetGame}
              className="flex items-center gap-2 px-6 py-3 bg-white text-stone-700 border border-stone-300 rounded-lg hover:bg-stone-50 transition shadow-sm font-medium"
            >
              <RotateCcw size={18} />
              Reset
            </button>
          </div>
        </div>

        {/* Right Column: Stats & Settings */}
        <div className="flex flex-col w-full max-w-lg">
          <Scoreboard 
            stats={stats} 
            currentPlayer={currentPlayer} 
            gameOver={gameOver} 
          />

          {/* AI Toggle */}
          <div className="mt-6 bg-white p-4 rounded-xl shadow-sm border border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                 <RefreshCw size={20} />
               </div>
               <div>
                 <h3 className="font-bold text-stone-800">AI Opponent</h3>
                 <p className="text-xs text-stone-500">Play against the computer (White)</p>
               </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={isAIEnabled}
                onChange={(e) => setIsAIEnabled(e.target.checked)}
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-sm">
            <p className="font-semibold mb-1">Game Info:</p>
            <p>Black (●) moves first. The game ends when both players pass consecutively. Territory is estimated automatically using flood-fill.</p>
          </div>
        </div>
      </main>

      <footer className="mt-12 text-stone-400 text-sm font-medium tracking-wide">
        Made by SHIVOHAM Kumar
      </footer>
    </div>
  );
}

export default App;