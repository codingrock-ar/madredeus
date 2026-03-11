export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <div class="row">
                <div class="col-md-3 text-center mb-4">
                    <div class="avatar-circle d-flex justify-content-center align-items-center text-primary fw-bold mx-auto mb-3 shadow" style="width:120px; height:120px; font-size: 3rem;">
                        {{ user.name.charAt(0).toUpperCase() }}
                    </div>
                    <h5 class="fw-bold">{{ user.name }}</h5>
                    <p class="text-muted small">Administrador</p>
                </div>
                <div class="col-md-9 border-start ps-md-5">
                    <h5 class="mb-4">Información de Cuenta</h5>
                    <form @submit.prevent="saveProfile">
                        <div class="row g-3">
                            <div class="col-md-12">
                                <label class="form-label">Nombre Completo</label>
                                <input type="text" class="form-control" v-model="user.name">
                            </div>
                            <div class="col-md-12">
                                <label class="form-label">Correo Electrónico (No modificable)</label>
                                <input type="email" class="form-control bg-light" :value="user.email" readonly disabled>
                            </div>
                            
                            <h5 class="mt-5 mb-3">Seguridad</h5>
                            <div class="col-md-6">
                                <label class="form-label">Nueva Contraseña</label>
                                <input type="password" class="form-control" v-model="passwords.new" placeholder="Dejar en blanco para no cambiar">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Confirmar Contraseña</label>
                                <input type="password" class="form-control" v-model="passwords.confirm" placeholder="••••••••">
                            </div>

                            <div class="col-12 mt-4 text-end">
                                <button type="submit" class="btn btn-primary" :disabled="loading">
                                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                    Guardar Cambios
                                </button>
                            </div>
                            
                            <div class="col-12 mt-3" v-if="message">
                                <div class="alert" :class="(messageType === 'success') ? 'alert-success' : 'alert-danger'">
                                    {{ message }}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            user: { name: '', email: ''},
            passwords: { new: '', confirm: '' },
            loading: false,
            message: '',
            messageType: ''
        }
    },
    mounted() {
        const u = localStorage.getItem('user');
        if (u) {
            this.user = JSON.parse(u);
        } else {
            this.$router.push('/login');
        }
    },
    methods: {
        async saveProfile() {
            this.message = '';
            
            if (this.passwords.new !== this.passwords.confirm) {
                this.messageType = 'error';
                this.message = 'Las contraseñas no coinciden.';
                return;
            }
            
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/profile', {
                    method: 'PUT',
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({
                        email: this.user.email,
                        name: this.user.name,
                        newPassword: this.passwords.new
                    })
                });
                
                const result = await response.json();
                
                if (response.ok && result.status === 'success') {
                    this.messageType = 'success';
                    this.message = 'Perfil actualizado exitosamente.';
                    this.passwords.new = '';
                    this.passwords.confirm = '';
                    
                    // Actualizar localStorage para reflejar el cambio en la UI global
                    const lsUser = JSON.parse(localStorage.getItem('user'));
                    lsUser.name = this.user.name;
                    localStorage.setItem('user', JSON.stringify(lsUser));
                    
                } else {
                    this.messageType = 'error';
                    this.message = result.error || 'Ocurrió un error al actualizar.';
                }
            } catch (error) {
                console.error("Error", error);
                this.messageType = 'error';
                this.message = 'Error de conexión con el servidor.';
            } finally {
                this.loading = false;
            }
        }
    }
}
