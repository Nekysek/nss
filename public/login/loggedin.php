<?php
declare(strict_types=1);
require_once __DIR__ . '/../library/common.php';

$user = current_user($db, $tables);
if ($user === null) {
    session_destroy();
    respond(['loggedin' => false]);
}
respond(['loggedin' => true, 'user' => $user['user']]);
