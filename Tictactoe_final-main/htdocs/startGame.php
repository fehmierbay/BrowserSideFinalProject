<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: http://localhost:3000"); 
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

ini_set('session.cookie_samesite', 'None');
ini_set('session.cookie_secure', 'true');

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}
require_once "dbsession.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $uidx = $data['uidx'];
    $uido = $data['uido'];
    $sizex = $data['sizex'];
    $sizey = $data['sizey'];

    $dcdb = getDbSes();
    if ($dcdb) {
        $insertGame = $dcdb->prepare("INSERT INTO game (uidx, uido, sizex, sizey) VALUES (:uidx, :uido, :sizex, :sizey)");
        $insertGame->bindValue(":uidx", $uidx);
        $insertGame->bindValue(":uido", $uido);
        $insertGame->bindValue(":sizex", $sizex);
        $insertGame->bindValue(":sizey", $sizey);
        if ($insertGame->execute()) {
            $gameId = $dcdb->lastInsertId();
        
            if (!isset($_SESSION['games'])) {
                $_SESSION['games'] = array();
            }
        
            $_SESSION['games'][(string)$gameId] = [
                'board' => array_fill(0, $sizex * $sizey, null),
                'playerX' => $uidx,
                'playerO' => $uido,
                'currentTurn' => $uidx,
                'status' => 'active',
                'sizex' => $sizex,
                'sizey' => $sizey
            ];
        
            $_SESSION["gameId"] = $gameId;
            $_SESSION["uidx"] = $uidx;
            $_SESSION["uido"] = $uido;
            $_SESSION["currentTurn"] = $uidx;
            $_SESSION["status"] = 'active';
        
            session_write_close();
            session_start();
        
            header('Content-Type: application/json');
            echo json_encode([
                "success" => true,
                "gameId" => $gameId,
                "uidx" => $uidx,
                "uido" => $uido,
                "debug" => [
                    "sessionData" => $_SESSION
                ],
                "sessionID" => session_id(),
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to insert game"]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Database connection failed"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request"]);
}
?>