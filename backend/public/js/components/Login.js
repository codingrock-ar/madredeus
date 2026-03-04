export default {
    template: `
    <div class="login-container">
        <div class="login-bg d-none d-md-block"></div>
        <div class="login-panel">
            <div class="login-logo">
                <h1>imd</h1>
                <h2>INSTITUTO<br>MADRE<br>DEUS</h2>
            </div>
            
            <form style="width: 100%;" @submit.prevent="login">
                <input type="email" class="form-control-custom" placeholder="admin@madredeus.com" v-model="email" required>
                
                <!-- Contraseña con botón de Ver -->
                <div class="position-relative mb-2">
                    <input :type="showPassword ? 'text' : 'password'" class="form-control-custom mb-0" placeholder="••••••••" v-model="password" required>
                    <button type="button" class="btn btn-link position-absolute end-0 top-0 text-decoration-none" 
                            @click="showPassword = !showPassword" style="color: #6c757d; padding: 10px;">
                        <i :class="showPassword ? 'ph ph-eye-slash' : 'ph ph-eye'"></i>
                    </button>
                </div>
                
                <!-- Recordar Contraseña -->
                <div class="form-check mb-4 mt-2">
                    <input class="form-check-input" type="checkbox" id="rememberMe" v-model="rememberMe">
                    <label class="form-check-label text-muted small" for="rememberMe" style="cursor: pointer;">
                        Recordar mi usuario
                    </label>
                </div>

                <div v-if="error" class="alert alert-danger py-2 small text-center">{{ error }}</div>

                <button type="submit" class="btn-login" :disabled="loading">
                    <span v-if="loading">Verificando...</span>
                    <span v-else>INICIAR SESIÓN</span>
                </button>
            </form>
        </div>
    </div>
    `,
    data() {
        return {
            email: '', 
            password: '', 
            error: '',
            loading: false,
            showPassword: false,
            rememberMe: false
        }
    },
    methods: {
        async login() {
            this.error = '';
            this.loading = true;
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: this.email, password: this.password })
                });

                const result = await response.json();

                if (response.ok && result.status === 'success') {
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('user', JSON.stringify(result.user));
                    
                    if(this.rememberMe) {
                        localStorage.setItem('saved_email', this.email);
                    } else {
                        localStorage.removeItem('saved_email');
                    }
                    
                    this.$router.push('/dashboard');
                } else {
                    this.error = result.message || 'Credenciales incorrectas';
                }
            } catch (err) {
                this.error = 'Error de conexión con el servidor.';
            } finally {
                this.loading = false;
            }
        }
    },
    mounted() {
        const saved = localStorage.getItem('saved_email');
        if (saved) {
            this.email = saved;
            this.rememberMe = true;
        } else {
            // Valores por defecto para demo
            this.email = 'admin@madredeus.com';
            this.password = '123456';
        }
    }
}
