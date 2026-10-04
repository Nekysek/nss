<?php
declare(strict_types=1);
require_once __DIR__ . '/../library/common.php';

$_SESSION = [];
session_destroy();
respond(['status' => 'success']);
