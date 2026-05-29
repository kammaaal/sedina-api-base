<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

include "../koneksi.php";

$id = isset($_GET['id'])
    ? intval($_GET['id'])
    : 0;

$query = mysqli_query($conn, "
    SELECT *
    FROM agenda
    WHERE id = '$id'
");

$data = mysqli_fetch_assoc($query);

if($data){

    echo json_encode([
        "status" => true,
        "data" => $data
    ]);

} else {

    echo json_encode([
        "status" => false
    ]);
}
?>