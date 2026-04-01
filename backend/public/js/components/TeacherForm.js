export default {
    template: `
    <div class="fade-in">
        <div class="card-modern shadow-sm border-0 p-0 overflow-hidden">
            <div class="card-header bg-white border-bottom p-4">
                <div class="d-flex align-items-center mb-3">
                    <button class="btn btn-light btn-sm me-3 border" @click="$router.push('/teachers')">
                        <i class="ph ph-arrow-left"></i> Volver
                    </button>
                    <h4 class="mb-0 fw-bold">{{ teacher.id ? 'Ficha del Docente' : 'Nuevo Docente' }}</h4>
                </div>
            </div>
            
            <div class="card-body p-4 p-md-5">
                <ul class="nav nav-tabs mb-4" id="teacherTabs">
                    <li class="nav-item">
                        <a class="nav-link" :class="{active: tab === 'personal'}" href="#" @click.prevent="tab = 'personal'">Datos Personales</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" :class="{active: tab === 'academic_home'}" href="#" @click.prevent="tab = 'academic_home'">Estudios y Domicilio</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" :class="{active: tab === 'contact_exp'}" href="#" @click.prevent="tab = 'contact_exp'">Contacto y Experiencia</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" :class="{active: tab === 'req_cost'}" href="#" @click.prevent="tab = 'req_cost'">Requisitos y Costo</a>
                    </li>
                </ul>

                <form @submit.prevent="saveTeacher">
                    <div v-show="tab === 'personal'" class="fade-in">
                        <div class="row g-4 mb-4">
                            <div class="col-md-3 text-center">
                                <h5 class="text-primary mb-3 text-start"><i class="ph ph-camera me-2"></i>Foto</h5>
                                <div class="position-relative d-inline-block mb-3">
                                    <img :src="teacher.image || 'https://ui-avatars.com/api/?name=' + (teacher.name||'Docente') + '+' + (teacher.lastname||'Nuevo') + '&size=128'" 
                                         class="rounded shadow-sm object-fit-cover border" 
                                         style="width: 150px; height: 150px;"
                                         id="photo-preview">
                                    
                                    <label for="teacher-photo-upload" class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle p-2 shadow" title="Cambiar Foto" style="cursor: pointer; transform: translate(30%, 30%);">
                                        <i class="ph ph-pencil-simple fs-5"></i>
                                        <input type="file" id="teacher-photo-upload" class="d-none" @change="handleFileChange" accept="image/*">
                                    </label>
                                </div>
                            </div>

                            <div class="col-md-9">
                                <h5 class="text-primary mb-3"><i class="ph ph-user-circle me-2"></i>Información Personal</h5>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">Nombre <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" v-model="teacher.name" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">Apellido <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" v-model="teacher.lastname" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">Fecha de Nacimiento</label>
                                        <input type="date" class="form-control" v-model="teacher.birthdate">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">Lugar de Nacimiento</label>
                                        <input type="text" class="form-control" v-model="teacher.birth_place">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label text-muted small fw-bold">Tipo de Documento</label>
                                        <select class="form-select" v-model="teacher.document_type">
                                            <option value="DNI">DNI</option>
                                            <option value="Cédula de Identidad">Cédula de Identidad</option>
                                            <option value="Pasaporte">Pasaporte</option>
                                            <option value="Libreta Cívica (LC)">Libreta Cívica (LC)</option>
                                            <option value="Libreta de Enrolamiento (LE)">Libreta de Enrolamiento (LE)</option>
                                            <option value="Cédula de Identidad Extranjera">Cédula de Identidad Extranjera</option>
                                            <option value="DU">DU</option>
                                        </select>
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label text-muted small fw-bold">Número de Documento</label>
                                        <input type="text" class="form-control" v-model="teacher.dni">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label text-muted small fw-bold">Estado Civil</label>
                                        <select class="form-select" v-model="teacher.civil_status">
                                            <option value="Soltero">Soltero</option>
                                            <option value="Casado">Casado</option>
                                            <option value="Divorciado">Divorciado</option>
                                            <option value="Viudo">Viudo</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="tab === 'academic_home'" class="fade-in">
                        <div class="row g-4">
                            <div class="col-md-6">
                                <h5 class="text-primary mb-3"><i class="ph ph-graduation-cap me-2"></i>Estudios</h5>
                                <div class="row g-3">
                                    <div class="col-md-12">
                                        <label class="form-label text-muted small fw-bold">Máximo Nivel Alcanzado</label>
                                        <select class="form-select" v-model="teacher.max_education_level">
                                            <option value="Secundario">Secundario</option>
                                            <option value="Terciario">Terciario</option>
                                            <option value="Universitario">Universitario</option>
                                            <option value="Posgrado">Posgrado</option>
                                        </select>
                                    </div>
                                    <div class="col-md-12">
                                        <label class="form-label text-muted small fw-bold d-block">Finalizado</label>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" value="Si" v-model="teacher.education_finished" id="fin_si">
                                            <label class="form-check-label" for="fin_si">Si</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" value="No" v-model="teacher.education_finished" id="fin_no">
                                            <label class="form-check-label" for="fin_no">No</label>
                                        </div>
                                    </div>
                                    <div class="col-md-12">
                                        <label class="form-label text-muted small fw-bold">Título Obtenido</label>
                                        <input type="text" class="form-control" v-model="teacher.degree_obtained">
                                    </div>
                                    <div class="col-md-12">
                                        <label class="form-label text-muted small fw-bold">Establecimiento</label>
                                        <input type="text" class="form-control" v-model="teacher.institution">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-6">
                                <h5 class="text-primary mb-3"><i class="ph ph-map-pin me-2"></i>Domicilio</h5>
                                <div class="row g-3">
                                    <div class="col-md-8">
                                        <label class="form-label text-muted small fw-bold">Calle</label>
                                        <input type="text" class="form-control" v-model="teacher.address_street">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label text-muted small fw-bold">Número</label>
                                        <input type="text" class="form-control" v-model="teacher.address_number">
                                    </div>
                                    <div class="col-md-12">
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" value="Casa" v-model="teacher.address_type" id="addr_casa">
                                            <label class="form-check-label" for="addr_casa">Casa</label>
                                        </div>
                                        <div class="form-check form-check-inline">
                                            <input class="form-check-input" type="radio" value="Departamento" v-model="teacher.address_type" id="addr_depto">
                                            <label class="form-check-label" for="addr_depto">Departamento</label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">Provincia</label>
                                        <input type="text" class="form-control" v-model="teacher.address_province">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label text-muted small fw-bold">Localidad</label>
                                        <input type="text" class="form-control" v-model="teacher.address_locality">
                                    </div>
                                    <div class="col-md-12">
                                        <label class="form-label text-muted small fw-bold">Código Postal</label>
                                        <input type="text" class="form-control" v-model="teacher.address_zip_code">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-show="tab === 'contact_exp'" class="fade-in">
                        <div class="row g-4">
                            <div class="col-md-12">
                                <h5 class="text-primary mb-3"><i class="ph ph-phone me-2"></i>Datos de Contacto</h5>
                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <label class="form-label text-muted small fw-bold">E-mail</label>
                                        <input type="email" class="form-control" v-model="teacher.email" placeholder="example@domain.com">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label text-muted small fw-bold">Teléfono Fijo</label>
                                        <input type="tel" class="form-control" v-model="teacher.phone_landline">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label text-muted small fw-bold">Teléfono Móvil</label>
                                        <input type="tel" class="form-control" v-model="teacher.phone_mobile">
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <h5 class="text-primary mb-3"><i class="ph ph-briefcase me-2"></i>Experiencia Laboral Asistencial</h5>
                                <textarea class="form-control" rows="6" v-model="teacher.exp_asistencial"></textarea>
                            </div>
                            <div class="col-md-6">
                                <h5 class="text-primary mb-3"><i class="ph ph-chalkboard-teacher me-2"></i>Experiencia Laboral Académica Docente</h5>
                                <textarea class="form-control" rows="6" v-model="teacher.exp_academica"></textarea>
                            </div>
                        </div>
                    </div>

                    <div v-show="tab === 'req_cost'" class="fade-in">
                        <div class="row g-4">
                            <div class="col-md-8">
                                <h5 class="text-primary mb-3"><i class="ph ph-list-checks me-2"></i>Requisitos</h5>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="form-check mb-3">
                                            <input class="form-check-input" type="checkbox" v-model="teacher.req_cv" id="req_cv">
                                            <label class="form-check-label" for="req_cv">CV</label>
                                        </div>
                                        <div class="mb-3">
                                            <div class="form-check mb-1">
                                                <input class="form-check-input" type="checkbox" v-model="teacher.req_psycho" id="req_psycho">
                                                <label class="form-check-label" for="req_psycho">Certificado de aptitud psicofisica</label>
                                            </div>
                                            <textarea class="form-control form-control-sm" rows="2" v-model="teacher.req_psycho_obs" v-if="teacher.req_psycho"></textarea>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check mb-3">
                                            <input class="form-check-input" type="checkbox" v-model="teacher.req_dni_copy" id="req_dni">
                                            <label class="form-check-label" for="req_dni">Fotocopia del DNI</label>
                                        </div>
                                        <div class="mb-3">
                                            <div class="form-check mb-1">
                                                <input class="form-check-input" type="checkbox" v-model="teacher.req_degree_copy" id="req_degree">
                                                <label class="form-check-label" for="req_degree">Fotocopia del título</label>
                                            </div>
                                            <textarea class="form-control form-control-sm" rows="2" v-model="teacher.req_degree_copy_obs" v-if="teacher.req_degree_copy"></textarea>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <h5 class="text-primary mb-3"><i class="ph ph-currency-dollar me-2"></i>Costo del docente</h5>
                                <div class="row g-3">
                                    <div class="col-md-12">
                                        <label class="form-label text-muted small fw-bold">[$]</label>
                                        <input type="number" step="0.01" class="form-control" v-model="teacher.cost_amount">
                                    </div>
                                    <div class="col-md-12">
                                        <label class="form-label text-muted small fw-bold">Unidad de tiempo</label>
                                        <select class="form-select" v-model="teacher.cost_unit">
                                            <option value="Minuto">Minuto</option>
                                            <option value="Fracción (20 minutos)">Fracción (20 minutos)</option>
                                            <option value="Hora Cátedra">Hora Cátedra</option>
                                            <option value="Hora Reloj">Hora Reloj</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mt-5 pt-4 border-top text-end">
                        <button type="button" class="btn btn-light me-2 btn-lg" @click="$router.push('/teachers')">Cancelar</button>
                        <button type="submit" class="btn btn-primary px-5 btn-lg shadow-sm" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {{ teacher.id ? 'Guardar Cambios' : 'Crear Docente' }}
                        </button>
                    </div>
                    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
                </form>
            </div>
        </div>

        <!-- MODAL DE RECORTE -->
        <div class="modal fade" id="cropModal" tabindex="-1" aria-hidden="true" data-bs-backdrop="static">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Recortar Foto de Perfil</h5>
                        <button type="button" class="btn-close" @click="closeCropModal"></button>
                    </div>
                    <div class="modal-body p-0" style="max-height: 70vh; overflow: hidden; background: #000;">
                        <div class="img-container">
                            <img id="image-to-crop" style="max-width: 100%;">
                        </div>
                    </div>
                    <div class="modal-footer justify-content-between">
                        <div class="btn-group">
                            <button class="btn btn-outline-secondary" @click="cropper.rotate(-90)" title="Rotar Izquierda">
                                <i class="ph ph-arrow-counter-clockwise"></i>
                            </button>
                            <button class="btn btn-outline-secondary" @click="cropper.rotate(90)" title="Rotar Derecha">
                                <i class="ph ph-arrow-clockwise"></i>
                            </button>
                        </div>
                        <div>
                            <button type="button" class="btn btn-light me-2" @click="closeCropModal">Cancelar</button>
                            <button type="button" class="btn btn-primary" @click="cropAndUpload">
                                <span v-if="uploading" class="spinner-border spinner-border-sm me-1"></span>
                                Aplicar y Subir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            tab: 'personal',
            teacher: { 
                image: '',
                document_type: 'DNI',
                civil_status: 'Soltero',
                max_education_level: 'Secundario',
                education_finished: 'No',
                address_type: 'Casa',
                cost_unit: 'Hora',
                req_cv: false,
                req_psycho: false,
                req_dni_copy: false,
                req_degree_copy: false
            },
            loading: false,
            uploading: false,
            error: null,
            cropper: null,
            cropModal: null
        }
    },
    methods: {
        async fetchTeacher(id) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/teachers/' + id, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();
                
                if (response.ok && result.status === 'success') {
                    const data = result.data;
                    // Parse Booleans from DB (0/1)
                    data.req_cv = data.req_cv == 1;
                    data.req_psycho = data.req_psycho == 1;
                    data.req_dni_copy = data.req_dni_copy == 1;
                    data.req_degree_copy = data.req_degree_copy == 1;
                    this.teacher = data;
                } else {
                    this.error = result.error || 'Error cargando datos del docente';
                }
            } catch (error) {
                console.error("Error:", error);
                this.error = "Error de conexión";
            }
        },
        handleFileChange(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.getElementById('image-to-crop');
                img.src = e.target.result;
                
                if (!this.cropModal) {
                    this.cropModal = new bootstrap.Modal(document.getElementById('cropModal'));
                }
                this.cropModal.show();
                
                // Inicializar cropper después de que el modal se muestre
                setTimeout(() => {
                    if (this.cropper) {
                        this.cropper.destroy();
                    }
                    this.cropper = new Cropper(img, {
                        aspectRatio: 1,
                        viewMode: 1,
                        background: false
                    });
                }, 200);
            };
            reader.readAsDataURL(file);
            // Reset input so change triggers again for same file
            event.target.value = '';
        },
        closeCropModal() {
            if (this.cropper) {
                this.cropper.destroy();
                this.cropper = null;
            }
            if (this.cropModal) {
                this.cropModal.hide();
            }
        },
        async cropAndUpload() {
            if (!this.cropper) return;
            
            this.uploading = true;
            const canvas = this.cropper.getCroppedCanvas({
                width: 400,
                height: 400
            });

            const base64Image = canvas.toDataURL('image/jpeg', 0.85);

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/teachers/upload-photo', {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ image: base64Image })
                });

                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    this.teacher.image = result.url;
                    this.closeCropModal();
                } else {
                    alert(result.error || 'Error al subir la imagen');
                }
            } catch (e) {
                console.error(e);
                alert('Error de conexión al subir la imagen');
            } finally {
                this.uploading = false;
            }
        },
        async saveTeacher() {
            this.error = null;
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const id = this.teacher.id;
                const method = id ? 'PUT' : 'POST';
                const endpoint = id ? '/api/teachers/' + id : '/api/teachers';

                const response = await fetch(endpoint, {
                    method: method,
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.teacher)
                });

                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    this.$router.push('/teachers');
                } else {
                    this.error = result.error || 'Ocurrió un error al guardar';
                }
            } catch(e) {
                console.error(e);
                this.error = "Error de red al guardar";
            } finally {
                this.loading = false;
            }
        }
    },
    mounted() {
        const id = this.$route.query.id;
        if(id) {
            this.fetchTeacher(id);
        }
    }
}
