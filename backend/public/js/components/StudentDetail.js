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
                <button class="btn btn-soft-info btn-sm" @click="sendLegajo" :disabled="sendingLegajo">
                    <i class="ph" :class="sendingLegajo ? 'ph-spinner-gap animate-spin' : 'ph-envelope-simple-open'"></i> 
                    {{ sendingLegajo ? 'Enviando...' : 'Enviar Legajo' }}
                </button>
                <router-link :to="'/student/form?id=' + student.id" class="btn btn-primary btn-sm">
                    <i class="ph ph-pencil me-1"></i> Editar
                </router-link>
                <button class="btn btn-outline-success btn-sm" @click="activeTab = 'grades'">
                    <i class="ph ph-graduation-cap me-1"></i> Calificaciones
                </button>
                <button class="btn btn-outline-dark btn-sm" @click="activeTab = 'payments'">
                    <i class="ph ph-currency-dollar me-1"></i> Pagos
                </button>
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
                    <div class="d-flex flex-wrap justify-content-center gap-1 mb-2">
                        <span v-for="ins in (student.inscriptions || [])" :key="'badge-'+ins.id" 
                              class="badge" :class="getBadgeClass(ins.status)">
                            {{ ins.status }}
                        </span>
                    </div>
                    
                    <hr class="my-3">
                    
                    <div class="text-start small">
                        <div v-for="ins in (student.inscriptions || [])" :key="ins.id" class="mb-3 border-start ps-2 border-primary">
                            <label class="text-muted d-block small mb-0">{{ ins.career_title }}</label>
                            <span class="fw-bold d-block">{{ ins.commission || '-' }} ({{ ins.shift || '-' }})</span>
                            <span class="text-muted extra-small">Ciclo: {{ ins.academic_cycle || '-' }} | Libro/Folio: {{ ins.book || '-' }}/{{ ins.folio || '-' }}</span>
                        </div>
                        <div v-if="!student.inscriptions || student.inscriptions.length === 0" class="text-muted italic">
                            Sin inscripciones activas
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
                                <a class="nav-link" :class="{active: activeTab === 'contact'}" href="#" @click.prevent="activeTab = 'contact'">
                                    <i class="ph ph-phone me-2"></i>Contacto
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

                        <!-- TAB: CONTACTO -->
                        <div v-show="activeTab === 'contact'" class="fade-in">
                            <div class="row g-4">
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
                            </div>
                        </div>

                        <!-- TAB: ACADEMIC -->
                        <div v-show="activeTab === 'academic'" class="fade-in">
                            <div class="row g-4">
                                <div class="col-12">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h6 class="fw-bold mb-0 border-bottom pb-2 w-100">Inscripciones a Carreras</h6>
                                    </div>
                                    
                                    <div v-for="(ins, idx) in (student.inscriptions || [])" :key="ins.id" class="card border mb-3">
                                        <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                            <span class="fw-bold text-primary"><i class="ph ph-graduation-cap me-2"></i>{{ ins.career_title }}</span>
                                            <span v-if="idx === 0" class="badge bg-primary extra-small">Preferida</span>
                                        </div>
                                        <div class="card-body p-3">
                                            <div class="row">
                                                <div class="col-md-3 mb-2">
                                                    <label class="text-muted d-block extra-small mb-0">Ciclo Lectivo</label>
                                                    <span class="small fw-bold">{{ ins.academic_cycle || '-' }}</span>
                                                </div>
                                                <div class="col-md-2 mb-2">
                                                    <label class="text-muted d-block extra-small mb-0">Comisión</label>
                                                    <span class="small fw-bold">{{ ins.commission || '-' }}</span>
                                                </div>
                                                <div class="col-md-2 mb-2">
                                                    <label class="text-muted d-block extra-small mb-0">Turno</label>
                                                    <span class="small fw-bold">{{ ins.shift || '-' }}</span>
                                                </div>
                                                <div class="col-md-3 mb-2">
                                                    <label class="text-muted d-block extra-small mb-0">Estado</label>
                                                    <span class="badge rounded-pill" 
                                                          :class="{'badge-soft-success': ins.status === 'En Curso', 'badge-soft-danger': ins.status === 'Abandono', 'badge-soft-info': ins.status === 'Egresado'}">
                                                        {{ ins.status }}
                                                    </span>
                                                </div>
                                                <div class="col-md-2 mb-2 text-end">
                                                    <label class="text-muted d-block extra-small mb-0">Libro/Folio</label>
                                                    <span class="small">{{ ins.book || '-' }}/{{ ins.folio || '-' }}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div v-if="!student.inscriptions || student.inscriptions.length === 0" class="text-muted small text-center py-4">
                                        No hay inscripciones registradas.
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
                            <div v-if="student.inscriptions && student.inscriptions.length > 0">
                                <div v-for="ins in student.inscriptions" :key="'ins-grades-' + ins.id" class="mb-5">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h6 class="fw-bold mb-0 text-primary"><i class="ph ph-graduation-cap me-2"></i>{{ ins.career_title }}</h6>
                                        <span class="badge bg-soft-success text-success fw-bold">Promedio: {{ calculateAverage(ins.subjects) }}</span>
                                    </div>
                                    
                                    <div v-if="ins.subjects && ins.subjects.length > 0">
                                        <div v-for="year in getYears(ins.subjects)" :key="year" class="mb-4">
                                            <div class="bg-light p-2 rounded mb-2 fw-bold small">AÑO {{ year }}</div>
                                            <div class="row g-3">
                                                <div v-for="q in [1, 2]" :key="q" class="col-md-6">
                                                    <div class="border rounded p-3 h-100">
                                                        <h7 class="fw-bold d-block mb-2 text-muted extra-small text-uppercase">Cuatrimestre {{ q }}</h7>
                                                        <ul class="list-group list-group-flush small">
                                                            <li v-for="sub in filterSubjects(ins.subjects, year, q)" :key="sub.id" 
                                                                class="list-group-item px-0 py-1 d-flex justify-content-between align-items-center border-dashed">
                                                                <span>{{ sub.name }}</span>
                                                                <span class="badge extra-small" :class="getGradeBadgeClass(sub.grade_status)">
                                                                    {{ sub.grade ? sub.grade : (sub.grade_status || 'Pendiente') }}
                                                                </span>
                                                            </li>
                                                            <li v-if="filterSubjects(ins.subjects, year, q).length === 0" class="list-group-item px-0 py-1 text-muted extra-small italic">
                                                                No hay materias asigancdas.
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-else class="text-center py-4 text-muted small">
                                        No se encontraron materias cargadas para este plan de estudios.
                                    </div>
                                    <hr v-if="student.inscriptions.length > 1" class="my-4">
                                </div>
                            </div>
                            <div v-else class="text-center py-5">
                                <i class="ph ph-mask-sad fs-1 text-muted mb-2"></i>
                                <p class="text-muted small">El alumno no tiene inscripciones activas para ver calificaciones.</p>
                            </div>
                        </div>

                        <!-- TAB: PAYMENTS -->
                        <div v-show="activeTab === 'payments'" class="fade-in">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="fw-bold mb-0">Historial de Pagos</h6>
                                <div class="d-flex gap-2">
                                    <button class="btn btn-soft-primary btn-sm" @click="generatePlanModal = true">
                                        <i class="ph ph-graduation-cap me-1"></i>Matricular en Carrera
                                    </button>
                                    <button class="btn btn-primary btn-sm" @click="showNewPaymentModal()">
                                        <i class="ph ph-plus me-1"></i>Registrar Pago
                                    </button>
                                </div>
                            </div>
                            <div class="table-responsive">
                                <table class="table table-sm align-middle small">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Tipo</th>
                                            <th>Concepto</th>
                                            <th>Vencimiento</th>
                                            <th>Monto</th>
                                            <th>Estado</th>
                                            <th class="text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody v-if="student.payments && student.payments.length > 0">
                                        <tr v-for="p in student.payments" :key="p.id">
                                            <td class="text-center">
                                                <i v-if="p.type === 'Matrícula'" class="ph ph-star text-warning fs-5" title="Matrícula"></i>
                                                <i v-else-if="p.type === 'Cuota'" class="ph ph-calendar text-primary fs-5" title="Cuota"></i>
                                                <i v-else class="ph ph-tag text-secondary fs-5" title="Otro"></i>
                                            </td>
                                            <td>
                                                <span class="fw-bold">{{ p.concept }}</span>
                                                <div v-if="p.details" class="extra-small text-muted">{{ formatDetails(p.details) }}</div>
                                            </td>
                                            <td>
                                                <span :class="getDueDateClass(p.due_date, p.status)">
                                                    {{ formatDate(p.due_date) }}
                                                    <span v-if="p.status === 'Pendiente'" class="d-block extra-small">{{ getDueDaysText(p.due_date) }}</span>
                                                </span>
                                            </td>
                                            <td class="fw-bold text-dark">
                                                $ {{ formatCurrency(p.amount, p) }}
                                                <div v-if="p.status === 'Pendiente' && isLate(p.due_date)" class="extra-small text-danger fw-bold mt-1">
                                                    <i class="ph ph-warning-circle"></i> Incluye recargo
                                                </div>
                                            </td>

                                            <td>
                                                <span class="badge rounded-pill" :class="p.status === 'Pagado' ? 'bg-success' : (p.status === 'Anulado' ? 'bg-secondary' : (isLate(p.due_date) ? 'bg-danger' : 'bg-warning text-dark'))">
                                                    {{ p.status === 'Pendiente' && isLate(p.due_date) ? 'Pendiente Vencido' : p.status }}
                                                </span>
                                            </td>
                                            <td class="text-end">
                                                <div class="d-flex justify-content-end gap-1">
                                                    <button v-if="p.status === 'Pendiente'" class="btn btn-icon btn-sm btn-soft-primary" title="Cobrar" @click="collectPayment(p)">
                                                        <i class="ph ph-currency-dollar"></i>
                                                    </button>
                                                    <button v-if="p.status === 'Pendiente'" class="btn btn-icon btn-sm btn-soft-warning" title="Notificar Deuda" @click="sendPaymentReminder()">
                                                        <i class="ph ph-bell"></i>
                                                    </button>
                                                    <button class="btn btn-icon btn-sm btn-soft-danger" title="Eliminar" @click="deletePayment(p.id)">
                                                        <i class="ph ph-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                    <tbody v-else>
                                        <tr>
                                            <td colspan="6" class="text-center py-4 text-muted small">
                                                No hay pagos registrados para este alumno.
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <!-- MODAL: MATRICULAR (GENERAR PLAN) -->
                            <div v-if="generatePlanModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); z-index: 1050;">
                                <div class="modal-dialog modal-md modal-dialog-centered">
                                    <div class="modal-content shadow-lg border-0">
                                        <div class="modal-header bg-primary text-white">
                                            <h5 class="modal-title fw-bold"><i class="ph ph-calendar-plus me-2"></i>Matricular en Carrera</h5>
                                            <button type="button" class="btn-close btn-close-white" @click="generatePlanModal = false"></button>
                                        </div>
                                        <div class="modal-body p-4">
                                            <div class="alert alert-warning small mb-4">
                                                <i class="ph ph-warning-circle me-2"></i><strong>Atención:</strong> Al matricular, se anularán los pagos pendientes actuales del alumno para evitar duplicidad de deuda.
                                            </div>

                                            <div class="row g-3">
                                                <div class="col-12">
                                                    <label class="form-label small fw-bold">Ciclo de Inicio</label>
                                                    <select class="form-select" v-model="planConfig.start_cycle">
                                                        <option value="Marzo">Marzo (Cuotas Mar-Dic)</option>
                                                        <option value="Agosto">Agosto (Cuotas Ago-Dic / Mar-Jul)</option>
                                                    </select>
                                                </div>

                                                <div class="col-12">
                                                    <div class="form-check mb-2">
                                                        <input class="form-check-input" type="checkbox" id="genMatricula" v-model="planConfig.include_matricula">
                                                        <label class="form-check-label fw-bold" for="genMatricula">Incluir Matrícula</label>
                                                    </div>
                                                    <div v-if="planConfig.include_matricula" class="row g-2 ps-4">
                                                        <div class="col-md-6">
                                                            <label class="form-label small">Monto Matrícula</label>
                                                            <input type="number" class="form-control" v-model.number="planConfig.matricula_amount">
                                                        </div>
                                                        <div class="col-md-6">
                                                            <label class="form-label small">Vencimiento</label>
                                                            <input type="date" class="form-control" v-model="planConfig.matricula_due_date">
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="col-12">
                                                    <label class="form-label small fw-bold">Valor de la Cuota</label>
                                                    <div class="input-group">
                                                        <span class="input-group-text">$</span>
                                                        <input type="number" class="form-control" v-model.number="planConfig.quota_amount">
                                                    </div>
                                                    <div class="form-text extra-small">Se aplicará a las 10 cuotas mensuales.</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="modal-footer border-0 p-3 bg-light rounded-bottom">
                                            <button type="button" class="btn btn-light" @click="generatePlanModal = false">Cancelar</button>
                                            <button type="button" class="btn btn-primary px-4" @click="executeGeneratePlan" :disabled="generatingPlan">
                                                <span v-if="generatingPlan" class="spinner-border spinner-border-sm me-2"></span>
                                                Generar Plan Completo
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
            sendingLegajo: false,
            activeTab: this.$route.query.tab || 'general',
            generatePlanModal: false,
            generatingPlan: false,
            paymentConfigs: {
                quota_base_amount: 40000,
                matricula_base_amount: 50000
            },
            planConfig: {
                include_matricula: true,
                matricula_amount: 50000,
                matricula_due_date: new Date().toISOString().split('T')[0],
                start_cycle: 'Marzo',
                quota_amount: 40000
            }
        }
    },
    computed: {
        statusBadgeClass() {
            if (!this.student) return '';
            // Use the status of the first inscription as global status
            const status = (this.student.inscriptions && this.student.inscriptions.length > 0) 
                         ? this.student.inscriptions[0].status 
                         : this.student.status;
            
            switch(status) {
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
            await this.fetchPaymentConfigs();
            
            // Si viene con la acción de cobrar, abrimos el modal
            if (this.$route.query.action === 'collect') {
                this.showNewPaymentModal();
            }
        }
    },
    methods: {
        getBadgeClass(status) {
            switch(status) {
                case 'En Curso': return 'bg-soft-success text-success';
                case 'Abandono': return 'bg-soft-danger text-danger';
                case 'Egresado': return 'bg-soft-info text-info';
                default: return 'bg-soft-warning text-warning';
            }
        },
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
        },
        async sendLegajo() {
            if (!this.student.email) {
                alert("El alumno no tiene un correo electrónico registrado.");
                return;
            }

            if (!confirm(`¿Estás seguro de enviar el resumen de legajo a ${this.student.email}?`)) {
                return;
            }

            this.sendingLegajo = true;
            try {
                const response = await fetch(window.API_BASE + `/api/students/${this.student.id}/send-legajo`, {
                    method: 'POST'
                });
                const result = await response.json();
                
                if (result.status === 'success') {
                    alert("Legajo enviado con éxito.");
                } else {
                    alert("Error: " + result.message);
                }
            } catch (error) {
                console.error("Error sending legajo:", error);
                alert("Ocurrió un error al intentar enviar el legajo.");
            } finally {
                this.sendingLegajo = false;
            }
        },
        formatDate(dateStr) {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-AR');
        },
        formatCurrency(amount, p = null) {
            let total = parseFloat(amount);
            if (p && p.status === 'Pendiente' && this.isLate(p.due_date)) {
                const today = new Date();
                const due = new Date(p.due_date);
                
                // Si estamos en un mes posterior al vencimiento, ya aplica el máximo (20%)
                // Si estamos en el mismo mes, depende del día
                const isSameMonth = (today.getFullYear() === due.getFullYear() && today.getMonth() === due.getMonth());
                const day = today.getDate();

                if (!isSameMonth || day > 20) {
                    total *= 1.20; // 20% de interés
                } else if (day > 10) {
                    total *= 1.10; // 10% de interés
                }
            }
            return total.toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        },
        hasInterest(p) {
            if (!p || p.status !== 'Pendiente' || !this.isLate(p.due_date)) return false;
            const today = new Date();
            const due = new Date(p.due_date);
            const isSameMonth = (today.getFullYear() === due.getFullYear() && today.getMonth() === due.getMonth());
            const day = today.getDate();
            return !isSameMonth || day > 10;
        },
        formatDetails(details) {
            try {
                const parsed = JSON.parse(details);
                return Array.isArray(parsed) ? parsed.join(', ') : details;
            } catch (e) {
                return details;
            }
        },
        isLate(dueDate) {
            if (!dueDate) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            // Aseguramos que se interprete como fecha local al agregar la hora
            const due = new Date(dueDate + 'T00:00:00');
            return due < today;
        },
        getDueDateClass(dueDate, status) {
            if (status === 'Pagado' || status === 'Anulado') return 'text-muted';
            if (this.isLate(dueDate)) return 'text-danger fw-bold';
            return 'text-success fw-bold';
        },
        getDueDaysText(dueDate) {
            if (!dueDate) return '';
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const due = new Date(dueDate + 'T00:00:00');
            const diffTime = due - today;
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
                const dayOfMonth = today.getDate();
                if (dayOfMonth <= 10) return 'Vencido (Período de gracia)';
                if (dayOfMonth <= 20) return 'Vencido (1er Vencimiento)';
                return 'Vencido (2do Vencimiento)';
            }
            if (diffDays === 0) return 'Vence hoy';
            if (diffDays === 1) return 'Vence mañana';
            if (diffDays <= 7) return 'Vence esta semana';
            return `Vence en ${diffDays} días`;
        },
        getYears(subjects) {
            const years = [...new Set(subjects.map(s => s.academic_year))];
            return years.sort((a, b) => a - b);
        },
        filterSubjects(subjects, year, quarter) {
            return subjects.filter(s => s.academic_year == year && s.quarter == quarter);
        },
        getGradeBadgeClass(status) {
            if (!status) return 'border text-muted';
            let lower = status.toLowerCase();
            if (lower.includes('aprobado') || lower === 'regular') return 'bg-success';
            if (lower.includes('desaprobado') || lower === 'libre') return 'bg-danger';
            return 'bg-secondary';
        },
        calculateAverage(subjects) {
            if (!subjects || !subjects.length) return '-';
            let sum = 0;
            let count = 0;
            subjects.forEach(s => {
                let num = parseFloat(s.grade);
                if (!isNaN(num)) {
                    sum += num;
                    count++;
                }
            });
            return count > 0 ? (sum / count).toFixed(2) : '-';
        },
        async showNewPaymentModal(prefill = null) {
            let amountVal = '';
            let conceptVal = '';
            
            if (prefill) {
                // Calcular monto con interés si corresponde
                let total = parseFloat(prefill.amount);
                if (prefill.status === 'Pendiente' && this.isLate(prefill.due_date)) {
                    const today = new Date();
                    const due = new Date(prefill.due_date);
                    const isSameMonth = (today.getFullYear() === due.getFullYear() && today.getMonth() === due.getMonth());
                    const day = today.getDate();
                    if (!isSameMonth || day > 20) total *= 1.20;
                    else if (day > 10) total *= 1.10;
                }
                amountVal = total.toFixed(2);
                conceptVal = prefill.concept;
            }

            const { value: formValues } = await Swal.fire({
                title: prefill ? `Cobrar Concepto: ${prefill.concept}` : `Cobrar a: ${this.student.lastname}, ${this.student.name}`,
                html: `
                    <div class="text-start">
                        <div class="row g-2">
                            <div class="col-6">
                                <label class="form-label small fw-bold">Fecha</label>
                                <input id="swal-date" type="date" class="form-control form-control-sm mb-3" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="col-6">
                                <label class="form-label small fw-bold">Monto</label>
                                <input id="swal-amount" type="number" step="0.01" class="form-control form-control-sm mb-3" value="${amountVal}" placeholder="0.00">
                            </div>
                        </div>

                        <label class="form-label small fw-bold">Concepto</label>
                        <select id="swal-concept" class="form-select form-select-sm mb-3">
                            <option value="">Seleccione concepto...</option>
                            ${conceptVal && !['Matrícula', 'Matrícula Anual', 'Cuota 1', 'Cuota 2', 'Cuota 3', 'Cuota 4', 'Cuota 5', 'Cuota 6', 'Cuota 7', 'Cuota 8', 'Cuota 9', 'Cuota 10', 'Intereses', 'Otros'].includes(conceptVal) ? `
                                <option value="${conceptVal}" selected>${conceptVal}</option>
                            ` : ''}
                            <option value="Matrícula" ${conceptVal === 'Matrícula' ? 'selected' : ''}>Matrícula</option>
                            <option value="Matrícula Anual" ${conceptVal === 'Matrícula Anual' ? 'selected' : ''}>Matrícula Anual</option>
                            <option value="Cuota 1" ${conceptVal === 'Cuota 1' ? 'selected' : ''}>Cuota 1</option>
                            <option value="Cuota 2" ${conceptVal === 'Cuota 2' ? 'selected' : ''}>Cuota 2</option>
                            <option value="Cuota 3" ${conceptVal === 'Cuota 3' ? 'selected' : ''}>Cuota 3</option>
                            <option value="Cuota 4" ${conceptVal === 'Cuota 4' ? 'selected' : ''}>Cuota 4</option>
                            <option value="Cuota 5" ${conceptVal === 'Cuota 5' ? 'selected' : ''}>Cuota 5</option>
                            <option value="Cuota 6" ${conceptVal === 'Cuota 6' ? 'selected' : ''}>Cuota 6</option>
                            <option value="Cuota 7" ${conceptVal === 'Cuota 7' ? 'selected' : ''}>Cuota 7</option>
                            <option value="Cuota 8" ${conceptVal === 'Cuota 8' ? 'selected' : ''}>Cuota 8</option>
                            <option value="Cuota 9" ${conceptVal === 'Cuota 9' ? 'selected' : ''}>Cuota 9</option>
                            <option value="Cuota 10" ${conceptVal === 'Cuota 10' ? 'selected' : ''}>Cuota 10</option>
                            <option value="Intereses" ${conceptVal === 'Intereses' ? 'selected' : ''}>Intereses</option>
                            <option value="Otros" ${conceptVal === 'Otros' ? 'selected' : ''}>Otros</option>
                        </select>

                        <label class="form-label small fw-bold">Método</label>
                        <select id="swal-method" class="form-select form-select-sm mb-3">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Depósito">Depósito</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Registrar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const amount = document.getElementById('swal-amount').value;
                    const concept = document.getElementById('swal-concept').value;
                    const payment_date = document.getElementById('swal-date').value;
                    const payment_method = document.getElementById('swal-method').value;

                    if (!amount || !concept) {
                        Swal.showValidationMessage('Por favor complete los campos obligatorios');
                        return false;
                    }
                    return { student_id: this.student.id, amount, concept, payment_date, payment_method };
                }
            });

            if (formValues) {
                try {
                    let response;
                    if (prefill) {
                        // Si es un pago existente, lo actualizamos a 'Pagado'
                        response = await fetch(window.API_BASE + `/api/payments/${prefill.id}/process`, {
                            method: 'POST',
                            body: JSON.stringify({
                                paid_amount: formValues.amount,
                                base_amount: prefill.amount,
                                interest_amount: parseFloat(formValues.amount) - parseFloat(prefill.amount),
                                payment_method: formValues.payment_method,
                                notes: `Cobro desde ficha de alumno`
                            }),
                            headers: { 'Content-Type': 'application/json' }
                        });
                    } else {
                        // Si es un cobro nuevo/suelto
                        response = await fetch(window.API_BASE + '/api/payments', {
                            method: 'POST',
                            body: JSON.stringify(formValues),
                            headers: { 'Content-Type': 'application/json' }
                        });
                    }
                    
                    const res = await response.json();
                    if (res.status === 'success') {
                        Swal.fire('¡Éxito!', 'Pago registrado correctamente', 'success');
                        await this.fetchStudent(this.student.id);
                    } else {
                        Swal.fire('Error', res.message, 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'No se pudo registrar el pago.', 'error');
                }
            }
        },
        collectPayment(payment) {
            this.showNewPaymentModal(payment);
        },
        async sendPaymentReminder() {
            const confirmed = await Swal.fire({
                title: '¿Enviar recordatorio de pago?',
                text: `Se enviará un email a ${this.student.name} ${this.student.lastname} notificando su deuda pendiente.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, enviar'
            });

            if (!confirmed.isConfirmed) return;

            const totalDebt = this.student.payments
                .filter(p => p.status === 'Pendiente')
                .reduce((sum, p) => sum + parseFloat(p.amount), 0);

            try {
                const response = await fetch(window.API_BASE + '/api/reminders/payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ student_id: this.student.id, debt: totalDebt })
                });
                const res = await response.json();
                if (res.status === 'success') {
                    Swal.fire('Enviado', 'Recordatorio enviado correctamente', 'success');
                } else {
                    Swal.fire('Error', res.message, 'error');
                }
            } catch (e) {
                Swal.fire('Error', 'No se pudo enviar el recordatorio', 'error');
            }
        },
        async fetchPaymentConfigs() {
            try {
                const response = await fetch(window.API_BASE + '/api/config/payments');
                const result = await response.json();
                if (result.status === 'success') {
                    result.data.forEach(c => {
                        if (c.config_key === 'quota_base_amount') this.paymentConfigs.quota_base_amount = parseFloat(c.config_value);
                        if (c.config_key === 'matricula_base_amount') this.paymentConfigs.matricula_base_amount = parseFloat(c.config_value);
                    });
                    this.planConfig.quota_amount = this.paymentConfigs.quota_base_amount;
                    this.planConfig.matricula_amount = this.paymentConfigs.matricula_base_amount;
                }
            } catch (e) { console.error(e); }
        },
        async executeGeneratePlan() {
            if (this.generatingPlan) return;
            
            const confirmed = await Swal.fire({
                title: '¿Confirmar matriculación?',
                text: "Se generará el plan de pagos y se anularán los pendientes anteriores.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, matricular',
                cancelButtonText: 'Cancelar'
            });

            if (!confirmed.isConfirmed) return;

            this.generatingPlan = true;
            try {
                // Generar los conceptos según el ciclo
                const planData = [];
                if (this.planConfig.include_matricula) {
                    planData.push({
                        type: 'Matrícula',
                        concept: 'Matrícula',
                        amount: this.planConfig.matricula_amount,
                        due_date: this.planConfig.matricula_due_date
                    });
                }

                // Generar 10 cuotas
                const startMonth = this.planConfig.start_cycle === 'Marzo' ? 2 : 7; // Marzo(2) o Agosto(7)
                const currentYear = new Date().getFullYear();

                for (let i = 0; i < 10; i++) {
                    let month = (startMonth + i) % 12;
                    let year = currentYear + Math.floor((startMonth + i) / 12);
                    
                    const dueDate = new Date(year, month, 10);
                    planData.push({
                        type: 'Cuota',
                        concept: `Cuota ${i + 1}`,
                        amount: this.planConfig.quota_amount,
                        due_date: dueDate.toISOString().split('T')[0]
                    });
                }

                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + `/api/students/${this.student.id}/generate-payments`, {
                    method: 'POST',
                    headers: { 
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify(planData)
                });
                
                const result = await response.json();
                if (result.status === 'success') {
                    Swal.fire('¡Éxito!', 'Alumno matriculado correctamente', 'success');
                    this.generatePlanModal = false;
                    await this.fetchStudent(this.student.id);
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (e) {
                Swal.fire('Error', 'No se pudo procesar la matriculación', 'error');
            } finally {
                this.generatingPlan = false;
            }
        },
        async deletePayment(id) {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta acción no se puede deshacer.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                try {
                    const response = await fetch(window.API_BASE + `/api/payments/${id}`, { method: 'DELETE' });
                    const res = await response.json();
                    if (res.status === 'success') {
                        Swal.fire('Eliminado', 'el pago ha sido eliminado.', 'success');
                        this.fetchStudent(this.student.id);
                    } else {
                        Swal.fire('Error', res.message, 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'No se pudo eliminar el pago.', 'error');
                }
            }
        }
    }
}
