export default {
    template: `
    <div class="fade-in" v-if="student">
        <!-- Breadcrumb / Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item"><router-link to="/students">Alumnos</router-link></li>
                    <li class="breadcrumb-item active">{{ student.lastname }}, {{ student.name }}</li>
                </ol>
            </nav>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm" @click="printDetail">
                    <i class="ph ph-printer me-1"></i> Imprimir
                </button>
                <router-link :to="'/student/form?id=' + student.id" class="btn btn-primary btn-sm">
                    <i class="ph ph-pencil me-1"></i> Editar
                </router-link>
                <router-link :to="'/students/promotion?student_id=' + student.id" class="btn btn-secondary btn-sm">
                    <i class="ph ph-fast-forward me-1"></i> Promocionar
                </router-link>
            </div>
        </div>

        <div class="row">
            <!-- Sidebar Detalle Estudiante -->
            <div class="col-md-3">
                <div class="card-modern p-4 text-center mb-4 sticky-top" style="top: 20px;">
                    <div class="position-relative d-inline-block mb-3">
                        <img :src="student.photo || 'https://ui-avatars.com/api/?name=' + student.name + '+' + student.lastname + '&size=128&background=random'" 
                             class="rounded-circle shadow-sm border" 
                             style="width: 120px; height: 120px; object-fit: cover;">
                        <span class="position-absolute bottom-0 end-0 border border-white rounded-circle p-1" 
                              :class="statusBadgeClass" style="width: 20px; height: 20px;"></span>
                    </div>
                    <h5 class="fw-bold mb-1 text-uppercase">{{ student.lastname }}, {{ student.name }}</h5>
                    <p class="text-muted small mb-2">ID: #{{ student.id }} | DNI: {{ student.dni }}</p>
                    <span class="badge" :class="statusBadgeClass">{{ student.status }}</span>
                    
                    <hr class="my-3">
                    
                    <div class="text-start small">
                        <div class="mb-3">
                            <label class="text-muted d-block small mb-0">Carrera</label>
                            <span class="fw-bold">{{ student.career }}</span>
                        </div>
                        <div class="mb-3">
                            <label class="text-muted d-block small mb-0">Comisión / Turno</label>
                            <span class="fw-bold">{{ student.commission || '-' }} ({{ student.shift || '-' }})</span>
                        </div>
                        <div class="mb-3">
                            <label class="text-muted d-block small mb-0">Ciclo Lectivo</label>
                            <span class="fw-bold">{{ student.academic_cycle || '-' }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contenido Principal -->
            <div class="col-md-9" id="printableArea">
                <div class="card-modern overflow-hidden">
                    <div class="bg-light border-bottom px-3 pt-3">
                        <ul class="nav nav-tabs border-0" id="detailTabs">
                            <li class="nav-item">
                                <a class="nav-link" :class="{active: activeTab === 'general'}" href="#" @click.prevent="activeTab = 'general'">
                                    <i class="ph ph-user me-2"></i>General
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" :class="{active: activeTab === 'academic'}" href="#" @click.prevent="activeTab = 'academic'">
                                    <i class="ph ph-book-open me-2"></i>Académico
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" :class="{active: activeTab === 'grades'}" href="#" @click.prevent="activeTab = 'grades'">
                                    <i class="ph ph-notebook me-2"></i>Calificaciones
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" :class="{active: activeTab === 'payments'}" href="#" @click.prevent="activeTab = 'payments'">
                                    <i class="ph ph-currency-dollar me-2"></i>Pagos
                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" :class="{active: activeTab === 'docs'}" href="#" @click.prevent="activeTab = 'docs'">
                                    <i class="ph ph-folder me-2"></i>Documentos
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div class="p-4">
                        <!-- TAB: GENERAL -->
                        <div v-show="activeTab === 'general'" class="fade-in">
                            <div class="row g-4">
                                <div class="col-12">
                                    <h6 class="fw-bold mb-3 border-bottom pb-2">Datos Personales</h6>
                                    <div class="row">
                                        <div class="col-md-4 mb-3">
                                            <label class="text-muted d-block small mb-0">Nombres / Apellidos</label>
                                            <span class="fw-bold text-uppercase">{{ student.name }} / {{ student.lastname }}</span>
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="text-muted d-block small mb-0">Documento ({{ student.document_type || 'DNI' }})</label>
                                            <span class="fw-bold">{{ student.dni }}</span>
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="text-muted d-block small mb-0">Fecha de Nacimiento</label>
                                            <span class="fw-bold">{{ student.birthdate || '-' }}</span>
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="text-muted d-block small mb-0">Lugar de Nacimiento</label>
                                            <span class="fw-bold">{{ student.birth_place || '-' }}</span>
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="text-muted d-block small mb-0">Nacionalidad</label>
                                            <span class="fw-bold">{{ student.nationality || '-' }}</span>
                                        </div>
                                        <div class="col-md-4 mb-3">
                                            <label class="text-muted d-block small mb-0">Estado Civil</label>
                                            <span class="fw-bold">{{ student.civil_status || '-' }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <h6 class="fw-bold mb-3 border-bottom pb-2">Información de Contacto</h6>
                                    <p class="mb-2 small"><strong>Email:</strong> {{ student.email || '-' }}</p>
                                    <p class="mb-2 small"><strong>Tel. Móvil:</strong> {{ student.phone_mobile || '-' }}</p>
                                    <p class="mb-2 small"><strong>Tel. Fijo:</strong> {{ student.phone_landline || '-' }}</p>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="fw-bold mb-3 border-bottom pb-2">Domicilio</h6>
                                    <p class="mb-2 small"><strong>Calle/Nro:</strong> {{ student.address_street }} {{ student.address_number }}</p>
                                    <p class="mb-2 small"><strong>Tipo:</strong> {{ student.address_type || '-' }}</p>
                                    <p class="mb-2 small"><strong>Localidad:</strong> {{ student.address_locality }} ({{ student.address_province || '-' }})</p>
                                    <p class="mb-0 small"><strong>Código Postal:</strong> {{ student.address_zip_code || '-' }}</p>
                                </div>
                                
                                <div class="col-12 mt-4">
                                    <h6 class="fw-bold mb-3 border-bottom pb-2">Estudios Previos</h6>
                                    <div class="row">
                                        <div class="col-md-4 mb-2">
                                            <p class="small mb-0 text-muted">Nivel Máximo</p>
                                            <span class="fw-bold">{{ student.max_education_level || '-' }}</span>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <p class="small mb-0 text-muted">¿Finalizado?</p>
                                            <span class="fw-bold">{{ student.education_finished === 'Si' ? 'SI' : 'NO' }}</span>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <p class="small mb-0 text-muted">Título Obtenido</p>
                                            <span class="fw-bold">{{ student.degree_obtained || '-' }}</span>
                                        </div>
                                        <div class="col-md-12">
                                            <p class="small mb-0 text-muted">Institución</p>
                                            <span class="fw-bold">{{ student.institution || '-' }}</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-12 mt-4" v-if="student.notes">
                                    <h6 class="fw-bold mb-3 border-bottom pb-2">Observaciones Generales</h6>
                                    <div class="bg-light p-3 rounded small italic text-muted">
                                        {{ student.notes }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- TAB: ACADEMIC -->
                        <div v-show="activeTab === 'academic'" class="fade-in">
                            <div class="row g-4">
                                <div class="col-12">
                                    <h6 class="fw-bold mb-3 border-bottom pb-2">Ficha Académica</h6>
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <label class="text-muted d-block small mb-0">Carrera</label>
                                            <span class="fw-bold text-primary">{{ student.career }}</span>
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label class="text-muted d-block small mb-0">Ciclo Lectivo</label>
                                            <span class="fw-bold">{{ student.academic_cycle || '-' }}</span>
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label class="text-muted d-block small mb-0">Comisión</label>
                                            <span class="fw-bold">{{ student.commission || '-' }}</span>
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label class="text-muted d-block small mb-0">Turno</label>
                                            <span class="fw-bold">{{ student.shift || '-' }}</span>
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label class="text-muted d-block small mb-0">Libro</label>
                                            <span class="fw-bold">{{ student.book || '-' }}</span>
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label class="text-muted d-block small mb-0">Folio</label>
                                            <span class="fw-bold">{{ student.folio || '-' }}</span>
                                        </div>
                                        <div class="col-md-3 mb-3">
                                            <label class="text-muted d-block small mb-0">Estado Actual</label>
                                            <span class="badge" :class="statusBadgeClass">{{ student.status }}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-12" v-if="student.found_institution">
                                    <h6 class="fw-bold mb-3 border-bottom pb-2">¿Cómo nos conoció?</h6>
                                    <div class="small p-2 bg-light rounded text-muted">
                                        {{ formatFound(student.found_institution) }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- TAB: GRADES -->
                        <div v-show="activeTab === 'grades'" class="fade-in">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="fw-bold mb-0">Estado de Situación Académica</h6>
                                <span class="badge bg-soft-success">Promedio: 8.45</span>
                            </div>
                            <!-- Mock table remains same for now as backend for grades isn't ready -->
                            <div class="table-responsive">
                                <table class="table table-sm align-middle small">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Materia</th>
                                            <th class="text-center">Parcial 1</th>
                                            <th class="text-center">Parcial 2</th>
                                            <th class="text-center">Final</th>
                                            <th class="text-center">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>ANATOMOFISIOLOGIA</td>
                                            <td class="text-center">8</td>
                                            <td class="text-center">7</td>
                                            <td class="text-center">9</td>
                                            <td class="text-center"><span class="badge border text-success">Aprobado</span></td>
                                        </tr>
                                        <tr>
                                            <td>MICROBIOLOGIA</td>
                                            <td class="text-center">9</td>
                                            <td class="text-center">8</td>
                                            <td class="text-center">-</td>
                                            <td class="text-center"><span class="badge border text-primary">Cursando</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- TAB: PAYMENTS -->
                        <div v-show="activeTab === 'payments'" class="fade-in">
                            <div class="alert alert-info py-2 d-flex align-items-center small mb-4">
                                <i class="ph ph-info me-2 fs-5"></i>
                                Próximo vencimiento: 10 de Abril, 2024
                            </div>
                            <h6 class="fw-bold mb-3">Historial de Pagos</h6>
                            <div class="table-responsive">
                                <table class="table table-sm align-middle small">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Concepto</th>
                                            <th>Fecha</th>
                                            <th>Monto</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Matrícula 2024</td>
                                            <td>05/03/2024</td>
                                            <td>$15.000,00</td>
                                            <td><span class="text-success fw-bold">Pagado</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <!-- TAB: DOCS -->
                        <div v-show="activeTab === 'docs'" class="fade-in">
                            <h6 class="fw-bold mb-3">Estado de Documentación</h6>
                            <div class="row">
                                <div class="col-md-6 border-end">
                                    <ul class="list-group list-group-flush small">
                                        <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span>Fotocopia del DNI</span>
                                            <i :class="student.req_dni_photocopy ? 'ph-check-circle text-success' : 'ph-x-circle text-danger'" class="ph fs-5"></i>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <div>
                                                <span>Fotocopia del título</span>
                                                <div v-if="student.req_degree_photocopy_obs" class="extra-small text-muted">{{student.req_degree_photocopy_obs}}</div>
                                            </div>
                                            <i :class="student.req_degree_photocopy ? 'ph-check-circle text-success' : 'ph-x-circle text-danger'" class="ph fs-5"></i>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span>Dos fotos 4x4</span>
                                            <i :class="student.req_two_photos ? 'ph-check-circle text-success' : 'ph-x-circle text-danger'" class="ph fs-5"></i>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span>Apto Psicofísico</span>
                                            <i :class="student.req_psychophysical ? 'ph-check-circle text-success' : 'ph-x-circle text-danger'" class="ph fs-5"></i>
                                        </li>
                                    </ul>
                                </div>
                                <div class="col-md-6 px-md-4">
                                     <ul class="list-group list-group-flush small">
                                        <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span>Libreta de Estudiante</span>
                                            <i :class="student.req_student_book ? 'ph-check-circle text-success' : 'ph-x-circle text-danger'" class="ph fs-5"></i>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span>Título Secundario Original</span>
                                            <i :class="student.req_final_degree ? 'ph-check-circle text-success' : 'ph-x-circle text-danger'" class="ph fs-5"></i>
                                        </li>
                                        <li class="list-group-item d-flex justify-content-between align-items-center px-0">
                                            <span>Certificado de Vacunas</span>
                                            <i :class="student.req_vaccines ? 'ph-check-circle text-success' : 'ph-x-circle text-danger'" class="ph fs-5"></i>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
        <p class="mt-2 text-muted">Cargando datos del alumno...</p>
    </div>
    <div v-else class="alert alert-danger">
        Error al cargar los datos del alumno.
    </div>
    `,
    data() {
        return {
            student: null,
            loading: true,
            activeTab: 'general'
        }
    },
    computed: {
        statusBadgeClass() {
            if (!this.student) return '';
            switch(this.student.status) {
                case 'En Curso': return 'bg-soft-success text-success';
                case 'Abandono': return 'bg-soft-danger text-danger';
                case 'Egresado': return 'bg-soft-info text-info';
                default: return 'bg-soft-warning text-warning';
            }
        }
    },
    async mounted() {
        const id = this.$route.params.id;
        if (id) {
            await this.fetchStudent(id);
        }
    },
    methods: {
        async fetchStudent(id) {
            this.loading = true;
            try {
                const response = await fetch(window.API_BASE + '/api/students/' + id);
                const result = await response.json();
                if (result.status === 'success') {
                    this.student = result.data;
                }
            } catch (error) {
                console.error("Error fetching student detail:", error);
            } finally {
                this.loading = false;
            }
        },
        formatFound(val) {
            if (!val) return '-';
            try {
                const parsed = JSON.parse(val);
                return Array.isArray(parsed) ? parsed.join(', ') : val;
            } catch (e) {
                return val;
            }
        },
        printDetail() {
            window.print();
        }
    }
}
