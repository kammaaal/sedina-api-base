<?php
header("Content-Type: application/json");
include "koneksi.php";

$user_id = $_GET['user_id'] ?? 0;

if ($user_id == 0) {
  echo json_encode([
    "status" => false,
    "message" => "user_id tidak valid"
  ]);
  exit;
}

// ===== USER =====
$queryUser = mysqli_query($conn, "
  SELECT 
    u.nama,
    u.email,
    u.foto,
    u.role_id,
    u.fraksi_id,
    u.komisi_id,
    u.jabatan_id,

    f.nama_fraksi,
    k.nama_komisi,
    j.nama_jabatan

  FROM users u

  LEFT JOIN fraksi f 
    ON u.fraksi_id = f.id

  LEFT JOIN komisi k 
    ON u.komisi_id = k.id

  LEFT JOIN jabatan j
    ON u.jabatan_id = j.id

  WHERE u.id = '$user_id'
");

$user = mysqli_fetch_assoc($queryUser);

// ===== USER TIDAK ADA =====
if (!$user) {

  echo json_encode([
    "status" => false,
    "message" => "User tidak ditemukan"
  ]);

  exit;
}

// ===== AKD =====
$akd = [];

$q = mysqli_query($conn, "
  SELECT a.nama_akd 
  FROM user_akd ua
  JOIN akd a ON ua.akd_id = a.id
  WHERE ua.user_id = '$user_id'
");

while($r = mysqli_fetch_assoc($q)) {
  $akd[] = $r['nama_akd'];
}

// ===== PANJA =====
$panja = [];

$q = mysqli_query($conn, "
  SELECT p.nama_panja 
  FROM user_panja up
  JOIN panja p ON up.panja_id = p.id
  WHERE up.user_id = '$user_id'
");

while($r = mysqli_fetch_assoc($q)) {
  $panja[] = $r['nama_panja'];
}

// ===== PANSUS =====
$pansus = [];

$q = mysqli_query($conn, "
  SELECT p.nama_pansus 
  FROM user_pansus up
  JOIN pansus p ON up.pansus_id = p.id
  WHERE up.user_id = '$user_id'
");

while($r = mysqli_fetch_assoc($q)) {
  $pansus[] = $r['nama_pansus'];
}

// ===== RESPONSE =====
echo json_encode([
  "status" => true,

  "data" => [

    "nama" => $user['nama'],
    "email" => $user['email'],

    // 🔥 INI YANG PENTING
    "foto" => $user['foto'],

    "role_id" => $user['role_id'],
    "fraksi_id" => $user['fraksi_id'],
    "komisi_id" => $user['komisi_id'],
    "jabatan_id" => $user['jabatan_id'],

    "jabatan" => $user['nama_jabatan'] ?? "-",
    "fraksi" => $user['nama_fraksi'] ?? "-",
    "komisi" => $user['nama_komisi'] ?? "-",

    "akd" => $akd,
    "panja" => $panja,
    "pansus" => $pansus
  ]
]);
?>