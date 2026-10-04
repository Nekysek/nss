<?php
declare(strict_types=1);

// Společný bootstrap pro všechny endpointy: JSON odpověď, bezpečné cookies, přístup k DB a pomocné funkce.

require_once __DIR__ . '/../login/library/database.php';

header('Content-Type: application/json; charset=utf-8');

const SESSION_LIFETIME = 3600;      // platnost přihlášení v sekundách
const MAX_FILE_SIZE    = 2000000;   // maximální velikost ukládaného souboru (B)

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => !empty($_SERVER['HTTPS']),
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

function respond(array $data, int $code = 200): never
{
    http_response_code($code);
    echo json_encode($data);
    exit;
}

function fail(string $error, int $code = 400): never
{
    respond(['status' => 'error', 'error' => $error], $code);
}

/** Načte JSON tělo požadavku (nebo klasický POST). */
function input(): array
{
    if (!empty($_POST)) {
        return $_POST;
    }
    $data = json_decode(file_get_contents('php://input') ?: '', true);
    return is_array($data) ? $data : [];
}

function require_post(): void
{
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        fail('method not allowed', 405);
    }
}

/** Vrátí přihlášeného uživatele (user, perms) nebo null. */
function current_user(PDO $db, array $tables): ?array
{
    $login = $_SESSION['login'] ?? null;
    if (!is_array($login) || empty($login['authkey']) || empty($login['time'])) {
        return null;
    }
    if (time() - (int)$login['time'] > SESSION_LIFETIME) {
        return null;
    }

    $stmt = $db->prepare('SELECT user, perms FROM ' . $tables['login'] . ' WHERE authkey = :authkey');
    $stmt->execute([':authkey' => $login['authkey']]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    return $row ?: null;
}

/** Tajný pepper z database.php (nebo proměnné prostředí NSS_PEPPER). Není uložený v databázi. */
function pepper(): string
{
    $pepper = defined('PEPPER') ? PEPPER : (getenv('NSS_PEPPER') ?: '');
    if (strlen($pepper) < 32) {
        fail('pepper not configured', 500);
    }
    return $pepper;
}

/** Heslo se nejdřív zpracuje HMAC s pepperem (výstup má pevnou délku 64 znaků, takže bcrypt nic neořízne) a pak hashuje. */
function hash_password(string $password): string
{
    return password_hash(hash_hmac('sha256', $password, pepper()), PASSWORD_DEFAULT);
}

function verify_password(string $password, string $hash): bool
{
    return password_verify(hash_hmac('sha256', $password, pepper()), $hash);
}

/** Kořenový adresář veřejně dostupných souborů (public/files). */
function files_root(): string
{
    return realpath(__DIR__ . '/../files') ?: fail('files root missing', 500);
}

/**
 * Převede cestu z požadavku (např. "/files/a.txt" nebo "files/") na skutečnou cestu na disku.
 * Vrací null, pokud cesta neexistuje nebo vede mimo kořen souborů (ochrana proti "../" a symlinkům).
 */
function resolve_path(string $relative): ?string
{
    if (str_contains($relative, "\0")) {
        return null;
    }
    $public = realpath(__DIR__ . '/..');
    $real   = realpath($public . '/' . ltrim($relative, '/'));
    if ($real === false) {
        return null;
    }
    $root = files_root();
    if ($real === $root || str_starts_with($real, $root . DIRECTORY_SEPARATOR)) {
        return $real;
    }
    return null;
}

/** Cesta na disku -> cesta relativní k public/ (např. "/files/a.txt"). */
function to_relative(string $real): string
{
    return substr($real, strlen(realpath(__DIR__ . '/..')));
}

/** Ověří, že je uživatel přihlášen a smí upravovat daný soubor. Vrací uživatele. */
function require_edit_permission(PDO $db, array $tables, string $file): array
{
    $user = current_user($db, $tables);
    if ($user === null) {
        fail('notlogged', 401);
    }

    $perms = json_decode((string)$user['perms'], true);
    if (!is_array($perms)) {
        fail('error reading permissions', 403);
    }

    $grant   = $perms['grant'] ?? null;
    $file    = '/' . ltrim($file, '/');
    $granted = $grant === 'all' || (is_array($grant) && !empty($grant[$file]));
    if (!$granted) {
        fail('no permission', 403);
    }
    return $user;
}
