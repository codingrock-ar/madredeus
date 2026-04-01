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
                    <div class="row g-4 mb-4">
                        <h5 class="text-primary mb-3"><i class="ph ph-student me-2"></i>Información de la Carrera</h5>
                        
                        <div class="col-md-8">
                            <label class="form-label text-muted small fw-bold">Título de la Carrera <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" v-model="career.title" required placeholder="Ej: Enfermería Profesional">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-muted small fw-bold">Duración (Años) <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" v-model="career.duration" required min="1" max="10">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label text-muted small fw-bold">Resolución</label>
                            <input type="text" class="form-control" v-model="career.resolution" placeholder="Ej: Res. 123/24">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-muted small fw-bold">Título a otorgar</label>
                            <input type="text" class="form-control" v-model="career.degree_title" placeholder="Ej: Enfermero/a Profesional">
                        </div>

                        <div class="col-12">
                            <label class="form-label text-muted small fw-bold">Plan de Estudio (Archivo PDF/Doc)</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="ph ph-file-pdf"></i></span>
                                <input type="file" class="form-control" @change="handleFileUpload" accept=".pdf,.doc,.docx,.txt,.zip">
                                <button v-if="career.study_plan" type="button" class="btn btn-outline-secondary" @click="viewStudyPlan">
                                    <i class="ph ph-eye me-1"></i> Ver Actual
                                </button>
                            </div>
                            <small class="text-muted mt-1 d-block" v-if="uploading">
                                <span class="spinner-border spinner-border-sm me-1"></span> Subiendo plan...
                            </small>
                            <small class="text-muted mt-1 d-block" v-else>Formatos aceptados: PDF, DOC, DOCX, TXT, ZIP.</small>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-top text-end">
                        <button type="button" class="btn btn-light me-2" @click="$router.push('/careers')">Cancelar</button>
                        <button type="submit" class="btn btn-primary px-4" :disabled="loading || uploading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {{ career.id ? 'Actualizar Cambios' : 'Anexar Carrera' }}
                        </button>
                    </div>
                    <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
                </form>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            career: { title: '', duration: 3, resolution: '', degree_title: '', study_plan: '' },
            loading: false,
            uploading: false,
            error: null
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
                const endpoint = id ? '/api/careers/' + id : '/api/careers';

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
        if(id) {
            this.fetchCareer(id);
        }
    }
}
