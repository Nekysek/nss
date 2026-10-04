<?php
declare(strict_types=1);
require_once __DIR__ . '/common.php';

require_post();
$dirParam = input()['dir'] ?? '';
if (!is_string($dirParam) || $dirParam === '') {
    fail('no post dir');
}

$dir = resolve_path($dirParam);
if ($dir === null || !is_dir($dir)) {
    respond(['status' => 'redirect', 'href' => './?dir=files/']);
}

$relDir = ltrim(to_relative($dir), '/');          // např. "files" nebo "files/sub"
$relDir = rtrim($relDir, '/') . '/';

$entries = array_values(array_filter(scandir($dir) ?: [], fn($n) => $n !== '.' && $n !== '..' && $n[0] !== '.'));
if (count($entries) === 0) {
    fail('directory empty');
}

function format_size(int $bytes): string
{
    if ($bytes > 1000000000) return round($bytes / 1000000000) . ' GB';
    if ($bytes > 1000000)    return round($bytes / 1000000) . ' MB';
    if ($bytes > 1000)       return round($bytes / 1000) . ' KB';
    return $bytes . ' B';
}

$files = [];
$count = ['files' => 0, 'folders' => 0];

foreach ($entries as $name) {
    $path = $dir . DIRECTORY_SEPARATOR . $name;
    if (is_link($path)) {
        continue;                                  // symlinky neukazujeme
    }
    if (is_dir($path)) {
        $files[] = [
            'name'     => $name,
            'changed'  => date('j.m.Y - H:i', filemtime($path)),
            'type'     => 'dir',
            'size'     => '-',
            'location' => './?dir=' . $relDir . $name,
        ];
        $count['folders']++;
    } elseif (is_file($path)) {
        $parts = explode('.', $name);
        $files[] = [
            'name'     => $parts[0],
            'changed'  => date('j.m.Y - H:i', filemtime($path)),
            'type'     => count($parts) > 1 ? end($parts) : 'unknown',
            'size'     => format_size((int)filesize($path)),
            'location' => '/' . $relDir . $name,
        ];
        $count['files']++;
    }
}

respond([
    'status' => 'success',
    'files'  => json_encode($files),
    'count'  => json_encode($count),
]);
