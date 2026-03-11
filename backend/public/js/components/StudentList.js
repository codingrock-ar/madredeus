export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <div class="row g-3 mb-4">
                <div class="col-md-4">
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i class="ph ph-magnifying-glass"></i></span>
                        <input type="text" class="form-control border-start-0" placeholder="Buscar por Apellido, DNI..." v-model="search">
                    </div>
                </div>
                <div class="col-md-3">
                    <select class="form-select" v-model="selectedCareer">
                        <option value="">Todas las Carreras</option>
                        <option v-for="career in careers" :key="career.id" :value="career.title">
                            {{ career.title }}
                        </option>
                    </select>
                </div>
                <div class="col-md-5 text-end">
                    <div class="row align-items-center">
                        <div class="col-12 col-md-auto mb-3 mb-md-0 me-auto">
                            <button class="btn btn-primary shadow-sm" @click="$router.push('/student/form')">
                                <i class="ph ph-plus-circle me-1"></i> Nuevo Estudiante
                            </button>
                        </div>
                        <div class="col-12 col-md-auto d-flex gap-2">
                        </div>
                    </div>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table align-middle table-hover">
                    <thead class="table-light">
                        <tr>
                            <th scope="col" width="50">ID</th>
                            <th scope="col">Estudiante</th>
                            <th scope="col">Documento</th>
                            <th scope="col">Carrera / Comisión</th>
                            <th scope="col">Estado</th>
                            <th scope="col" class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="6" class="text-center py-4 text-muted">Cargando datos...</td>
                        </tr>
                        <tr v-else v-for="student in paginatedStudents" :key="student.id">
                            <td class="text-muted">#{{ student.id }}</td>
                            <td>
                                <div class="d-flex align-items-center gap-3">
                                    <img :src="'https://ui-avatars.com/api/?name=' + student.name + '&background=random'" class="avatar-circle">
                                    <div>
                                        <div class="fw-bold">{{ student.lastname }}, {{ student.name }}</div>
                                        <div class="text-muted small">{{ student.email }}</div>
                                    </div>
                                </div>
                            </td>
                            <td>{{ student.dni }}</td>
                            <td>
                                <div class="fw-semibold">{{ student.career }}</div>
                                <div class="small text-muted">Comisión {{ student.commission }} - {{ student.shift }}</div>
                            </td>
                            <td>
                                <span class="badge rounded-pill" 
                                      :class="{'badge-soft-success': student.status === 'En Curso', 'badge-soft-danger': student.status === 'Abandono', 'badge-soft-info': student.status === 'Egresado'}">
                                    {{ student.status }}
                                </span>
                            </td>
                            <td class="text-end">
                                <div class="d-flex justify-content-end gap-2">
                                    <button class="btn btn-sm btn-outline-primary" title="Editar" @click="$router.push('/student/form?id=' + student.id)"><i class="ph ph-pencil-simple"></i></button>
                                    <button class="btn btn-sm btn-outline-danger" title="Eliminar" @click="deleteStudent(student.id, student.name + ' ' + student.lastname)"><i class="ph ph-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <nav class="d-flex justify-content-center mt-4" v-if="totalPages >= 1 && paginatedStudents.length > 0">
                <ul class="pagination pagination-sm">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <a class="page-link" href="#" @click.prevent="currentPage > 1 && currentPage--">Anterior</a>
                    </li>
                    <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                        <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <a class="page-link" href="#" @click.prevent="currentPage < totalPages && currentPage++">Siguiente</a>
                    </li>
                </ul>
            </nav>
            <div v-if="paginatedStudents.length === 0 && !loading" class="text-center text-muted py-4">
                No se encontraron estudiantes con los filtros actuales.
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            students: [],
            careers: [],
            loading: true,
            search: '',
            selectedCareer: '',
            currentPage: 1,
            itemsPerPage: 10
        }
    },
    computed: {
        filteredStudents() {
            let result = this.students;
            
            // Filtro por Carrera (ajuste por tipo string seguro)
            if (this.selectedCareer && this.selectedCareer !== '') {
                result = result.filter(s => s.career && s.career.includes(this.selectedCareer));
            }
            
            // Filtro por Búsqueda de Texto (DNI, Nombre, Apellido)
            if (this.search) {
                const term = this.search.toLowerCase();
                result = result.filter(s => 
                    (s.name && s.name.toLowerCase().includes(term)) || 
                    (s.lastname && s.lastname.toLowerCase().includes(term)) || 
                    (s.dni && s.dni.toString().includes(term))
                );
            }
            
            return result;
        },
        totalPages() {
            return Math.ceil(this.filteredStudents.length / this.itemsPerPage) || 1;
        },
        paginatedStudents() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredStudents.slice(start, start + this.itemsPerPage);
        }
    },
    watch: {
        search() {
            this.currentPage = 1;
        },
        selectedCareer() {
            this.currentPage = 1;
        }
    },
    methods: {
        goToForm(id) {
            if (id) {
                 this.$router.push({ path: '/student/form', query: { id: id }});
            } else {
                 this.$router.push('/student/form');
            }
        },
        async fetchStudents() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/students', {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
                });
                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();
                if (result.status === 'success') {
                    this.students = result.data;
                }
            } catch (error) {
                console.error("Error al cargar estudiantes:", error);
            } finally {
                this.loading = false;
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
                console.error("Error al cargar carreras:", error);
            }
        },
        async deleteStudent(id, name) {
            if (!confirm('¿Estás seguro que deseas eliminar al estudiante ' + name + '?')) return;
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/students/' + id, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    this.fetchStudents(); // Recargar la lista
                } else {
                    const result = await response.json();
                    alert(result.error || 'Error al eliminar');
                }
            } catch (error) {
                console.error("Error al eliminar", error);
                alert("Error de red");
            }
        }
    },
    mounted() {
        this.fetchCareers();
        this.fetchStudents();
    }
}
