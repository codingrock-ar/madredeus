export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="fw-bold mb-0">
                    <i class="ph ph-users-three me-2 text-primary"></i>Actualizar Comisión de Estudiantes
                </h5>
                <div class="stepper d-flex gap-2">
                    <span class="badge rounded-pill" :class="step === 1 ? 'bg-primary' : 'bg-light text-muted border'">1. Filtrar</span>
                    <span class="badge rounded-pill" :class="step === 2 ? 'bg-primary' : 'bg-light text-muted border'">2. Actualizar</span>
                </div>
            </div>

            <!-- PASO 1: FILTROS -->
            <div v-if="step === 1" class="fade-in">
                <div class="row g-3 p-3 bg-light rounded-3 mb-4">
                    <div class="col-md-3">
                        <label class="form-label small fw-bold">Año Lectivo</label>
                        <select class="form-select border-0 shadow-sm" v-model="filters.year">
                            <option v-for="y in availableYears" :key="y" :value="y">{{ y }}</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label small fw-bold">Ciclo / Cuatrimestre</label>
                        <select class="form-select border-0 shadow-sm" v-model="filters.cycle">
                            <option v-for="c in cycles" :key="c.id" :value="c.name">{{ c.name }}</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small fw-bold">Carrera</label>
                        <select class="form-select border-0 shadow-sm" v-model="filters.career">
                            <option v-for="c in careers" :key="c.id" :value="c.title">{{ c.title }}</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label small fw-bold">Comisión</label>
                        <select class="form-select border-0 shadow-sm" v-model="filters.commission">
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                </div>
                
                <div class="text-end">
                    <button class="btn btn-primary px-4 shadow-sm" @click="goToStep2">
                        Siguiente <i class="ph ph-caret-right ms-1"></i>
                    </button>
                </div>
            </div>

            <!-- PASO 2: SELECCIÓN Y ACTUALIZACIÓN -->
            <div v-if="step === 2" class="fade-in">
                <div class="alert alert-info border-0 shadow-sm d-flex align-items-center py-2 mb-4">
                    <i class="ph ph-info me-2 fs-5"></i>
                    <span class="small">Seleccione los alumnos que desea mover a una nueva comisión.</span>
                </div>

                <div class="table-responsive mb-4">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 40px;">
                                    <input type="checkbox" class="form-check-input" v-model="selectAll" @change="toggleSelectAll">
                                </th>
                                <th>Estudiante</th>
                                <th>DNI</th>
                                <th>Condición</th>
                                <th>Comisión Actual</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="loading">
                                <td colspan="5" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary"></div></td>
                            </tr>
                            <tr v-else-if="students.length === 0">
                                <td colspan="5" class="text-center py-4 text-muted small">No se encontraron estudiantes con los filtros aplicados.</td>
                            </tr>
                            <tr v-else v-for="s in students" :key="s.id">
                                <td><input type="checkbox" class="form-check-input" :value="s.id" v-model="selectedIds"></td>
                                <td class="fw-bold small text-uppercase">{{ s.lastname }}, {{ s.name }}</td>
                                <td class="small">{{ s.dni }}</td>
                                <td><span class="badge border text-success">Regular</span></td>
                                <td class="text-center fw-bold">{{ s.commission || '-' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="row align-items-center g-3 mt-4 pt-3 border-top">
                    <div class="col-md-6">
                        <button class="btn btn-link text-muted p-0" @click="step = 1">
                            <i class="ph ph-caret-left me-1"></i> Volver a filtros
                        </button>
                    </div>
                    <div class="col-md-4">
                        <div class="input-group input-group-sm">
                            <span class="input-group-text bg-white border-end-0 text-muted">Destino: Comisión</span>
                            <select class="form-select border-start-0" v-model="destinationCommission">
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                                <option value="D">D</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-success btn-sm w-100 shadow-sm" 
                                :disabled="selectedIds.length === 0 || !destinationCommission || updating"
                                @click="updateCommissions">
                            <span v-if="updating" class="spinner-border spinner-border-sm me-1"></span>
                            Actualizar ({{ selectedIds.length }})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            step: 1,
            loading: false,
            updating: false,
            careers: [],
            cycles: [],
            students: [],
            selectedIds: [],
            selectAll: false,
            destinationCommission: 'B',
            filters: {
                year: new Date().getFullYear(),
                cycle: '',
                career: '',
                commission: 'A'
            }
        }
    },
    computed: {
        availableYears() {
            const currentYear = new Date().getFullYear();
            return [currentYear, currentYear - 1, currentYear + 1];
        }
    },
    async mounted() {
        await Promise.all([
            this.fetchCareers(),
            this.fetchCycles()
        ]);
        if (this.careers.length > 0) this.filters.career = this.careers[0].title;
        if (this.cycles.length > 0) this.filters.cycle = this.cycles[0].name;
    },
    methods: {
        async fetchCareers() {
            try {
                const response = await fetch(window.API_BASE + '/api/careers');
                const result = await response.json();
                if (result.status === 'success') {
                    this.careers = result.data;
                }
            } catch (error) {
                console.error("Error fetching careers:", error);
            }
        },
        async fetchCycles() {
            try {
                const response = await fetch(window.API_BASE + '/api/config/cycles');
                const result = await response.json();
                if (result.status === 'success') {
                    this.cycles = result.data.map(c => ({ id: c.id, name: c.name }));
                }
            } catch (error) {
                console.error("Error fetching cycles:", error);
            }
        },
        async goToStep2() {
            this.step = 2;
            this.loading = true;
            this.selectedIds = [];
            this.selectAll = false;
            try {
                // Fetch students matching the current filters (Cycle + Career + Commission)
                const query = new URLSearchParams({
                    career: this.filters.career,
                    commission: this.filters.commission,
                    academic_cycle: this.filters.cycle,
                    per_page: 100 // Load more for bulk processing
                }).toString();
                
                const response = await fetch(window.API_BASE + '/api/students?' + query);
                const result = await response.json();
                if (result.status === 'success') {
                    this.students = result.data;
                }
            } catch (error) {
                console.error("Error fetching students for commissioning:", error);
            } finally {
                this.loading = false;
            }
        },
        toggleSelectAll() {
            if (this.selectAll) {
                this.selectedIds = this.students.map(s => s.id);
            } else {
                this.selectedIds = [];
            }
        },
        async updateCommissions() {
            if (!confirm(`¿Confirma actualizar la comisión de ${this.selectedIds.length} alumnos a "${this.destinationCommission}"?`)) return;
            
            this.updating = true;
            try {
                const response = await fetch(window.API_BASE + '/api/students/bulk-commission', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ids: this.selectedIds,
                        commission: this.destinationCommission
                    })
                });
                const result = await response.json();
                if (result.status === 'success') {
                    Swal.fire('¡Éxito!', result.message, 'success');
                    this.step = 1; // Back to start or refresh list
                } else {
                    Swal.fire('Error', result.error, 'error');
                }
            } catch (error) {
                console.error("Error in bulk update:", error);
                Swal.fire('Error', 'No se pudo procesar la solicitud', 'error');
            } finally {
                this.updating = false;
            }
        }
    }
}
