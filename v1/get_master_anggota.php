<?php

header("Content-Type: application/json");

include "koneksi.php";

$jabatan = [];
$komisi = [];
$fraksi = [];
$akd = [];

// JABATAN
$q1 = mysqli_query($conn,"
SELECT * FROM jabatan
ORDER BY nama_jabatan ASC
");

while($d = mysqli_fetch_assoc($q1)){
    $jabatan[] = $d;
}

// KOMISI
$q2 = mysqli_query($conn,"
SELECT * FROM komisi
ORDER BY nama_komisi ASC
");

while($d = mysqli_fetch_assoc($q2)){
    $komisi[] = $d;
}

// FRAKSI
$q3 = mysqli_query($conn,"
SELECT * FROM fraksi
ORDER BY nama_fraksi ASC
");

while($d = mysqli_fetch_assoc($q3)){
    $fraksi[] = $d;
}

// AKD
$q4 = mysqli_query($conn,"
SELECT * FROM akd
ORDER BY nama_akd ASC
");

while($d = mysqli_fetch_assoc($q4)){
    $akd[] = $d;
}

echo json_encode([
    "status" => true,
    "jabatan" => $jabatan,
    "komisi" => $komisi,
    "fraksi" => $fraksi,
    "akd" => $akd
]);
?>