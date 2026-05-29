<?php

header("Content-Type: application/json");

include "koneksi.php";

$user_id =
    $_POST['user_id'] ?? 0;

$isi_pesan =
    $_POST['isi_pesan'] ?? '';

// =====================================
// VALIDASI
// =====================================
if ($user_id == 0 || $isi_pesan == '') {

    echo json_encode([
        "status" => false,
        "message" => "Data tidak lengkap"
    ]);

    exit;
}

// =====================================
// AMBIL USER
// =====================================
$qUser = mysqli_query($conn, "

    SELECT nama

    FROM users

    WHERE id='$user_id'

    LIMIT 1
");

$user =
    mysqli_fetch_assoc($qUser);

if (!$user) {

    echo json_encode([
        "status" => false,
        "message" => "User tidak ditemukan"
    ]);

    exit;
}

$penulis =
    $user['nama'];

// =====================================
// INSERT PESAN
// =====================================
$query = mysqli_query($conn, "

    INSERT INTO pesan (

        isi_pesan,
        penulis,
        tanggal

    ) VALUES (

        '$isi_pesan',
        '$penulis',
        NOW()
    )
");

// =====================================
// RESPONSE
// =====================================
if ($query) {

    echo json_encode([
        "status" => true,
        "message" => "Pesan berhasil disimpan"
    ]);

} else {

    echo json_encode([
        "status" => false,
        "message" => mysqli_error($conn)
    ]);
}
?>