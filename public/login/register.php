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
if (mb_strlen($user) < 3 || mb_strlen($user) > 30) {
    fail('user too long or too short');
}
if (mb_strlen($pass) < 8 || mb_strlen($pass) > 30) {
    fail('pass too long or too short');
}

$stmt = $db->prepare('SELECT 1 FROM ' . $tables['login'] . ' WHERE user = :user');
$stmt->execute([':user' => $user]);
if ($stmt->fetch()) {
    fail('user already exists', 409);
}

$authkey = bin2hex(random_bytes(32));
$insert  = $db->prepare(
    'INSERT INTO ' . $tables['login'] . ' (user, pass, perms, authkey) VALUES (:user, :pass, :perms, :authkey)'
);
$insert->execute([
    ':user'    => $user,
    ':pass'    => hash_password($pass),
    ':perms'   => '{}',                       // nový uživatel nemá žádná oprávnění k úpravám
    ':authkey' => $authkey,
]);

session_regenerate_id(true);
$_SESSION['login'] = ['authkey' => $authkey, 'time' => time()];
respond(['status' => 'success']);
