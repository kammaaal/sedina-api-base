<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

include "koneksi.php";

$conn->set_charset("utf8mb4");

$page = isset($_GET['page'])
    ? (int)$_GET['page']
    : 1;

if ($page < 1) {
    $page = 1;
}

$limit = 5;
$offset = ($page - 1) * $limit;

$sql = "
    SELECT *
    FROM berita
    WHERE status='publish'
    ORDER BY id DESC
    LIMIT $limit OFFSET $offset
";

$query = mysqli_query($conn, $sql);

if (!$query) {

    echo json_encode([
        "status" => false,
        "message" => mysqli_error($conn)
    ]);

    exit;
}

$data = [];

while($row = mysqli_fetch_assoc($query)) {

    if (!empty($row['thumbnail'])) {

        $row['thumbnail'] =
            "https://applaunch.my.id/dprd/dashboard/upload/berita/" .
            $row['thumbnail'];

    } else {

        $row['thumbnail'] =
            "https://picsum.photos/500/300";
    }

    $data[] = $row;
}

echo json_encode([
    "status" => true,
    "data" => $data
]);