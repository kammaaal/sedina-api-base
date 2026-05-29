<?php

header("Content-Type: application/json");

include "koneksi.php";

$id             = $_POST['id'] ?? '';
$judul          = $_POST['judul'] ?? '';
$detail_tugas   = $_POST['detail_tugas'] ?? '';
$catatan        = $_POST['catatan'] ?? '';
$tanggal        = $_POST['tanggal'] ?? '';
$jam            = $_POST['jam'] ?? '';
$lokasi         = $_POST['lokasi'] ?? '';
$prioritas      = $_POST['prioritas'] ?? 'low';

if ($id == '') {

    echo json_encode([
        "status" => false,
        "message" => "ID kosong"
    ]);

    exit;
}

$lampiran = '';

if (isset($_FILES['lampiran'])) {

    $fileName =
        time() . "_" .
        $_FILES['lampiran']['name'];

    $tmp =
        $_FILES['lampiran']['tmp_name'];

    $path =
        "../dashboard/upload/todo/" .
        $fileName;

    move_uploaded_file($tmp, $path);

    $lampiran =
        ", lampiran='$fileName'";
}

$query = mysqli_query($conn, "

    UPDATE todos SET

    title           ='$judul',
    detail_tugas    ='$detail_tugas',
    catatan         ='$catatan',
    date            ='$tanggal',
    time            ='$jam',
    location        ='$lokasi',
    priority        ='$prioritas'

    $lampiran

    WHERE id='$id'
");

if ($query) {

    echo json_encode([
        "status" => true,
        "message" => "Todo berhasil diupdate"
    ]);

} else {

    echo json_encode([
        "status" => false,
        "message" => mysqli_error($conn)
    ]);
}
?>