export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Buscar profesor..." v-model="search">
                        <button class="btn btn-outline-secondary" type="button"><i class="ph ph-magnifying-glass"></i></button>
                    </div>
                </div>
                <div class="col-md-6 text-end d-flex justify-content-end gap-2">
                    <button class="btn btn-outline-danger shadow-sm btn-sm" @click="exportToPdf">
                        <i class="ph ph-file-pdf me-1"></i> PDF
                    </button>
                    <button class="btn btn-outline-secondary shadow-sm btn-sm" @click="printList">
                        <i class="ph ph-printer me-1"></i> Imprimir
                    </button>
                    <button class="btn btn-primary shadow-sm btn-sm" @click="$router.push('/teacher/form')">
                        <i class="ph ph-plus-circle me-1"></i> Nuevo Docente
                    </button>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table align-middle table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Imagen</th>
                            <th>Apellido</th>
                            <th>Nombre</th>
                            <th>Última Modificación</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="prof in paginatedTeachers" :key="prof.id">
                            <td>{{ prof.id }}</td>
                            <td>
                                <img :src="prof.image || 'https://ui-avatars.com/api/?name=' + prof.name + '+' + prof.lastname + '&size=64'" 
                                     class="rounded-circle border" 
                                     style="width:32px; height:32px; object-fit: cover;">
                            </td>
                            <td>{{ prof.lastname }}</td>
                            <td>{{ prof.name }}</td>
                            <td class="text-muted small">{{ prof.last_modified }}</td>
                            <td class="text-end">
                                <div class="d-flex justify-content-end gap-2">
                                    <button class="btn btn-sm btn-outline-primary" title="Editar" @click="$router.push('/teacher/form?id=' + prof.id)"><i class="ph ph-pencil-simple"></i></button>
                                    <button class="btn btn-sm btn-outline-danger" title="Eliminar" @click="deleteTeacher(prof.id, prof.name + ' ' + prof.lastname)"><i class="ph ph-trash"></i></button>
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
    </div>
    `,
    data() { return { teachers: [], search: '', currentPage: 1, itemsPerPage: 10 } },
    computed: {
        filteredTeachers() {
            if(!this.search) return this.teachers;
            const term = this.search.toLowerCase();
            return this.teachers.filter(t => 
                t.name.toLowerCase().includes(term) || 
                t.lastname.toLowerCase().includes(term)
            );
        },
        totalPages() {
            return Math.ceil(this.filteredTeachers.length / this.itemsPerPage) || 1;
        },
        paginatedTeachers() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredTeachers.slice(start, start + this.itemsPerPage);
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
                const response = await fetch(window.API_BASE + '/api/teachers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();
                if (result.status === 'success') this.teachers = result.data;
            } catch (error) { console.error("Error al cargar profesores:", error); }
        },
        async deleteTeacher(id, name) {
            if (!confirm('¿Estás seguro que deseas eliminar al docente ' + name + '?')) return;
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/teachers/' + id, {
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
        },
        exportToPdf() {
            window.print();
        },
        printList() {
            window.print();
        }
    }
}
