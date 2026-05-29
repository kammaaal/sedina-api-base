<?php

header("Content-Type: application/json");

include "koneksi.php";

if (!$conn) {

    echo json_encode([
        "status" => false,
        "message" => "Koneksi gagal"
    ]);

    exit;
}

$id = isset($_POST['id'])
    ? (int) $_POST['id']
    : 0;

if ($id <= 0) {

    echo json_encode([
        "status" => false,
        "message" => "ID kosong"
    ]);

    exit;
}

mysqli_query($conn, "
    UPDATE berita
    SET dilihat = dilihat + 1
    WHERE id = '$id'
");

echo json_encode([
    "status" => true
]);