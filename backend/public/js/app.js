import Login from './components/Login.js';
import Layout from './components/Layout.js';
import Dashboard from './components/Dashboard.js';
import StudentList from './components/StudentList.js';
import StudentReportList from './components/StudentReportList.js';
import StudentForm from './components/StudentForm.js';
import TeacherList from './components/TeacherList.js';
import TeacherForm from './components/TeacherForm.js';
import CareerList from './components/CareerList.js';
import CareerForm from './components/CareerForm.js';
import SubjectList from './components/SubjectList.js';
import SubjectForm from './components/SubjectForm.js';
import Profile from './components/Profile.js';
import StudentCommissionUpdate from './components/StudentCommissionUpdate.js';
import CareerInscription from './components/CareerInscription.js';
import SinigepList from './components/SinigepList.js';
import PeriodPromotion from './components/PeriodPromotion.js';
import StudentDetail from './components/StudentDetail.js';
import StudentGrades from './components/StudentGrades.js';
import StudentCollect from './components/StudentCollect.js';
import CycleList from './components/CycleList.js';
import ScholarshipList from './components/ScholarshipList.js';
import PaymentList from './components/PaymentList.js';

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
            { path: 'students', component: StudentList, meta: { title: 'Base de Datos de Alumnos' } },
            { path: 'students/report', component: StudentReportList, meta: { title: 'Listado de Estudiantes' } },
            { path: 'student/form', component: StudentForm, meta: { title: 'Ficha de Estudiante' } },
            { path: 'teachers', component: TeacherList, meta: { title: 'Listado de Profesores' } },
            { path: 'teacher/form', component: TeacherForm, meta: { title: 'Ficha de Profesor' } },
            { path: 'careers', component: CareerList, meta: { title: 'Listado de Carreras' } },
            { path: 'career/form', component: CareerForm, meta: { title: 'Ficha de Carrera' } },
            { path: 'subjects', component: SubjectList, meta: { title: 'Listado de Materias' } },
            { path: 'subject/form', component: SubjectForm, meta: { title: 'Ficha de Materia' } },
            { path: 'profile', component: Profile, meta: { title: 'Perfil de Usuario' } },
            { path: 'students/commission', component: StudentCommissionUpdate, meta: { title: 'Actualizar Comisiones' } },
            { path: 'students/inscription', component: CareerInscription, meta: { title: 'Inscripción a Carrera' } },
            { path: 'students/sinigep', component: SinigepList, meta: { title: 'Listado Sinigep' } },
            { path: 'students/promotion', component: PeriodPromotion, meta: { title: 'Promoción de Periodo' } },
            { path: 'student/detail/:id', component: StudentDetail, meta: { title: 'Detalle de Estudiante' } },
            { path: 'student/grades/:id', component: StudentGrades, meta: { title: 'Calificaciones' } },
            { path: 'student/collect/:id', component: StudentCollect, meta: { title: 'Cobrar' } },
            { path: 'config/cycles', component: CycleList, meta: { title: 'Ciclos Lectivos' } },
            { path: 'config/scholarships', component: ScholarshipList, meta: { title: 'Tipos de Beca' } },
            { path: 'payments', component: PaymentList, meta: { title: 'Gestión de Pagos' } }
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
