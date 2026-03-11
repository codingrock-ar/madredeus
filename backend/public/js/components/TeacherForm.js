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
                <form @submit.prevent="saveTeacher">
                    <div class="row g-4 mb-4">
                        <h5 class="text-primary mb-3"><i class="ph ph-user-circle me-2"></i>Información Personal</h5>
                        
                        <div class="col-md-6">
                            <label class="form-label text-muted small fw-bold">Nombre <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" v-model="teacher.name" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-muted small fw-bold">Apellido <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" v-model="teacher.lastname" required>
                        </div>
                        <div class="col-12 mt-4">
                            <label class="form-label text-muted small fw-bold">Avatar URL</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="ph ph-link"></i></span>
                                <input type="url" class="form-control" v-model="teacher.image" placeholder="https://api.dicebear.com/7.x/avataaars/svg?seed=Buster">
                            </div>
                            <small class="text-muted mt-1 d-block">URL directa a una imagen (.jpg, .png) para ilustrar su perfil.</small>
                        </div>
                    </div>
                    
                    <div class="mt-4 pt-4 border-top text-end">
                        <button type="button" class="btn btn-light me-2" @click="$router.push('/teachers')">Cancelar</button>
                        <button type="submit" class="btn btn-primary px-4" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {{ teacher.id ? 'Actualizar Cambios' : 'Crear Docente' }}
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
            teacher: { image: '' },
            loading: false,
            error: null
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
                    this.teacher = result.data;
                } else {
                    this.error = result.error || 'Error cargando datos del docente';
                }
            } catch (error) {
                console.error("Error:", error);
                this.error = "Error de conexión";
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

                // Si no hay imagen colocamos un avatar en base al nombre usando DiceBear
                if (!this.teacher.image) {
                     this.teacher.image = `https://api.dicebear.com/7.x/initials/svg?seed=${this.teacher.name} ${this.teacher.lastname}`;
                }

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
