export default {
    template: `
    <div class="fade-in">
        <div class="row">
            <div class="col-md-3 mb-4">
                <div class="card-modern p-4 text-center h-100">
                    <div class="position-relative d-inline-block mb-3">
                        <!-- Dynamic avatar or fallback -->
                        <img :src="'https://ui-avatars.com/api/?name=' + (student.name||'Nuevo') + '+' + (student.lastname||'Estudiante') + '&size=128'" class="rounded-circle shadow-sm" style="width: 120px; height: 120px;">
                        <button class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle p-2" title="Cambiar Foto">
                            <i class="ph ph-camera"></i>
                        </button>
                    </div>
                    <h5 class="fw-bold">{{ student.lastname || 'Nuevo' }}, {{ student.name || 'Estudiante' }}</h5>
                    <p class="text-muted small" v-if="student.id">ID: {{ student.id }}</p>
                    
                    <hr>
                    <div class="text-start small" v-if="student.id">
                        <p class="mb-1"><strong>DNI:</strong> {{ student.dni }}</p>
                        <p class="mb-1"><strong>Estado:</strong> <span class="text-danger fw-bold">{{ student.status }}</span></p>
                        <p class="mb-1"><strong>Inscripción:</strong> 29/12/2023</p>
                    </div>
                    
                    <div class="d-grid gap-2 mt-4">
                        <button class="btn btn-outline-primary btn-sm"><i class="ph ph-printer me-2"></i>Imprimir Ficha</button>
                        <button class="btn btn-outline-secondary btn-sm" @click="$router.push('/students')"><i class="ph ph-arrow-left me-2"></i>Volver</button>
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
                            <a class="nav-link" :class="{active: tab === 'docs'}" href="#" @click.prevent="tab = 'docs'">Documentación</a>
                        </li>
                         <li class="nav-item">
                            <a class="nav-link" :class="{active: tab === 'notes'}" href="#" @click.prevent="tab = 'notes'">Observaciones</a>
                        </li>
                    </ul>

                    <form>
                        <div v-if="tab === 'personal'">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Nombre</label>
                                    <input type="text" class="form-control" v-model="student.name">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Apellido</label>
                                    <input type="text" class="form-control" v-model="student.lastname">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">DNI</label>
                                    <input type="text" class="form-control" v-model="student.dni">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Fecha Nacimiento</label>
                                    <input type="date" class="form-control" v-model="student.birthdate">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Nacionalidad</label>
                                    <select class="form-select" v-model="student.nationality">
                                        <option value="Argentina">Argentina</option>
                                        <option value="Perú">Perú</option>
                                        <option selected>Otro</option>
                                    </select>
                                </div>
                                
                                <div class="col-12"><hr class="text-muted my-2"></div>
                                
                                <div class="col-md-6">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" v-model="student.email" placeholder="alumno@email.com">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Teléfono Móvil</label>
                                    <input type="tel" class="form-control" v-model="student.phone" placeholder="Ej: 1122734789">
                                </div>
                                <div class="col-md-8">
                                    <label class="form-label">Domicilio</label>
                                    <input type="text" class="form-control" v-model="student.address" placeholder="Calle y número">
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Localidad</label>
                                    <input type="text" class="form-control" v-model="student.city">
                                </div>
                            </div>
                        </div>

                        <div v-if="tab === 'academic'">
                            <div class="row g-3">
                                <div class="col-md-12">
                                    <div class="alert alert-info d-flex align-items-center" role="alert" v-if="student.status === 'Abandono'">
                                        <i class="ph ph-info me-2 fs-5"></i>
                                        <div>El estudiante está en condición de <strong>Abandono</strong> desde Marzo 2024.</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Carrera</label>
                                    <select class="form-select" v-model="student.career">
                                        <option>Enfermería Profesional</option>
                                        <option>Radiología</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Ciclo Lectivo</label>
                                    <select class="form-select">
                                        <option>2024</option>
                                        <option>2025</option>
                                        <option>2026</option>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Periodo</label>
                                    <select class="form-select">
                                        <option>1</option>
                                        <option>2</option>
                                        <option selected>3</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Comisión</label>
                                    <select class="form-select" v-model="student.commission">
                                        <option>A</option>
                                        <option>B</option>
                                        <option>C</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Turno</label>
                                    <select class="form-select" v-model="student.shift">
                                        <option>TM</option>
                                        <option>TN</option>
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">Estado</label>
                                    <select class="form-select border-danger text-danger fw-bold" v-model="student.status">
                                        <option value="En Curso">En Curso</option>
                                        <option value="Abandono">Abandono</option>
                                        <option value="Egresado">Egresado</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <!-- El resto del HTML Docs y Notes se mantiene igual -->
                        <div v-if="tab === 'docs'">
                            <div class="row g-4">
                                <div class="col-md-6">
                                    <h6 class="fw-bold mb-3 text-primary">Requisitos de Ingreso</h6>
                                    <div class="form-check mb-2">
                                        <input class="form-check-input" type="checkbox" id="doc1" checked>
                                        <label class="form-check-label" for="doc1">Fotocopia DNI</label>
                                    </div>
                                    <div class="form-check mb-2">
                                        <input class="form-check-input" type="checkbox" id="doc2" checked>
                                        <label class="form-check-label" for="doc2">Título Secundario / Polimodal</label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div v-if="tab === 'notes'">
                            <label class="form-label">Historial y Notas Administrativas</label>
                            <textarea class="form-control" rows="8" style="background-color: #fffbeb; border-color: #fcd34d;">Sin observaciones.</textarea>
                        </div>

                        <div class="mt-4 pt-3 border-top text-end">
                            <button type="button" class="btn btn-light me-2" @click="$router.push('/students')">Volver al Listado</button>
                            <button type="button" class="btn btn-primary px-4" @click="saveStudent" :disabled="loading">
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
            student: { status: 'En Curso' },
            loading: false,
            error: null,
            successMessage: null
        }
    },
    methods: {
        async fetchStudent(id) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/students/' + id, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();
                
                if (response.ok && result.status === 'success') {
                    this.student = result.data;
                } else {
                    this.error = result.error || 'Error cargando datos del estudiante';
                }
            } catch (error) {
                console.error("Error:", error);
                this.error = "Error de conexión";
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
                    
                    if (!id) {
                         // Si es creación nueva y no tenemos id, forzamos recarga y redirigimos suavemente
                        setTimeout(() => { this.$router.push('/students') }, 1500);
                    } else {
                         // Si es edición lo dejamos en la ficha y refetch status actual
                         this.fetchStudent(id);
                    }
                    
                    // Ocultar mensaje de éxito despues de 3 segundos
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
        }
    },
    mounted() {
        const id = this.$route.query.id;
        if(id) {
            this.fetchStudent(id);
        }
    }
}
