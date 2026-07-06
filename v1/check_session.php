<?php
include "koneksi.php";

$user_id = $_POST['user_id'];
$device_id = $_POST['device_id'];

$query = mysqli_query($conn, "SELECT device_id FROM users WHERE id = '$user_id'");
$data = mysqli_fetch_assoc($query);

if ($data['device_id'] != $device_id) {
    echo json_encode([
        "status" => false,
        "message" => "Session expired"
    ]);
} else {
    echo json_encode([
        "status" => true
    ]);
}
?>