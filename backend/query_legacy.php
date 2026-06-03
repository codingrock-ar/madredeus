<?php
$dsn = "mysql:host=db;dbname=madredeus_legacy;charset=utf8mb4";
$conn = new PDO($dsn, "root", "secret");
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $conn->query("SELECT ID, Degree FROM Courses WHERE Degree LIKE '%LAFERRERE ENFERMERIA%'");
$career = $stmt->fetch();
if ($career) {
    echo "Legacy Career found: ID " . $career['ID'] . " - " . $career['Degree'] . "\n";
    
    // Count subjects
    $stmt = $conn->prepare("
        SELECT COUNT(*) as c 
        FROM CoursesSubjects cs 
        JOIN Subjects s ON cs.SubjectId = s.ID 
        WHERE cs.CourseId = ? AND s.IsDeleted = 0
    ");
    $stmt->execute([$career['ID']]);
    print_r($stmt->fetchAll());
    
    // List subjects
    $stmt = $conn->prepare("
        SELECT s.Name 
        FROM CoursesSubjects cs 
        JOIN Subjects s ON cs.SubjectId = s.ID 
        WHERE cs.CourseId = ? AND s.IsDeleted = 0
    ");
    $stmt->execute([$career['ID']]);
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} else {
    echo "Legacy Career not found\n";
}
