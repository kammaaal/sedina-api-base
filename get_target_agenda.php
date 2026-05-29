<?php

header("Content-Type: application/json");

include "koneksi.php";

$tipe = $_GET['tipe'];

$data = [];

if($tipe == "komisi"){

    $query = mysqli_query($conn,"
    SELECT id,nama_komisi AS nama
    FROM komisi
    ORDER BY nama_komisi ASC
    ");
}

else if($tipe == "fraksi"){

    $query = mysqli_query($conn,"
    SELECT id,nama_fraksi AS nama
    FROM fraksi
    ORDER BY nama_fraksi ASC
    ");
}

else if($tipe == "akd"){

    $query = mysqli_query($conn,"
    SELECT id,nama_akd AS nama
    FROM akd
    ORDER BY nama_akd ASC
    ");
}

else {

    $query = mysqli_query($conn,"
    SELECT 0 AS id,'Umum' AS nama
    ");
}

while($row = mysqli_fetch_assoc($query)){

    $data[] = $row;
}

echo json_encode([
    "status" => true,
    "data" => $data
]);

?>