<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $gameId = $data['gameId'] ?? null;
    $x = $data['x'] ?? null;
    $y = $data['y'] ?? null;
    $player = $data['player'] ?? null;

    if (!isset($_SESSION['games'][$gameId])) {
        echo json_encode([
            'success' => false,
            'message' => 'error'
        ]);
        exit;
    }

    $game = &$_SESSION['games'][$gameId];
    
    if (!isset($game['board'])) {
        $game['board'] = array_fill(0, 9, null);
    }
    if (!isset($game['currentTurn'])) {
        $game['currentTurn'] = $game['playerX'];
    }

    $position = $y * 3 + $x;

    if ($game['currentTurn'] !== $player) {
        echo json_encode([
            'success' => false,
            'message' => 'not your turn'
        ]);
        exit;
    }

    if ($game['board'][$position] !== null) {
        echo json_encode([
            'success' => false,
            'message' => 'should change to another place'
        ]);
        exit;
    }

    $symbol = ($player === $game['playerX']) ? 'X' : 'O';
    $game['board'][$position] = $symbol;
    
    $game['currentTurn'] = ($player === $game['playerX']) ? $game['playerO'] : $game['playerX'];
    
    $winner = checkWinner($game['board']);
    if ($winner) {
        $game['status'] = 'completed';
        $game['winner'] = $winner;
        echo json_encode([
            'success' => true,
            'board' => $game['board'],
            'status' => 'completed',
            'winner' => $winner,
            'nextTurn' => null
        ]);
    } else if (!in_array(null, $game['board'])) {
        $game['status'] = 'draw';
        echo json_encode([
            'success' => true,
            'board' => $game['board'],
            'status' => 'draw',
            'winner' => null,
            'nextTurn' => null
        ]);
    } else {
        echo json_encode([
            'success' => true,
            'board' => $game['board'],
            'status' => 'active',
            'nextTurn' => $game['currentTurn']
        ]);
    }
}

function checkWinner($board) {
    $lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    foreach ($lines as $line) {
        [$a, $b, $c] = $line;
        if ($board[$a] && $board[$a] === $board[$b] && $board[$a] === $board[$c]) {
            return $board[$a];
        }
    }
    return null;
}
?>