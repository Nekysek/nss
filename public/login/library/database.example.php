<?php
    // Zkopíruj tento soubor jako database.php a doplň vlastní údaje.
    // database.php je v .gitignore a nesmí se commitovat.
    define('DB_NAME', 'nss');
    define('DB_USER', 'nss');
    define('DB_PASSWORD', 'CHANGE_ME');
    define('DB_HOST', '127.0.0.1');

    // Tajný "pepper" pro hashování hesel. Nesmí být v databázi ani v gitu.
    // Vygeneruj ho příkazem: php -r "echo bin2hex(random_bytes(32));"
    // Pozor: po jeho ztrátě nebo změně se nikdo nepřihlásí (hesla by bylo nutné resetovat).
    define('PEPPER', 'CHANGE_ME_random_string_of_at_least_32_characters');

    global $tables;
    $tables = [
        "login" => "nss_login"
    ];

    global $db;
    $db = new PDO(
        "mysql:host=" .DB_HOST. ";dbname=" .DB_NAME,DB_USER,DB_PASSWORD,
        array(
            PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8',
        )
    );
?>
