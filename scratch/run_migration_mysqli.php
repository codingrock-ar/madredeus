<?php
$host = 'db';
$user = 'root';
$pass = 'secret';
$db = 'madredeus_db';

$conn = new mysqli($host, $user, $pass, $db);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "ALTER TABLE payments ADD COLUMN IF NOT EXISTS last_notified DATETIME DEFAULT NULL";
if ($conn->query($sql) === TRUE) {
    echo "Column last_notified added to payments\n";
} else {
    echo "Error adding column to payments: " . $conn->error . "\n";
}

$sql = "ALTER TABLE students ADD COLUMN IF NOT EXISTS last_notified_docs DATETIME DEFAULT NULL";
if ($conn->query($sql) === TRUE) {
    echo "Column last_notified_docs added to students\n";
} else {
    echo "Error adding column to students: " . $conn->error . "\n";
}

$conn->close();
