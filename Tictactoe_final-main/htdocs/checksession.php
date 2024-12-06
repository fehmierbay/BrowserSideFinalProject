<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type"); 
header("Access-Control-Allow-Credentials: true");

phpinfo();

echo session_save_path();

echo is_writable(session_save_path()) ? 'Writable' : 'Not Writable';
?>
