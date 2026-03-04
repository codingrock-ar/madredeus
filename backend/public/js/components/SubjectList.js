export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Buscar materia..." v-model="search">
                        <button class="btn btn-outline-secondary" type="button"><i class="ph ph-magnifying-glass"></i></button>
                    </div>
                </div>
                <div class="col-md-6 text-end">
                    <button class="btn btn-primary shadow-sm" @click="$router.push('/subject/form')">
                        <i class="ph ph-plus-circle me-1"></i> Nueva Materia
                    </button>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table align-middle table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Programa</th>
                            <th>Última Modificación</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="materia in paginatedSubjects" :key="materia.id">
                            <td>{{ materia.id }}</td>
                            <td class="text-primary fw-semibold" style="text-decoration: underline; cursor: pointer;">{{ materia.name }}</td>
                            <td>
                                <a :href="materia.program" target="_blank" v-if="materia.program && materia.program.length > 0">
                                    <i class="ph ph-file-doc fs-4 text-primary"></i>
                                </a>
                                <span v-else class="text-muted small">N/A</span>
                            </td>
                            <td class="text-muted small">{{ materia.last_modified }}</td>
                            <td class="text-end">
                                <div class="d-flex justify-content-end gap-2">
                                    <button class="btn btn-sm btn-outline-primary" title="Editar" @click="$router.push('/subject/form?id=' + materia.id)"><i class="ph ph-pencil-simple"></i></button>
                                    <button class="btn btn-sm btn-outline-danger" title="Eliminar" @click="deleteSubject(materia.id, materia.name)"><i class="ph ph-trash"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <nav class="d-flex justify-content-center mt-4" v-if="totalPages > 1">
                <ul class="pagination pagination-sm">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                        <a class="page-link" href="#" @click.prevent="currentPage--">Anterior</a>
                    </li>
                    <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                        <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                        <a class="page-link" href="#" @click.prevent="currentPage++">Siguiente</a>
                    </li>
                </ul>
            </nav>
        </div>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `,
    data() { return { subjects: [], search: '', currentPage: 1, itemsPerPage: 10 } },
    computed: {
        filteredSubjects() {
            if(!this.search) return this.subjects;
            const term = this.search.toLowerCase();
            return this.subjects.filter(s => s.name.toLowerCase().includes(term));
        },
        totalPages() {
            return Math.ceil(this.filteredSubjects.length / this.itemsPerPage) || 1;
        },
        paginatedSubjects() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredSubjects.slice(start, start + this.itemsPerPage);
        }
    },
    watch: {
        search() {
            this.currentPage = 1;
        }
    },
    mounted() { this.fetchData(); },
    methods: {
        async fetchData() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/subjects', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();
                if (result.status === 'success') this.subjects = result.data;
            } catch (error) { console.error("Error:", error); }
        },
        async deleteSubject(id, name) {
            if (!confirm('¿Estás seguro que deseas eliminar la materia ' + name + '?')) return;
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/subjects/' + id, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    this.fetchData(); // Recargar la lista
                } else {
                    const result = await response.json();
                    alert(result.error || 'Error al eliminar');
                }
            } catch (error) {
                console.error("Error al eliminar", error);
                alert("Error de red");
            }
        }
    }
}
