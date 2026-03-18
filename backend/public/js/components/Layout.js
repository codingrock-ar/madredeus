export default {
    template: `
    <div>
        <div class="sidebar-overlay" :class="{'show': isSidebarOpen}" @click="toggleSidebar"></div>

        <div class="sidebar" :class="{'show-sidebar': isSidebarOpen}">
            <div class="brand d-flex align-items-center justify-content-between p-3 border-bottom">
                <div class="d-flex align-items-center w-100 justify-content-center">
                    <img src="imagenes/LogoMadreDeus.png" alt="Logo Madre Deus" style="max-height: 50px; object-fit: contain;">
                </div>
                <button class="btn btn-sm btn-link text-white d-md-none p-0 position-absolute end-0 me-3" @click="toggleSidebar">
                    <i class="ph ph-x fs-4"></i>
                </button>
            </div>
            <nav class="mt-4 flex-grow-1 overflow-auto">
                <router-link to="/dashboard" class="nav-link" active-class="active">
                    <i class="ph ph-squares-four"></i> Dashboard
                </router-link>

                <div class="px-3 mt-4 mb-2 text-uppercase small fw-bold text-muted-sidebar d-flex align-items-center justify-content-between pointer" 
                     style="letter-spacing: 1px; font-size: 0.7rem;"
                     @click="toggleMenu('alumnos')">
                    Gestión de Alumnos
                    <i class="ph" :class="activeMenus.alumnos ? 'ph-caret-up' : 'ph-caret-down'"></i>
                </div>
                
                <div v-show="activeMenus.alumnos" class="fade-in">
                    <router-link to="/students" class="nav-link" active-class="active" :class="{ active: $route.path === '/students' || $route.path === '/student/form' }">
                        <i class="ph ph-users"></i> Listado de Alumnos
                    </router-link>
                    <router-link to="/students/inscription" class="nav-link ps-4 submenu-link" active-class="active">
                        <i class="ph ph-identification-card"></i> Inscripción
                    </router-link>
                    <router-link to="/students/commission" class="nav-link ps-4 submenu-link" active-class="active">
                        <i class="ph ph-users-three"></i> Comisiones
                    </router-link>
                    <router-link to="/students/sinigep" class="nav-link ps-4 submenu-link" active-class="active">
                        <i class="ph ph-list-numbers"></i> Sinigep
                    </router-link>
                    <router-link to="/students/promotion" class="nav-link ps-4 submenu-link" active-class="active">
                        <i class="ph ph-fast-forward"></i> Promoción
                    </router-link>
                </div>

                <div class="px-3 mt-4 mb-2 text-uppercase small fw-bold text-muted-sidebar d-flex align-items-center justify-content-between pointer" 
                     style="letter-spacing: 1px; font-size: 0.7rem;"
                     @click="toggleMenu('academico')">
                    Académico y Staff
                    <i class="ph" :class="activeMenus.academico ? 'ph-caret-up' : 'ph-caret-down'"></i>
                </div>
                
                <div v-show="activeMenus.academico" class="fade-in">
                    <router-link to="/teachers" class="nav-link" active-class="active">
                        <i class="ph ph-chalkboard-teacher"></i> Profesores
                    </router-link>
                    <router-link to="/careers" class="nav-link" active-class="active">
                        <i class="ph ph-graduation-cap"></i> Carreras
                    </router-link>
                    <router-link to="/subjects" class="nav-link" active-class="active">
                        <i class="ph ph-books"></i> Materias
                    </router-link>
                </div>
            </nav>
        </div>

        <div class="main-content">
            <header class="d-flex justify-content-between align-items-center mb-4">
                <div class="d-flex align-items-center">
                    <button class="btn btn-light d-md-none me-3 border px-2 py-1" @click="toggleSidebar">
                        <i class="ph ph-list fs-4"></i>
                    </button>
                    <div>
                        <h4 class="fw-bold mb-0">{{ $route.meta.title || 'Dashboard' }}</h4>
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb mb-0 text-muted fs-7" style="font-size: 0.85rem;">
                                <li class="breadcrumb-item">Inicio</li>
                                <li class="breadcrumb-item active" aria-current="page">{{ $route.meta.title || 'Panel' }}</li>
                            </ol>
                        </nav>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-3" v-if="user">
                    <div class="dropdown">
                        <div class="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded shadow-sm dropdown-toggle" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer;">
                            <div class="avatar-circle d-flex justify-content-center align-items-center text-primary fw-bold">{{ user.name.charAt(0).toUpperCase() }}</div>
                            <span class="small fw-bold">{{ user.name }}</span>
                        </div>
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                            <li><router-link class="dropdown-item py-2" to="/profile"><i class="ph ph-user me-2"></i>Mi Perfil</router-link></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item py-2 text-danger" href="#" @click.prevent="logout"><i class="ph ph-sign-out me-2"></i>Cerrar Sesión</a></li>
                        </ul>
                    </div>
                </div>
            </header>

            <!-- Aquí se inyectan las vistas de los componentes -->
            <router-view></router-view>
        </div>
    </div>
    `,
    data() {
        return {
            isSidebarOpen: false,
            user: null,
            activeMenus: {
                alumnos: true,
                academico: true
            }
        }
    },
    mounted() {
        const u = localStorage.getItem('user');
        if (u) {
            this.user = JSON.parse(u);
        }
    },
    methods: {
        toggleSidebar() {
            this.isSidebarOpen = !this.isSidebarOpen;
        },
        toggleMenu(menu) {
            this.activeMenus[menu] = !this.activeMenus[menu];
        },
        logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            this.$router.push('/login');
        }
    }
}
