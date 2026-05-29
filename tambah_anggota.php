<?php

header("Content-Type: application/json");

include "koneksi.php";

$nama       = $_POST['nama'];
$email      = $_POST['email'];
$password   = md5($_POST['password']);

$jabatan_id = $_POST['jabatan_id'];
$komisi_id  = $_POST['komisi_id'];
$fraksi_id  = $_POST['fraksi_id'];
$akd_id     = $_POST['akd_id'];

$role_id = 3;

// =====================================
// CEK EMAIL
// =====================================

$cek = mysqli_query($conn,"
SELECT * FROM users
WHERE email='$email'
");

if(mysqli_num_rows($cek) > 0){

    echo json_encode([
        "status" => false,
        "message" => "Email sudah digunakan"
    ]);

    exit;
}

// =====================================
// FOTO
// =====================================

$foto = "";

if(isset($_FILES['foto'])){

    $ext = pathinfo(
        $_FILES['foto']['name'],
        PATHINFO_EXTENSION
    );

    $foto =
        time().rand(111,999).".".$ext;

    move_uploaded_file(

        $_FILES['foto']['tmp_name'],

        "../dashboard/upload/anggota/".$foto
    );
}

// =====================================
// INSERT USER
// =====================================

$query = mysqli_query($conn,"

INSERT INTO users(

nama,
email,
password,
foto,
role_id,
jabatan_id,
komisi_id,
fraksi_id

)

VALUES(

'$nama',
'$email',
'$password',
'$foto',
'$role_id',
'$jabatan_id',
'$komisi_id',
'$fraksi_id'

)

");

if($query){

    $user_id =
        mysqli_insert_id($conn);

    if($akd_id != ""){

        mysqli_query($conn,"

        INSERT INTO user_akd(

        user_id,
        akd_id

        )

        VALUES(

        '$user_id',
        '$akd_id'

        )

        ");
    }

    echo json_encode([
        "status" => true,
        "message" => "Berhasil"
    ]);

} else {

    echo json_encode([
        "status" => false,
        "message" => mysqli_error($conn)
    ]);
}
?>