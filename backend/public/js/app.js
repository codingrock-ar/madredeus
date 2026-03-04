import Login from './components/Login.js';
import Layout from './components/Layout.js';
import Dashboard from './components/Dashboard.js';
import StudentList from './components/StudentList.js';
import StudentForm from './components/StudentForm.js';
import TeacherList from './components/TeacherList.js';
import TeacherForm from './components/TeacherForm.js';
import CareerList from './components/CareerList.js';
import CareerForm from './components/CareerForm.js';
import SubjectList from './components/SubjectList.js';
import SubjectForm from './components/SubjectForm.js';
import Profile from './components/Profile.js';

const { createApp } = Vue;
const { createRouter, createWebHashHistory } = VueRouter;

// Definición de Rutas Dinámicas
const routes = [
    { path: '/login', component: Login, meta: { title: 'Iniciar Sesión', public: true } },
    {
        path: '/',
        component: Layout,
        redirect: '/dashboard',
        children: [
            { path: 'dashboard', component: Dashboard, meta: { title: 'Dashboard' } },
            { path: 'students', component: StudentList, meta: { title: 'Listado de Estudiantes' } },
            { path: 'student/form', component: StudentForm, meta: { title: 'Ficha de Estudiante' } },
            { path: 'teachers', component: TeacherList, meta: { title: 'Listado de Profesores' } },
            { path: 'teacher/form', component: TeacherForm, meta: { title: 'Ficha de Profesor' } },
            { path: 'careers', component: CareerList, meta: { title: 'Listado de Carreras' } },
            { path: 'career/form', component: CareerForm, meta: { title: 'Ficha de Carrera' } },
            { path: 'subjects', component: SubjectList, meta: { title: 'Listado de Materias' } },
            { path: 'subject/form', component: SubjectForm, meta: { title: 'Ficha de Materia' } },
            { path: 'profile', component: Profile, meta: { title: 'Perfil de Usuario' } }
        ]
    }
];

// Instancia global del Enrutador
const router = createRouter({
    history: createWebHashHistory(),
    routes
});

// Guardián de Navegación (Proteger rutas sin Token)
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token');
    
    // Si la ruta no es pública y no hay logueo, echar al login
    if (!to.meta.public && !token) {
        next('/login');
    } 
    // Si ya estas logueado y tratas de entrar a la landing de login
    else if (to.path === '/login' && token) {
        next('/dashboard');
    } 
    else {
        // Todo en órden, procede.
        next();
    }
});

// Inicializar la aplicación SPA global
const app = createApp({});
app.use(router);
app.mount('#app');
