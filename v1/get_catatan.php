<?php
include "koneksi.php";

$agenda_id = $_GET['agenda_id'];
$user_id   = $_GET['user_id'];

$q = mysqli_query($conn, "
  SELECT catatan FROM agenda_catatan
  WHERE agenda_id='$agenda_id' AND user_id='$user_id'
");

$data = mysqli_fetch_assoc($q);

echo json_encode([
  "status" => true,
  "catatan" => $data['catatan'] ?? ""
]);
?>