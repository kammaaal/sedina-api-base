<?php
header("Content-Type: application/json");
include "koneksi.php";

$user_id = $_POST['user_id'] ?? 0;
$old_pass = $_POST['old_password'] ?? '';
$new_pass = $_POST['new_password'] ?? '';

if ($user_id == 0 || $old_pass == '' || $new_pass == '') {
  echo json_encode([
    "status" => false,
    "message" => "Data tidak lengkap"
  ]);
  exit;
}

// 🔥 ambil password lama dari DB
$q = mysqli_query($conn, "SELECT password FROM users WHERE id='$user_id'");
$user = mysqli_fetch_assoc($q);

if (!$user) {
  echo json_encode([
    "status" => false,
    "message" => "User tidak ditemukan"
  ]);
  exit;
}

// 🔥 validasi password lama
if ($user['password'] != $old_pass) {
  echo json_encode([
    "status" => false,
    "message" => "Password lama salah"
  ]);
  exit;
}

// 🔥 update password baru
mysqli_query($conn, "UPDATE users SET password='$new_pass' WHERE id='$user_id'");

echo json_encode([
  "status" => true,
  "message" => "Password berhasil diubah"
]);
?>