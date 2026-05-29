<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");

include "koneksi.php";

$conn->set_charset("utf8mb4");

// =====================================
// AMBIL DATA
// =====================================

$tag        = $_POST['tag'] ?? '';
$penulis    = $_POST['penulis'] ?? '';
$judul      = $_POST['judul'] ?? '';
$ringkasan  = $_POST['ringkasan'] ?? '';
$isi        = $_POST['isi'] ?? '';

$status = "publish";

// =====================================
// VALIDASI
// =====================================

if(

    $tag == "" ||
    $penulis == "" ||
    $judul == "" ||
    $ringkasan == "" ||
    $isi == ""

){

    echo json_encode([

        "status" => false,

        "message" => "Data belum lengkap"
    ]);

    exit;
}

// =====================================
// UPLOAD THUMBNAIL
// =====================================

$thumbnail = "";

if(

    isset($_FILES['thumbnail']) &&
    $_FILES['thumbnail']['error'] == 0

){

    $fileName =
        $_FILES['thumbnail']['name'];

    $tmpName =
        $_FILES['thumbnail']['tmp_name'];

    $ext =
        strtolower(

            pathinfo(
                $fileName,
                PATHINFO_EXTENSION
            )
        );

    $thumbnail =

        time() .
        rand(111,999) .
        "." .
        $ext;

    // =================================
    // FOLDER UPLOAD
    // =================================

    $folder =
        "../dashboard/upload/berita/";

    // =================================
    // CEK FOLDER
    // =================================

    if(!file_exists($folder)){

        mkdir(

            $folder,
            0777,
            true
        );
    }

    // =================================
    // PATH FILE
    // =================================

    $uploadPath =
        $folder . $thumbnail;

    // =================================
    // MOVE FILE
    // =================================

    if(

        move_uploaded_file(
            $tmpName,
            $uploadPath
        )

    ){

        // sukses upload

    } else {

        echo json_encode([

            "status" => false,

            "message" =>
                "Gagal upload thumbnail"
        ]);

        exit;
    }
}

// =====================================
// TANGGAL & JAM
// =====================================

$tanggal_upload =
    date("Y-m-d");

$jam_upload =
    date("H:i:s");

// =====================================
// INSERT DATABASE
// =====================================

$query = mysqli_query($conn, "

INSERT INTO berita(

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

)

VALUES(

'$tag',
'$penulis',
'$judul',
'$ringkasan',
'$isi',
'$thumbnail',
'$status',
'$tanggal_upload',
'$jam_upload',
NOW(),
NOW(),
'0'

)

");

// =====================================
// RESPONSE
// =====================================

if($query){

    echo json_encode([

        "status" => true,

        "message" => "Berita berhasil ditambahkan"
    ]);

} else {

    echo json_encode([

        "status" => false,

        "message" => mysqli_error($conn)
    ]);
}

?>