<?php
header("Content-Type: application/json");
include "koneksi.php";

$query = mysqli_query($conn, "
  SELECT * FROM pesan
  ORDER BY tanggal DESC
");

$data = [];

while($row = mysqli_fetch_assoc($query)){
  $data[] = $row;
}

echo json_encode([
  "status" => true,
  "total" => count($data),
  "data" => $data
]);
?>