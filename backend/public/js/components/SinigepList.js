export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="fw-bold mb-0"><i class="ph ph-list-numbers me-2"></i>Listado Sinigep</h5>
                <button class="btn btn-sm btn-outline-primary" @click="exportExcel">
                    <i class="ph ph-download-simple me-2"></i>Exportar Excel
                </button>
            </div>
            
            <div class="row g-3 mb-4 p-3 bg-light rounded-3 border">
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Periodo</label>
                    <select class="form-select" v-model="filters.periodo" @change="fetchStudents">
                        <option value="">Todos</option>
                        <option v-for="n in 6" :key="n" :value="n">Período {{ n }}</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label small fw-bold">Carrera</label>
                    <select class="form-select" v-model="filters.career" @change="fetchStudents">
                        <option value="">Todas</option>
                        <option v-for="c in careers" :key="c.id" :value="c.title">{{c.title}}</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Sexo</label>
                    <select class="form-select" v-model="filters.sexo" @change="fetchStudents">
                        <option value="">Todos</option>
                        <option v-for="g in metadata.genders" :key="g" :value="g">{{g}}</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Estado Sinigep</label>
                    <select class="form-select" v-model="filters.sinigep_status" @change="fetchStudents">
                        <option value="">Todos</option>
                        <option v-for="s in metadata.sinigep_statuses" :key="s" :value="s">{{s}}</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label small fw-bold">Buscar</label>
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="DNI, Nombre..." v-model="filters.name" @keyup.enter="fetchStudents">
                        <button class="btn btn-primary" @click="fetchStudents">
                            <i class="ph ph-magnifying-glass"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-sm table-hover border align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>DNI</th>
                            <th>Apellido y Nombre</th>
                            <th>Sexo</th>
                            <th>Carrera</th>
                            <th>Año</th>
                            <th>Condición</th>
                            <th>Estado Sinigep</th>
                            <th class="text-end">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="8" class="text-center py-5">
                                <div class="spinner-border text-primary" role="status"></div>
                                <div class="mt-2 text-muted">Cargando datos Sinigep...</div>
                            </td>
                        </tr>
                        <tr v-else-if="students.length === 0">
                            <td colspan="8" class="text-center py-5 text-muted">
                                No se encontraron estudiantes con los filtros seleccionados.
                            </td>
                        </tr>
                        <tr v-for="student in students" :key="student.id">
                            <td class="fw-bold">{{ student.dni }}</td>
                            <td>{{ student.lastname }}, {{ student.name }}</td>
                            <td>
                                <span class="badge bg-light text-dark border">{{ student.gender || 'No especifica' }}</span>
                            </td>
                            <td class="small">{{ student.career }}</td>
                            <td class="text-center">{{ student.academic_cycle || '-' }}</td>
                            <td>
                                <span class="badge" :class="student.status === 'En Curso' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">
                                    {{ student.status }}
                                </span>
                            </td>
                            <td>
                                <span class="badge rounded-pill" :class="getStatusClass(student.sinigep_status)">
                                    {{ student.sinigep_status || 'Pendiente' }}
                                </span>
                            </td>
                            <td class="text-end">
                                <router-link :to="'/student/form?id=' + student.id" class="btn btn-sm btn-icon btn-outline-primary">
                                    <i class="ph ph-pencil-simple"></i>
                                </router-link>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            students: [],
            careers: [],
            metadata: {
                genders: [],
                sinigep_statuses: []
            },
            loading: true,
            filters: {
                periodo: '',
                career: '',
                sexo: '',
                sinigep_status: '',
                name: ''
            }
        }
    },
    methods: {
        async fetchMetadata() {
            try {
                const response = await fetch(window.API_BASE + '/api/metadata/student-types');
                const result = await response.json();
                if (result.status === 'success') {
                    this.metadata.genders = result.data.genders;
                    this.metadata.sinigep_statuses = result.data.sinigep_statuses;
                }
            } catch (error) {
                console.error("Error fetching metadata:", error);
            }
        },
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
        async fetchStudents() {
            this.loading = true;
            try {
                const query = new URLSearchParams(this.filters).toString();
                const response = await fetch(window.API_BASE + '/api/students/report?' + query);
                const result = await response.json();
                if (result.status === 'success') {
                    this.students = result.data;
                }
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                this.loading = false;
            }
        },
        getStatusClass(status) {
            switch (status) {
                case 'Informado': return 'bg-info';
                case 'Pendiente': return 'bg-warning text-dark';
                case 'Error': return 'bg-danger';
                case 'Rechazado': return 'bg-dark';
                default: return 'bg-secondary';
            }
        },
        exportExcel() {
            const query = new URLSearchParams(this.filters).toString();
            window.location.href = window.API_BASE + '/api/students/export?' + query;
        }
    },
    async mounted() {
        await Promise.all([
            this.fetchMetadata(),
            this.fetchCareers(),
            this.fetchStudents()
        ]);
    }
}
