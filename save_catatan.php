<?php
include "koneksi.php";

$agenda_id = $_POST['agenda_id'];
$user_id   = $_POST['user_id'];
$catatan   = $_POST['catatan'];

$cek = mysqli_query($conn, "
  SELECT id FROM agenda_catatan 
  WHERE agenda_id='$agenda_id' AND user_id='$user_id'
");

if(mysqli_num_rows($cek) > 0){
    mysqli_query($conn, "
      UPDATE agenda_catatan 
      SET catatan='$catatan'
      WHERE agenda_id='$agenda_id' AND user_id='$user_id'
    ");
} else {
    mysqli_query($conn, "
      INSERT INTO agenda_catatan (agenda_id, user_id, catatan)
      VALUES ('$agenda_id', '$user_id', '$catatan')
    ");
}

echo json_encode(["status"=>true]);
?>