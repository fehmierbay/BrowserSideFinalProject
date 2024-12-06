<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

session_start();
require "dbsession.php";
require "jsonhelper.php";

// Get database connection
$dcdb = getDbSes();
if ($dcdb) {
    // Retrieve the request body
    $reqbody = file_get_contents('php://input');
    $jsonar = json_decode($reqbody, true);

    // Validate input
    if (empty(trim($jsonar["pass"])) || empty(trim($jsonar["email"]))) {
        // If email or password is empty, clear session and return error
        $_SESSION["uid"] = "";
        jsonResponse(false, "Nonexistent user or wrong password", 1);
        return;
    }

    // Proceed with registration
    registerUser($jsonar, $dcdb);
}

/**
 * Handles user registration
 *
 * @param array $jsonar The data from the request body
 * @param PDO $dcdb The database connection
 */
function registerUser($jsonar, $dcdb) {
    try {
        // Check if the user already exists
        $selectUser = $dcdb->prepare("SELECT uid FROM user WHERE email = :email;");
        $selectUser->bindValue(":email", $jsonar["email"]);

        if ($selectUser->execute() && $selectUser->rowCount() > 0) {
            // User already exists
            jsonResponse(false, "User already exists", 5);
            return;
        }

        // Insert the new user into the database
        $insertUser = $dcdb->prepare("INSERT INTO user (email, hash) VALUES (:email, :hash);");
        $insertUser->bindValue(":email", $jsonar["email"]);
        $insertUser->bindValue(":hash", password_hash($jsonar["pass"], PASSWORD_BCRYPT));

        if ($insertUser->execute()) {
            // Registration successful
            jsonResponse(true, "Registration successful", 6);
        } else {
            // Registration failed
            jsonResponse(false, "Registration failed", 7);
        }
    } catch (Exception $e) {
        // Error handling
        jsonResponse(false, "An error occurred: " . $e->getMessage(), 8);
    }
}
