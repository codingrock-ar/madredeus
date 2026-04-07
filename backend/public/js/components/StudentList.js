export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <!-- FILTROS SUPERIORES -->
            <div class="row g-3 mb-4">
                <div class="col-md-4 position-relative">
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i class="ph ph-magnifying-glass text-muted"></i></span>
                        <input type="text" class="form-control border-start-0 ps-0" 
                               placeholder="Buscar por DNI, Apellido o Nombre..." 
                               v-model="filters.search" 
                               @input="onSearchInput"
                               @keydown.down="onArrowDown"
                               @keydown.up="onArrowUp"
                               @keydown.enter="onEnter">
                    </div>
                    
                    <!-- Autocomplete Dropdown -->
                    <div v-if="showAutocomplete && suggestions.length > 0" class="autocomplete-dropdown shadow-sm border rounded-3 position-absolute start-0 end-0 bg-white mt-1">
                        <div v-for="(s, index) in suggestions" 
                             :key="s.id" 
                             class="suggestion-item p-2 border-bottom pointer"
                             :class="{ 'bg-light': index === arrowCounter }"
                             @click="selectSuggestion(s)">
                            <div class="fw-bold small">{{ s.lastname }}, {{ s.name }}</div>
                            <div class="text-muted extra-small">DNI: {{ s.dni }}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <select class="form-select" v-model="filters.career" @change="fetchStudents">
                        <option value="">Todas las Carreras</option>
                        <option v-for="career in careers" :key="career.id" :value="career.title">
                            {{ career.title }}
                        </option>
                    </select>
                </div>
                <div class="col-md-5 text-end d-flex justify-content-end gap-2">
                    <button class="btn btn-outline-danger shadow-sm btn-sm" @click="exportToPdf">
                        <i class="ph ph-file-pdf me-1"></i> PDF
                    </button>
                    <button class="btn btn-outline-secondary shadow-sm btn-sm" @click="printList">
                        <i class="ph ph-printer me-1"></i> Imprimir
                    </button>
                    <button class="btn btn-primary shadow-sm btn-sm" @click="goToForm()">
                        <i class="ph ph-plus-circle me-1"></i> Nuevo Estudiante
                    </button>
                </div>
            </div>

            <!-- TABLA DE ALUMNOS -->
            <div class="table-responsive">
                <table class="table align-middle table-hover">
                    <thead class="table-light">
                        <tr>
                            <th scope="col" width="60">ID</th>
                            <th scope="col" width="60">Imagen</th>
                            <th scope="col">Documento</th>
                            <th scope="col">Apellido</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Carrera</th>
                            <th scope="col">Periodo</th>
                            <th scope="col">Comisión</th>
                            <th scope="col">Turno</th>
                            <th scope="col">Estado</th>
                            <th scope="col" class="text-end">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="11" class="text-center py-5">
                                <div class="spinner-border text-primary" role="status"></div>
                                <div class="mt-2 text-muted">Cargando datos...</div>
                            </td>
                        </tr>
                        <tr v-else-if="students.length === 0">
                            <td colspan="11" class="text-center py-5 text-muted">
                                No se encontraron estudiantes con los filtros seleccionados.
                            </td>
                        </tr>
                        <tr v-else v-for="student in students" :key="student.id">
                            <td class="text-muted small">#{{ student.id }}</td>
                            <td>
                                <img :src="student.photo || 'https://ui-avatars.com/api/?name=' + student.name + '+' + student.lastname + '&background=random'" 
                                     class="rounded-circle shadow-sm border object-fit-cover" 
                                     style="width: 48px; height: 48px;"
                                     :alt="student.name">
                            </td>
                            <td class="fw-semibold">{{ student.dni }}</td>
                            <td>{{ student.lastname }}</td>
                            <td>{{ student.name }}</td>
                            <td class="small">{{ student.career }}</td>
                            <td class="text-center">{{ student.academic_cycle || '-' }}</td>
                            <td class="text-center small">{{ student.commission }}</td>
                            <td class="text-center small">{{ student.shift }}</td>
                            <td>
                                <span class="badge rounded-pill" 
                                      :class="{'badge-soft-success': student.status === 'En Curso', 'badge-soft-danger': student.status === 'Abandono', 'badge-soft-info': student.status === 'Egresado'}">
                                    {{ student.status }}
                                </span>
                            </td>
                            <td class="text-end">
                                <div class="d-flex justify-content-end gap-1">
                                    <button class="btn btn-icon btn-sm btn-outline-info" data-bs-toggle="tooltip" title="Ver detalle" @click="viewDetail(student.id)">
                                        <i class="ph ph-eye"></i>
                                    </button>
                                    <button class="btn btn-icon btn-sm btn-outline-warning" data-bs-toggle="tooltip" title="Editar Inscripción" @click="editInscription(student.id)">
                                        <i class="ph ph-user-plus"></i>
                                    </button>
                                    <button class="btn btn-icon btn-sm btn-outline-primary" data-bs-toggle="tooltip" title="Editar" @click="goToForm(student.id)">
                                        <i class="ph ph-pencil-simple"></i>
                                    </button>
                                    <button class="btn btn-icon btn-sm btn-outline-success" data-bs-toggle="tooltip" title="Calificaciones" @click="viewGrades(student.id)">
                                        <i class="ph ph-graduation-cap"></i>
                                    </button>
                                    <button class="btn btn-icon btn-sm btn-outline-dark" data-bs-toggle="tooltip" title="Cobrar" @click="collectPayment(student.id)">
                                        <i class="ph ph-currency-dollar"></i>
                                    </button>
                                    <button class="btn btn-icon btn-sm btn-outline-secondary" data-bs-toggle="tooltip" title="Promocionar" @click="promoteStudent(student.id)">
                                        <i class="ph ph-fast-forward"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <!-- PAGINADO -->
            <div class="d-flex justify-content-between align-items-center mt-4" v-if="meta.total_pages > 0">
                <div class="small text-muted">
                    Mostrando {{ students.length }} de {{ meta.total }} resultados
                </div>
                <nav>
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item" :class="{ disabled: meta.page === 1 }">
                            <a class="page-link" href="#" @click.prevent="goToPage(meta.page - 1)">
                                <i class="ph ph-caret-left"></i> Anterior
                            </a>
                        </li>
                        <li class="page-item" v-for="p in meta.total_pages" :key="p" :class="{ active: meta.page === p }">
                            <a class="page-link" href="#" @click.prevent="goToPage(p)">{{ p }}</a>
                        </li>
                        <li class="page-item" :class="{ disabled: meta.page === meta.total_pages }">
                            <a class="page-link" href="#" @click.prevent="goToPage(meta.page + 1)">
                                Siguiente <i class="ph ph-caret-right"></i>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            students: [],
            careers: [],
            loading: true,
            filters: {
                search: '',
                career: '',
                page: 1,
                per_page: 10
            },
            meta: {
                total: 0,
                page: 1,
                total_pages: 0
            },
            suggestions: [],
            showAutocomplete: false,
            arrowCounter: -1,
            debounceTimeout: null,
            tooltipInstances: []
        }
    },
    methods: {
        debounceFetch() {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.filters.page = 1;
                this.fetchStudents();
            }, 500);
        },
        onSearchInput() {
            this.debounceFetch();
            this.fetchSuggestions();
        },
        async fetchSuggestions() {
            if (this.filters.search.length < 3) {
                this.suggestions = [];
                this.showAutocomplete = false;
                return;
            }

            try {
                const response = await fetch(window.API_BASE + '/api/students/autocomplete?q=' + encodeURIComponent(this.filters.search));
                const result = await response.json();
                if (result.status === 'success') {
                    this.suggestions = result.data;
                    this.showAutocomplete = true;
                    this.arrowCounter = -1;
                }
            } catch (error) {
                console.error("Error fetching suggestions:", error);
            }
        },
        selectSuggestion(student) {
            this.filters.search = `${student.lastname}, ${student.name}`;
            this.showAutocomplete = false;
            this.fetchStudents();
        },
        onArrowDown() {
            if (this.arrowCounter < this.suggestions.length - 1) {
                this.arrowCounter++;
            }
        },
        onArrowUp() {
            if (this.arrowCounter > 0) {
                this.arrowCounter--;
            }
        },
        onEnter() {
            if (this.arrowCounter !== -1) {
                this.selectSuggestion(this.suggestions[this.arrowCounter]);
            } else {
                this.showAutocomplete = false;
            }
        },
        goToPage(p) {
            if (p < 1 || p > this.meta.total_pages) return;
            this.filters.page = p;
            this.fetchStudents();
        },
        goToForm(id) {
            if (id) {
                this.$router.push({ path: '/student/form', query: { id: id }});
            } else {
                this.$router.push('/student/form');
            }
        },
        viewDetail(id) {
            this.destroyTooltips();
            this.$router.push('/student/detail/' + id);
        },
        editInscription(id) {
            this.destroyTooltips();
            this.$router.push('/students/inscription?id=' + id);
        },
        viewGrades(id) {
            this.destroyTooltips();
            this.$router.push('/student/grades/' + id);
        },
        collectPayment(id) {
            this.destroyTooltips();
            this.$router.push('/student/collect/' + id);
        },
        promoteStudent(id) {
            this.destroyTooltips();
            this.$router.push('/students/promotion?student_id=' + id);
        },
        async fetchStudents() {
            this.destroyTooltips();
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const query = new URLSearchParams({
                    search: this.filters.search,
                    career: this.filters.career,
                    page: this.filters.page,
                    per_page: this.filters.per_page
                }).toString();

                const response = await fetch(window.API_BASE + '/api/students?' + query, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();

                if (result.status === 'success') {
                    this.students = result.data;
                    this.meta = result.meta;
                }
            } catch (error) {
                console.error("Error al cargar estudiantes:", error);
            } finally {
                this.loading = false;
                this.$nextTick(() => {
                    this.initTooltips();
                });
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
                console.error("Error al cargar carreras:", error);
            }
        },
        initTooltips() {
            const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
            this.tooltipInstances = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl);
            });
        },
        exportToPdf() {
            // Utilizamos el print del navegador que permite guardado como PDF
            window.print();
        },
        printList() {
            window.print();
        },
        destroyTooltips() {
            if (this.tooltipInstances) {
                this.tooltipInstances.forEach(tooltip => tooltip.dispose());
                this.tooltipInstances = [];
            }
            // Remove any leftover tooltip elements from the DOM
            const leftovers = document.querySelectorAll('.tooltip');
            leftovers.forEach(el => el.remove());
        }
    },
    async mounted() {
        await this.fetchCareers();
        await this.fetchStudents();
    }
}
