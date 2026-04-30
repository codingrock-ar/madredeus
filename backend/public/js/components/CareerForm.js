export default {
    template: `
    <div class="fade-in">
        <div class="card-modern shadow-sm border-0 p-0 overflow-hidden">
            <div class="card-header bg-white border-bottom p-4">
                <div class="d-flex align-items-center mb-3">
                    <button class="btn btn-light btn-sm me-3 border" @click="$router.push('/careers')">
                        <i class="ph ph-arrow-left"></i> Volver
                    </button>
                    <h4 class="mb-0 fw-bold">{{ career.id ? 'Ficha de Carrera' : 'Nueva Carrera' }}</h4>
                </div>
            </div>
            
            <div class="card-body p-4 p-md-5">
                <form @submit.prevent="saveCareer">
                    <div class="row g-4 mb-4" :class="{'opacity-75': isViewMode}">
                        <h5 class="text-primary mb-3"><i class="ph ph-student me-2"></i>{{ isViewMode ? 'Información Detallada' : 'Información de la Carrera' }}</h5>
                        
                        <div class="col-md-8">
                            <label class="form-label text-muted small fw-bold">Título de la Carrera <span class="text-danger" v-if="!isViewMode">*</span></label>
                            <input type="text" class="form-control" v-model="career.title" :required="!isViewMode" :disabled="isViewMode" placeholder="Ej: Enfermería Profesional">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-muted small fw-bold">Duración (Años) <span class="text-danger" v-if="!isViewMode">*</span></label>
                            <input type="number" class="form-control" v-model="career.duration" :required="!isViewMode" :disabled="isViewMode" min="1" max="10">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label text-muted small fw-bold">Resolución</label>
                            <input type="text" class="form-control" v-model="career.resolution" :disabled="isViewMode" placeholder="Ej: Res. 123/24">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-muted small fw-bold">Título a otorgar</label>
                            <input type="text" class="form-control" v-model="career.degree_title" :disabled="isViewMode" placeholder="Ej: Enfermero/a Profesional">
                        </div>

                        <div class="col-12">
                            <label class="form-label text-muted small fw-bold">Plan de Estudio (Archivo PDF/Doc)</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="ph ph-file-pdf"></i></span>
                                <input v-if="!isViewMode" type="file" class="form-control" @change="handleFileUpload" accept=".pdf,.doc,.docx,.txt,.zip">
                                <button v-if="career.study_plan" type="button" class="btn btn-outline-secondary" @click="viewStudyPlan">
                                    <i class="ph ph-eye me-1"></i> Ver Actual
                                </button>
                                <span v-else-if="isViewMode" class="form-control text-muted">No hay archivo adjunto</span>
                            </div>
                            <small class="text-muted mt-1 d-block" v-if="uploading">
                                <span class="spinner-border spinner-border-sm me-1"></span> Subiendo plan...
                            </small>
                            <small v-if="!isViewMode" class="text-muted mt-1 d-block">Formatos aceptados: PDF, DOC, DOCX, TXT, ZIP.</small>
                        </div>
                    </div>
                    
                    <div v-if="career.id && career.subjects && career.subjects.length > 0" class="mt-5 pt-4 border-top fade-in">
                        <h5 class="text-primary mb-4"><i class="ph ph-books me-2"></i>Plan de Estudios (Materias)</h5>
                        <div v-for="(quarters, year) in groupedSubjects" :key="year" class="mb-4">
                            <h6 class="fw-bold bg-light p-2 rounded mb-3 shadow-none border-start border-primary border-4">
                                <i class="ph ph-calendar-blank me-2"></i>Año {{ year }}
                            </h6>
                            <div class="row g-3">
                                <div v-for="(subjects, quarter) in quarters" :key="quarter" class="col-md-6">
                                    <div class="card border border-light-subtle shadow-none h-100">
                                        <div class="card-header bg-light-subtle py-2 d-flex justify-content-between align-items-center">
                                            <span class="badge bg-primary-subtle text-primary small">{{ quarter }}º Cuatrimestre</span>
                                            <div class="d-flex gap-2 align-items-center">
                                                <span class="text-muted small me-2">{{ subjects.length }} materias</span>
                                                <button v-if="!isViewMode" type="button" class="btn btn-primary btn-xs py-0 px-2" @click="openAddModal(year, quarter)" style="font-size: 0.7rem;">
                                                    <i class="ph ph-plus-circle me-1"></i> Agregar
                                                </button>
                                            </div>
                                        </div>
                                        <div class="card-body p-0">
                                            <ul class="list-group list-group-flush small">
                                                <li v-for="s in subjects" :key="s.id" class="list-group-item d-flex justify-content-between align-items-center py-2 border-light-subtle">
                                                    <span>{{ s.name }}</span>
                                                    <div class="d-flex gap-2 align-items-center">
                                                        <i v-if="s.program" class="ph ph-file-pdf text-danger" title="Tiene programa"></i>
                                                        <button v-if="!isViewMode" type="button" class="btn btn-link btn-sm p-0 text-primary" @click="$router.push('/subject/form?id=' + s.id)">
                                                            <i class="ph ph-pencil-simple"></i>
                                                        </button>
                                                        <button v-if="!isViewMode" type="button" class="btn btn-link btn-sm p-0 text-danger" @click="unlinkSubject(s.id, s.name)">
                                                            <i class="ph ph-trash"></i>
                                                        </button>
                                                    </div>
                                                </li>
                                                <li v-if="subjects.length === 0" class="list-group-item text-muted py-2 fst-italic text-center">
                                                    Sin materias cargadas<br>
                                                    <button v-if="!isViewMode" type="button" class="btn btn-link btn-sm p-0 mt-1" @click="openAddModal(year, quarter)">Cargar ahora</button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-else-if="career.id && !isViewMode" class="mt-5 pt-4 border-top text-center p-5 bg-light rounded border-dashed">
                        <i class="ph ph-books text-muted fs-1 mb-3"></i>
                        <p class="text-muted mb-3">Aún no hay materias cargadas para esta carrera.</p>
                        <button type="button" class="btn btn-outline-primary btn-sm" @click="openAddModal(1, 1)">
                            <i class="ph ph-plus-circle me-1"></i> Cargar primera materia
                        </button>
                    </div>

                    <div class="mt-4 pt-4 border-top text-end">
                        <button type="button" class="btn btn-light me-2" @click="$router.push('/careers')">{{ isViewMode ? 'Cerrar' : 'Cancelar' }}</button>
                        <button v-if="!isViewMode" type="submit" class="btn btn-primary px-4" :disabled="loading || uploading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {{ career.id ? 'Actualizar Cambios' : 'Anexar Carrera' }}
                        </button>
                    </div>
                    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
                </form>
            </div>
        </div>

        <!-- Modal Agregar Materia -->
        <div v-if="showAddModal" class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5); z-index: 1050;">
            <div class="modal-dialog modal-md modal-dialog-centered">
                <div class="modal-content shadow-lg border-0">
                    <div class="modal-header bg-primary text-white p-3">
                        <h5 class="modal-title fw-bold"><i class="ph ph-books me-2"></i>Agregar Materia</h5>
                        <button type="button" class="btn-close btn-close-white" @click="closeAddModal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="mb-3">
                            <label class="badge bg-light text-primary border mb-3">Ubicación: Año {{ modalContext.year }}, Cuatrimestre {{ modalContext.quarter }}</label>
                            
                            <ul class="nav nav-pills nav-fill mb-4 bg-light p-1 rounded-pill" id="pills-tab" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link rounded-pill py-2" :class="{active: addMode === 'new'}" @click="addMode = 'new'" type="button">Nueva Materia</button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link rounded-pill py-2" :class="{active: addMode === 'existing'}" @click="addMode = 'existing'" type="button">Elegir Existente</button>
                                </li>
                            </ul>

                            <div v-if="addMode === 'new'" class="fade-in">
                                <label class="form-label small fw-bold">Nombre de la Materia</label>
                                <input type="text" class="form-control" v-model="quickSubject.name" placeholder="Ej: Anatomía II" @keyup.enter="saveQuickSubject">
                                <small class="text-muted mt-2 d-block">Se creará y vinculará automáticamente a esta carrera.</small>
                            </div>

                            <div v-else class="fade-in">
                                <label class="form-label small fw-bold">Seleccionar de la lista</label>
                                <select class="form-select" v-model="selectedSubjectId">
                                    <option value="">Seleccione una materia disponible...</option>
                                    <option v-for="s in availableSubjects" :key="s.id" :value="s.id">{{ s.name }}</option>
                                </select>
                                <div v-if="availableSubjects.length === 0" class="alert alert-warning mt-2 small p-2">
                                    No hay materias sin carrera asignada en el sistema.
                                </div>
                                <small class="text-muted mt-2 d-block">Solo se muestran materias que no pertenecen a ninguna carrera.</small>
                            </div>
                        </div>
                        
                        <div v-if="modalError" class="alert alert-danger small p-2">{{ modalError }}</div>
                    </div>
                    <div class="modal-footer border-0 p-3 bg-light rounded-bottom">
                        <button type="button" class="btn btn-light" @click="closeAddModal">Cancelar</button>
                        <button type="button" class="btn btn-primary px-4" @click="saveQuickSubject" :disabled="modalLoading">
                            <span v-if="modalLoading" class="spinner-border spinner-border-sm me-1"></span>
                            {{ addMode === 'new' ? 'Crear y Vincular' : 'Vincular Materia' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            career: { title: '', duration: 3, resolution: '', degree_title: '', study_plan: '', subjects: [] },
            loading: false,
            uploading: false,
            isViewMode: false,
            error: null,
            
            // Modal states
            showAddModal: false,
            addMode: 'new',
            modalLoading: false,
            modalError: null,
            modalContext: { year: 1, quarter: 1 },
            quickSubject: { name: '' },
            selectedSubjectId: '',
            allSubjects: []
        }
    },
    computed: {
        groupedSubjects() {
            if (!this.career.subjects) return {};
            const groups = {};
            this.career.subjects.forEach(s => {
                const year = s.academic_year || 1;
                const quarter = s.quarter || 1;
                
                if (!groups[year]) groups[year] = { 1: [], 2: [] };
                if (!groups[year][quarter]) groups[year][quarter] = [];
                
                groups[year][quarter].push(s);
            });
            return groups;
        },
        availableSubjects() {
            return this.allSubjects.filter(s => !s.career_id || s.career_id == 0);
        }
    },
    methods: {
        async fetchCareer(id) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/careers/' + id, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();
                
                if (response.ok && result.status === 'success') {
                    this.career = result.data;
                } else {
                    this.error = result.error || 'Error cargando datos de la carrera';
                }
            } catch (error) {
                console.error("Error:", error);
                this.error = "Error de conexión";
            }
        },
        async fetchAllSubjects() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/subjects', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.status === 'success') {
                    this.allSubjects = result.data;
                }
            } catch (e) { console.error(e); }
        },
        openAddModal(year, quarter) {
            this.modalContext = { year, quarter };
            this.showAddModal = true;
            this.modalError = null;
            this.fetchAllSubjects();
        },
        closeAddModal() {
            this.showAddModal = false;
            this.quickSubject.name = '';
            this.selectedSubjectId = '';
            this.addMode = 'new';
        },
        async saveQuickSubject() {
            this.modalError = null;
            if (this.addMode === 'new' && !this.quickSubject.name) {
                this.modalError = "El nombre es obligatorio";
                return;
            }
            if (this.addMode === 'existing' && !this.selectedSubjectId) {
                this.modalError = "Debe seleccionar una materia";
                return;
            }

            this.modalLoading = true;
            try {
                const token = localStorage.getItem('token');
                let response;

                if (this.addMode === 'new') {
                    response = await fetch(window.API_BASE + '/api/subjects', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: this.quickSubject.name,
                            career_id: this.career.id,
                            academic_year: this.modalContext.year,
                            quarter: this.modalContext.quarter
                        })
                    });
                } else {
                    // Link existing
                    const subject = this.allSubjects.find(s => s.id == this.selectedSubjectId);
                    response = await fetch(window.API_BASE + '/api/subjects/' + this.selectedSubjectId, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            ...subject,
                            career_id: this.career.id,
                            academic_year: this.modalContext.year,
                            quarter: this.modalContext.quarter
                        })
                    });
                }

                if (response.ok) {
                    this.closeAddModal();
                    this.fetchCareer(this.career.id);
                } else {
                    const res = await response.json();
                    this.modalError = res.error || "Error al procesar la solicitud";
                }
            } catch (e) {
                console.error(e);
                this.modalError = "Error de red";
            } finally {
                this.modalLoading = false;
            }
        },
        async unlinkSubject(id, name) {
            if (!confirm(`¿Estás seguro que deseas quitar la materia "${name}" de esta carrera? No se eliminará del sistema, pero ya no formará parte del plan de estudios.`)) return;
            
            try {
                const token = localStorage.getItem('token');
                // First get the subject data to preserve other fields
                const getRes = await fetch(window.API_BASE + '/api/subjects/' + id, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const subject = (await getRes.json()).data;
                
                const response = await fetch(window.API_BASE + '/api/subjects/' + id, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...subject,
                        career_id: null
                    })
                });

                if (response.ok) {
                    this.fetchCareer(this.career.id);
                } else {
                    alert("Error al desvincular materia");
                }
            } catch (e) {
                console.error(e);
                alert("Error de conexión");
            }
        },
        async handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            this.uploading = true;
            this.error = null;

            const formData = new FormData();
            formData.append('study_plan', file);

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/careers/upload-plan', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    this.career.study_plan = result.url;
                } else {
                    this.error = result.error || 'Error al subir el archivo';
                }
            } catch (e) {
                console.error(e);
                this.error = 'Error de conexión al subir el archivo';
            } finally {
                this.uploading = false;
            }
        },
        viewStudyPlan() {
            if (this.career.study_plan) {
                window.open(window.API_BASE + '/' + this.career.study_plan, '_blank');
            }
        },
        async saveCareer() {
            this.error = null;
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const id = this.career.id;
                const method = id ? 'PUT' : 'POST';
                const endpoint = id ? window.API_BASE + '/api/careers/' + id : window.API_BASE + '/api/careers';

                const response = await fetch(endpoint, {
                    method: method,
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.career)
                });

                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    this.$router.push('/careers');
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
        this.isViewMode = this.$route.query.view === '1';
        if(id) {
            this.fetchCareer(id);
        }
    }
}
