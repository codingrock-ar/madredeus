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
                            <a class="nav-link" :class="{active: tab === 'personal'}" href="#" @click.prevent="tab = 'personal'">Datos Personales</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{active: tab === 'academic'}" href="#" @click.prevent="tab = 'academic'">Académico</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{active: tab === 'contact'}" href="#" @click.prevent="tab = 'contact'">Domicilio y Contacto</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" :class="{active: tab === 'docs'}" href="#" @click.prevent="tab = 'docs'">Documentación y Otros</a>
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
                                            <input type="text" class="form-control form-control-sm" v-model="ins.commission">
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

                        <!-- TAB: DOCS & OTHERS -->
                        <div v-show="tab === 'docs' || isPrinting" class="fade-in">
                            <div class="row g-4">
                                <div class="col-md-12">
                                    <h6 class="fw-bold mb-3">Requisitos</h6>
                                    
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <div class="form-check mb-2">
                                                <input class="form-check-input" type="checkbox" id="req1" v-model="student.req_dni_photocopy">
                                                <label class="form-check-label" for="req1">Fotocopia del DNI</label>
                                            </div>
                                            
                                            <div class="mb-3">
                                                <div class="form-check mb-1">
                                                    <input class="form-check-input" type="checkbox" id="req2" v-model="student.req_degree_photocopy">
                                                    <label class="form-check-label" for="req2">Fotocopia del título</label>
                                                </div>
                                                <textarea v-if="student.req_degree_photocopy" class="form-control form-control-sm mt-1" v-model="student.req_degree_photocopy_obs" placeholder="Observaciones título..."></textarea>
                                            </div>

                                            <div class="form-check mb-3">
                                                <input class="form-check-input" type="checkbox" id="req3" v-model="student.req_two_photos">
                                                <label class="form-check-label" for="req3">Dos fotos 4x4</label>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                             <div class="mb-3">
                                                <div class="form-check mb-1">
                                                    <input class="form-check-input" type="checkbox" id="req4" v-model="student.req_psychophysical">
                                                    <label class="form-check-label" for="req4">Certificado de aptitud psicofísica</label>
                                                </div>
                                                <textarea v-if="student.req_psychophysical" class="form-control form-control-sm mt-1" v-model="student.req_psychophysical_obs" placeholder="Observaciones psicofísico..."></textarea>
                                            </div>

                                            <div class="mb-3">
                                                <div class="form-check mb-1">
                                                    <input class="form-check-input" type="checkbox" id="req5" v-model="student.req_vaccines">
                                                    <label class="form-check-label" for="req5">Certificado de vacunas</label>
                                                </div>
                                                <textarea v-if="student.req_vaccines" class="form-control form-control-sm mt-1" v-model="student.req_vaccines_obs" placeholder="Observaciones vacunas..."></textarea>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <div class="form-check mb-3">
                                                <input class="form-check-input" type="checkbox" id="req6" v-model="student.req_student_book">
                                                <label class="form-check-label" for="req6">Libreta</label>
                                            </div>
                                        </div>
                                        
                                        <div class="col-md-6">
                                            <div class="mb-3">
                                                <div class="form-check mb-1">
                                                    <input class="form-check-input" type="checkbox" id="req7" v-model="student.req_final_degree">
                                                    <label class="form-check-label" for="req7">Título Final</label>
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
                inscriptions: []
            },
            originalStudent: null,
            loading: false,
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
            photoPreview: null
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
                const endpoint = id ? '/api/students/' + id : '/api/students';

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
        }
    },
    async mounted() {
        await this.fetchMetadata();
        await this.fetchCareers();
        
        const id = this.$route.query.id;
        if(id) {
            await this.fetchStudent(id);
        } else {
            this.originalStudent = JSON.stringify(this.student);
        }
    }
}
