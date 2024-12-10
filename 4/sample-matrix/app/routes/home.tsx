import type { Route } from "./+types/home";
import { useEffect, useState, useCallback } from "react";

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
}

export default function Home() {
  const [input, setInput] = useState<string[]>([]);
  const [visitCounts, setVisitCounts] = useState<CellVisit[][]>([]);
  const [xmasCount, setXmasCount] = useState(0);
  const [delay, setDelay] = useState(50);
  const [isRunning, setIsRunning] = useState(false);

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

    await sleep(delay);

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
              isCurrentlyChecking: false
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
      [-1, -1], [-1, 0], [-1, 1],  // Up diagonals and vertical
      [0, -1], [0, 1],             // Horizontals
      [1, -1], [1, 0], [1, 1]      // Down diagonals and vertical
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
          Array(line.length).fill({ count: 0, isPartOfXMAS: false, isCurrentlyChecking: false })
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
              }`}
              style={{
                opacity: visitCounts[rowIndex]?.[colIndex]?.count 
                  ? Math.min(0.5 + visitCounts[rowIndex][colIndex].count * 0.15, 1)
                  : 0.5
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
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 1000;
        }

        .controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .controls label {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .start-button {
          padding: 0.75rem 1rem;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s ease;
        }

        .start-button:hover:not(:disabled) {
          background: #45a049;
        }

        .start-button:disabled {
          background: #cccccc;
          cursor: not-allowed;
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
      `}</style>
    </div>
  );
}
