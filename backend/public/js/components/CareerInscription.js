export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <h5 class="fw-bold mb-4"><i class="ph ph-student me-2"></i>Inscripción a Carrera</h5>
            
            <form class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">Estudiante</label>
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Buscar por DNI o Apellido...">
                        <button class="btn btn-outline-secondary" type="button"><i class="ph ph-magnifying-glass"></i></button>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <label class="form-label">Carrera a Inscribir</label>
                    <select class="form-select">
                        <option selected disabled>Seleccionar carrera...</option>
                        <option>Enfermería Profesional (3 años)</option>
                        <option>Radiología (3 años)</option>
                        <option>Instrumentación Quirúrgica (3 años)</option>
                    </select>
                </div>

                <div class="col-md-4">
                    <label class="form-label">Cohorte / Año de Ingreso</label>
                    <input type="number" class="form-control" value="2024">
                </div>

                <div class="col-md-4">
                    <label class="form-label">Fecha de Inscripción</label>
                    <input type="date" class="form-control">
                </div>

                <div class="col-md-4">
                    <label class="form-label">Número de Legajo</label>
                    <input type="text" class="form-control" placeholder="Auto-generado si queda vacío">
                </div>

                <div class="col-12 mt-4">
                    <div class="alert alert-warning">
                        <i class="ph ph-warning-circle me-2"></i>
                        Asegúrese de que el estudiante haya presentado toda la documentación requerida antes de confirmar la inscripción.
                    </div>
                </div>

                <div class="col-12 text-end mt-4">
                    <button type="button" class="btn btn-light me-2" @click="$router.push('/students')">Cancelar</button>
                    <button type="submit" class="btn btn-primary px-4">Confirmar Inscripción</button>
                </div>
            </form>
        </div>
    </div>
    `
}
