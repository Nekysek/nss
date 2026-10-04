#!/usr/bin/env bash
# Smoke test PHP backendu: registrace, přihlášení, oprávnění, ochrana proti "../".
# Používá dočasnou kopii aplikace s SQLite databází, MySQL není potřeba.
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'kill $PID 2>/dev/null; rm -rf "$TMP"' EXIT
cp -r "$ROOT/public" "$TMP/public"
cat > "$TMP/public/login/library/database.php" <<PHP
<?php
define("PEPPER", "test-pepper-test-pepper-test-pepper-1234");
global \$tables; \$tables = ["login" => "nss_login"];
global \$db; \$db = new PDO("sqlite:$TMP/test.db");
\$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
\$db->exec("CREATE TABLE IF NOT EXISTS nss_login (id INTEGER PRIMARY KEY, user TEXT UNIQUE, pass TEXT, perms TEXT, authkey TEXT UNIQUE)");
PHP
mkdir -p "$TMP/public/files"; echo hello > "$TMP/public/files/a.txt"; echo SECRET > "$TMP/secret.txt"
PORT=8099
php -S 127.0.0.1:$PORT -t "$TMP/public" >/dev/null 2>&1 & PID=$!
sleep 1

URL=http://127.0.0.1:$PORT; JAR="$TMP/jar"; FAIL=0
post() { curl -s -b "$JAR" -c "$JAR" -H 'Content-Type: application/json' -X POST -d "$2" "$URL$1"; }
check() { if echo "$2" | grep -q "$3"; then echo "ok   $1"; else echo "FAIL $1: $2"; FAIL=1; fi; }

check "registrace"                "$(post /login/register.php '{"user":"tester","pass":"password123"}')" '"success"'
check "wildcard v loginu"         "$(post /login/login.php '{"user":"%","pass":"x"}')" 'wrong user or pass'
check "špatné heslo"              "$(post /login/login.php '{"user":"tester","pass":"nope12345"}')" 'wrong user or pass'
check "přihlášení"                "$(post /login/login.php '{"user":"tester","pass":"password123"}')" '"success"'
check "bez oprávnění nelze číst"  "$(post /library/editor.php '{"file":"/files/a.txt"}')" 'no permission'
php -r "\$d=new PDO('sqlite:$TMP/test.db');\$d->exec('update nss_login set perms=\'{\"grant\":\"all\"}\'');"
check "s oprávněním lze číst"     "$(post /library/editor.php '{"file":"/files/a.txt"}')" 'hello'
check "../ při čtení"             "$(post /library/editor.php '{"file":"/files/../../secret.txt"}')" 'redirect'
check "database.php nejde číst"   "$(post /library/editor.php '{"file":"/login/library/database.php"}')" 'redirect'
check "uložení"                   "$(post /library/save.php '{"dir":"/files/a.txt","content":"changed"}')" '"success"'
check "../ při ukládání"          "$(post /library/save.php '{"dir":"/files/../../secret.txt","content":"pwn"}')" 'error'
[ "$(cat "$TMP/secret.txt")" = "SECRET" ] && echo "ok   secret.txt nezměněn" || { echo "FAIL secret.txt změněn"; FAIL=1; }
check "přejmenování"              "$(post /library/rename.php '{"dir":"/files/a.txt","content":"c.txt"}')" '"success"'
check "neplatný nový název"       "$(post /library/rename.php '{"dir":"/files/c.txt","content":"../x.txt"}')" 'invalid name'
check "výpis adresáře"            "$(post /library/files.php '{"dir":"files/"}')" 'c'
check "../ při výpisu"            "$(post /library/files.php '{"dir":"files/../login"}')" 'redirect'
exit $FAIL
