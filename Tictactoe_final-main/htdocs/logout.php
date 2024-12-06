<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $rawInput = file_get_contents('php://input');
        $parsedData = json_decode($rawInput, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON format');
        }

        $userId = $parsedData['uid'] ?? null;

        if (empty($userId)) {
            throw new Exception('User ID is missing');
        }

        if (!empty($_SESSION['loggedInUsers'])) {
            $_SESSION['loggedInUsers'] = array_filter(
                $_SESSION['loggedInUsers'],
                function ($user) use ($userId) {
                    return (int)$user['uid'] !== (int)$userId;
                }
            );
        }

        clearSession();

        echo json_encode([
            "status" => "success",
            "message" => "User successfully logged out",
            "remainingUsers" => $_SESSION['loggedInUsers'] ?? []
        ]);
        exit();

    } catch (Exception $ex) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => $ex->getMessage()
        ]);
        exit();
    }
} else {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Unsupported request method"
    ]);
}

function clearSession() {
    unset($_SESSION['uid'], $_SESSION['email'], $_SESSION['lastActivityTime'], $_SESSION['gameId'], $_SESSION['games']);
}
?>
