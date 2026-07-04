<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

include "koneksi.php";

$conn->set_charset("utf8mb4");

// =====================================
// PAGINATION
// =====================================

$page = isset($_GET['page'])
    ? (int)$_GET['page']
    : 1;

if($page < 1){
    $page = 1;
}

$limit = 50;

$offset =
    ($page - 1) * $limit;

// =====================================
// GET BERITA
// =====================================

$query = mysqli_query($conn, "

SELECT

id,
tag,
penulis,
judul,
ringkasan,
isi,
thumbnail,
status,
tanggal_upload,
jam_upload,
created_at,
updated_at,
dilihat

FROM berita

ORDER BY id DESC

LIMIT $limit OFFSET $offset

");

// =====================================
// ERROR QUERY
// =====================================

if(!$query){

    echo json_encode([

        "status" => false,

        "message" => mysqli_error($conn)
    ]);

    exit;
}

// =====================================
// ARRAY DATA
// =====================================

$data = [];

while($row = mysqli_fetch_assoc($query)){

    // ================================
    // THUMBNAIL
    // ================================

    if(
        !empty($row['thumbnail'])
    ){

        $row['thumbnail'] =

            "https://applaunch.my.id/dprd/dashboard/upload/berita/" .

            $row['thumbnail'];

    } else {

        $row['thumbnail'] = "";
    }

    $data[] = $row;
}

// =====================================
// RESPONSE
// =====================================

echo json_encode([

    "status" => true,

    "data" => $data
]);

?>