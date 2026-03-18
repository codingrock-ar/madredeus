export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="fw-bold mb-0"><i class="ph ph-list-numbers me-2"></i>Listado Sinigep</h5>
                <button class="btn btn-sm btn-outline-primary"><i class="ph ph-download-simple me-2"></i>Exportar Excel</button>
            </div>
            
            <div class="row g-3 mb-4">
                <div class="col-md-3">
                    <label class="form-label">Periodo</label>
                    <select class="form-select">
                        <option>2024 - 1</option>
                        <option>2023 - 2</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label">Carrera</label>
                    <select class="form-select">
                        <option>Todas</option>
                        <option>Enfermería Profesional</option>
                        <option>Radiología</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">Filtrar</label>
                    <input type="text" class="form-control" placeholder="DNI, Nombre...">
                </div>
                <div class="col-md-2 d-flex align-items-end">
                    <button class="btn btn-primary w-100">Filtrar</button>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-sm table-hover border">
                    <thead class="bg-light">
                        <tr>
                            <th>DNI</th>
                            <th>Apellido y Nombre</th>
                            <th>Carrera</th>
                            <th>Año</th>
                            <th>Condición</th>
                            <th>Estado Sinigep</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>35.123.456</td>
                            <td>PEREZ, Juan</td>
                            <td>Enfermería</td>
                            <td>1ro</td>
                            <td>Regular</td>
                            <td><span class="badge bg-info">Informado</span></td>
                        </tr>
                        <tr>
                            <td>36.789.012</td>
                            <td>GARCIA, Maria</td>
                            <td>Radiología</td>
                            <td>2do</td>
                            <td>Regular</td>
                            <td><span class="badge bg-warning text-dark">Pendiente</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `
}
