<?php

header("Content-Type: application/json");

include "koneksi.php";

$user_id      = $_POST['user_id'] ?? 0;
$judul        = $_POST['judul'] ?? '';
$detail       = $_POST['detail_tugas'] ?? '';
$catatan      = $_POST['catatan'] ?? '';
$tanggal      = $_POST['tanggal'] ?? '';
$jam          = $_POST['jam'] ?? '';
$lokasi       = $_POST['lokasi'] ?? '';
$prioritas    = $_POST['prioritas'] ?? 'low';

$lampiran = "";

// ======================================
// UPLOAD FILE
// ======================================
if (isset($_FILES['lampiran'])) {

    $file = $_FILES['lampiran'];

    $namaFile =
        time() . "_" .
        basename($file['name']);

    $target =
        "../dashboard/uploads/todo/" .
        $namaFile;

    move_uploaded_file(
        $file['tmp_name'],
        $target
    );

    $lampiran = $namaFile;
}

$query = mysqli_query($conn, "

    INSERT INTO todo_list (

        user_id,
        judul,
        detail_tugas,
        catatan,
        tanggal,
        jam,
        lokasi,
        prioritas,
        lampiran

    ) VALUES (

        '$user_id',
        '$judul',
        '$detail',
        '$catatan',
        '$tanggal',
        '$jam',
        '$lokasi',
        '$prioritas',
        '$lampiran'
    )
");

if ($query) {

    echo json_encode([
        "status" => true,
        "message" => "Todo berhasil ditambahkan"
    ]);

} else {

    echo json_encode([
        "status" => false,
        "message" => mysqli_error($conn)
    ]);
}