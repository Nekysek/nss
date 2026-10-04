<?php
declare(strict_types=1);
require_once __DIR__ . '/common.php';

require_post();
$in      = input();
$file    = $in['dir'] ?? '';
$content = $in['content'] ?? null;

if (!is_string($file) || $file === '') {
    fail('no file');
}
if (!is_string($content)) {
    fail('no content data');
}
if (strlen($content) > MAX_FILE_SIZE) {
    fail('file too large', 413);
}

require_edit_permission($db, $tables, $file);

$real = resolve_path($file);
if ($real === null || !is_file($real) || !is_writable($real)) {
    fail('file doesnt exists', 404);
}

if (file_put_contents($real, $content, LOCK_EX) === false) {
    fail('write failed', 500);
}
respond(['status' => 'success']);
