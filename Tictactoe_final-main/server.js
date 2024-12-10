const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

const connectedUsers = {}; // Aktif kullanıcılar
const activeGames = {}; // Oyun durumları

server.on('connection', (client) => {
  let loggedUserId = null;

  client.on('message', async (msg) => {
    const receivedData = JSON.parse(msg);
    console.log('Mesaj alındı:', receivedData);

    switch (receivedData.type) {
      case 'login': {
        connectedUsers[receivedData.uid] = {
          client,
          email: receivedData.email,
        };
        loggedUserId = receivedData.uid;

        client.send(
          JSON.stringify({
            type: 'loginSuccess',
            message: 'Giriş başarılı',
            currentUser: { uid: receivedData.uid, email: receivedData.email },
            users: Object.keys(connectedUsers).map((id) => ({
              uid: id,
              email: connectedUsers[id].email,
            })),
          })
        );
        console.log('Kullanıcı giriş yaptı:', receivedData.email);
        notifyAllUsers();
        break;
      }

      case 'startGame': {
        const { player1, player2, width, height, playerX, playerO } = receivedData;

        try {
          const response = await fetch('http://localhost:12380/startGame.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ player1, player2, width, height }),
          });
          const result = await response.json();

          if (result.success) {
            const newGameId = result.gameId;
            console.log('Oyun oluşturuldu:', newGameId);

            activeGames[newGameId] = {
              player1,
              player2,
              width,
              height,
              playerX,
              playerO,
              board: Array(width * height).fill(null),
              currentTurn: player1,
            };

            [player1, player2].forEach((playerId) => {
              if (connectedUsers[playerId]?.client.readyState === WebSocket.OPEN) {
                connectedUsers[playerId].client.send(
                  JSON.stringify({
                    type: 'gameStarted',
                    gameId: newGameId,
                    playerX: player1,
                    playerO: player2,
                    opponent: {
                      uid: playerId === player1 ? player2 : player1,
                      email: connectedUsers[playerId === player1 ? player2 : player1]?.email,
                    },
                  })
                );
              }
            });
          } else {
            client.send(
              JSON.stringify({
                type: 'error',
                message: result.message || 'Oyun başlatılamadı',
              })
            );
          }
        } catch (err) {
          console.error('Hata oluştu:', err);
          client.send(
            JSON.stringify({
              type: 'error',
              message: 'Sunucu hatası',
            })
          );
        }
        break;
      }

      case 'makeMove': {
        const { gameId, x, y, player } = receivedData;
        const currentGame = activeGames[gameId];

        if (!currentGame) {
          client.send(JSON.stringify({ type: 'error', message: 'Oyun bulunamadı' }));
          return;
        }

        const boardIndex = y * currentGame.width + x;
        if (
          boardIndex < 0 ||
          boardIndex >= currentGame.board.length ||
          currentGame.board[boardIndex] !== null
        ) {
          client.send(JSON.stringify({ type: 'error', message: 'Geçersiz hamle' }));
          return;
        }

        currentGame.board[boardIndex] = player;
        currentGame.currentTurn =
          currentGame.currentTurn === currentGame.player1
            ? currentGame.player2
            : currentGame.player1;

        [currentGame.player1, currentGame.player2].forEach((playerId) => {
          if (connectedUsers[playerId]) {
            connectedUsers[playerId].client.send(
              JSON.stringify({
                type: 'updateBoard',
                gameId,
                currentTurn: currentGame.currentTurn,
                board: currentGame.board,
              })
            );
          }
        });
        break;
      }

      case 'logout': {
        delete connectedUsers[receivedData.uid];
        notifyAllUsers();
        break;
      }

      default: {
        console.log('Bilinmeyen mesaj türü:', receivedData.type);
        break;
      }
    }
  });

  client.on('close', () => {
    if (loggedUserId && connectedUsers[loggedUserId]) {
      delete connectedUsers[loggedUserId];
      notifyAllUsers();
    }
  });
});

function notifyAllUsers() {
  const updatedUserList = Object.keys(connectedUsers).map((uid) => ({
    uid,
    email: connectedUsers[uid].email,
  }));

  Object.values(connectedUsers).forEach(({ client }) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: 'updateUsers',
          users: updatedUserList,
        })
      );
    }
  });
}

console.log('WebSocket sunucusu çalışıyor: ws://localhost:8080');
