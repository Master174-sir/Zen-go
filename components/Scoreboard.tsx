import React from 'react';
import { Player, GameStats, KOMI } from '../types';

interface ScoreboardProps {
  stats: GameStats;
  currentPlayer: Player;
  gameOver: boolean;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ stats, currentPlayer, gameOver }) => {
  const blackTotal = stats.prisoners[Player.Black] + stats.territory[Player.Black];
  const whiteTotal = stats.prisoners[Player.White] + stats.territory[Player.White] + KOMI;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden w-full max-w-lg mt-6">
      <div className="bg-stone-800 text-stone-100 p-3 text-center font-bold tracking-widest uppercase flex justify-between items-center px-6">
        <span>Japanese Scoreboard</span>
        {gameOver && <span className="text-red-400 text-xs animate-pulse">Game Over</span>}
      </div>

      <div className="grid grid-cols-3 divide-x divide-stone-100 bg-stone-50">
        {/* Header Row */}
        <div className="p-3 font-semibold text-stone-500 text-sm flex items-center justify-center">Category</div>
        <div className={`p-3 font-bold text-center flex flex-col items-center ${currentPlayer === Player.Black ? 'bg-stone-200/50' : ''}`}>
           <span className="w-4 h-4 rounded-full bg-black inline-block mb-1 shadow-sm border border-stone-600"></span>
           Black
        </div>
        <div className={`p-3 font-bold text-center flex flex-col items-center ${currentPlayer === Player.White ? 'bg-stone-200/50' : ''}`}>
           <span className="w-4 h-4 rounded-full bg-white inline-block mb-1 shadow-sm border border-stone-300"></span>
           White
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-stone-100 text-sm">
        {/* Prisoners */}
        <div className="grid grid-cols-3 divide-x divide-stone-100">
          <div className="p-2 pl-4 text-stone-600 font-medium">Prisoners</div>
          <div className="p-2 text-center">{stats.prisoners[Player.Black]}</div>
          <div className="p-2 text-center">{stats.prisoners[Player.White]}</div>
        </div>

        {/* Territory */}
        <div className="grid grid-cols-3 divide-x divide-stone-100 bg-stone-50/50">
          <div className="p-2 pl-4 text-stone-600 font-medium">Territory (Est.)</div>
          <div className="p-2 text-center text-stone-500">{stats.territory[Player.Black]}</div>
          <div className="p-2 text-center text-stone-500">{stats.territory[Player.White]}</div>
        </div>

        {/* Komi */}
        <div className="grid grid-cols-3 divide-x divide-stone-100">
          <div className="p-2 pl-4 text-stone-600 font-medium">Komi</div>
          <div className="p-2 text-center">0.0</div>
          <div className="p-2 text-center">{KOMI}</div>
        </div>

        {/* Total */}
        <div className="grid grid-cols-3 divide-x divide-stone-100 bg-amber-50 font-bold text-stone-800">
          <div className="p-3 pl-4">TOTAL SCORE</div>
          <div className="p-3 text-center text-lg">{blackTotal}</div>
          <div className="p-3 text-center text-lg">{whiteTotal}</div>
        </div>
      </div>
      
      {gameOver && (
        <div className="p-4 text-center bg-stone-900 text-white">
          {blackTotal > whiteTotal 
            ? `Black Wins by ${blackTotal - whiteTotal}` 
            : `White Wins by ${(whiteTotal - blackTotal).toFixed(1)}`}
        </div>
      )}
    </div>
  );
};

export default Scoreboard;