<?PHP

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"); 
header("Access-Control-Allow-Credentials: true");

session_start();

$response = array(
    "uid" => isset($_SESSION["uid"]) ? $_SESSION["uid"] : null,

    "email" => isset($_SESSION["email"]) ? $_SESSION["email"] : null,

    "lastActivityTime" => isset($_SESSION["lastActivityTime"]) ? $_SESSION["lastActivityTime"] : null,

    "loggedInUsers" => isset($_SESSION["loggedInUsers"]) ? $_SESSION["loggedInUsers"] : null,

    "gameId" => isset($_SESSION["gameId"]) ? $_SESSION["gameId"] : null,

    "uidx" => isset($_SESSION["uidx"]) ? $_SESSION["uidx"] : null,

    "uido" => isset($_SESSION["uido"]) ? $_SESSION["uido"] : null,

    "games" => isset($_SESSION["games"]) ? $_SESSION["games"] : null,

);

header('Content-Type: application/json');
echo json_encode($response);
?>