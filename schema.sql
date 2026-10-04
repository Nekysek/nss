-- Tabulka pro přihlášení uživatelů.
CREATE TABLE nss_login (
  id      INT AUTO_INCREMENT PRIMARY KEY,
  user    VARCHAR(30)  NOT NULL UNIQUE,
  pass    VARCHAR(255) NOT NULL,          -- výstup password_hash()
  perms   TEXT         NOT NULL,          -- JSON, např. {"grant":"all"} nebo {"grant":{"/files/a.txt":true}}
  authkey CHAR(64)     NOT NULL UNIQUE    -- identifikátor relace
);

-- Oprávnění k úpravám se nastavuje ručně, např.:
-- UPDATE nss_login SET perms = '{"grant":"all"}' WHERE user = 'admin';
