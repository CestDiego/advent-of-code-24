import type { Route } from "./+types/home";
import { useEffect, useState, useCallback, useRef } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Matrix Visualization" },
    { name: "description", content: "Matrix character visualization" },
  ];
}

interface CellVisit {
  count: number;
  isPartOfXMAS: boolean;
  isCurrentlyChecking: boolean;
  isSlaming: boolean;
}

export default function Home() {
  const [input, setInput] = useState<string[]>([]);
  const [visitCounts, setVisitCounts] = useState<CellVisit[][]>([]);
  const [xmasCount, setXmasCount] = useState(0);
  const [delay, setDelay] = useState(50);
  const [isRunning, setIsRunning] = useState(false);

  const delayRef = useRef(delay);

  useEffect(() => {
    delayRef.current = delay;
  }, [delay]);

  // Function to check if a position is valid in the matrix
  const isValid = (row: number, col: number) => {
    return row >= 0 && row < input.length && col >= 0 && col < input[0].length;
  };

  const sleep = (ms: number) => new Promise(resolve => {
    const start = performance.now();
    const frame = (currentTime: number) => {
      if (currentTime - start < ms) {
        requestAnimationFrame(frame);
      } else {
        resolve(undefined);
      }
    };
    requestAnimationFrame(frame);
  });

  // Function to check for XMAS pattern starting at a position
  const checkXMAS = async (startRow: number, startCol: number, rowDir: number, colDir: number) => {
    if (!isValid(startRow + 3 * rowDir, startCol + 3 * colDir)) return false;
    
    const pattern = "XMAS";
    
    // Mark current cells as being checked
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        setVisitCounts(prev => {
          const newCounts = prev.map(row => [...row]);
          for (let i = 0; i < 4; i++) {
            const row = startRow + i * rowDir;
            const col = startCol + i * colDir;
            newCounts[row][col] = {
              ...newCounts[row][col],
              isCurrentlyChecking: true
            };
          }
          return newCounts;
        });
        resolve();
      });
    });

    await sleep(delayRef.current);

    // Check pattern
    for (let i = 0; i < 4; i++) {
      const row = startRow + i * rowDir;
      const col = startCol + i * colDir;
      if (input[row][col] !== pattern[i]) {
        // Clear current checking state
        await new Promise<void>(resolve => {
          requestAnimationFrame(() => {
            setVisitCounts(prev => {
              const newCounts = prev.map(row => [...row]);
              for (let j = 0; j < 4; j++) {
                const r = startRow + j * rowDir;
                const c = startCol + j * colDir;
                newCounts[r][c] = {
                  ...newCounts[r][c],
                  isCurrentlyChecking: false
                };
              }
              return newCounts;
            });
            resolve();
          });
        });
        return false;
      }
    }
    
    // Mark cells as part of XMAS pattern
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        setVisitCounts(prev => {
          const newCounts = prev.map(row => [...row]);
          for (let i = 0; i < 4; i++) {
            const row = startRow + i * rowDir;
            const col = startCol + i * colDir;
            newCounts[row][col] = {
              count: newCounts[row][col].count + 1,
              isPartOfXMAS: true,
              isCurrentlyChecking: false,
              isSlaming: true
            };
          }
          return newCounts;
        });
        resolve();
      });
    });
    
    // Wait for slam animation
    await sleep(600);

    // Reset slam state
    await new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        setVisitCounts(prev => {
          const newCounts = prev.map(row => [...row]);
          for (let i = 0; i < 4; i++) {
            const row = startRow + i * rowDir;
            const col = startCol + i * colDir;
            newCounts[row][col] = {
              ...newCounts[row][col],
              isSlaming: false
            };
          }
          return newCounts;
        });
        resolve();
      });
    });
    
    return true;
  };

  const startSearch = useCallback(async () => {
    if (!input.length || isRunning) return;
    
    setIsRunning(true);
    setXmasCount(0);
    let count = 0;
    
    const directions = [
      [-1, 0],   // Up
      [-1, 1],   // Up-Right
      [0, 1],    // Right
      [1, 1],    // Down-Right
      [1, 0],    // Down
      [1, -1],   // Down-Left
      [0, -1],   // Left
      [-1, -1]   // Up-Left
    ];

    for (let row = 0; row < input.length; row++) {
      for (let col = 0; col < input[0].length; col++) {
        for (const [rowDir, colDir] of directions) {
          if (await checkXMAS(row, col, rowDir, colDir)) {
            count++;
            setXmasCount(count);
          }
        }
      }
    }
    
    setIsRunning(false);
  }, [input, delay, isRunning]);

  useEffect(() => {
    fetch('/input.txt')
      .then(response => response.text())
      .then(text => {
        const lines = text.trim().split('\n');
        setInput(lines);
        setVisitCounts(lines.map(line => 
          Array(line.length).fill({ count: 0, isPartOfXMAS: false, isCurrentlyChecking: false, isSlaming: false })
        ));
      })
      .catch(error => console.error('Error loading matrix:', error));
  }, []);

  return (
    <div className="matrix-container">
      <div className="control-panel">
        <h2>XMAS Pattern Count: {xmasCount}</h2>
        <div className="controls">
          <label>
            Animation Speed:
            <input 
              type="range" 
              min="0" 
              max="200" 
              value={delay} 
              onChange={e => setDelay(Number(e.target.value))}
            />
            {delay}ms
          </label>
          <button 
            onClick={startSearch}
            disabled={isRunning}
            className="start-button"
          >
            {isRunning ? 'Searching...' : 'Start Search'}
          </button>
        </div>
      </div>
      
      {input.map((row, rowIndex) => (
        <div key={rowIndex} className="matrix-row">
          {row.split('').map((char, colIndex) => (
            <div 
              key={`${rowIndex}-${colIndex}`} 
              className={`matrix-cell ${char.toLowerCase()} ${
                visitCounts[rowIndex]?.[colIndex]?.isPartOfXMAS ? 'xmas-pattern' : ''
              } ${
                visitCounts[rowIndex]?.[colIndex]?.isCurrentlyChecking ? 'checking' : ''
              } ${
                visitCounts[rowIndex]?.[colIndex]?.isSlaming ? 'slaming' : ''
              }`}
              style={{
                opacity: visitCounts[rowIndex]?.[colIndex]?.count 
                  ? Math.min(0.4 + visitCounts[rowIndex][colIndex].count * 0.45, 1)
                  : 0.4
              }}
              title={`${char} at [${rowIndex}, ${colIndex}] - Visited ${visitCounts[rowIndex]?.[colIndex]?.count || 0} times`}
            >
              {char}
            </div>
          ))}
        </div>
      ))}
      <style>{`
        .matrix-container {
          display: flex;
          flex-direction: column;
          gap: 1px;
          font-family: monospace;
          background: #f0f0f0;
          padding: 1rem;
        }
        
        .control-panel {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(255, 255, 255, 0.95);
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          z-index: 1000;
          backdrop-filter: blur(5px);
          min-width: 250px;
        }

        .control-panel h2 {
          margin: 0 0 1.5rem 0;
          color: #333;
          font-size: 1.5rem;
          text-align: center;
          border-bottom: 2px solid #eee;
          padding-bottom: 0.75rem;
        }

        .controls {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .controls label {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          color: #555;
          font-weight: 500;
        }

        .controls input[type="range"] {
          width: 100%;
          height: 6px;
          -webkit-appearance: none;
          background: #e0e0e0;
          border-radius: 3px;
          outline: none;
        }

        .controls input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          background: #4CAF50;
          border-radius: 50%;
          cursor: pointer;
          transition: background 0.2s;
        }

        .controls input[type="range"]::-webkit-slider-thumb:hover {
          background: #45a049;
        }

        .start-button {
          padding: 0.75rem 1rem;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
        }

        .start-button:hover:not(:disabled) {
          background: #45a049;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
        }

        .start-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
          box-shadow: none;
        }

        .speed-value {
          text-align: center;
          font-size: 0.9rem;
          color: #666;
          margin-top: -0.5rem;
        }

        .matrix-row {
          display: flex;
          gap: 1px;
        }
        
        .matrix-cell {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          border: 1px solid #ddd;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .m { background: #99ccff; }
        .s { background: #ffcc99; }
        .a { background: #99ff99; }
        .x { background: #ff9999; }
        
        .xmas-pattern {
          border: 2px solid #666;
          box-shadow: 0 0 4px rgba(0,0,0,0.3);
        }

        .checking {
          border: 3px solid #ff0000;
          transform: scale(1.1);
          z-index: 1;
          box-shadow: 0 0 12px rgba(255,0,0,0.4);
        }

        .checking::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 2px solid #ff0000;
          border-radius: 2px;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }

        .slaming {
          animation: slam 0.6s cubic-bezier(.36,.07,.19,.97);
          transform-origin: center;
          z-index: 10;
        }

        @keyframes slam {
          0% {
            transform: scale(1) rotate(0deg);
          }
          20% {
            transform: scale(2) rotate(10deg);
          }
          40% {
            transform: scale(1.5) rotate(-8deg);
          }
          60% {
            transform: scale(1.8) rotate(6deg);
          }
          80% {
            transform: scale(0.9) rotate(-4deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
}
