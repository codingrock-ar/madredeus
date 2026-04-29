export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="fw-bold mb-0">Tipos de Beca</h5>
                <div class="d-flex align-items-center gap-3">
                    <div class="form-check form-switch mb-0">
                        <input class="form-check-input" type="checkbox" id="showInactiveToggle" v-model="showInactive">
                        <label class="form-check-label small text-muted fw-bold" for="showInactiveToggle">Mostrar dadas de baja</label>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-success btn-sm shadow-sm" @click="exportToExcel">
                            <i class="ph ph-file-xls me-1"></i> Exportar a Excel
                        </button>
                        <button class="btn btn-primary shadow-sm btn-sm" @click="showAddModal = true">
                            <i class="ph ph-plus-circle me-1"></i> Nueva Beca
                        </button>
                    </div>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table align-middle table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>Tipo de Beca</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="scholarship in scholarships" :key="scholarship.id" v-show="scholarship.status === 'active' || showInactive">
                            <td class="fw-semibold text-primary" style="cursor: pointer;" @click="editScholarship(scholarship)">{{ scholarship.name }}</td>
                            <td class="text-muted small">{{ scholarship.description || '-' }}</td>
                            <td>
                                <span class="badge rounded-pill" :class="scholarship.status === 'active' ? 'badge-soft-success' : 'badge-soft-secondary'">
                                    {{ scholarship.status === 'active' ? 'Activa' : 'Inactiva' }}
                                </span>
                            </td>
                            <td class="text-end">
                                <div class="d-flex justify-content-end gap-2">
                                    <button class="btn btn-sm btn-outline-primary" @click="editScholarship(scholarship)" title="Editar">
                                        <i class="ph ph-pencil-simple"></i>
                                    </button>
                                    <button v-if="scholarship.status === 'active'" class="btn btn-sm btn-outline-warning" @click="toggleStatus(scholarship.id, 'inactive')" title="Dar de baja">
                                        <i class="ph ph-arrow-circle-down"></i> Baja
                                    </button>
                                    <button v-else class="btn btn-sm btn-outline-success" @click="toggleStatus(scholarship.id, 'active')" title="Dar de alta">
                                        <i class="ph ph-arrow-circle-up"></i> Alta
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" @click="deleteScholarship(scholarship.id)" title="Eliminar">
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
                    Cantidad de Tipos de Beca: <span class="fw-bold">{{ scholarships.filter(s => s.status === 'active' || showInactive).length }}</span>
                </div>
            </div>
        </div>

        <!-- Modal -->
        <div v-if="showAddModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">{{ editingId ? 'Editar Tipo de Beca' : 'Nuevo Tipo de Beca' }}</h5>
                        <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold">Nombre</label>
                            <input type="text" class="form-control" v-model="newScholarship.name" placeholder="Ej: Beca Alumno Excelente">
                        </div>
                        <div class="mb-3">
                            <label class="form-label text-muted small fw-bold">Descripción (Opcional)</label>
                            <textarea class="form-control" v-model="newScholarship.description" rows="3" placeholder="Detalles de la beca..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-light" @click="closeModal">Cancelar</button>
                        <button type="button" class="btn btn-primary px-4" @click="saveScholarship">
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
            scholarships: [],
            showInactive: false,
            showAddModal: false,
            editingId: null,
            newScholarship: { name: '', description: '', status: 'active' }
        }
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        async fetchData() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/config/scholarships', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.status === 'success') this.scholarships = result.data;
            } catch (e) { console.error(e); }
        },
        editScholarship(scholarship) {
            this.editingId = scholarship.id;
            this.newScholarship = { name: scholarship.name, description: scholarship.description, status: scholarship.status };
            this.showAddModal = true;
        },
        closeModal() {
            this.showAddModal = false;
            this.editingId = null;
            this.newScholarship = { name: '', description: '', status: 'active' };
        },
        async saveScholarship() {
            try {
                const token = localStorage.getItem('token');
                const method = this.editingId ? 'PUT' : 'POST';
                const url = this.editingId 
                    ? window.API_BASE + '/api/config/scholarships/' + this.editingId 
                    : window.API_BASE + '/api/config/scholarships';

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.newScholarship)
                });
                if (response.ok) {
                    this.closeModal();
                    this.fetchData();
                }
            } catch (e) { console.error(e); }
        },
        async toggleStatus(id, status) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + `/api/config/scholarships/${id}/status`, {
                    method: 'PATCH',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                });
                if (response.ok) this.fetchData();
            } catch (e) { console.error(e); }
        },
        async deleteScholarship(id) {
            if (!confirm('¿Estás seguro de eliminar este registro?')) return;
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/config/scholarships/' + id, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) this.fetchData();
            } catch (e) { console.error(e); }
        },
        exportToExcel() {
            const rows = [
                ['ID', 'Nombre', 'Descripción', 'Estado']
            ];
            
            this.scholarships.forEach(s => {
                rows.push([
                    s.id,
                    s.name,
                    s.description || '',
                    s.status === 'active' ? 'Activa' : 'Inactiva'
                ]);
            });

            let csvContent = "data:text/csv;charset=utf-8,\ufeff" 
                + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "tipos_de_beca.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
