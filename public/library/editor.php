<?php
declare(strict_types=1);
require_once __DIR__ . '/common.php';

require_post();
$file = input()['file'] ?? '';
if (!is_string($file) || $file === '') {
    fail('no post file');
}

require_edit_permission($db, $tables, $file);

$real = resolve_path($file);
if ($real === null || !is_file($real)) {
    respond(['status' => 'redirect', 'redirect' => './']);
}

respond(['status' => 'success', 'content' => file_get_contents($real)]);
