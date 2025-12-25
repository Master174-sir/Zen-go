import React, { useMemo } from 'react';
import { BoardState, Player, BOARD_SIZE } from '../types';

interface GoBoardProps {
  board: BoardState;
  onIntersectionClick: (r: number, c: number) => void;
  lastMove: { r: number, c: number } | null;
  disabled: boolean;
}

const GoBoard: React.FC<GoBoardProps> = ({ board, onIntersectionClick, lastMove, disabled }) => {
  // Generate star points (Hoshi) for 9x9 board
  const starPoints = useMemo(() => {
    if (BOARD_SIZE === 9) return [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]];
    if (BOARD_SIZE === 13) return [[3, 3], [3, 9], [6, 6], [9, 3], [9, 9]];
    if (BOARD_SIZE === 19) return [[3, 3], [3, 9], [3, 15], [9, 3], [9, 9], [9, 15], [15, 3], [15, 9], [15, 15]];
    return [];
  }, []);

  const isStarPoint = (r: number, c: number) => {
    return starPoints.some(([sr, sc]) => sr === r && sc === c);
  };

  return (
    <div className="relative p-2 md:p-4 rounded-lg shadow-2xl bg-[#dcb35c] wood-texture select-none">
      {/* Grid Container */}
      <div 
        className="relative grid"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
          width: 'min(90vw, 500px)',
          height: 'min(90vw, 500px)',
        }}
      >
        {/* Render Cells */}
        {board.map((row, r) => (
          row.map((cell, c) => (
            <div 
              key={`${r}-${c}`}
              className="relative flex items-center justify-center cursor-pointer group"
              onClick={() => !disabled && onIntersectionClick(r, c)}
            >
              {/* Grid Lines */}
              {/* Horizontal Line */}
              <div className={`absolute w-full h-0.5 bg-stone-800 pointer-events-none z-0 ${c === 0 ? 'left-1/2 w-1/2' : ''} ${c === BOARD_SIZE - 1 ? 'right-1/2 w-1/2' : ''}`} />
              
              {/* Vertical Line */}
              <div className={`absolute h-full w-0.5 bg-stone-800 pointer-events-none z-0 ${r === 0 ? 'top-1/2 h-1/2' : ''} ${r === BOARD_SIZE - 1 ? 'bottom-1/2 h-1/2' : ''}`} />

              {/* Star Point (Hoshi) */}
              {isStarPoint(r, c) && (
                <div className="absolute w-2 h-2 rounded-full bg-stone-900 z-0" />
              )}

              {/* Hover Ghost Stone (only if empty and not disabled) */}
              {cell === Player.None && !disabled && (
                <div className="w-[85%] h-[85%] rounded-full opacity-0 group-hover:opacity-40 bg-black z-10 transition-opacity" />
              )}

              {/* Actual Stone */}
              {cell !== Player.None && (
                <div 
                  className={`
                    w-[90%] h-[90%] rounded-full z-20 transition-all duration-200
                    ${cell === Player.Black ? 'stone-black' : 'stone-white'}
                  `}
                >
                  {/* Last Move Marker */}
                  {lastMove?.r === r && lastMove?.c === c && (
                    <div className={`
                      absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                      w-1/3 h-1/3 rounded-full border-2 
                      ${cell === Player.Black ? 'border-white/50' : 'border-black/50'}
                    `} />
                  )}
                </div>
              )}
            </div>
          ))
        ))}
      </div>
      
      {/* Coordinates (Optional, simplified for aesthetics) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-4 border-[#5d4037]/30 rounded-lg"></div>
    </div>
  );
};

export default GoBoard;