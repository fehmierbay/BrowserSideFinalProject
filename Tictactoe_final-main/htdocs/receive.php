<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

session_start();

require_once "sessioncheck.php";
require_once "dbsession.php";

define('SESSION_TIMEOUT', 900); // 15 minutes

// Check for session timeout
if (isSessionExpired()) {
    terminateSession("Session expired");
}

// Update last activity time
$_SESSION['lastActivityTime'] = time();

// Main execution block
if (($uid = sessionUid()) !== null) {
    $currentTime = getCurrentTimeMillis();
    handleSessionUpdates($uid, $currentTime);
    handleResponse();
}

// Helper functions
function isSessionExpired() {
    return isset($_SESSION['lastActivityTime']) && (time() - $_SESSION['lastActivityTime']) > SESSION_TIMEOUT;
}

function terminateSession($message) {
    session_unset();
    session_destroy();
    echo json_encode(["success" => false, "message" => $message]);
    exit();
}

function getCurrentTimeMillis() {
    return round(microtime(true) * 1000);
}

function handleSessionUpdates($uid, $currentTime) {
    $_SESSION['lastCallTime'] = $currentTime;

    if (!isset($_SESSION['lastDbUpdateTime'])) {
        $_SESSION['lastDbUpdateTime'] = $currentTime;
    }

    $timeSinceLastUpdate = $currentTime - $_SESSION['lastDbUpdateTime'];

    if ($timeSinceLastUpdate >= 10000) { // Update every 10 seconds
        $dcdb = getDbSes();
        if ($dcdb) {
            updateDatabaseSession($dcdb, $uid, $currentTime);
        }
        $_SESSION['lastDbUpdateTime'] = $currentTime;
    }
}

function updateDatabaseSession($db, $uid, $lastSeenTime) {
    try {
        $stmt = $db->prepare("UPDATE session SET lastseen = :lastseen WHERE uid = :uid");
        $stmt->bindValue(":lastseen", $lastSeenTime);
        $stmt->bindValue(":uid", $uid);
        $stmt->execute();
    } catch (Exception $e) {
        error_log("Error updating session in database: " . $e->getMessage());
    }
}

function handleResponse() {
    $response = ["success" => true];

    if (isset($_POST['action']) && $_POST['action'] === 'nop') {
        $response["action"] = 'nop';
    }

    echo json_encode($response);
}
?>
