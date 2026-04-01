export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Buscar carrera..." v-model="search">
                        <button class="btn btn-outline-secondary" type="button"><i class="ph ph-magnifying-glass"></i></button>
                    </div>
                </div>
                <div class="col-md-6 text-end">
                    <button class="btn btn-primary shadow-sm" @click="$router.push('/career/form')">
                        <i class="ph ph-plus-circle me-1"></i> Nueva Carrera
                    </button>
                </div>
            </div>
            <div class="table-responsive">
                <table class="table align-middle table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>ID</th>
                            <th>Título</th>
                            <th>Duración (Años)</th>
                            <th>Última Modificación</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="carrera in paginatedCareers" :key="carrera.id">
                            <td>{{ carrera.id }}</td>
                            <td class="text-primary fw-semibold" style="text-decoration: underline; cursor: pointer;" @click="$router.push('/career/form?id=' + carrera.id)">{{ carrera.title }}</td>
                            <td>{{ carrera.duration }}</td>
                            <td class="text-muted small">{{ carrera.last_modified }}</td>
                            <td class="text-end">
                                <div class="d-flex justify-content-end gap-2">
                                    <button class="btn btn-sm btn-outline-primary" title="Editar" @click="$router.push('/career/form?id=' + carrera.id)"><i class="ph ph-pencil-simple"></i></button>
                                    <button class="btn btn-sm btn-outline-danger" title="Eliminar" @click="deleteCareer(carrera.id, carrera.title)"><i class="ph ph-trash"></i></button>
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
    data() { return { careers: [], search: '', currentPage: 1, itemsPerPage: 10 } },
    computed: {
        filteredCareers() {
            if(!this.search) return this.careers;
            const term = this.search.toLowerCase();
            return this.careers.filter(c => c.title.toLowerCase().includes(term));
        },
        totalPages() {
            return Math.ceil(this.filteredCareers.length / this.itemsPerPage) || 1;
        },
        paginatedCareers() {
            const start = (this.currentPage - 1) * this.itemsPerPage;
            return this.filteredCareers.slice(start, start + this.itemsPerPage);
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
                const response = await fetch(window.API_BASE + '/api/careers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();
                if (result.status === 'success') this.careers = result.data;
            } catch (error) { console.error("Error:", error); }
        },
        async deleteCareer(id, title) {
            if (!confirm('¿Estás seguro que deseas eliminar la carrera ' + title + '?')) return;
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/careers/' + id, {
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
