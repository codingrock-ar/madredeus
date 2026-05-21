-- ====================================================================
-- MIGRACIÓN 29: RESTAURAR TABLAS DE BITÁCORA Y OPERADORES HISTÓRICOS
-- BASE DE DATOS: madredeus_final
-- ====================================================================

-- 1. Crear tabla de EventosBitacora si no existe
CREATE TABLE IF NOT EXISTS `EventosBitacora` (
  `IdEventoBitacora` INT NOT NULL PRIMARY KEY,
  `Descripcion` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Crear tabla de Usuario histórico si no existe
CREATE TABLE IF NOT EXISTS `Usuario` (
  `IdUsuario` INT NOT NULL PRIMARY KEY,
  `Nombre` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Apellido` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `NombeUsuario` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Activo` TINYINT DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Crear tabla de Bitacoras si no existe con índices optimizados para alta paginación y búsqueda
CREATE TABLE IF NOT EXISTS `Bitacoras` (
  `IdBitacora` INT NOT NULL PRIMARY KEY,
  `Descripcion` VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Fecha` DATETIME DEFAULT NULL,
  `IdUsuario` INT DEFAULT NULL,
  `IdTipoEvento` INT DEFAULT NULL,
  INDEX `idx_fecha` (`Fecha`),
  INDEX `idx_usuario` (`IdUsuario`),
  INDEX `idx_tipo_evento` (`IdTipoEvento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Importar datos desde madredeus_legacy de forma segura y eficiente
INSERT INTO `EventosBitacora` (`IdEventoBitacora`, `Descripcion`)
SELECT `IdEventoBitacora`, `Descripcion` 
FROM madredeus_legacy.`EventosBitacora`
ON DUPLICATE KEY UPDATE `Descripcion` = VALUES(`Descripcion`);

INSERT INTO `Usuario` (`IdUsuario`, `Nombre`, `Apellido`, `NombeUsuario`, `Activo`)
SELECT `IdUsuario`, `Nombre`, `Apellido`, `NombeUsuario`, `Activo` 
FROM madredeus_legacy.`Usuario`
ON DUPLICATE KEY UPDATE 
  `Nombre` = VALUES(`Nombre`),
  `Apellido` = VALUES(`Apellido`),
  `NombeUsuario` = VALUES(`NombeUsuario`),
  `Activo` = VALUES(`Activo`);

INSERT IGNORE INTO `Bitacoras` (`IdBitacora`, `Descripcion`, `Fecha`, `IdUsuario`, `IdTipoEvento`)
SELECT `IdBitacora`, `Descripcion`, `Fecha`, `IdUsuario`, `IdTipoEvento` 
FROM madredeus_legacy.`Bitacoras`;
