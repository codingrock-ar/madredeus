<?php

require __DIR__ . '/../../vendor/autoload.php';

use App\Config\Environment;
use App\Config\Database;

// Initial setup (only if not included from run_seeds.php)
if (!isset($db)) {
    $config = Environment::get();
    if ($config['APP_ENV'] !== 'development') {
        echo "Aborting: El entorno no es 'development'.\n";
        exit(1);
    }

    try {
        $db = (new Database())->getConnection();
        if (!$db) {
            die("Error: No se pudo conectar a la base de datos.\n");
        }
    } catch (PDOException $e) {
        echo "Error de conexión: " . $e->getMessage() . "\n";
        exit(1);
    }
}

try {

    echo "Iniciando generación de datos de prueba extendidos...\n";

    // 1. Crear 10 Ciclos Lectivos
    echo "Generando Ciclos Lectivos...\n";
    $academic_cycles = [];
    for ($i = 2020; $i <= 2029; $i++) {
        $name = (string)$i;
        $status = ($i == 2024) ? 'active' : 'inactive';
        $stmt = $db->prepare("INSERT IGNORE INTO academic_cycles (name, status) VALUES (?, ?)");
        $stmt->execute([$name, $status]);
        $academic_cycles[] = $name;
    }

    // 2. Crear 10 Tipos de Beca
    echo "Generando Tipos de Beca...\n";
    $scholarship_names = [
        'Sin Beca', 'Beca 10%', 'Beca 25%', 'Beca 50%', 'Beca 75%', 
        'Beca Familiar', 'Beca Mérito', 'Beca Estímulo', 'Beca Convenio', 'Beca 100%'
    ];
    foreach ($scholarship_names as $name) {
        $stmt = $db->prepare("INSERT IGNORE INTO scholarship_types (name) VALUES (?)");
        $stmt->execute([$name]);
    }

    // Obtener IDs de Becas
    $scholarship_ids = $db->query("SELECT id FROM scholarship_types")->fetchAll(PDO::FETCH_COLUMN);

    // 3. Obtener IDs de Carreras
    $careers = $db->query("SELECT title FROM careers LIMIT 10")->fetchAll(PDO::FETCH_COLUMN);
    $commissions = ['A', 'B', 'C', 'D', 'E'];
    $shifts = ['TM', 'TT', 'TN'];

    // 4. Crear 100 Alumnos
    echo "Generando 100 Alumnos...\n";
    $names = ['Juan', 'Maria', 'Pedro', 'Ana', 'Carlos', 'Laura', 'Luis', 'Sofia', 'Miguel', 'Lucia', 'Jose', 'Elena', 'Ricardo', 'Valentina', 'Diego', 'Martina', 'Fernando', 'Camila', 'Gabriel', 'Victoria'];
    $lastnames = ['Perez', 'Gomez', 'Rodriguez', 'Lopez', 'Garcia', 'Martinez', 'Hernandez', 'Diaz', 'Torres', 'Ramirez', 'Alvarez', 'Flores', 'Benitez', 'Ruiz', 'Silva', 'Medina', 'Vera', 'Castro', 'Suarez', 'Blanco'];

    $student_ids = [];
    for ($i = 0; $i < 100; $i++) {
        $dni = (string)rand(30000000, 50000000);
        $name = $names[array_rand($names)];
        $lastname = $lastnames[array_rand($lastnames)];
        $email = strtolower($name . "." . $lastname . $i . "@example.com");
        $career = $careers[array_rand($careers)];
        
        // Distribución en comisiones: Asegurar que A-E tengan al menos 10 cada una, el resto aleatorio
        if ($i < 50) {
            $commission = $commissions[$i % 5];
        } else {
            $commission = $commissions[array_rand($commissions)];
        }
        
        $shift = $shifts[array_rand($shifts)];
        $cycle = $academic_cycles[array_rand($academic_cycles)];
        $scholarship_id = $scholarship_ids[array_rand($scholarship_ids)];
        
        $stmt = $db->prepare("INSERT INTO students (dni, name, lastname, email, career, commission, shift, academic_cycle, scholarship_id, academic_year, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'En Curso')");
        $stmt->execute([$dni, $name, $lastname, $email, $career, $commission, $shift, $cycle, $scholarship_id, '2024']);
        $student_ids[] = $db->lastInsertId();
    }

    // 5. Crear 50 Pagos
    echo "Generando 50 Pagos...\n";
    $concepts = ['Matrícula 2024', 'Cuota 1', 'Cuota 2', 'Cuota 3', 'Cuota 4', 'Derecho de Examen'];
    $methods = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'];
    
    // Asegurar que algunos alumnos tengan múltiples pagos
    for ($i = 0; $i < 50; $i++) {
        // Para los primeros 10 pagos, usar solo 3 alumnos (múltiples pagos por alumno)
        if ($i < 10) {
            $student_id = $student_ids[$i % 3];
        } else {
            $student_id = $student_ids[array_rand($student_ids)];
        }
        
        $amount = (float)rand(2000, 15000);
        $concept = $concepts[array_rand($concepts)];
        $method = $methods[array_rand($methods)];
        
        $stmt = $db->prepare("INSERT INTO payments (student_id, amount, concept, payment_method) VALUES (?, ?, ?, ?)");
        $stmt->execute([$student_id, $amount, $concept, $method]);
    }

    echo "¡Exito! Datos de prueba generados correctamente.\n";

} catch (PDOException $e) {
    echo "Error ejecutando el generador: " . $e->getMessage() . "\n";
    exit(1);
}
