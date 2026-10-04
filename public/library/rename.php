<?php
declare(strict_types=1);
require_once __DIR__ . '/common.php';

require_post();
$in   = input();
$file = $in['dir'] ?? '';
$new  = $in['content'] ?? '';

if (!is_string($file) || $file === '' || !is_string($new)) {
    fail('bad request');
}
// nový název: jen písmena, číslice, tečka, pomlčka, podtržítko, mezera; nesmí začínat tečkou
if (!preg_match('/^[\p{L}\p{N}_\- ][\p{L}\p{N}_.\- ]{0,99}$/u', $new)) {
    fail('invalid name');
}

require_edit_permission($db, $tables, $file);

$real = resolve_path($file);
if ($real === null || !is_file($real)) {
    fail('file doesnt exists', 404);
}

$target = dirname($real) . DIRECTORY_SEPARATOR . $new;
if (file_exists($target)) {
    fail('target exists', 409);
}
if (!rename($real, $target)) {
    fail('rename failed', 500);
}
respond(['status' => 'success', 'file' => to_relative($target)]);
