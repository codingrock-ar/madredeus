export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="fw-bold mb-0">Ciclos Lectivos</h5>
                <button class="btn btn-primary shadow-sm" @click="showAddModal = true; initFlatpickr()">
                    <i class="ph ph-plus-circle me-1"></i> Nuevo Ciclo
                </button>
            </div>

            <div class="table-responsive">
                <table class="table align-middle table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Ciclo Lectivo</th>
                            <th>Fecha Desde</th>
                            <th>Fecha Hasta</th>
                            <th>Estado</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="cycle in cycles" :key="cycle.id">
                            <td class="fw-semibold text-primary" style="cursor: pointer;" @click="editCycle(cycle)">{{ cycle.name }}</td>
                            <td>{{ formatDate(cycle.start_date) }}</td>
                            <td>{{ formatDate(cycle.end_date) }}</td>
                            <td>
                                <span class="badge" :class="cycle.status === 'active' ? 'bg-success' : 'bg-secondary'">
                                    {{ cycle.status === 'active' ? 'Activo' : 'Inactivo' }}
                                </span>
                            </td>
                            <td class="text-end">
                                <div class="d-flex justify-content-end gap-2">
                                    <button class="btn btn-sm btn-outline-primary" @click="editCycle(cycle)">
                                        <i class="ph ph-pencil-simple"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteCycle(cycle.id)">
                                        <i class="ph ph-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="d-flex justify-content-between align-items-center mt-3 border-top pt-3">
                <div class="text-muted small">
                    Cantidad de Ciclos Lectivos: <span class="fw-bold">{{ cycles.length }}</span>
                </div>
            </div>
        </div>

        <!-- Modal para Nuevo/Editar -->
        <div v-if="showAddModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">{{ editingId ? 'Editar Ciclo Lectivo' : 'Nuevo Ciclo Lectivo' }}</h5>
                        <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold">Nombre del Ciclo</label>
                            <input type="text" class="form-control" v-model="newCycle.name" placeholder="Ej: Marzo 2024">
                        </div>
                        <div class="row g-3 mb-3">
                            <div class="col-6">
                                <label class="form-label text-muted small fw-bold">Fecha Desde</label>
                                <input type="text" class="form-control" id="cycle_start_date" v-model="newCycle.start_date" placeholder="dd/mm/aaaa">
                            </div>
                            <div class="col-6">
                                <label class="form-label text-muted small fw-bold">Fecha Hasta</label>
                                <input type="text" class="form-control" id="cycle_end_date" v-model="newCycle.end_date" placeholder="dd/mm/aaaa">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold">Estado</label>
                            <select class="form-select" v-model="newCycle.status">
                                <option value="active">Activo</option>
                                <option value="inactive">Inactivo</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-light" @click="closeModal">Cancelar</button>
                        <button type="button" class="btn btn-primary px-4" @click="saveCycle">
                            {{ editingId ? 'Actualizar' : 'Guardar' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            cycles: [],
            showAddModal: false,
            editingId: null,
            newCycle: { name: '', start_date: '', end_date: '', status: 'active' },
            flatpickrInstances: []
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/config/cycles', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.status === 'success') this.cycles = result.data;
            } catch (e) { console.error(e); }
        },
        formatDate(date) {
            if (!date) return '-';
            const [year, month, day] = date.split('-');
            return `${day}/${month}/${year}`;
        },
        editCycle(cycle) {
            this.editingId = cycle.id;
            this.newCycle = { ...cycle };
            this.showAddModal = true;
            this.initFlatpickr();
        },
        initFlatpickr() {
            this.$nextTick(() => {
                const baseConfig = {
                    dateFormat: "Y-m-d", // Backend format
                    altInput: true,
                    altFormat: "d/m/Y", // Display format
                    allowInput: true,
                    locale: "es",
                };
                
                // Limpiar instancias previas si existen
                this.flatpickrInstances.forEach(fp => fp.destroy());
                this.flatpickrInstances = [];

                const startInput = document.getElementById('cycle_start_date');
                const endInput = document.getElementById('cycle_end_date');

                if (startInput) {
                    this.flatpickrInstances.push(flatpickr(startInput, {
                        ...baseConfig,
                        defaultDate: this.newCycle.start_date,
                        onChange: (selectedDates, dateStr) => {
                            this.newCycle.start_date = dateStr;
                        }
                    }));
                }
                if (endInput) {
                    this.flatpickrInstances.push(flatpickr(endInput, {
                        ...baseConfig,
                        defaultDate: this.newCycle.end_date,
                        onChange: (selectedDates, dateStr) => {
                            this.newCycle.end_date = dateStr;
                        }
                    }));
                }
            });
        },
        closeModal() {
            this.showAddModal = false;
            this.editingId = null;
            this.newCycle = { name: '', start_date: '', end_date: '', status: 'active' };
            this.flatpickrInstances.forEach(fp => fp.destroy());
            this.flatpickrInstances = [];
        },
        async saveCycle() {
            try {
                const token = localStorage.getItem('token');
                const method = this.editingId ? 'PUT' : 'POST';
                const url = this.editingId 
                    ? window.API_BASE + '/api/config/cycles/' + this.editingId 
                    : window.API_BASE + '/api/config/cycles';

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.newCycle)
                });
                if (response.ok) {
                    this.closeModal();
                    this.fetchData();
                }
            } catch (e) { console.error(e); }
        },
        async deleteCycle(id) {
            if (!confirm('¿Eliminar este ciclo?')) return;
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/config/cycles/' + id, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) this.fetchData();
            } catch (e) { console.error(e); }
        }
    }
}
