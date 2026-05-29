<?php
header("Content-Type: application/json");
include "koneksi.php";

$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

if ($email == '' || $password == '') {

    echo json_encode([
        "status" => false,
        "message" => "Email & password wajib diisi"
    ]);

    exit;
}

$query = mysqli_query($conn, "

    SELECT 
        users.*,

        roles.nama_role,

        jabatan.nama_jabatan,

        fraksi.nama_fraksi,

        komisi.nama_komisi

    FROM users

    LEFT JOIN roles 
        ON users.role_id = roles.id

    LEFT JOIN jabatan 
        ON users.jabatan_id = jabatan.id

    LEFT JOIN fraksi 
        ON users.fraksi_id = fraksi.id

    LEFT JOIN komisi 
        ON users.komisi_id = komisi.id

    WHERE users.email = '$email'

    LIMIT 1
");

$user = mysqli_fetch_assoc($query);

if ($user) {

    if ($password == $user['password']) {

        // =====================================
        // AKD
        // =====================================
        $akd = [];

        $qAkd = mysqli_query($conn, "

            SELECT a.nama_akd

            FROM user_akd ua

            JOIN akd a 
                ON ua.akd_id = a.id

            WHERE ua.user_id = '".$user['id']."'
        ");

        while($r = mysqli_fetch_assoc($qAkd)) {

            $akd[] = $r['nama_akd'];
        }

        echo json_encode([

            "status" => true,

            "message" => "Login berhasil",

            "data" => [

                "id" => $user['id'],

                "nama" => $user['nama'],

                "email" => $user['email'],

                "foto" => $user['foto'],

                // ROLE
                "role" => $user['nama_role'] ?? "",

                "role_id" => $user['role_id'] ?? 0,

                // JABATAN
                "jabatan" => $user['nama_jabatan'] ?? "",

                "jabatan_id" => $user['jabatan_id'] ?? 0,

                // FRAKSI
                "fraksi" => $user['nama_fraksi'] ?? "",

                "fraksi_id" => $user['fraksi_id'] ?? 0,

                // KOMISI
                "komisi" => $user['nama_komisi'] ?? "",

                "komisi_id" => $user['komisi_id'] ?? 0,

                // AKD
                "akd" => $akd
            ]
        ]);

    } else {

        echo json_encode([

            "status" => false,

            "message" => "Password salah"
        ]);
    }

} else {

    echo json_encode([

        "status" => false,

        "message" => "User tidak ditemukan"
    ]);
}
?>