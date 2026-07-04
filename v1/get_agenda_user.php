<?php
header("Content-Type: application/json");
include "koneksi.php";

$user_id = $_GET['user_id'] ?? 0;
$type    = $_GET['type'] ?? 'all';

// =====================================================
// VALIDASI
// =====================================================
if ($user_id == 0) {

  echo json_encode([
    "status" => false,
    "message" => "user_id tidak valid"
  ]);

  exit;
}

// =====================================================
// AMBIL ROLE USER
// =====================================================
$user_query = mysqli_query(
  $conn,
  "SELECT role_id FROM users WHERE id='$user_id'"
);

$user_data = mysqli_fetch_assoc($user_query);

$role_id = $user_data['role_id'] ?? 0;

// =====================================================
// SUPER ADMIN / ADMIN
// =====================================================
$is_privileged =
    ($role_id == 1 || $role_id == 2);

// =====================================================
// SUPER ADMIN / ADMIN
// LIHAT SEMUA AGENDA
// =====================================================
if ($is_privileged && $type == 'all') {

  $query = mysqli_query($conn, "

    SELECT DISTINCT

      a.*,

      n.notulensi_resmi,
      n.file_notulensi

    FROM agenda a

    LEFT JOIN notulensi n
      ON a.id = n.agenda_id

    ORDER BY a.tanggal ASC

  ");

  // DEBUG MYSQL ERROR
  if (!$query) {

    echo json_encode([
      "status" => false,
      "message" => mysqli_error($conn)
    ]);

    exit;
  }

  $data = [];

  while($row = mysqli_fetch_assoc($query)) {

    $row['notulensi_resmi'] =
        $row['notulensi_resmi'] ?? null;

    $row['file_notulensi'] =
        $row['file_notulensi'] ?? null;

    $row['file_undangan'] =
        $row['file_undangan'] ?? null;

    $row['lokasi'] =
        $row['lokasi'] ?? "-";

    $data[] = $row;
  }

  echo json_encode([

    "status" => true,

    "role_id" => $role_id,

    "is_privileged" => true,

    "total" => count($data),

    "data" => $data

  ]);

  exit;
}

// =====================================================
// USER NORMAL
// =====================================================

// ================= KOMISI =================
$komisi = [];

$q = mysqli_query(
  $conn,
  "SELECT komisi_id FROM users WHERE id='$user_id'"
);

while($r = mysqli_fetch_assoc($q)) {

  if($r['komisi_id'] != null){
    $komisi[] = $r['komisi_id'];
  }
}

// ================= FRAKSI =================
$fraksi = [];

$q = mysqli_query(
  $conn,
  "SELECT fraksi_id FROM users WHERE id='$user_id'"
);

while($r = mysqli_fetch_assoc($q)) {

  if($r['fraksi_id'] != null){
    $fraksi[] = $r['fraksi_id'];
  }
}

// ================= AKD =================
$akd = [];

$q = mysqli_query(
  $conn,
  "SELECT akd_id FROM user_akd WHERE user_id='$user_id'"
);

while($r = mysqli_fetch_assoc($q)) {
  $akd[] = $r['akd_id'];
}

// ================= PANJA =================
$panja = [];

$q = mysqli_query(
  $conn,
  "SELECT panja_id FROM user_panja WHERE user_id='$user_id'"
);

while($r = mysqli_fetch_assoc($q)) {
  $panja[] = $r['panja_id'];
}

// ================= PANSUS =================
$pansus = [];

$q = mysqli_query(
  $conn,
  "SELECT pansus_id FROM user_pansus WHERE user_id='$user_id'"
);

while($r = mysqli_fetch_assoc($q)) {
  $pansus[] = $r['pansus_id'];
}

// =====================================================
// CONVERT STRING
// =====================================================
$komisi_str = implode(",", !empty($komisi) ? $komisi : [0]);

$fraksi_str = implode(",", !empty($fraksi) ? $fraksi : [0]);

$akd_str = implode(",", !empty($akd) ? $akd : [0]);

$panja_str = implode(",", !empty($panja) ? $panja : [0]);

$pansus_str = implode(",", !empty($pansus) ? $pansus : [0]);
// =====================================================
// BUILD WHERE BERDASARKAN TYPE
// =====================================================
$where = [];

// =====================================
// ALL
// =====================================
if ($type == 'all') {

  $where[] =
  "(t.target_type='komisi'
  AND t.target_id IN ($komisi_str))";

  $where[] =
  "(t.target_type='fraksi'
  AND t.target_id IN ($fraksi_str))";

  $where[] =
  "(t.target_type='akd'
  AND t.target_id IN ($akd_str))";

  $where[] =
  "(t.target_type='panja'
  AND t.target_id IN ($panja_str))";

  $where[] =
  "(t.target_type='pansus'
  AND t.target_id IN ($pansus_str))";

  $where[] =
  "(a.tipe='paripurna')";
}

// =====================================
// KOMISI
// =====================================
else if ($type == 'komisi') {

  $where[] =
  "(t.target_type='komisi'
  AND t.target_id IN ($komisi_str))";
}

// =====================================
// FRAKSI
// =====================================
else if ($type == 'fraksi') {

  $where[] =
  "(t.target_type='fraksi'
  AND t.target_id IN ($fraksi_str))";
}

// =====================================
// AKD
// =====================================
else if ($type == 'akd') {

  $where[] =
  "(t.target_type='akd'
  AND t.target_id IN ($akd_str))";
}

// =====================================
// PANJA
// =====================================
else if ($type == 'panja') {

  $where[] =
  "(t.target_type='panja'
  AND t.target_id IN ($panja_str))";
}

// =====================================
// PANSUS
// =====================================
else if ($type == 'pansus') {

  $where[] =
  "(t.target_type='pansus'
  AND t.target_id IN ($pansus_str))";
}

// =====================================
// PARIPURNA
// =====================================
else if ($type == 'paripurna') {

  $where[] =
  "(a.tipe='paripurna')";
}

$where_sql = implode(" OR ", $where);

// =====================================================
// QUERY USER NORMAL
// =====================================================
$query = mysqli_query($conn, "

  SELECT DISTINCT

    a.*,

    t.target_type,

    n.notulensi_resmi,
    n.file_notulensi

  FROM agenda a

  JOIN agenda_target t
    ON a.id = t.agenda_id

  LEFT JOIN notulensi n
    ON a.id = n.agenda_id

  WHERE $where_sql

  ORDER BY a.tanggal ASC

");

// DEBUG MYSQL ERROR
if (!$query) {

  echo json_encode([
    "status" => false,
    "message" => mysqli_error($conn)
  ]);

  exit;
}

// =====================================================
// RESULT
// =====================================================
$data = [];

while($row = mysqli_fetch_assoc($query)) {

  $row['notulensi_resmi'] =
      $row['notulensi_resmi'] ?? null;

  $row['file_notulensi'] =
      $row['file_notulensi'] ?? null;

  $row['file_undangan'] =
      $row['file_undangan'] ?? null;

  $row['lokasi'] =
      $row['lokasi'] ?? "-";

  $data[] = $row;
}

// =====================================================
// RESPONSE
// =====================================================
echo json_encode([

  "status" => true,

  "role_id" => $role_id,

  "is_privileged" => false,

  "total" => count($data),

  "data" => $data

]);
?>
