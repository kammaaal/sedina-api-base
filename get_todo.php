<?php

header("Content-Type: application/json");

include "koneksi.php";

$user_id = $_GET['user_id'] ?? 0;

if ($user_id == 0) {

    echo json_encode([
        "status" => false,
        "message" => "User tidak valid"
    ]);

    exit;
}

$query = mysqli_query($conn, "

    SELECT *
    FROM todo_list

    WHERE user_id = '$user_id'

    ORDER BY tanggal ASC,
    jam ASC

");

$data = [];

while($row = mysqli_fetch_assoc($query)) {

    $lampiran = "";

    if (!empty($row['lampiran'])) {

        $lampiran =
            "https://applaunch.my.id/dprd/dashboard/uploads/todo/" .
            $row['lampiran'];
    }

    $data[] = [

        "id" => $row["id"],

        "title" => $row["judul"],

        "detail_tugas" =>
            $row["detail_tugas"],

        "catatan" =>
            $row["catatan"],

        "time" =>
            substr($row["jam"], 0, 5),

        "location" =>
            $row["lokasi"],

        "priority" =>
            $row["prioritas"],

        "done" =>
            $row["status"] == "done",

        "date" =>
            $row["tanggal"],

        "lampiran" =>
            $lampiran,
    ];
}

echo json_encode([
    "status" => true,
    "data" => $data
]);