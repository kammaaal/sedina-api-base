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

// ======================================
// AMBIL DATA USER
// ======================================

$user = mysqli_fetch_assoc(

  mysqli_query(
    $conn,
    "SELECT * FROM users WHERE id='$user_id'"
  )
);

$komisi_id =
    $user['komisi_id'] ?? 0;

$fraksi_id =
    $user['fraksi_id'] ?? 0;

// ======================================
// AKD USER
// ======================================

$akd_ids = [];

$q_akd = mysqli_query(
  $conn,
  "SELECT akd_id
   FROM user_akd
   WHERE user_id='$user_id'"
);

while($r = mysqli_fetch_assoc($q_akd)) {

  $akd_ids[] = $r['akd_id'];
}

$akd_str =
    implode(",", !empty($akd_ids)
    ? $akd_ids
    : [0]);

// ======================================
// PANJA USER
// ======================================

$panja_ids = [];

$q_panja = mysqli_query(
  $conn,
  "SELECT panja_id
   FROM user_panja
   WHERE user_id='$user_id'"
);

while($r = mysqli_fetch_assoc($q_panja)) {

  $panja_ids[] = $r['panja_id'];
}

$panja_str =
    implode(",", !empty($panja_ids)
    ? $panja_ids
    : [0]);

// ======================================
// PANSUS USER
// ======================================

$pansus_ids = [];

$q_pansus = mysqli_query(
  $conn,
  "SELECT pansus_id
   FROM user_pansus
   WHERE user_id='$user_id'"
);

while($r = mysqli_fetch_assoc($q_pansus)) {

  $pansus_ids[] = $r['pansus_id'];
}

$pansus_str =
    implode(",", !empty($pansus_ids)
    ? $pansus_ids
    : [0]);

// ======================================
// QUERY AGENDA USER
// ======================================

$query = mysqli_query($conn, "

SELECT DISTINCT

  a.id,
  a.judul,
  a.deskripsi,
  a.tanggal,
  a.waktu_mulai,
  a.waktu_selesai,
  a.lokasi,
  a.file_undangan,
  a.tipe,

  t.target_type,
  t.target_id

FROM agenda a

LEFT JOIN agenda_target t
ON a.id = t.agenda_id

WHERE

(
  t.target_type='komisi'
  AND t.target_id='$komisi_id'
)

OR

(
  t.target_type='fraksi'
  AND t.target_id='$fraksi_id'
)

OR

(
  t.target_type='akd'
  AND t.target_id IN ($akd_str)
)

OR

(
  t.target_type='panja'
  AND t.target_id IN ($panja_str)
)

OR

(
  t.target_type='pansus'
  AND t.target_id IN ($pansus_str)
)

OR

(
  a.tipe='paripurna'
)

ORDER BY
a.tanggal ASC,
a.waktu_mulai ASC

");

// ======================================
// ERROR MYSQL
// ======================================

if (!$query) {

  echo json_encode([

    "status" => false,

    "message" => mysqli_error($conn)
  ]);

  exit;
}

// ======================================
// RESULT
// ======================================

$data = [];

while($row = mysqli_fetch_assoc($query)) {

  // 🔥 jenis final untuk flutter
  $row['jenis'] =
      $row['target_type']
      ?: $row['tipe'];

  // 🔥 default lokasi
  $row['lokasi'] =
      $row['lokasi'] ?: "-";

  $data[] = $row;
}

// ======================================
// RESPONSE
// ======================================

echo json_encode([

  "status" => true,

  "total" => count($data),

  "data" => $data

]);
?>