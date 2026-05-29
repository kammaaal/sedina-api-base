<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include "koneksi.php";

$user_id = isset($_GET['user_id'])
    ? intval($_GET['user_id'])
    : 0;

if($user_id == 0){

    echo json_encode([
        "status" => false,
        "message" => "user_id kosong"
    ]);

    exit;
}

$query = mysqli_query($conn, "

    SELECT
        kehadiran.*,
        agenda.judul,
        agenda.tanggal

    FROM kehadiran

    LEFT JOIN agenda
    ON agenda.id = kehadiran.agenda_id

    WHERE kehadiran.user_id = '$user_id'

    ORDER BY kehadiran.id DESC

");

$data = [];

while($row = mysqli_fetch_assoc($query)){

    $data[] = $row;
}

echo json_encode([
    "status" => true,
    "data" => $data
]);
?>