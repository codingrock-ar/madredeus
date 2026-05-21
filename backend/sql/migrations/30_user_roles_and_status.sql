-- Migración 30: Agregar role y estado a la tabla users
ALTER TABLE users
    ADD COLUMN role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
    ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1,
    ADD COLUMN is_blocked TINYINT(1) NOT NULL DEFAULT 0;

-- Promover el primer usuario registrado a admin automáticamente
UPDATE users SET role = 'admin' WHERE id = (SELECT id FROM (SELECT MIN(id) as id FROM users) t);
