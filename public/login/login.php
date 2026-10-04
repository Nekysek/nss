<?php
declare(strict_types=1);
require_once __DIR__ . '/../library/common.php';

require_post();
$in   = input();
$user = $in['user'] ?? '';
$pass = $in['pass'] ?? '';
if (!is_string($user) || !is_string($pass) || $user === '' || $pass === '') {
    fail('no user or pass');
}

$stmt = $db->prepare('SELECT pass, authkey FROM ' . $tables['login'] . ' WHERE user = :user');
$stmt->execute([':user' => $user]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

// stejná odpověď pro neexistující uživatele i špatné heslo; fiktivní hash vyrovná dobu odpovědi
$hash = $row['pass'] ?? '$2y$12$OLi0KqmATAonarSv95Yyle7BM2s0pqPekoNZ/kVgz2gDHuBLMtAWG';
if (!verify_password($pass, $hash) || $row === false) {
    fail('wrong user or pass', 401);
}

session_regenerate_id(true);
$_SESSION['login'] = ['authkey' => $row['authkey'], 'time' => time()];
respond(['status' => 'success']);
