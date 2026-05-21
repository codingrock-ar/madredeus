-- Arreglar el mapeo de Requisitos (PersonsRequirements)
-- En la migración original, los RequirementType 0 (Título) y 1 (DNI) se cruzaron, 
-- y las observaciones de Título quedaron en DNI. 
-- Vamos a corregir todas las columnas de requisitos en la tabla students.

UPDATE madredeus_final.students s
JOIN (
    SELECT 
        PersonID,
        MAX(CASE WHEN RequirementType = 1 THEN Completed ELSE 0 END) as req_dni,
        MAX(CASE WHEN RequirementType = 0 THEN Completed ELSE 0 END) as req_degree,
        MAX(CASE WHEN RequirementType = 0 THEN NULLIF(TRIM(Comments), '') ELSE NULL END) as req_degree_obs,
        MAX(CASE WHEN RequirementType = 3 THEN Completed ELSE 0 END) as req_photos,
        MAX(CASE WHEN RequirementType = 4 THEN Completed ELSE 0 END) as req_psycho,
        MAX(CASE WHEN RequirementType = 4 THEN NULLIF(TRIM(Comments), '') ELSE NULL END) as req_psycho_obs,
        MAX(CASE WHEN RequirementType = 5 THEN Completed ELSE 0 END) as req_vaccines,
        MAX(CASE WHEN RequirementType = 5 THEN NULLIF(TRIM(Comments), '') ELSE NULL END) as req_vaccines_obs,
        MAX(CASE WHEN RequirementType = 6 THEN Completed ELSE 0 END) as req_book,
        MAX(CASE WHEN RequirementType = 7 THEN Completed ELSE 0 END) as req_final,
        MAX(CASE WHEN RequirementType = 7 THEN NULLIF(TRIM(Comments), '') ELSE NULL END) as req_final_obs
    FROM madredeus_legacy.PersonsRequirements
    GROUP BY PersonID
) req ON s.id = req.PersonID
SET 
    s.req_dni_photocopy        = COALESCE(req.req_dni, 0),
    s.req_degree_photocopy     = COALESCE(req.req_degree, 0),
    s.req_degree_photocopy_obs = req.req_degree_obs,
    s.req_two_photos           = COALESCE(req.req_photos, 0),
    s.req_psychophysical       = COALESCE(req.req_psycho, 0),
    s.req_psychophysical_obs   = req.req_psycho_obs,
    s.req_vaccines             = COALESCE(req.req_vaccines, 0),
    s.req_vaccines_obs         = req.req_vaccines_obs,
    s.req_student_book         = COALESCE(req.req_book, 0),
    s.req_final_degree         = COALESCE(req.req_final, 0),
    s.req_final_degree_obs     = req.req_final_obs;
