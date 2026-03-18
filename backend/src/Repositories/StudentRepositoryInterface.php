<?php

namespace App\Repositories;

/**
 * Interface StudentRepositoryInterface
 * 
 * Este patrón permite cambiar entre MySQL y SQL Server sin afectar
 * el código de los Controladores. Ambos repositorios deben implementar esta interfaz.
 */
interface StudentRepositoryInterface {
    public function getAll();
    public function getPaginated(array $params);
    public function searchSimple(string $term);
    public function getById($id);
    public function create(array $data);
    public function update($id, array $data);
    public function updateCommissionBulk(array $ids, string $commission);
    public function delete($id);
}
