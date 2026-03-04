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
                            <label class="form-label text-muted small fw-bold">Título <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" v-model="career.title" required placeholder="Ej: Enfermería Profesional">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label text-muted small fw-bold">Duración (Años) <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" v-model="career.duration" required min="1" max="10">
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-top text-end">
                        <button type="button" class="btn btn-light me-2" @click="$router.push('/careers')">Cancelar</button>
                        <button type="submit" class="btn btn-primary px-4" :disabled="loading">
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
            career: { title: '', duration: 3 },
            loading: false,
            error: null
        }
    },
    methods: {
        async fetchCareer(id) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/careers/' + id, {
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
                    body: JSON.stringify({
                        title: this.career.title,
                        duration: parseInt(this.career.duration)
                    })
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
