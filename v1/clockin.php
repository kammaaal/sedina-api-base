<?php
include 'koneksi.php';

$agenda_id = $_POST['agenda_id'];
$user_id   = $_POST['user_id'];
$lokasi    = $_POST['lokasi'];
$foto      = $_POST['foto'];

// 🔥 folder upload
$folder = "uploads/";
if (!is_dir($folder)) {
  mkdir($folder, 0777, true);
}

// 🔥 decode base64
$image = base64_decode($foto);
$nama_file = "clockin_" . time() . ".jpg";
$path = $folder . $nama_file;

// simpan file
file_put_contents($path, $image);

// 🔥 cek sudah absen
$cek = mysqli_query($conn, "
  SELECT * FROM kehadiran 
  WHERE agenda_id='$agenda_id' AND user_id='$user_id'
");

if (mysqli_num_rows($cek) > 0) {
  echo json_encode([
    "status" => false,
    "message" => "Sudah clock-in"
  ]);
  exit;
}

// 🔥 waktu sekarang
$tanggal = date("Y-m-d");
$jam     = date("H:i:s");

// 🔥 insert ke DB
mysqli_query($conn, "
  INSERT INTO kehadiran (agenda_id, user_id, tanggal, jam, lokasi, foto)
  VALUES (
    '$agenda_id',
    '$user_id',
    '$tanggal',
    '$jam',
    '$lokasi',
    '$path'
  )
");

// 🔥 URL foto (PENTING)
$base_url = "https://applaunch.my.id/dprd/api/";

// 🔥 response lengkap
echo json_encode([
  "status" => true,
  "message" => "Berhasil clock-in",
  "tanggal" => $tanggal,
  "jam" => $jam,
  "lokasi" => $lokasi,
  "foto_url" => $base_url . $path
]);