import React, { useState, useRef, useEffect } from 'react';

interface GameProps {
  gameId: string;
  user: User;
  opponent: User;
  board: (string | null)[];
  gridWidth: number;
  gridHeight: number;
  updateBoard: React.Dispatch<React.SetStateAction<(string | null)[]>>;
  userXId: number;
  userOId: number;
}

interface User {
  uid: number;
  email: string;
  lastSeen: number;
  gameId: number | null;
}

const showError = (error: any) => {
  alert("Something went wrong. Please check the network logs for details.");
};

const moveHandler = (moveData: any) => {
  alert("Move handling is still a work in progress. Check the lobby for game updates.");
};

const sendPlayerMove = (mx: number, my: number, config: any) => {
  const movePayload = { x: mx, y: my };
  fetch(config.serverBase + config.receiverEndpoint, {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(movePayload),
    credentials: "include",
  })
  .then(response => response.json())
  .then(result => moveHandler(result))
  .catch(err => showError(err));
};

const drawXShape = (context: CanvasRenderingContext2D, x: number, y: number, cellSize: number, progress: number) => {
  context.beginPath();
  context.moveTo(x * cellSize, y * cellSize);
  context.lineTo(x * cellSize + cellSize * (progress / 100), y * cellSize + cellSize * (progress / 100));
  context.moveTo(x * cellSize + cellSize, y * cellSize);
  context.lineTo(x * cellSize + cellSize - cellSize * (progress / 100), y * cellSize + cellSize * (progress / 100));
  context.stroke();
};

const drawOShape = (context: CanvasRenderingContext2D, x: number, y: number, cellSize: number, progress: number) => {
  context.beginPath();
  context.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, (cellSize / 2) * (progress / 100), 0, 2 * Math.PI);
  context.stroke();
};

const renderGrid = (context: CanvasRenderingContext2D, cols: number, rows: number, canvasWidth: number, canvasHeight: number) => {
  const squareSize = Math.min(canvasWidth / cols, canvasHeight / rows);

  if (squareSize < 10) {
    alert("Square size is too small for the canvas.");
    return;
  }

  context.clearRect(0, 0, canvasWidth, canvasHeight);
  context.strokeStyle = 'black';

  for (let i = 0; i <= cols; i++) {
    context.beginPath();
    context.moveTo(i * squareSize, 0);
    context.lineTo(i * squareSize, rows * squareSize);
    context.stroke();
  }

  for (let i = 0; i <= rows; i++) {
    context.beginPath();
    context.moveTo(0, i * squareSize);
    context.lineTo(cols * squareSize, i * squareSize);
    context.stroke();
  }
};

const animateShape = (context: CanvasRenderingContext2D, x: number, y: number, cellSize: number, shape: string) => {
  let progress = 0;
  const interval = setInterval(() => {
    context.clearRect(x * cellSize, y * cellSize, cellSize, cellSize);
    context.strokeStyle = 'black';
    context.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

    if (shape === 'X') {
      drawXShape(context, x, y, cellSize, progress);
    } else if (shape === 'O') {
      drawOShape(context, x, y, cellSize, progress);
    }

    progress += 5;
    if (progress >= 100) {
      clearInterval(interval);
    }
  }, 16);
};

const Game: React.FC<GameProps> = ({
  gameId, user, opponent, board, gridWidth, gridHeight, updateBoard, userXId, userOId 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [renderedCells, setRenderedCells] = useState(new Set<number>());
  const [turn, setTurn] = useState<number>(userXId);

  useEffect(() => {
    const pollGameState = async () => {
      try {
        const response = await fetch(`http://localhost:12380/checkGameState.php?gameId=${gameId}`, {
          credentials: 'include',
        });
        const result = await response.json();

        if (result.success && result.data) {
          updateBoard(result.data.board);
          setTurn(result.data.turn);

          const canvas = canvasRef.current;
          if (!canvas) return;
          const context = canvas.getContext('2d');
          if (!context) return;

          const cellSize = canvas.width / gridWidth;

          result.data.board.forEach((cell: string | null, index: number) => {
            if (!cell || renderedCells.has(index)) return;

            const x = index % gridWidth;
            const y = Math.floor(index / gridWidth);

            animateShape(context, x, y, cellSize, cell);

            setRenderedCells(prev => new Set(prev).add(index));
          });
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const interval = setInterval(pollGameState, 1000);
    return () => clearInterval(interval);
  }, [gameId, gridWidth, gridHeight, renderedCells, updateBoard]);

  const makeMove = async (x: number, y: number) => {
    if (turn !== user.uid) return;

    try {
      const response = await fetch('http://localhost:12380/makeMove.php', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameId,
          x,
          y,
          player: user.uid
        })
      });

      const data = await response.json();
      if (data.success) {
        updateBoard(data.board);
        setTurn(data.nextTurn);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / (canvas.width / gridWidth));
    const y = Math.floor((event.clientY - rect.top) / (canvas.height / gridHeight));

    if (x >= 0 && x < gridWidth && y >= 0 && y < gridHeight) {
      makeMove(x, y);
    }
  };

  useEffect(() => {
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        renderGrid(context, gridWidth, gridHeight, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [gridWidth, gridHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const cellSize = canvas.width / gridWidth;

    board.forEach((cell, index) => {
      if (!cell || renderedCells.has(index)) return;

      const x = index % gridWidth;
      const y = Math.floor(index / gridWidth);

      if (cell === 'X') {
        drawXShape(context, x, y, cellSize, 100);
      } else if (cell === 'O') {
        drawOShape(context, x, y, cellSize, 100);
      }

      setRenderedCells(prev => new Set(prev).add(index));
    });
  }, [board, renderedCells, gridWidth, gridHeight]);

  return (
    <div>
      <h2>Playing against {opponent.email}</h2>
      <p>Current Turn: {turn === user.uid ? 'Your Turn' : 'Opponent\'s Turn'}</p>
      <canvas 
        ref={canvasRef} 
        width={gridWidth * 200} 
        height={gridHeight * 200} 
        onClick={handleCanvasClick} 
      />
      <audio autoPlay loop>
        <source src="http://localhost:12380/background.mp3" type="audio/mpeg" />
      </audio>
    </div>
  );
};

export default Game;
