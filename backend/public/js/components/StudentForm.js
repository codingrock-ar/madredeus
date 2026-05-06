export default {
    template: `
    <div class="fade-in">
        <div class="row">
            <div class="col-md-3 mb-4">
                <div class="card-modern p-4 text-center h-100">
                    <div class="position-relative d-inline-block mb-3">
                        <!-- Dynamic avatar or preview -->
                        <img :src="photoPreview || 'https://ui-avatars.com/api/?name=' + (student.name||'Nuevo') + '+' + (student.lastname||'Estudiante') + '&size=128'" 
                             class="rounded-circle shadow-sm object-fit-cover" 
                             style="width: 120px; height: 120px;">
                        
                        <label for="photo-upload" class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle p-2" title="Cambiar Foto" style="cursor: pointer;">
                            <i class="ph ph-camera"></i>
                            <input type="file" id="photo-upload" class="d-none" @change="handlePhotoUpload" accept="image/*">
                        </label>
                    </div>
                    <h5 class="fw-bold">{{ student.lastname || 'Nuevo' }}, {{ student.name || 'Estudiante' }}</h5>
                    <p class="text-muted small" v-if="student.id">ID: {{ student.id }}</p>
                    
                    <hr>
                    <div class="text-start small" v-if="student.id">
                        <p class="mb-1"><strong>DNI:</strong> {{ student.dni }}</p>
                        <p class="mb-1"><strong>Estado:</strong> <span class="text-danger fw-bold">{{ student.status }}</span></p>
                    </div>
                    
                    <div class="d-grid gap-2 mt-4">
                        <button v-if="student.id" class="btn btn-outline-primary btn-sm" @click="printForm">
                            <i class="ph ph-printer me-2"></i>Imprimir Ficha
                        </button>
                        <button v-if="student.id" class="btn btn-outline-danger btn-sm" @click="printForm">
                            <i class="ph ph-file-pdf me-2"></i>Exportar a Pdf
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" @click="goBack">
                            <i class="ph ph-arrow-left me-2"></i>Volver
                        </button>
                    </div>
                </div>
            </div>

            <div class="col-md-9">
                <div class="card-modern p-4">
                    <ul class="nav nav-tabs mb-4" id="studentTabs">
                        <li class="nav-item">
                            <a class="nav-link" :class="{active: tab === 'personal'}" href="#" @click.prevent="tab = 'personal'">
                                <i class="ph ph-user me-2"></i>General
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{active: tab === 'academic'}" href="#" @click.prevent="tab = 'academic'">
                                <i class="ph ph-book-open me-2"></i>Académico
                            </a>
                        </li>
                        <li class="nav-item" v-if="student.id">
                            <a class="nav-link" :class="{active: tab === 'grades'}" href="#" @click.prevent="tab = 'grades'">
                                <i class="ph ph-notebook me-2"></i>Calificaciones
                            </a>
                        </li>
                        <li class="nav-item" v-if="student.id">
                            <a class="nav-link" :class="{active: tab === 'payments'}" href="#" @click.prevent="tab = 'payments'">
                                <i class="ph ph-currency-dollar me-2"></i>Pagos
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{active: tab === 'contact'}" href="#" @click.prevent="tab = 'contact'">
                                <i class="ph ph-address-book me-2"></i>Contacto
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{active: tab === 'docs'}" href="#" @click.prevent="tab = 'docs'">
                                <i class="ph ph-folder me-2"></i>Documentos
                            </a>
                        </li>
                    </ul>

                    <form @submit.prevent="saveStudent">
                        <!-- TAB: PERSONAL -->
                        <div v-show="tab === 'personal' || isPrinting" class="fade-in">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Nombre</label>
                                    <input type="text" class="form-control" v-model="student.name" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Apellido</label>
                                    <input type="text" class="form-control" v-model="student.lastname" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Tipo de Documento</label>
                                    <select class="form-select" v-model="student.document_type">
                                        <option v-for="type in metadata.document_types" :key="type" :value="type">{{type}}</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Número de Documento</label>
                                    <input type="text" class="form-control" v-model="student.dni" required>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Fecha Nacimiento</label>
                                    <input type="date" class="form-control" v-model="student.birthdate">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Lugar de Nacimiento</label>
                                    <input type="text" class="form-control" v-model="student.birth_place">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Nacionalidad</label>
                                    <input type="text" class="form-control" v-model="student.nationality">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Estado Civil</label>
                                    <select class="form-select" v-model="student.civil_status">
                                        <option v-for="status in metadata.civil_statuses" :key="status" :value="status">{{status}}</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label text-primary fw-bold">Sexo (Sinigep)</label>
                                    <select class="form-select border-primary" v-model="student.gender">
                                        <option v-for="g in metadata.genders" :key="g" :value="g">{{g}}</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label text-info fw-bold">Estado Sinigep</label>
                                    <select class="form-select border-info" v-model="student.sinigep_status">
                                        <option v-for="s in metadata.sinigep_statuses" :key="s" :value="s">{{s}}</option>
                                    </select>
                                </div>
                                
                                <div class="col-12"><hr class="text-muted my-2"></div>
                                <h6 class="fw-bold mb-2">Estudios</h6>
                                
                                <div class="col-md-6">
                                    <label class="form-label">Nivel Máximo Alcanzado</label>
                                    <select class="form-select" v-model="student.max_education_level">
                                        <option v-for="level in metadata.education_levels" :key="level" :value="level">{{level}}</option>
                                    </select>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label d-block">¿Finalizado?</label>
                                    <div class="form-check form-check-inline mt-2" v-for="opt in metadata.yes_no_options" :key="opt">
                                        <input class="form-check-input" type="radio" :name="'edu_fin_'+opt" :id="'edu_fin_'+opt" :value="opt" v-model="student.education_finished">
                                        <label class="form-check-label" :for="'edu_fin_'+opt">{{opt}}</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Título obtenido</label>
                                    <input type="text" class="form-control" v-model="student.degree_obtained">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Establecimiento</label>
                                    <input type="text" class="form-control" v-model="student.institution">
                                </div>
                            </div>
                        </div>

                        <!-- TAB: ACADEMIC (MULTI-CAREER) -->
                        <div v-show="tab === 'academic' || isPrinting" class="fade-in">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="fw-bold mb-0">Inscripciones a Carreras</h6>
                                <button type="button" class="btn btn-outline-primary btn-sm" @click="addInscription">
                                    <i class="ph ph-plus me-1"></i> Nueva Inscripción
                                </button>
                            </div>

                            <div v-for="(ins, index) in student.inscriptions" :key="index" class="card border mb-3">
                                <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
                                    <span class="fw-bold text-primary small">#{{index + 1}} - Inscripto en: {{ ins.career_title || '(Seleccione Carrera)' }}</span>
                                    <button type="button" class="btn btn-link text-danger p-0" @click="removeInscription(index)">
                                        <i class="ph ph-trash"></i>
                                    </button>
                                </div>
                                <div class="card-body p-3">
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label small">Carrera</label>
                                            <select class="form-select form-select-sm" v-model="ins.career_title" @change="updateCareerId(ins)">
                                                <option v-for="c in careers" :key="c.id" :value="c.title">{{c.title}}</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label small">Ciclo Lectivo</label>
                                            <input type="text" class="form-control form-control-sm" v-model="ins.academic_cycle" placeholder="Ej: 2024">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label small">Comisión</label>
                                            <select class="form-select form-select-sm" v-model="ins.commission">
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label small">Libro</label>
                                            <input type="text" class="form-control form-control-sm" v-model="ins.book">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label small">Folio</label>
                                            <input type="text" class="form-control form-control-sm" v-model="ins.folio">
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label small">Turno</label>
                                            <select class="form-select form-select-sm" v-model="ins.shift">
                                                <option value="TM">Mañana (TM)</option>
                                                <option value="TT">Tarde (TT)</option>
                                                <option value="TN">Noche (TN)</option>
                                            </select>
                                        </div>
                                        <div class="col-md-3">
                                            <label class="form-label small">Estado</label>
                                            <select class="form-select form-select-sm" v-model="ins.status">
                                                <option value="Estadío 0">Estadío 0</option>
                                                <option value="En Curso">En Curso</option>
                                                <option value="Abandono">Abandono</option>
                                                <option value="Egresado">Egresado</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div v-if="!student.inscriptions || student.inscriptions.length === 0" class="text-center py-4 bg-light rounded text-muted small">
                                <i class="ph ph-warning-circle fs-3 mb-2 d-block"></i>
                                No hay inscripciones registradas. Haga clic en "Nueva Inscripción" para comenzar.
                            </div>
                        </div>

                        <!-- TAB: CONTACT -->
                        <div v-show="tab === 'contact' || isPrinting" class="fade-in">
                            <div class="row g-3">
                                <h6 class="fw-bold mb-2">Domicilio</h6>
                                <div class="col-md-8">
                                    <label class="form-label">Calle</label>
                                    <input type="text" class="form-control" v-model="student.address_street">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Número</label>
                                    <input type="text" class="form-control" v-model="student.address_number">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label d-block">Tipo de Residencia</label>
                                    <div class="form-check form-check-inline mt-2" v-for="type in metadata.address_types" :key="type">
                                        <input class="form-check-input" type="radio" :name="'addr_type_'+type" :id="'addr_type_'+type" :value="type" v-model="student.address_type">
                                        <label class="form-check-label" :for="'addr_type_'+type">{{type}}</label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Provincia</label>
                                    <input type="text" class="form-control" v-model="student.address_province">
                                </div>
                                <div class="col-md-8">
                                    <label class="form-label">Localidad</label>
                                    <input type="text" class="form-control" v-model="student.address_locality">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Código Postal</label>
                                    <input type="text" class="form-control" v-model="student.address_zip_code">
                                </div>

                                <div class="col-12"><hr class="text-muted my-2"></div>
                                <h6 class="fw-bold mb-2">Datos de Contacto</h6>
                                
                                <div class="col-md-6">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" v-model="student.email">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Teléfono Fijo</label>
                                    <input type="tel" class="form-control" v-model="student.phone_landline">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Teléfono Móvil</label>
                                    <input type="tel" class="form-control" v-model="student.phone_mobile">
                                </div>
                            </div>
                        </div>

                        <!-- TAB: GRADES -->
                        <div v-show="tab === 'grades' || isPrinting" class="fade-in">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="fw-bold mb-0">Calificaciones</h6>
                                <button type="button" class="btn btn-success btn-sm" @click="saveGradesBtn" :disabled="savingGrades">
                                    <span v-if="savingGrades" class="spinner-border spinner-border-sm me-2"></span>
                                    Guardar Calificaciones
                                </button>
                            </div>
                            
                            <div v-if="student.inscriptions && student.inscriptions.length > 0">
                                <div v-for="ins in student.inscriptions" :key="'ins-grades-'+ins.id" class="card border mb-3">
                                    <div class="card-header bg-light py-2 fw-bold text-primary">
                                        <i class="ph ph-graduation-cap me-2"></i>{{ ins.career_title }}
                                    </div>
                                    <div class="card-body p-3">
                                        <div v-for="year in getYears(ins.subjects)" :key="year" class="mb-4">
                                            <div class="bg-light p-2 rounded mb-2 fw-bold small">AÑO {{ year }}</div>
                                            <div class="row g-3">
                                                <div v-for="q in [1, 2]" :key="q" class="col-md-6">
                                                    <div class="border rounded p-3 h-100">
                                                        <h7 class="fw-bold d-block mb-2 text-muted extra-small text-uppercase">Cuatrimestre {{ q }}</h7>
                                                        <div v-for="sub in filterSubjects(ins.subjects, year, q)" :key="sub.id" class="mb-2 pb-2 border-bottom border-dashed last-border-none">
                                                            <div class="small fw-bold mb-1">{{ sub.name }}</div>
                                                            <div class="d-flex gap-2">
                                                                <input type="text" class="form-control form-control-sm" v-model="sub.grade" placeholder="Nota" style="width: 80px;">
                                                                <select class="form-select form-select-sm" v-model="sub.grade_status">
                                                                    <option value="">Pendiente</option>
                                                                    <option value="Aprobado">Aprobado</option>
                                                                    <option value="Regular">Regular</option>
                                                                    <option value="Libre">Libre</option>
                                                                    <option value="Desaprobado">Desaprobado</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div v-if="filterSubjects(ins.subjects, year, q).length === 0" class="text-muted extra-small italic">
                                                            No hay materias asignadas.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div v-if="!ins.subjects || ins.subjects.length === 0" class="text-center text-muted py-3 small">
                                            No hay materias cargadas para esta carrera. Por favor guarda la inscripción primero.
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="alert alert-warning small">
                                Debes inscribir al alumno en una carrera y guardar los cambios antes de cargar calificaciones.
                            </div>
                        </div>

                        <!-- TAB: PAYMENTS -->
                        <div v-show="tab === 'payments' || isPrinting" class="fade-in">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <h6 class="fw-bold mb-0">Gestión de Pagos</h6>
                                <div class="d-flex gap-2">
                                    <button type="button" class="btn btn-soft-primary btn-sm" @click="generatePlanModal = true" :disabled="!student.id">
                                        <i class="ph ph-graduation-cap me-1"></i>Matricular en Carrera
                                    </button>
                                    <button type="button" class="btn btn-primary btn-sm" @click="showNewPaymentModal()">
                                        <i class="ph ph-plus me-1"></i>Registrar Pago
                                    </button>
                                </div>
                            </div>
                            
                            <div v-if="student.payments && student.payments.length > 0">
                                <div class="table-responsive">
                                    <table class="table table-sm align-middle small">
                                        <thead class="table-light">
                                            <tr>
                                                <th>Tipo</th>
                                                <th>Concepto</th>
                                                <th>Vencimiento</th>
                                                <th>Monto</th>
                                                <th>Estado</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
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
                                                <td class="fw-bold">
                                                    <div v-if="p.status === 'Pagado'">
                                                        $ {{ formatCurrency(p.paid_amount || p.amount) }}
                                                        <div v-if="p.interest_amount > 0" class="extra-small text-danger">+ $ {{ formatCurrency(p.interest_amount) }} interés</div>
                                                    </div>
                                                    <div v-else>
                                                        $ {{ formatCurrency(p.amount, p) }}
                                                        <div v-if="p.status === 'Pendiente' && isLate(p.due_date)" class="extra-small text-danger fw-bold mt-1">
                                                            <i class="ph ph-warning-circle"></i> Incluye recargo
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span class="badge rounded-pill" :class="p.status === 'Pagado' ? 'bg-success' : (p.status === 'Anulado' ? 'bg-secondary' : (isLate(p.due_date) ? 'bg-danger' : 'bg-warning text-dark'))">
                                                        {{ p.status === 'Pendiente' && isLate(p.due_date) ? 'Pendiente Vencido' : p.status }}
                                                    </span>
                                                </td>
                                                <td class="text-end">
                                                    <div class="d-flex justify-content-end gap-1">
                                                        <button v-if="p.status === 'Pendiente'" type="button" class="btn btn-icon btn-sm btn-soft-primary" title="Cobrar" @click="openPaymentModal(p)">
                                                            <i class="ph ph-currency-dollar"></i>
                                                        </button>
                                                        <button v-if="p.status === 'Pendiente' && isLate(p.due_date)" type="button" class="btn btn-icon btn-sm btn-soft-warning" title="Notificar Atraso" @click="notifyLatePayment(p.id)">
                                                            <i class="ph ph-bell"></i>
                                                        </button>
                                                        <button type="button" class="btn btn-icon btn-sm btn-soft-danger" title="Eliminar" @click="deletePayment(p.id)">
                                                            <i class="ph ph-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div v-else class="text-center py-4 bg-light rounded text-muted small">
                                <i class="ph ph-wallet fs-3 d-block mb-2"></i>
                                El alumno no tiene pagos registrados. Utiliza el botón "Matricular en Carrera" para crearlos.
                            </div>
                            
                            <!-- Generar Pagos Modal -->
                            <!-- MODAL: GENERAR PLAN -->
                            <div v-if="generatePlanModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); z-index: 1050;">
                                <div class="modal-dialog modal-md modal-dialog-centered">
                                    <div class="modal-content shadow-lg border-0">
                                        <div class="modal-header bg-primary text-white">
                                            <h5 class="modal-title fw-bold"><i class="ph ph-calendar-plus me-2"></i>Matricular en Carrera</h5>
                                            <button type="button" class="btn-close btn-close-white" @click="generatePlanModal = false"></button>
                                        </div>
                                        <div class="modal-body p-4">
                                            <div class="alert alert-info small mb-4">
                                                <i class="ph ph-info me-2"></i>Se generará un plan de 10 cuotas mensuales según el ciclo elegido.
                                            </div>

                                            <div class="row g-3">
                                                <div class="col-12">
                                                    <label class="form-label small fw-bold">Ciclo de Inicio</label>
                                                    <select class="form-select" v-model="planConfig.start_cycle">
                                                        <option value="Marzo">Marzo (Clásico: Marzo a Diciembre)</option>
                                                        <option value="Agosto">Agosto (Agosto a Julio del año siguiente)</option>
                                                    </select>
                                                </div>

                                                <div class="col-12"><hr class="my-2"></div>

                                                <div class="col-12">
                                                    <div class="form-check form-switch mb-2">
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
                                                    <div class="form-text extra-small">Se aplicará a las 10 cuotas.</div>
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

                        <!-- TAB: DOCS & OTHERS -->
                        <div v-show="tab === 'docs' || isPrinting" class="fade-in">
                            <div class="row g-4">
                                <div class="col-md-12">
                                    <div class="d-flex justify-content-between align-items-center mb-3">
                                        <h6 class="fw-bold mb-0">Requisitos</h6>
                                        <button v-if="student.id" type="button" class="btn btn-soft-warning btn-sm" @click="notifyMissingDocs" :disabled="sendingNotification">
                                            <span v-if="sendingNotification" class="spinner-border spinner-border-sm me-2"></span>
                                            <i v-else class="ph ph-bell me-1"></i> Notificar Faltantes (Email)
                                        </button>
                                    </div>
                                    
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="d-flex align-items-center gap-2 mb-2">
                                                <div class="form-check flex-grow-1">
                                                    <input class="form-check-input" type="checkbox" id="req1" v-model="student.req_dni_photocopy">
                                                    <label class="form-check-label" for="req1">Fotocopia del DNI</label>
                                                </div>
                                                <div v-if="student.id" class="doc-upload-zone">
                                                    <a v-if="student.file_dni" :href="window.API_BASE + student.file_dni" target="_blank" class="btn btn-icon btn-xs btn-outline-success me-1" title="Ver archivo">
                                                        <i class="ph ph-file"></i>
                                                    </a>
                                                    <label :for="'file-dni'" class="btn btn-icon btn-xs btn-outline-primary m-0" title="Subir archivo">
                                                        <i class="ph ph-upload-simple"></i>
                                                        <input type="file" :id="'file-dni'" class="d-none" @change="uploadDoc($event, 'dni')">
                                                    </label>
                                                </div>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <div class="d-flex align-items-center gap-2 mb-1">
                                                    <div class="form-check flex-grow-1">
                                                        <input class="form-check-input" type="checkbox" id="req2" v-model="student.req_degree_photocopy">
                                                        <label class="form-check-label" for="req2">Fotocopia del título</label>
                                                    </div>
                                                    <div v-if="student.id" class="doc-upload-zone">
                                                        <a v-if="student.file_degree" :href="window.API_BASE + student.file_degree" target="_blank" class="btn btn-icon btn-xs btn-outline-success me-1" title="Ver archivo">
                                                            <i class="ph ph-file"></i>
                                                        </a>
                                                        <label :for="'file-degree'" class="btn btn-icon btn-xs btn-outline-primary m-0" title="Subir archivo">
                                                            <i class="ph ph-upload-simple"></i>
                                                            <input type="file" :id="'file-degree'" class="d-none" @change="uploadDoc($event, 'degree')">
                                                        </label>
                                                    </div>
                                                </div>
                                                <textarea v-if="student.req_degree_photocopy" class="form-control form-control-sm mt-1" v-model="student.req_degree_photocopy_obs" placeholder="Observaciones título..."></textarea>
                                            </div>

                                            <div class="d-flex align-items-center gap-2 mb-3">
                                                <div class="form-check flex-grow-1">
                                                    <input class="form-check-input" type="checkbox" id="req3" v-model="student.req_two_photos">
                                                    <label class="form-check-label" for="req3">Dos fotos 4x4</label>
                                                </div>
                                                <!-- No file upload for photos as it's usually physical, but could be added if needed -->
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                             <div class="mb-3">
                                                <div class="d-flex align-items-center gap-2 mb-1">
                                                    <div class="form-check flex-grow-1">
                                                        <input class="form-check-input" type="checkbox" id="req4" v-model="student.req_psychophysical">
                                                        <label class="form-check-label" for="req4">Certificado de aptitud psicofísica</label>
                                                    </div>
                                                    <div v-if="student.id" class="doc-upload-zone">
                                                        <a v-if="student.file_psychophysical" :href="window.API_BASE + student.file_psychophysical" target="_blank" class="btn btn-icon btn-xs btn-outline-success me-1" title="Ver archivo">
                                                            <i class="ph ph-file"></i>
                                                        </a>
                                                        <label :for="'file-psy'" class="btn btn-icon btn-xs btn-outline-primary m-0" title="Subir archivo">
                                                            <i class="ph ph-upload-simple"></i>
                                                            <input type="file" :id="'file-psy'" class="d-none" @change="uploadDoc($event, 'psychophysical')">
                                                        </label>
                                                    </div>
                                                </div>
                                                <textarea v-if="student.req_psychophysical" class="form-control form-control-sm mt-1" v-model="student.req_psychophysical_obs" placeholder="Observaciones psicofísico..."></textarea>
                                            </div>

                                            <div class="mb-3">
                                                <div class="d-flex align-items-center gap-2 mb-1">
                                                    <div class="form-check flex-grow-1">
                                                        <input class="form-check-input" type="checkbox" id="req5" v-model="student.req_vaccines">
                                                        <label class="form-check-label" for="req5">Certificado de vacunas</label>
                                                    </div>
                                                    <div v-if="student.id" class="doc-upload-zone">
                                                        <a v-if="student.file_vaccines" :href="window.API_BASE + student.file_vaccines" target="_blank" class="btn btn-icon btn-xs btn-outline-success me-1" title="Ver archivo">
                                                            <i class="ph ph-file"></i>
                                                        </a>
                                                        <label :for="'file-vac'" class="btn btn-icon btn-xs btn-outline-primary m-0" title="Subir archivo">
                                                            <i class="ph ph-upload-simple"></i>
                                                            <input type="file" :id="'file-vac'" class="d-none" @change="uploadDoc($event, 'vaccines')">
                                                        </label>
                                                    </div>
                                                </div>
                                                <textarea v-if="student.req_vaccines" class="form-control form-control-sm mt-1" v-model="student.req_vaccines_obs" placeholder="Observaciones vacunas..."></textarea>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="d-flex align-items-center gap-2 mb-3">
                                                <div class="form-check flex-grow-1">
                                                    <input class="form-check-input" type="checkbox" id="req6" v-model="student.req_student_book">
                                                    <label class="form-check-label" for="req6">Libreta</label>
                                                </div>
                                                <div v-if="student.id" class="doc-upload-zone">
                                                    <a v-if="student.file_student_book" :href="window.API_BASE + student.file_student_book" target="_blank" class="btn btn-icon btn-xs btn-outline-success me-1" title="Ver archivo">
                                                        <i class="ph ph-file"></i>
                                                    </a>
                                                    <label :for="'file-book'" class="btn btn-icon btn-xs btn-outline-primary m-0" title="Subir archivo">
                                                        <i class="ph ph-upload-simple"></i>
                                                        <input type="file" :id="'file-book'" class="d-none" @change="uploadDoc($event, 'student_book')">
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <div class="d-flex align-items-center gap-2 mb-1">
                                                    <div class="form-check flex-grow-1">
                                                        <input class="form-check-input" type="checkbox" id="req7" v-model="student.req_final_degree">
                                                        <label class="form-check-label" for="req7">Título Final</label>
                                                    </div>
                                                    <div v-if="student.id" class="doc-upload-zone">
                                                        <a v-if="student.file_final_degree" :href="window.API_BASE + student.file_final_degree" target="_blank" class="btn btn-icon btn-xs btn-outline-success me-1" title="Ver archivo">
                                                            <i class="ph ph-file"></i>
                                                        </a>
                                                        <label :for="'file-final'" class="btn btn-icon btn-xs btn-outline-primary m-0" title="Subir archivo">
                                                            <i class="ph ph-upload-simple"></i>
                                                            <input type="file" :id="'file-final'" class="d-none" @change="uploadDoc($event, 'final_degree')">
                                                        </label>
                                                    </div>
                                                </div>
                                                <textarea v-if="student.req_final_degree" class="form-control form-control-sm mt-1" v-model="student.req_final_degree_obs" placeholder="Observaciones título final..."></textarea>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-12"><hr class="text-muted my-2"></div>
                                
                                <div class="col-md-12">
                                    <h6 class="fw-bold mb-3">Medio por el cual conoció la institución</h6>
                                    <div class="d-flex flex-wrap gap-3">
                                        <div class="form-check" v-for="source in metadata.media_sources" :key="source">
                                            <input class="form-check-input" type="checkbox" :id="'media_'+source" :value="source" v-model="student.found_institution">
                                            <label class="form-check-label" :for="'media_'+source">{{source}}</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-12">
                                    <label class="form-label fw-bold">Observaciones Generales</label>
                                    <textarea class="form-control" rows="4" v-model="student.notes" placeholder="Notas adicionales..."></textarea>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4 pt-3 border-top text-end">
                            <button type="button" class="btn btn-light me-2" @click="goBack">Volver al Listado</button>
                            <button type="submit" class="btn btn-primary px-4" :disabled="loading">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {{ student.id ? 'Guardar Cambios' : 'Crear Estudiante' }}
                            </button>
                        </div>
                        
                        <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
                        <div v-if="successMessage" class="alert alert-success mt-3 d-flex align-items-center">
                            <i class="ph ph-check-circle fs-4 me-2"></i> {{ successMessage }}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            tab: 'personal',
            student: { 
                status: 'En Curso',
                document_type: 'DNI',
                civil_status: 'Soltero',
                max_education_level: 'Secundario',
                education_finished: 'No',
                address_type: 'Casa',
                found_institution: [],
                req_dni_photocopy: false,
                req_degree_photocopy: false,
                req_two_photos: false,
                req_psychophysical: false,
                req_vaccines: false,
                req_student_book: false,
                req_final_degree: false,
                gender: 'No especifica',
                sinigep_status: 'Pendiente',
                file_dni: null,
                file_degree: null,
                file_psychophysical: null,
                file_vaccines: null,
                file_student_book: null,
                file_final_degree: null,
                inscriptions: []
            },
            originalStudent: null,
            loading: false,
            sendingNotification: false,
            savingGrades: false,
            isPrinting: false,
            error: null,
            successMessage: null,
            metadata: {
                document_types: [],
                civil_statuses: [],
                education_levels: [],
                yes_no_options: [],
                address_types: [],
                media_sources: []
            },
            careers: [],
            photoPreview: null,
            generatePlanModal: false,
            generatingPlan: false,
            paymentConfigs: {
                quota_base_amount: 40000,
                matricula_base_amount: 50000,
                interest_after_10: 10,
                interest_after_20: 20
            },
            paymentModal: {
                show: false,
                loading: false,
                payment: null,
                paid_amount: 0,
                interest_amount: 0,
                base_amount: 0,
                method: 'Efectivo',
                notes: ''
            },
            planConfig: {
                include_matricula: true,
                matricula_amount: 50000,
                matricula_due_date: new Date().toISOString().split('T')[0],
                start_cycle: 'Marzo',
                quota_amount: 40000,
                first_quota_due_date: ''
            }
        }
    },
    computed: {
        isDirty() {
            if (!this.originalStudent) return false;
            return JSON.stringify(this.student) !== this.originalStudent;
        }
    },
    methods: {
        printForm() {
            this.isPrinting = true;
            this.$nextTick(() => {
                window.print();
                this.isPrinting = false;
            });
        },
        async fetchMetadata() {
            try {
                const response = await fetch(window.API_BASE + '/api/metadata/student-types');
                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    this.metadata = result.data;
                }
            } catch (e) {
                console.error("Error fetching metadata:", e);
            }
        },
        async fetchCareers() {
            try {
                const response = await fetch(window.API_BASE + '/api/careers');
                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    this.careers = result.data;
                }
            } catch (e) {
                console.error("Error fetching careers:", e);
            }
        },
        async fetchStudent(id) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/students/' + id, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();
                
                if (response.ok && result.status === 'success') {
                    // Sanitize numeric fields that might come as strings from DB
                    const data = result.data;
                    
                    // Parse checkboxes from 0/1 to boolean
                    const boolFields = [
                        'req_dni_photocopy', 'req_degree_photocopy', 'req_two_photos', 
                        'req_psychophysical', 'req_vaccines', 'req_student_book', 'req_final_degree'
                    ];
                    boolFields.forEach(f => {
                        data[f] = data[f] == 1;
                    });

                    // Parse JSON for found_institution
                    if (data.found_institution) {
                        try {
                            data.found_institution = JSON.parse(data.found_institution);
                        } catch(e) { 
                            data.found_institution = []; 
                        }
                    } else {
                        data.found_institution = [];
                    }

                    this.student = data;
                    if (this.student.photo) {
                        this.photoPreview = this.student.photo;
                    }
                    this.originalStudent = JSON.stringify(this.student);
                } else {
                    this.error = result.error || 'Error cargando datos del estudiante';
                }
            } catch (error) {
                console.error("Error:", error);
                this.error = "Error de conexión";
            }
        },
        handlePhotoUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.photoPreview = e.target.result;
                    this.student.photo = e.target.result; // Base64 for simplicity in this demo
                };
                reader.readAsDataURL(file);
            }
        },
        async saveStudent() {
            if (!confirm('¿Estás seguro de que deseas guardar los cambios?')) return;
            
            this.error = null;
            this.successMessage = null;
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const id = this.student.id;
                const method = id ? 'PUT' : 'POST';
                const endpoint = id ? window.API_BASE + '/api/students/' + id : window.API_BASE + '/api/students';

                const response = await fetch(endpoint, {
                    method: method,
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.student)
                });

                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    this.successMessage = "¡Los datos han sido guardados correctamente!";
                    this.originalStudent = JSON.stringify(this.student);
                    
                    if (!id) {
                        setTimeout(() => { this.$router.push('/students') }, 1500);
                    } else {
                        this.fetchStudent(id);
                    }
                    setTimeout(() => { this.successMessage = null; }, 3000);
                } else {
                    this.error = result.error || 'Ocurrió un error al guardar';
                }
            } catch(e) {
                console.error(e);
                this.error = "Error de red al guardar";
            } finally {
                this.loading = false;
            }
        },
        goBack() {
            if (this.isDirty) {
                if (!confirm('Tiene cambios sin guardar. ¿Desea volver de todas formas? Se perderá la información no guardada.')) {
                    return;
                }
            }
            this.$router.push('/students');
        },
        addInscription() {
            if (!this.student.inscriptions) this.student.inscriptions = [];
            this.student.inscriptions.push({
                career_id: null,
                career_title: '',
                academic_cycle: '',
                commission: '',
                shift: 'TM',
                status: 'En Curso',
                book: '',
                folio: ''
            });
        },
        removeInscription(index) {
            if (confirm('¿Estás seguro de que deseas eliminar esta inscripción?')) {
                this.student.inscriptions.splice(index, 1);
            }
        },
        updateCareerId(ins) {
            const career = this.careers.find(c => c.title === ins.career_title);
            if (career) {
                ins.career_id = career.id;
            }
        },
        getYears(subjects) {
            if (!subjects) return [];
            const years = [...new Set(subjects.map(s => s.academic_year))];
            return years.sort((a, b) => a - b);
        },
        filterSubjects(subjects, year, quarter) {
            if (!subjects) return [];
            return subjects.filter(s => s.academic_year == year && s.quarter == quarter);
        },
        async saveGradesBtn() {
            this.savingGrades = true;
            try {
                const token = localStorage.getItem('token');
                let promises = [];
                for (const ins of this.student.inscriptions) {
                    if (ins.id && ins.subjects) {
                        const payload = {
                            grades: ins.subjects.map(s => ({
                                subject_id: s.id,
                                grade: s.grade,
                                status: s.grade_status
                            }))
                        };
                        promises.push(
                            fetch(window.API_BASE + `/api/students/${this.student.id}/inscriptions/${ins.id}/grades`, {
                                method: 'POST',
                                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                                body: JSON.stringify(payload)
                            })
                        );
                    }
                }
                
                if (promises.length === 0) {
                    this.savingGrades = false;
                    return;
                }

                await Promise.all(promises);
                this.successMessage = "Calificaciones guardadas exitosamente.";
                setTimeout(() => { this.successMessage = null; }, 3000);
            } catch (e) {
                console.error(e);
                this.error = "Error al guardar las calificaciones.";
            } finally {
                this.savingGrades = false;
            }
        },
        formatDate(dateStr) {
            if (!dateStr) return '-';
            const date = new Date(dateStr);
            return date.toLocaleDateString('es-AR');
        },
        formatCurrency(amount, p = null) {
            let total = parseFloat(amount || 0);
            if (p && p.status === 'Pendiente' && this.isLate(p.due_date)) {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const due = new Date(p.due_date + 'T00:00:00');
                const isSameMonth = (today.getFullYear() === due.getFullYear() && today.getMonth() === due.getMonth());
                const day = today.getDate();
                if (!isSameMonth || day > 20) total *= 1.20;
                else if (day > 10) total *= 1.10;
            }
            return total.toLocaleString('es-AR', { minimumFractionDigits: 2 });
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
        addMonthsToDate(dateStr, months) {
            let d = new Date(dateStr);
            d.setMonth(d.getMonth() + months);
            return d.toISOString().split('T')[0];
        },
        async fetchPaymentConfigs() {
            try {
                const response = await fetch(window.API_BASE + '/api/config/payments');
                const result = await response.json();
                if (result.status === 'success') {
                    result.data.forEach(c => {
                        if (this.paymentConfigs.hasOwnProperty(c.config_key)) {
                            this.paymentConfigs[c.config_key] = parseFloat(c.config_value);
                        }
                    });
                    // Update plan defaults
                    this.planConfig.quota_amount = this.paymentConfigs.quota_base_amount;
                    this.planConfig.matricula_amount = this.paymentConfigs.matricula_base_amount;
                }
            } catch (e) { console.error(e); }
        },
        async executeGeneratePlan() {
            if (!confirm("¿Matricular al alumno en la carrera? Se anularán pagos pendientes previos de este ciclo y se generarán la matrícula y 10 cuotas mensuales.")) return;
            
            this.generatingPlan = true;
            let planData = [];
            
            if (this.planConfig.include_matricula) {
                planData.push({
                    amount: this.planConfig.matricula_amount,
                    due_date: this.planConfig.matricula_due_date,
                    type: 'Matrícula',
                    concept: 'Matrícula Anual',
                    details: ['Derecho de inscripción']
                });
            }
            
            const startYear = new Date().getFullYear();
            let currentMonth = this.planConfig.start_cycle === 'Marzo' ? 3 : 8;
            let currentYear = startYear;

            for (let i = 1; i <= 10; i++) {
                if (currentMonth > 12) {
                    currentMonth = 1;
                    currentYear++;
                }
                if (currentMonth === 1 || currentMonth === 2) currentMonth = 3;
                
                const dueDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-10`;
                
                planData.push({
                    amount: this.planConfig.quota_amount,
                    due_date: dueDate,
                    type: 'Cuota',
                    concept: `Cuota ${i} (${currentMonth}/${currentYear})`,
                    details: ['Mensualidad']
                });
                
                currentMonth++;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/students/' + this.student.id + '/generate-payments', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
                    body: JSON.stringify(planData)
                });
                
                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    this.successMessage = "Alumno matriculado exitosamente.";
                    this.generatePlanModal = false;
                    await this.fetchStudent(this.student.id);
                    setTimeout(() => { this.successMessage = null; }, 3000);
                } else {
                    this.error = result.message || "Error al matricular el alumno.";
                }
            } catch (e) {
                console.error(e);
                this.error = "Error de conexión.";
            } finally {
                this.generatingPlan = false;
            }
        },
        async openPaymentModal(payment = null) {
            let amountVal = '';
            let conceptVal = '';
            let baseAmount = 0;
            
            if (payment) {
                baseAmount = parseFloat(payment.base_amount || payment.amount);
                let total = baseAmount;
                
                // Cálculo de interés para cuotas
                if (payment.type === 'Cuota' && this.isLate(payment.due_date)) {
                    const today = new Date();
                    const due = new Date(payment.due_date);
                    const isSameMonth = (today.getFullYear() === due.getFullYear() && today.getMonth() === due.getMonth());
                    const dayOfMonth = today.getDate();
                    
                    let interestRate = 0;
                    if (!isSameMonth || dayOfMonth > 20) {
                        interestRate = (this.paymentConfigs.interest_after_20 || 20) / 100;
                    } else if (dayOfMonth > 10) {
                        interestRate = (this.paymentConfigs.interest_after_10 || 10) / 100;
                    }
                    total += Math.round(baseAmount * interestRate);
                }
                amountVal = total.toFixed(2);
                conceptVal = payment.concept;
            }

            const { value: formValues } = await Swal.fire({
                title: payment ? `Cobrar Concepto: ${payment.concept}` : `Registrar Pago`,
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
                    const token = localStorage.getItem('token');
                    if (payment) {
                        response = await fetch(window.API_BASE + `/api/payments/${payment.id}/process`, {
                            method: 'POST',
                            headers: { 
                                'Authorization': 'Bearer ' + token,
                                'Content-Type': 'application/json' 
                            },
                            body: JSON.stringify({
                                paid_amount: formValues.amount,
                                base_amount: baseAmount,
                                interest_amount: parseFloat(formValues.amount) - baseAmount,
                                payment_method: formValues.payment_method,
                                notes: `Cobro desde edición de alumno`
                            })
                        });
                    } else {
                        response = await fetch(window.API_BASE + '/api/payments', {
                            method: 'POST',
                            headers: { 
                                'Authorization': 'Bearer ' + token,
                                'Content-Type': 'application/json' 
                            },
                            body: JSON.stringify(formValues)
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
        showNewPaymentModal() {
            this.openPaymentModal(null);
        },
        async notifyLatePayment(paymentId) {
            if (!confirm("¿Enviar notificación de atraso al correo del alumno?")) return;
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/payments/' + paymentId + '/notify-late', {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    alert("Notificación enviada con éxito.");
                } else {
                    alert("Error: " + (result.message || "Error desconocido"));
                }
            } catch (e) {
                alert("Error de conexión al enviar la notificación.");
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
                        await this.fetchStudent(this.student.id);
                    } else {
                        Swal.fire('Error', res.message, 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'No se pudo eliminar el pago.', 'error');
                }
            }
        },
        async notifyMissingDocs() {
            if (!confirm("¿Deseas enviar un correo al alumno recordando la documentación faltante?")) return;
            
            this.sendingNotification = true;
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/reminders/documentation', {
                    method: 'POST',
                    headers: { 
                        'Authorization': 'Bearer ' + token,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ student_id: this.student.id })
                });
                const result = await response.json();
                if (result.status === 'success') {
                    Swal.fire('¡Enviado!', 'Se ha enviado el recordatorio por email.', 'success');
                } else {
                    Swal.fire('Atención', result.message || 'Error al enviar notificación', 'warning');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'No se pudo conectar con el servidor para enviar la notificación.', 'error');
            } finally {
                this.sendingNotification = false;
            }
        },
        async uploadDoc(event, type) {
            const file = event.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${window.API_BASE}/api/students/${this.student.id}/documents/${type}`, {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer ' + token },
                    body: formData
                });

                const result = await response.json();
                if (result.status === 'success') {
                    Swal.fire('¡Éxito!', 'Archivo subido correctamente.', 'success');
                    this.student['file_' + type] = result.path;
                } else {
                    Swal.fire('Error', result.message || 'Error al subir archivo', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Error de conexión al subir el documento.', 'error');
            }
        }
    },
    async mounted() {
        await this.fetchMetadata();
        await this.fetchCareers();
        await this.fetchPaymentConfigs();
        
        const id = this.$route.query.id;
        if(id) {
            await this.fetchStudent(id);
        } else {
            this.originalStudent = JSON.stringify(this.student);
        }
    }
}
