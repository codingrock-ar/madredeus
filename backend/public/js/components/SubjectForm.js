export default {
    template: `
    <div class="fade-in">
        <div class="card-modern shadow-sm border-0 p-0 overflow-hidden">
            <div class="card-header bg-white border-bottom p-4">
                <div class="d-flex align-items-center mb-3">
                    <button class="btn btn-light btn-sm me-3 border" @click="$router.push('/subjects')">
                        <i class="ph ph-arrow-left"></i> Volver
                    </button>
                    <h4 class="mb-0 fw-bold">{{ subject.id ? 'Ficha de Materia' : 'Nueva Materia' }}</h4>
                </div>
            </div>
            
            <div class="card-body p-4 p-md-5">
                <form @submit.prevent="saveSubject">
                    <div class="row g-4 mb-4">
                        <h5 class="text-primary mb-3"><i class="ph ph-books me-2"></i>Información de la Materia</h5>
                        
                        <div class="col-md-6">
                            <label class="form-label text-muted small fw-bold">Nombre <span class="text-danger" v-if="!isViewMode">*</span></label>
                            <input type="text" class="form-control" v-model="subject.name" :required="!isViewMode" :disabled="isViewMode" placeholder="Ej: Anatomía Funcional">
                        </div>

                        <div class="col-md-6">
                            <label class="form-label text-muted small fw-bold">Carrera Asociada <span class="text-danger" v-if="!isViewMode">*</span></label>
                            <select class="form-select" v-model="subject.career_id" :required="!isViewMode" :disabled="isViewMode">
                                <option value="">Seleccione una carrera...</option>
                                <option v-for="career in careers" :key="career.id" :value="career.id">{{ career.title }}</option>
                            </select>
                        </div>

                        <div class="col-md-3">
                            <label class="form-label text-muted small fw-bold">Año <span class="text-danger" v-if="!isViewMode">*</span></label>
                            <input type="number" class="form-control" v-model="subject.academic_year" :required="!isViewMode" :disabled="isViewMode" min="1" max="6">
                        </div>

                        <div class="col-md-3">
                            <label class="form-label text-muted small fw-bold">Cuatrimestre <span class="text-danger" v-if="!isViewMode">*</span></label>
                            <select class="form-select" v-model="subject.quarter" :required="!isViewMode" :disabled="isViewMode">
                                <option :value="1">1º Cuatrimestre</option>
                                <option :value="2">2º Cuatrimestre</option>
                            </select>
                        </div>

                        <div class="col-12 mt-4">
                            <label class="form-label text-muted small fw-bold">Programa (Archivo PDF/Doc)</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="ph ph-file-pdf"></i></span>
                                <input v-if="!isViewMode" type="file" class="form-control" @change="handleFileUpload" accept=".pdf,.doc,.docx,.txt,.zip">
                                <button v-if="subject.program" type="button" class="btn btn-outline-secondary" @click="viewProgram">
                                    <i class="ph ph-eye me-1"></i> Ver Actual
                                </button>
                                <span v-else-if="isViewMode" class="form-control text-muted">No hay archivo adjunto</span>
                            </div>
                            <small class="text-muted mt-1 d-block" v-if="uploading">
                                <span class="spinner-border spinner-border-sm me-1"></span> Subiendo programa...
                            </small>
                            <small v-if="!isViewMode" class="text-muted mt-1 d-block">Formatos aceptados: PDF, DOC, DOCX, TXT, ZIP.</small>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-top text-end">
                        <button type="button" class="btn btn-light me-2" @click="$router.push('/subjects')">{{ isViewMode ? 'Cerrar' : 'Cancelar' }}</button>
                        <button v-if="!isViewMode" type="submit" class="btn btn-primary px-4" :disabled="loading || uploading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {{ subject.id ? 'Actualizar Cambios' : 'Anexar Materia' }}
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
            subject: { name: '', program: '', career_id: '', academic_year: 1, quarter: 1 },
            careers: [],
            loading: false,
            uploading: false,
            isViewMode: false,
            error: null
        }
    },
    methods: {
        async fetchCareers() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/careers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.status === 'success') {
                    this.careers = result.data;
                }
            } catch (e) { console.error("Error fetching careers", e); }
        },
        async fetchSubject(id) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/subjects/' + id, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();
                
                if (response.ok && result.status === 'success') {
                    this.subject = result.data;
                } else {
                    this.error = result.error || 'Error cargando datos de la materia';
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
            formData.append('program', file);

            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/subjects/upload-program', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: formData
                });

                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    this.subject.program = result.url;
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
        viewProgram() {
            if (this.subject.program) {
                window.open(window.API_BASE + '/' + this.subject.program, '_blank');
            }
        },
        async saveSubject() {
            this.error = null;
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const id = this.subject.id;
                const method = id ? 'PUT' : 'POST';
                const endpoint = id ? '/api/subjects/' + id : '/api/subjects';

                const response = await fetch(endpoint, {
                    method: method,
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.subject)
                });

                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    this.$router.push('/subjects');
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
    async mounted() {
        await this.fetchCareers();
        const id = this.$route.query.id;
        this.isViewMode = this.$route.query.view === '1';
        if(id) {
            this.fetchSubject(id);
        }
    }
}
