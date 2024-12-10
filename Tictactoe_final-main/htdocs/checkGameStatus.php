<?php
// CORS settings
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// Start session
session_start();

// Only GET requests are processed
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $gameId = isset($_GET['gameId']) ? trim($_GET['gameId']) : null;

    // Checking if gameId is provided
    if (empty($gameId)) {
        echo json_encode([
            'success' => false,
            'message' => 'Missing game ID'
        ]);
        exit;
    }

    $gameId = (int)$gameId;

    // Check if the game exists in the session
    if (empty($_SESSION['games']) || !array_key_exists($gameId, $_SESSION['games'])) {
        echo json_encode([
            'success' => false,
            'message' => 'Game not found',
            'debug' => [
                'sessionExists' => !empty($_SESSION),
                'gamesAvailable' => isset($_SESSION['games']),
                'gameIdType' => gettype($gameId),
                'gameIdValue' => $gameId,
                'availableGameIds' => array_keys($_SESSION['games'] ?? []),
                'sessionData' => $_SESSION
            ],
            "sessionID" => session_id(),
        ]);
        exit;
    }

    // Retrieve the game data
    $gameData = $_SESSION['games'][$gameId];
    echo json_encode([
        'success' => true,
        'data' => [
            'board' => $gameData['board'],
            'currentTurn' => $gameData['currentTurn'],
            'playerX' => $gameData['playerX'],
            'playerO' => $gameData['playerO'],
            'status' => $gameData['status']
        ]
    ]);
}
?>
