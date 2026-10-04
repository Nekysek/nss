# Nekysek Sort System (NSS)

Webový správce souborů s přihlášením a jednoduchým editorem textových souborů. Je to třetí verze tohoto nápadu,
vznikl jako osobní projekt ve volném čase (2024). Backend jsem později zrevidoval a zabezpečil (viz níže).

## Co umí

- registrace a přihlášení uživatelů (PHP + MySQL, relace s expirací 1 hodina)
- procházení adresářů se souborovým prohlížečem (React, kontextové menu, ikony podle typu souboru)
- editor textových souborů: číslování řádků, varování před odchodem s neuloženými změnami, ukládání, přejmenování
- oprávnění k úpravám uložená u uživatele jako JSON (`{"grant":"all"}` nebo seznam povolených souborů)

## Technologie

React 18 · Vite · React Router · Tailwind CSS · GSAP · PHP 8 (PDO) · MySQL · GitHub Actions

## Spuštění

1. Frontend: `npm install`, pak `npm run dev` (vývoj) nebo `npm run build` a obsah `dist/` nasadit na web server s PHP.
2. Databáze: vytvoř databázi a tabulku podle [`schema.sql`](schema.sql).
3. Konfigurace: zkopíruj `public/login/library/database.example.php` jako `database.php` a doplň přístupové údaje
   a `PEPPER` (vygeneruj ho příkazem `php -r "echo bin2hex(random_bytes(32));"`). Soubor `database.php` je v `.gitignore`.
4. Soubory ke sdílení patří do `public/files/`. Oprávnění k úpravám se přidělí ručně v databázi, například
   `UPDATE nss_login SET perms = '{"grant":"all"}' WHERE user = 'admin';`

Web server musí odkazovat nepřímé cesty (`/editor`) na `index.html` (SPA) a cesty `*.php` předávat PHP.

## Zabezpečení

Co backend řeší:

- hesla se ukládají přes `password_hash()` (bcrypt, náhodná sůl v hashi) a ověřují přes `password_verify()`
- před hashováním se heslo zpracuje přes HMAC s tajným **pepperem**, který není v databázi; útočník, který získá jen
  databázi, tedy nemůže hesla louskat (pepper nesmí být ztracen, jinak by se nikdo nepřihlásil)
- všechny SQL dotazy používají připravené dotazy, přihlášení porovnává přesnou shodu (ne `LIKE`)
- veškerý přístup k souborům prochází funkcí `resolve_path()`, která pomocí `realpath()` zajistí, že cesta zůstane uvnitř
  `public/files/` (ochrana proti `../` a symlinkům)
- zápis a přejmenování vyžadují přihlášení a oprávnění; velikost ukládaného souboru je omezená
- session cookie má příznaky `HttpOnly` a `SameSite=Strict`, po přihlášení se obnovuje ID relace
- frontend neskládá HTML z názvů souborů bez escapování (ochrana proti XSS)

Co zůstává otevřené: omezení počtu pokusů o přihlášení, CSRF tokeny nad rámec `SameSite`, a registrace je veřejná
(nový uživatel nemá žádná oprávnění k úpravám, dokud mu je správce nepřidělí).

## Testy

`bash tests/smoke_test.sh` spustí vestavěný PHP server nad dočasnou SQLite databází a ověří registraci, přihlášení,
oprávnění a to, že `../` nevede mimo `public/files/`. Stejný test běží v GitHub Actions spolu s ESLintem, buildem
frontendu a kontrolou syntaxe PHP.

## Licence

Všechna práva vyhrazena. Zdrojový kód je zveřejněn pouze k nahlédnutí, viz [LICENSE](LICENSE).
