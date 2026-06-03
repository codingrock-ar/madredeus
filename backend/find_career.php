<?php
require 'src/Config/Environment.php';
require 'src/Config/Database.php';

$db = (new \App\Config\Database())->getConnection();

$stmt = $db->query("SELECT id, title FROM careers");
$results = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach($results as $r) {
    echo $r['id'] . ' - ' . $r['title'] . "\n";
}
