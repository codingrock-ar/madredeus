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
    public function getById($id);
    public function create(array $data);
    public function update($id, array $data);
    public function delete($id);
}
