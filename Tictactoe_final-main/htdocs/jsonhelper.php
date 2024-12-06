<?php
function sendJsonResponse($isSuccess, $msg, $errorCode, $userEmail = null) {
    $responseData = [
        "success" => $isSuccess,
        "message" => $msg,
        "mid" => $errorCode,
    ];

    if (!is_null($userEmail)) {
        $responseData["user"] = $userEmail;
    }

    echo json_encode($responseData);
}
?>
