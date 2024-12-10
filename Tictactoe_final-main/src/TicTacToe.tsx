import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import GameBoard from './GameBoard';
import GameLobby from './GameLobby';
import Header from './Header';

interface IUser {
  id: number;
  email: string;
  lastActive: number;
  gameId: number | null;
}

function GameApp(props: any) {
  const appConfig = props.config;
  const [user, setUser] = useState<IUser | null>(null);
  const [currentView, setCurrentView] = useState<string>('login');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [currentOpponent, setCurrentOpponent] = useState<IUser | null>(null);
  const [gameBoard, setGameBoard] = useState<(string | null)[]>(Array(appConfig.sizex * appConfig.sizey).fill(null));

  const startNewGame = async (opponent: IUser) => {
    try {
      const response = await fetch('http://localhost:12380/startGame.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user!.id,
          opponentId: opponent.id,
          playerX: user!.id,
          playerO: opponent.id,
          sizex: 3,
          sizey: 3,
          email: user?.email,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setActiveGameId(result.gameId);
        setCurrentOpponent(opponent);
        setCurrentView('game');
        setGameBoard(Array(3 * 3).fill(null));
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:12380/logout.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user?.id,
        }),
      });

      const result = await response.json();
      if (result.status === 'success') {
        setUser(null);
        sessionStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        alert('Logout failed. Please try again.');
      }
    } catch (error) {
      console.error('Error logging out:', error);
      alert('Logout failed. Please try again.');
    }
  };

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const response = await fetch('http://localhost:12380/session.php', {
          method: 'GET',
          credentials: 'include',
        });

        const sessionData = await response.json();
        if (sessionData.id) {
          setUser({
            id: sessionData.id,
            email: sessionData.email,
            lastActive: sessionData.lastActive,
            gameId: sessionData.gameId,
          });
          setActiveGameId(sessionData.gameId);
          setCurrentView('lobby');
        }
      } catch (error) {
        console.error('Session error:', error);
        setCurrentView('login');
      }
    };

    checkUserSession();
  }, []);

  useEffect(() => {
    const monitorNewGame = async () => {
      try {
        const response = await fetch('http://localhost:12380/session.php', {
          credentials: 'include',
        });
        const data = await response.json();

        if (data.games) {
          const activeGameIds = Object.keys(data.games).filter((id) => data.games[id] !== null);
          const mostRecentGameId = Math.max(...activeGameIds.map(Number));
          const activeGame = data.games[mostRecentGameId];

          if (
            activeGame &&
            activeGame.status === 'active' &&
            activeGame.playerO === data.id
          ) {
            setActiveGameId(mostRecentGameId.toString());
            const opponent = {
              id: activeGame.playerX,
              email: data.loggedInUsers.find((user: IUser) => user.id === activeGame.playerX)?.email || '',
              lastActive: Date.now(),
              gameId: null,
            };
            setCurrentOpponent(opponent);
            setGameBoard(Array(appConfig.sizex * appConfig.sizey).fill(null));
            setCurrentView('game');
          }
        }
      } catch (error) {
        console.error('Error monitoring new game:', error);
      }
    };

    if (currentView === 'lobby') {
      const interval = setInterval(monitorNewGame, 2000);
      return () => clearInterval(interval);
    }
  }, [currentView, appConfig.sizex, appConfig.sizey]);

  return (
    <Container>
      <Header onLogout={handleLogout} username={user?.email} />
      {currentView === 'lobby' && <GameLobby onStartGame={startNewGame} />}
      {currentView === 'game' && currentOpponent && (
        <GameBoard
          gameId={activeGameId!}
          user={user!}
          opponent={currentOpponent}
          board={gameBoard}
          sizex={appConfig.sizex}
          sizey={appConfig.sizey}
          setBoard={setGameBoard}
          userId={user!.id}
          opponentId={currentOpponent.id}
        />
      )}
    </Container>
  );
}

export default GameApp;
