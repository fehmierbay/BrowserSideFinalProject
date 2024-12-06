<?php
require "constants.php";
require PREFIX . "credentials.php";

// Veritabanı bağlantısını kuran fonksiyon
// Eğer bağlantı başarısız olursa, credentials.php dosyasını kontrol edin!
function connectToDatabase()
{
    try {
        return new PDO(
            getDbStringFromCredentials(),
            getDbUserFromCredentials(),
            getDbPwdFromCredentials(),
            array(
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8'
            )
        );
    } catch (PDOException $dbError) {
        $response = [];
        $response["success"] = false;
        $response["message"] = "Failed to connect to the database: " . $dbError->getMessage();
        $response["errorCode"] = 1;
        echo json_encode($response);
        return false;
    }
}
?>
