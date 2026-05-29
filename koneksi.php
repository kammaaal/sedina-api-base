<?php
header("Content-Type: application/json");

$host = "localhost";
$user = "denx8937_sedina";
$pass = "Rsuherd1199";
$db   = "denx8937_sedina"; // contoh dari screenshot kamu

$conn = mysqli_connect($host, $user, $pass, $db);

if (!$conn) {
    echo json_encode([
        "status" => false,
        "message" => "Koneksi gagal"
    ]);
    exit;
}
?>