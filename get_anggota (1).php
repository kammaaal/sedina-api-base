<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "koneksi.php";

// ======================================================
// AMBIL DATA ANGGOTA
// EXCLUDE ADMIN & SUPER ADMIN
// ======================================================

$query = mysqli_query($conn, "

SELECT 
    users.id,
    users.nama,
    users.email,
    users.foto,

    jabatan.nama_jabatan AS jabatan,

    fraksi.nama_fraksi AS fraksi,

    komisi.nama_komisi AS komisi,

    akd.nama_akd AS akd

FROM users

LEFT JOIN jabatan
ON users.jabatan_id = jabatan.id

LEFT JOIN fraksi
ON users.fraksi_id = fraksi.id

LEFT JOIN komisi
ON users.komisi_id = komisi.id

LEFT JOIN user_akd
ON users.id = user_akd.user_id

LEFT JOIN akd
ON user_akd.akd_id = akd.id

WHERE users.role_id NOT IN (1,2)

ORDER BY users.id DESC

");

$data = [];

while($row = mysqli_fetch_assoc($query)){

    $data[] = $row;
}

echo json_encode([
    "status" => true,
    "data" => $data
]);