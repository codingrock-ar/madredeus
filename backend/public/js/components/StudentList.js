export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <!-- FILTROS SUPERIORES -->
            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <label class="form-label small fw-bold text-muted mb-1">Buscar Alumno</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i class="ph ph-magnifying-glass text-muted"></i></span>
                        <input type="text" class="form-control border-start-0 ps-0" 
                               placeholder="DNI, Apellido o Nombre..." 
                               v-model="filters.search" 
                               @input="onSearchInput"
                               @keydown.down="onArrowDown"
                               @keydown.up="onArrowUp"
                               @keydown.enter="onEnter"
                               @keyup.esc="showAutocomplete = false"
                               @focus="showAutocomplete = suggestions.length > 0"
                               @blur="onBlur">
                        
                        <!-- Lista de Autocompletado -->
                        <ul class="autocomplete-results shadow-lg list-group position-absolute w-100 mt-5" 
                            style="z-index: 1000; top: 0;"
                            v-if="showAutocomplete && suggestions.length > 0">
                            <li class="list-group-item list-group-item-action py-2 border-0 border-bottom d-flex align-items-center gap-2"
                                v-for="(student, i) in suggestions" 
                                :key="student.id"
                                @click="selectSuggestion(student)"
                                :class="{ 'bg-light active-suggestion': i === arrowCounter }"
                                style="cursor: pointer;">
                                <div class="avatar-sm bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px; font-size: 0.75rem;">
                                    {{ student.name.charAt(0) }}{{ student.lastname.charAt(0) }}
                                </div>
                                <div>
                                    <div class="fw-bold fs-7">{{ student.lastname }}, {{ student.name }}</div>
                                    <div class="extra-small text-muted">DNI: {{ student.dni }} | Legajo: #{{ student.id }}</div>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="col-md-6 text-end d-flex align-items-end justify-content-end gap-2">
                    <button class="btn btn-outline-danger shadow-sm" @click="exportToPdf">
                        <i class="ph ph-file-pdf me-1"></i> PDF
                    </button>
                    <button class="btn btn-outline-secondary shadow-sm" @click="printList">
                        <i class="ph ph-printer me-1"></i> Imprimir
                    </button>
                    <button class="btn btn-primary shadow-sm" @click="goToForm()">
                        <i class="ph ph-plus-circle me-1"></i> Nuevo Alumno
                    </button>
                </div>
            </div>

            <div class="row g-3 mb-4 p-3 bg-light rounded-3 border-dashed">
                <div class="col-md-3">
                    <label class="form-label small fw-bold text-muted mb-1">Carrera</label>
                    <select class="form-select" v-model="filters.career" @change="fetchStudents">
                        <option value="">Todas las Carreras</option>
                        <option value="none">Ninguna</option>
                        <option value="single">1 Carrera</option>
                        <option value="multiple">+ de 1 Carrera</option>
                        <option v-for="career in careers" :key="career.id" :value="career.title">
                            {{ career.title }}
                        </option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold text-muted mb-1">Comisión</label>
                    <select class="form-select" v-model="filters.commission" @change="fetchStudents">
                        <option value="">Todas</option>
                        <option value="A">Comisión A</option>
                        <option value="B">Comisión B</option>
                        <option value="C">Comisión C</option>
                        <option value="D">Comisión D</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold text-muted mb-1">Período</label>
                    <select class="form-select" v-model="filters.academic_cycle" @change="fetchStudents">
                        <option value="">Todos</option>
                        <option v-for="n in 6" :key="n" :value="n">Período {{ n }}</option>
                        <option value="Egresó">Egresó</option>
                        <option value="Finalizó Cursada">Finalizó Cursada</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold text-muted mb-1">Turno</label>
                    <select class="form-select" v-model="filters.shift" @change="fetchStudents">
                        <option value="">Todos los Turnos</option>
                        <option value="TM">Mañana (TM)</option>
                        <option value="TT">Tarde (TT)</option>
                        <option value="TN">Noche (TN)</option>
                    </select>
                </div>
                <div class="col-md-3 d-flex align-items-end">
                    <div class="d-flex gap-2 w-100">
                        <div class="flex-grow-1">
                            <label class="form-label small fw-bold text-muted mb-1">Estado</label>
                            <select class="form-select" v-model="filters.status" @change="fetchStudents">
                                <option value="">Todos los Estados</option>
                                <option value="En Curso">En Curso</option>
                                <option value="Abandono">Abandono</option>
                                <option value="Egresado">Egresado</option>
                                <option value="Finalizó Cursada">Finalizó Cursada</option>
                            </select>
                        </div>
                        <button class="btn btn-outline-secondary" @click="clearFilters" title="Limpiar Filtros" style="height: 38px; margin-top: 27px;">
                            <i class="ph ph-arrow-counter-clockwise"></i>
                        </button>
                    </div>
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
                            <td class="text-end pe-4">
                                <div class="d-flex justify-content-end gap-1">
                                    <router-link :to="'/student/detail/' + student.id" class="btn btn-icon btn-sm btn-outline-info" title="Ver detalle">
                                        <i class="ph ph-eye"></i>
                                    </router-link>
                                    <router-link :to="'/students/inscription?id=' + student.id" class="btn btn-icon btn-sm btn-outline-warning" title="Editar Inscripción">
                                        <i class="ph ph-user-plus"></i>
                                    </router-link>
                                    <router-link :to="'/student/form?id=' + student.id" class="btn btn-icon btn-sm btn-outline-primary" title="Editar">
                                        <i class="ph ph-pencil-simple"></i>
                                    </router-link>
                                    <router-link :to="'/student/detail/' + student.id + '?tab=grades'" class="btn btn-icon btn-sm btn-outline-success" title="Calificaciones">
                                        <i class="ph ph-graduation-cap"></i>
                                    </router-link>
                                    <router-link :to="'/student/detail/' + student.id + '?tab=payments&action=collect'" class="btn btn-icon btn-sm btn-outline-dark" title="Cobrar">
                                        <i class="ph ph-currency-dollar"></i>
                                    </router-link>
                                    <router-link :to="'/students/promotion?student_id=' + student.id" class="btn btn-icon btn-sm btn-outline-secondary" title="Promocionar">
                                        <i class="ph ph-fast-forward"></i>
                                    </router-link>
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
                        <li class="page-item" v-for="p in visiblePages" :key="p" :class="{ active: meta.page === p, disabled: p === '...' }">
                            <a class="page-link" href="#" @click.prevent="p !== '...' && goToPage(p)">{{ p }}</a>
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
                commission: '',
                academic_cycle: '',
                shift: '',
                status: '',
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
    computed: {
        visiblePages() {
            const pages = [];
            const total = this.meta.total_pages;
            const current = this.meta.page;
            
            if (total <= 10) {
                for (let i = 1; i <= total; i++) pages.push(i);
            } else {
                pages.push(1);
                if (current > 4) pages.push('...');
                
                const start = Math.max(2, current - 2);
                const end = Math.min(total - 1, current + 2);
                
                for (let i = start; i <= end; i++) pages.push(i);
                
                if (current < total - 3) pages.push('...');
                pages.push(total);
            }
            return pages;
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
                // Persistencia: Guardar filtros actuales
                sessionStorage.setItem('student_filters', JSON.stringify(this.filters));

                const token = localStorage.getItem('token');
                const query = new URLSearchParams({
                    search: this.filters.search,
                    career: this.filters.career,
                    commission: this.filters.commission,
                    academic_cycle: this.filters.academic_cycle,
                    shift: this.filters.shift,
                    status: this.filters.status,
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
        },
        handleClickOutside(e) {
            if (this.$el && !this.$el.contains(e.target)) {
                this.showAutocomplete = false;
            }
        },
        onBlur() {
            // Delay to allow selectSuggestion to fire if a click happened
            setTimeout(() => {
                this.showAutocomplete = false;
            }, 200);
        },
        clearFilters() {
            this.filters = {
                search: '',
                career: '',
                commission: '',
                academic_cycle: '',
                shift: '',
                status: '',
                page: 1,
                per_page: 10
            };
            sessionStorage.removeItem('student_filters');
            this.fetchStudents();
        }
    },
    async mounted() {
        // Cargar filtros persistentes si existen
        const savedFilters = sessionStorage.getItem('student_filters');
        if (savedFilters) {
            try {
                this.filters = JSON.parse(savedFilters);
            } catch (e) {
                console.error("Error parsing saved filters", e);
            }
        }

        await this.fetchCareers();
        await this.fetchStudents();
        document.addEventListener('click', this.handleClickOutside);
    },
    unmounted() {
        document.removeEventListener('click', this.handleClickOutside);
    }
}
