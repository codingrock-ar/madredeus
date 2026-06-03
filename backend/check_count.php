<?php
require 'src/Config/Environment.php';
require 'src/Config/Database.php';

$db = (new \App\Config\Database())->getConnection();

$stmt = $db->prepare('SELECT COUNT(*) FROM subjects WHERE career_id=2');
$stmt->execute();
print_r($stmt->fetchAll());
