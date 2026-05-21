export default {
    template: `
    <div class="fade-in">
        <div class="card-modern shadow-sm border-0 p-0 overflow-hidden">
            <div class="card-header bg-white border-bottom p-4">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0 fw-bold"><i class="ph ph-users-three me-2 text-primary"></i>Gestión de Usuarios</h5>
                    <button class="btn btn-primary btn-sm px-3" @click="openCreateModal">
                        <i class="ph ph-plus me-1"></i> Nuevo Usuario
                    </button>
                </div>
                <div class="mt-3">
                    <div class="input-group input-group-sm" style="max-width: 350px;">
                        <span class="input-group-text border-end-0 bg-white"><i class="ph ph-magnifying-glass text-muted"></i></span>
                        <input type="text" class="form-control border-start-0 ps-0" placeholder="Buscar por nombre o email..." v-model="search" @input="fetchUsers">
                    </div>
                </div>
            </div>
            <div class="card-body p-0">
                <div v-if="loading" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                </div>
                <div v-else-if="!users.length" class="text-center py-5 text-muted">
                    <i class="ph ph-users fs-1 d-block mb-2"></i>
                    No se encontraron usuarios
                </div>
                <div v-else class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="bg-light">
                            <tr>
                                <th class="px-4 py-3 text-muted small fw-bold">Nombre y Apellido</th>
                                <th class="py-3 text-muted small fw-bold">Email</th>
                                <th class="py-3 text-muted small fw-bold">Perfil</th>
                                <th class="py-3 text-muted small fw-bold">Estado</th>
                                <th class="py-3 text-muted small fw-bold text-end pe-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="u in users" :key="u.id">
                                <td class="px-4 py-3 fw-semibold">{{ u.name }}</td>
                                <td class="py-3 text-muted small">{{ u.email }}</td>
                                <td class="py-3">
                                    <span :class="u.role === 'admin' ? 'badge bg-primary-subtle text-primary' : 'badge bg-secondary-subtle text-secondary'">
                                        <i :class="u.role === 'admin' ? 'ph ph-shield-check me-1' : 'ph ph-user me-1'"></i>
                                        {{ u.role === 'admin' ? 'Administrador' : 'Usuario' }}
                                    </span>
                                </td>
                                <td class="py-3">
                                    <span v-if="!u.is_active" class="badge bg-danger-subtle text-danger"><i class="ph ph-prohibit me-1"></i>Dado de Baja</span>
                                    <span v-else-if="u.is_blocked" class="badge bg-warning-subtle text-warning"><i class="ph ph-lock me-1"></i>Bloqueado</span>
                                    <span v-else class="badge bg-success-subtle text-success"><i class="ph ph-check-circle me-1"></i>Activo</span>
                                </td>
                                <td class="py-3 text-end pe-4">
                                    <div class="d-flex gap-2 justify-content-end">
                                        <!-- Activo -->
                                        <template v-if="u.is_active && !u.is_blocked">
                                            <button class="btn btn-sm btn-outline-secondary" title="Editar" @click="openEditModal(u)"><i class="ph ph-pencil"></i></button>
                                            <button class="btn btn-sm btn-outline-warning" title="Bloquear" @click="blockUser(u, true)"><i class="ph ph-lock"></i></button>
                                            <button class="btn btn-sm btn-outline-danger" title="Dar de Baja" @click="deactivateUser(u)"><i class="ph ph-prohibit"></i></button>
                                        </template>
                                        <!-- Bloqueado -->
                                        <template v-else-if="u.is_active && u.is_blocked">
                                            <button class="btn btn-sm btn-outline-success" title="Desbloquear" @click="blockUser(u, false)"><i class="ph ph-lock-open"></i></button>
                                            <button class="btn btn-sm btn-outline-danger" title="Dar de Baja" @click="deactivateUser(u)"><i class="ph ph-prohibit"></i></button>
                                        </template>
                                        <!-- Dado de baja -->
                                        <template v-else>
                                            <button class="btn btn-sm btn-outline-success" title="Dar de Alta" @click="activateUser(u)"><i class="ph ph-check-circle"></i></button>
                                        </template>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Modal Crear/Editar -->
        <div class="modal fade" id="userModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content border-0 shadow">
                    <div class="modal-header border-0 pb-0">
                        <h5 class="modal-title fw-bold">{{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body pt-3">
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">Nombre completo</label>
                            <input type="text" class="form-control" v-model="form.name" placeholder="Ej: Juan García">
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">Email</label>
                            <input type="email" class="form-control" v-model="form.email" placeholder="usuario@ejemplo.com" :disabled="!!editingUser">
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">Perfil</label>
                            <select class="form-select" v-model="form.role">
                                <option value="user">Usuario</option>
                                <option value="admin">Administrador</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small fw-bold text-muted">{{ editingUser ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña' }}</label>
                            <input type="password" class="form-control" v-model="form.password" placeholder="••••••••">
                        </div>
                        <div v-if="modalError" class="alert alert-danger py-2 small">{{ modalError }}</div>
                    </div>
                    <div class="modal-footer border-0">
                        <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary px-4" @click="saveUser" :disabled="saving">
                            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
                            {{ editingUser ? 'Guardar Cambios' : 'Crear Usuario' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            users: [],
            loading: false,
            search: '',
            editingUser: null,
            form: { name: '', email: '', role: 'user', password: '' },
            modalError: null,
            saving: false
        }
    },
    methods: {
        async fetchUsers() {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const qs = this.search ? '?search=' + encodeURIComponent(this.search) : '';
                const res = await fetch(window.API_BASE + '/api/users' + qs, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await res.json();
                if (result.status === 'success') this.users = result.data;
            } catch (e) { console.error(e); }
            finally { this.loading = false; }
        },
        openCreateModal() {
            this.editingUser = null;
            this.form = { name: '', email: '', role: 'user', password: '' };
            this.modalError = null;
            new bootstrap.Modal(document.getElementById('userModal')).show();
        },
        openEditModal(user) {
            this.editingUser = user;
            this.form = { name: user.name, email: user.email, role: user.role, password: '' };
            this.modalError = null;
            new bootstrap.Modal(document.getElementById('userModal')).show();
        },
        async saveUser() {
            this.modalError = null;
            if (!this.form.name || !this.form.email) { this.modalError = 'Nombre y email son requeridos.'; return; }
            if (!this.editingUser && !this.form.password) { this.modalError = 'La contraseña es requerida para nuevos usuarios.'; return; }
            this.saving = true;
            try {
                const token = localStorage.getItem('token');
                const isEdit = !!this.editingUser;
                const url = isEdit ? window.API_BASE + '/api/users/' + this.editingUser.id : window.API_BASE + '/api/users';
                const res = await fetch(url, {
                    method: isEdit ? 'PUT' : 'POST',
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.form)
                });
                const result = await res.json();
                if (result.status === 'success') {
                    bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
                    await this.fetchUsers();
                } else {
                    this.modalError = result.error || 'Ocurrió un error.';
                }
            } catch(e) { this.modalError = 'Error de conexión.'; }
            finally { this.saving = false; }
        },
        async blockUser(user, block) {
            if (!confirm(block ? `¿Bloquear a ${user.name}?` : `¿Desbloquear a ${user.name}?`)) return;
            const token = localStorage.getItem('token');
            await fetch(window.API_BASE + '/api/users/' + user.id + '/block', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ blocked: block })
            });
            await this.fetchUsers();
        },
        async deactivateUser(user) {
            if (!confirm(`¿Dar de baja a ${user.name}? No podrá iniciar sesión.`)) return;
            const token = localStorage.getItem('token');
            await fetch(window.API_BASE + '/api/users/' + user.id + '/deactivate', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await this.fetchUsers();
        },
        async activateUser(user) {
            if (!confirm(`¿Dar de alta a ${user.name}?`)) return;
            const token = localStorage.getItem('token');
            await fetch(window.API_BASE + '/api/users/' + user.id + '/activate', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await this.fetchUsers();
        }
    },
    mounted() {
        this.fetchUsers();
    }
}
