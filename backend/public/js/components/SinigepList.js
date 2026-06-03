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
            
            <div v-if="error" class="alert alert-danger mb-4 d-flex align-items-center">
                <i class="ph ph-warning-circle fs-4 me-2"></i> {{ error }}
            </div>

            <div class="row g-3 mb-4 p-3 bg-light rounded-3 border align-items-end">
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Periodo</label>
                    <select class="form-select" v-model="filters.periodo">
                        <option value="">Todos</option>
                        <option v-for="n in 6" :key="n" :value="n">Período {{ n }}</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Carrera</label>
                    <select class="form-select" v-model="filters.career">
                        <option value="">Todas</option>
                        <option v-for="c in careers" :key="c.id" :value="c.title">{{c.title}}</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Condición</label>
                    <select class="form-select" v-model="filters.status">
                        <option value="">Todas</option>
                        <option value="En Curso">En Curso</option>
                        <option value="Regular">Regular</option>
                        <option value="Libre">Libre</option>
                        <option value="Egresado">Egresado</option>
                        <option value="Abandono">Abandono</option>
                        <option value="Finalizó Cursada">Finalizó Cursada</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Sexo</label>
                    <select class="form-select" v-model="filters.sexo">
                        <option value="">Todos</option>
                        <option v-for="g in metadata.genders" :key="g" :value="g">{{g}}</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Estado Sinigep</label>
                    <select class="form-select" v-model="filters.sinigep_status">
                        <option value="">Todos</option>
                        <option v-for="s in metadata.sinigep_statuses" :key="s" :value="s">{{s}}</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Buscar</label>
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Nombre..." v-model="filters.name" @keyup.enter="fetchStudents">
                        <button class="btn btn-primary" @click="fetchStudents" title="Filtrar">
                            <i class="ph ph-funnel"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-sm table-hover border align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>Carrera</th>
                            <th>a-o</th>
                            <th>turno</th>
                            <th>Periodo Actual</th>
                            <th>comisi-n</th>
                            <th>Apellido</th>
                            <th>Nombre</th>
                            <th>TIPo Doc.</th>
                            <th>DNI</th>
                            <th>Genero</th>
                            <th>Lugar Nacimiento</th>
                            <th>Condicion</th>
                            <th>Nivel Educacion</th>
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
                        <tr v-else-if="!hasSearched">
                            <td colspan="8" class="text-center py-5 text-muted">
                                <i class="ph ph-funnel fs-1 d-block mb-2 text-secondary"></i>
                                Haga clic en el botón de filtrar para cargar los alumnos.
                            </td>
                        </tr>
                        <tr v-else-if="students.length === 0">
                            <td colspan="8" class="text-center py-5 text-muted">
                                No se encontraron estudiantes con los filtros seleccionados.
                            </td>
                        </tr>
                        <tr v-for="student in students" :key="student.id">
                            <td class="small">{{ student.career }}</td>
                            <td class="text-center">{{ student.academic_year || '-' }}</td>
                            <td class="text-center">{{ student.shift || '-' }}</td>
                            <td class="text-center">{{ student.academic_cycle || '-' }}</td>
                            <td class="text-center">{{ student.commission || '-' }}</td>
                            <td>{{ student.lastname }}</td>
                            <td>{{ student.name }}</td>
                            <td>{{ student.document_type || 'DNI' }}</td>
                            <td class="fw-bold">{{ student.dni }}</td>
                            <td>
                                <span class="badge bg-light text-dark border">{{ student.gender || 'No especifica' }}</span>
                            </td>
                            <td>{{ student.nationality || student.birth_place || '-' }}</td>
                            <td>
                                <span class="badge" :class="student.career_status === 'En Curso' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">
                                    {{ student.career_status || student.status }}
                                </span>
                            </td>
                            <td class="small">
                                {{ student.max_education_level || '' }} 
                                {{ student.education_finished === 'Si' ? 'Completo' : (student.education_finished === 'No' ? 'Incompleto' : '') }}
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
            loading: false,
            hasSearched: false,
            error: null,
            filters: {
                periodo: '',
                career: '',
                status: '',
                sexo: '',
                sinigep_status: '',
                name: ''
            }
        }
    },
    methods: {
        async fetchMetadata() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/metadata/student-types', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
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
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/careers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
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
            this.hasSearched = true;
            this.error = null;
            try {
                const token = localStorage.getItem('token');
                
                // Clean filters: remove empty strings
                const cleanFilters = {};
                Object.keys(this.filters).forEach(key => {
                    if (this.filters[key] !== '' && this.filters[key] !== null) {
                        cleanFilters[key] = this.filters[key];
                    }
                });

                const query = new URLSearchParams(cleanFilters).toString();
                const response = await fetch(window.API_BASE + '/api/students/report?' + query, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 401) {
                    return this.$router.push('/login');
                }

                const result = await response.json();
                if (result.status === 'success') {
                    this.students = result.data;
                } else {
                    this.error = result.message || "Error al cargar alumnos";
                }
            } catch (error) {
                console.error("Error fetching students:", error);
                this.error = "Error de conexión con el servidor";
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
            const token = localStorage.getItem('token');
            const query = new URLSearchParams(this.filters).toString();
            window.location.href = window.API_BASE + '/api/students/export-sinigep?' + query + '&token=' + token;
        }
    },
    async mounted() {
        await this.fetchMetadata();
        await this.fetchCareers();
    }

}
