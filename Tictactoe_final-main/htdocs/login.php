<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

session_start();
require_once "dbsession.php";
require "jsonhelper.php";

$databaseConnection = getDbSes();

if ($databaseConnection) {
    $requestBody = file_get_contents('php://input');
    $jsonArray = json_decode($requestBody, true);

    if (empty(trim($jsonArray["pass"])) || empty(trim($jsonArray["email"]))) {
        $_SESSION["uid"] = "";
        jsonResponse(false, "Nonexistent user or wrong password", 1);
        return;
    }

    processLogin($jsonArray, $databaseConnection);
}

function processLogin($credentials, $db) {
    try {
        $query = $db->prepare("SELECT uid, hash, email FROM user WHERE email = :email;");
        $query->bindValue(":email", $credentials["email"]);

        if (!$query->execute() || $query->rowCount() === 0) {
            jsonResponse(false, "User does not exist", 4);
            return;
        }

        $user = $query->fetch();

        if (!password_verify($credentials["pass"], $user["hash"])) {
            resetSession();
            jsonResponse(false, "Incorrect password", 3);
            return;
        }

        $_SESSION["uid"] = $user["uid"];
        $_SESSION["email"] = $user["email"];
        $_SESSION["lastActivity"] = time();

        trackLoggedInUser($user["uid"], $user["email"]);
        refreshSessionData($db, $user["uid"]);

        jsonResponse(true, "Login successful", 2, [
            'uid' => $user["uid"],
            'email' => $user["email"],
            'lastActivity' => $_SESSION["lastActivity"]
        ]);

    } catch (Exception $ex) {
        error_log("Error in processLogin: " . $ex->getMessage());
        jsonResponse(false, "Unexpected error during login", 99);
    }
}

function resetSession() {
    $_SESSION["uid"] = null;
    $_SESSION["email"] = null;
}

function trackLoggedInUser($userId, $emailAddress) {
    if (!isset($_SESSION['loggedInUsers']) || !is_array($_SESSION['loggedInUsers'])) {
        $_SESSION['loggedInUsers'] = [];
    }

    foreach ($_SESSION['loggedInUsers'] as $activeUser) {
        if ($activeUser['uid'] === $userId) {
            return;
        }
    }

    $_SESSION['loggedInUsers'][] = [
        'uid' => $userId,
        'email' => $emailAddress
    ];
}

function refreshSessionData($dbConnection, $userId) {
    try {
        $currentTime = getMilliseconds();
        $sessionId = null;

        $threshold = $currentTime - 10 * 60 * 1000;
        $cleanOldSessions = $dbConnection->prepare("
            DELETE FROM session WHERE lastseen < :threshold
        ");
        $cleanOldSessions->bindValue(":threshold", $threshold);
        $cleanOldSessions->execute();

        $updateSession = $dbConnection->prepare("
            INSERT INTO session (uid, lastseen, gid)
            VALUES (:uid, :lastseen, :gid)
            ON DUPLICATE KEY UPDATE lastseen = :lastseen, gid = :gid;
        ");
        $updateSession->bindValue(":uid", $userId);
        $updateSession->bindValue(":lastseen", $currentTime);
        $updateSession->bindValue(":gid", $sessionId);
        $updateSession->execute();
    } catch (Exception $err) {
        error_log("Error in refreshSessionData: " . $err->getMessage());
    }
}

function getMilliseconds() {
    return floor(microtime(true) * 1000);
}
?>
