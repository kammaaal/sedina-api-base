<?php

header("Content-Type: application/json");

include "koneksi.php";

$id = $_POST['id'];

$query = mysqli_query($conn, "

SELECT
id,
nama,
email,
foto,
role_id

FROM users

WHERE id='$id'

LIMIT 1

");

$data =
    mysqli_fetch_assoc($query);

if($data){

    echo json_encode([

        "status" => true,

        "data" => $data
    ]);

} else {

    echo json_encode([

        "status" => false,

        "message" => "User tidak ditemukan"
    ]);
}
?>