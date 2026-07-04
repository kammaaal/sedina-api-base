<?php

header("Content-Type: application/json");

include "koneksi.php";

$data = [];

$query = mysqli_query($conn, "

SELECT 

agenda.id,
agenda.judul,
agenda.deskripsi,
agenda.lokasi,
agenda.tanggal,
agenda.waktu_mulai,
agenda.waktu_selesai,
agenda.tipe,

agenda_target.target_type,
agenda_target.target_id,

CASE

    WHEN agenda_target.target_type = 'komisi'
        THEN komisi.nama_komisi

    WHEN agenda_target.target_type = 'fraksi'
        THEN fraksi.nama_fraksi

    WHEN agenda_target.target_type = 'akd'
        THEN akd.nama_akd

    ELSE 'Umum'

END AS target_nama

FROM agenda

LEFT JOIN agenda_target
ON agenda.id = agenda_target.agenda_id

LEFT JOIN komisi
ON agenda_target.target_id = komisi.id
AND agenda_target.target_type = 'komisi'

LEFT JOIN fraksi
ON agenda_target.target_id = fraksi.id
AND agenda_target.target_type = 'fraksi'

LEFT JOIN akd
ON agenda_target.target_id = akd.id
AND agenda_target.target_type = 'akd'

ORDER BY agenda.tanggal DESC,
agenda.waktu_mulai DESC

");

while($row = mysqli_fetch_assoc($query)){

    $data[] = $row;
}

echo json_encode([
    "status" => true,
    "data" => $data
]);

?>