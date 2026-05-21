-- Migración 31: importar usuarios legacy a users de madredeus_final
-- Las contraseñas están en MD5 uppercase desde el sistema C# legacy.
-- Las migraremos con el prefijo especial {md5} para que AuthController
-- pueda distinguirlas y verificarlas correctamente.

INSERT INTO madredeus_final.users (name, email, password_hash, role, is_active, is_blocked)
SELECT 
    CONCAT(u.Nombre, ' ', u.Apellido)                       AS name,
    LOWER(CONCAT(u.NombeUsuario, '@madredeus.com'))         AS email,
    CONCAT('{md5}', UPPER(u.Pass))                          AS password_hash,
    CASE WHEN u.IdPerfil = 2 OR u.IdPerfil = 4 THEN 'admin' ELSE 'user' END AS role,
    u.Activo                                                AS is_active,
    u.Bloqueado                                             AS is_blocked
FROM madredeus_legacy.Usuario u
WHERE LOWER(CONCAT(u.NombeUsuario, '@madredeus.com')) COLLATE utf8mb4_unicode_ci NOT IN (
    SELECT email COLLATE utf8mb4_unicode_ci FROM madredeus_final.users
);
