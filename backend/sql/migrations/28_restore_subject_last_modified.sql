-- 1. Restaurar fechas de materias principales por coincidencia de ID
UPDATE madredeus_final.subjects s
JOIN madredeus_legacy.Subjects ls ON s.id = ls.ID
SET s.last_modified = COALESCE(ls.LastModificationDate, s.last_modified);

-- 2. Restaurar fechas de materias secundarias/clonadas por coincidencia de nombre
UPDATE madredeus_final.subjects s
JOIN madredeus_legacy.Subjects ls ON s.name = CONVERT(TRIM(ls.Name) USING utf8mb4) COLLATE utf8mb4_0900_ai_ci
SET s.last_modified = COALESCE(ls.LastModificationDate, s.last_modified)
WHERE s.id > 176;
