<?php

header("Content-Type: application/json");

include "koneksi.php";

$judul          = $_POST['judul'];
$deskripsi      = $_POST['deskripsi'];
$lokasi         = $_POST['lokasi'];
$tanggal        = $_POST['tanggal'];
$waktu_mulai    = $_POST['waktu_mulai'];
$waktu_selesai  = $_POST['waktu_selesai'];
$tipe           = $_POST['tipe'];
$target         = $_POST['target'];

if($judul == ""){

    echo json_encode([
        "status" => false,
        "message" => "Judul wajib diisi"
    ]);

    exit;
}

// =======================================
// INSERT AGENDA
// =======================================

$query = mysqli_query($conn, "

INSERT INTO agenda(

judul,
deskripsi,
lokasi,
tanggal,
waktu_mulai,
waktu_selesai,
tipe,
created_at

)

VALUES(

'$judul',
'$deskripsi',
'$lokasi',
'$tanggal',
'$waktu_mulai',
'$waktu_selesai',
'$tipe',
NOW()

)

");

if($query){

    $agenda_id =
        mysqli_insert_id($conn);

    // =======================================
    // CARI TARGET ID
    // =======================================

    $target_id = 0;

    if($tipe == "komisi"){

        $q = mysqli_query($conn,"
        SELECT id FROM komisi
        WHERE nama_komisi='$target'
        ");

        $d = mysqli_fetch_assoc($q);

        $target_id = $d['id'] ?? 0;
    }

    else if($tipe == "fraksi"){

        $q = mysqli_query($conn,"
        SELECT id FROM fraksi
        WHERE nama_fraksi='$target'
        ");

        $d = mysqli_fetch_assoc($q);

        $target_id = $d['id'] ?? 0;
    }

    else if($tipe == "akd"){

        $q = mysqli_query($conn,"
        SELECT id FROM akd
        WHERE nama_akd='$target'
        ");

        $d = mysqli_fetch_assoc($q);

        $target_id = $d['id'] ?? 0;
    }

    // =======================================
    // INSERT TARGET
    // =======================================

    mysqli_query($conn, "

    INSERT INTO agenda_target(

    agenda_id,
    target_type,
    target_id

    )

    VALUES(

    '$agenda_id',
    '$tipe',
    '$target_id'

    )

    ");

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