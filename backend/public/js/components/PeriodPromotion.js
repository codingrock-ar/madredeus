export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <h5 class="fw-bold mb-4"><i class="ph ph-fast-forward me-2"></i>Promocionar Periodo / Ciclo Lectivo</h5>
            
            <div class="alert alert-info border-start border-4 border-info">
                <h6 class="fw-bold"><i class="ph ph-info me-2"></i>Proceso de Promoción Masiva</h6>
                <p class="small mb-0">Esta herramienta permite avanzar a los estudiantes de un periodo a otro o de un año a otro de forma masiva. Se recomienda realizar una copia de seguridad de la base de datos antes de proceder.</p>
            </div>

            <div class="row g-4 mt-2">
                <div class="col-md-6 border-end">
                    <h6 class="fw-bold text-muted mb-3">ORIGEN (Actual)</h6>
                    <div class="mb-3">
                        <label class="form-label">Ciclo Lectivo</label>
                        <select class="form-select">
                            <option>2023</option>
                            <option selected>2024</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Periodo</label>
                        <select class="form-select">
                            <option>1</option>
                            <option selected>2</option>
                        </select>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <h6 class="fw-bold text-primary mb-3">DESTINO (Nuevo)</h6>
                    <div class="mb-3">
                        <label class="form-label">Ciclo Lectivo</label>
                        <select class="form-select">
                            <option selected>2024</option>
                            <option>2025</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Periodo</label>
                        <select class="form-select">
                            <option selected>3</option>
                            <option>1 (Siguiente Año)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="mt-4 p-3 bg-light rounded shadow-sm">
                <div class="form-check mb-3">
                    <input class="form-check-input" type="checkbox" id="checkCondicion" checked>
                    <label class="form-check-label" for="checkCondicion">
                        Solo promocionar alumnos con condición <strong>Regular</strong>.
                    </label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="checkFinales">
                    <label class="form-check-label" for="checkFinales">
                        Verificar que no posean deudas administrativas.
                    </label>
                </div>
            </div>

            <div class="mt-4 text-center">
                <button class="btn btn-primary px-5 py-2 fw-bold">
                    <i class="ph ph-rocket-launch me-2"></i>Iniciar Proceso de Promoción
                </button>
            </div>
        </div>
    </div>
    `
}
