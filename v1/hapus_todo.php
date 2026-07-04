<?php

header("Content-Type: application/json");

include "koneksi.php";

$id = $_POST['id'] ?? 0;

// ======================================
// HAPUS FILE
// ======================================
$get = mysqli_query($conn, "
    SELECT lampiran
    FROM todo_list
    WHERE id='$id'
");

$data = mysqli_fetch_assoc($get);

if (!empty($data['lampiran'])) {

    $path =
        "../dashboard/uploads/todo/" .
        $data['lampiran'];

    if (file_exists($path)) {
        unlink($path);
    }
}

$query = mysqli_query($conn, "

    DELETE FROM todo_list

    WHERE id='$id'
");

echo json_encode([
    "status" => $query
]);