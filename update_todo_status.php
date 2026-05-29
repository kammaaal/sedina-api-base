<?php

header("Content-Type: application/json");

include "koneksi.php";

$id =
    $_POST['id'] ?? 0;

$status =
    $_POST['status'] ?? 'pending';

// ========================================
// VALIDASI
// ========================================
if ($id == 0) {

    echo json_encode([
        "status" => false,
        "message" => "ID tidak valid"
    ]);

    exit;
}

// ========================================
// UPDATE
// ========================================
$query = mysqli_query($conn, "

    UPDATE todo_list

    SET status='$status'

    WHERE id='$id'
");

// ========================================
// RESPONSE
// ========================================
if ($query) {

    echo json_encode([
        "status" => true,
        "message" => "Status berhasil diupdate"
    ]);

} else {

    echo json_encode([
        "status" => false,
        "message" => mysqli_error($conn)
    ]);
}
?>