<?php
require __DIR__ . '/vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

$data = [
    ['19/5/2026', '19/5', '6777', 'mercado Pago', 't frances', '41695346', '', '', '', '3', 'lab', '150000', 'Abril', '56762', ''],
    ['20/5/2026', '19/5', '3268 / 9311', 'Galicia', 't ciudad', '96221045', '130000/1500', '', '', '4', 'Enf', '700000', 'Cuatrimestre 2025 comp', '56763', ''],
    ['20/5/2026', '19/5', '3ce1', 'Naranja', 't frances', '43324139', '', '', '', '1', 'Enf', '145000', 'Abril', '56764', ''],
    ['20/5/2026', '31/3', '1839', 'mercado Pago', 't frances', '48117435', '', '', '', '1', 'pod', '120000', 'Matricula', '56766', ''],
    ['20/5/2026', '19/5', '7930', 'mercado Pago', 't frances', '48117435', '', '', '', '1', 'por', '145000', 'Abril', '56767', ''],
    ['20/5/2026', '', '8321 / 1865', 'mercado Pago', 't frances', '94654725', '262000/3800', '', '', '3', 'lab', '300000', 'Matricula y Marzo', '56768', ''],
    ['26/5/2026', '21/5', '6255', 'mercado Pago', 't frances', '26644094', '', '', '', '-', 'ped', '130000', 'Abril Posgrado', '56770', ''],
    ['26/5/2026', '22/5', '6595', 'mercado Pago', 't ciudad', '94059756', '', '', '', '6', 'Enf', '155000', 'a cta Mayo', '56771', ''],
    ['26/5/2026', '10/5', '7429', 'mercado Pago', 't frances', '17632202', '', '', '', '1', 'pod', '130000', 'Mayo', '56772', ''],
    ['27/5/2026', '26/5', '2748', 'Nacion', 't frances', '17356541', '', '', '', '4', 'Enf', '74400', 'Mayo', '56778', ''],
    ['27/5/2026', '26/5', '5622', 'mercado Pago', 't ciudad', '47341316', '', '', '', '1', 'Enf', '132000', 'Mayo', '56780', 'La Ferrere'],
    ['27/5/2026', '26/5', 'e2a8', 'bnara', 't frances', '43324139', '', '', '', '1', 'Enf', '15000', 'Saldo Junio', '56785', '']
];

$row = 1;
foreach ($data as $rowData) {
    $col = 1;
    foreach ($rowData as $cellData) {
        $sheet->setCellValue([$col, $row], $cellData);
        $col++;
    }
    $row++;
}

$writer = new Xlsx($spreadsheet);
$writer->save(__DIR__ . '/pagos_prueba.xlsx');
echo "Archivo excel guardado en: " . __DIR__ . "/pagos_prueba.xlsx\n";
