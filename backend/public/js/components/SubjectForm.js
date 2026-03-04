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
                            <label class="form-label text-muted small fw-bold">Nombre <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" v-model="subject.name" required placeholder="Ej: Anatomía Funcional">
                        </div>
                        <div class="col-12 mt-4">
                            <label class="form-label text-muted small fw-bold">URL del Programa (Temario Analítico)</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="ph ph-link"></i></span>
                                <input type="url" class="form-control" v-model="subject.program" placeholder="https://ejemplo.com/programa.pdf">
                            </div>
                            <small class="text-muted mt-1 d-block">Enlace a un Drive, PDF o recurso docente.</small>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-top text-end">
                        <button type="button" class="btn btn-light me-2" @click="$router.push('/subjects')">Cancelar</button>
                        <button type="submit" class="btn btn-primary px-4" :disabled="loading">
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
            subject: { name: '', program: '' },
            loading: false,
            error: null
        }
    },
    methods: {
        async fetchSubject(id) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/subjects/' + id, {
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
    mounted() {
        const id = this.$route.query.id;
        if(id) {
            this.fetchSubject(id);
        }
    }
}
