export default {
    template: `
        <div class="container-fluid py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h4 mb-0"><i class="ph ph-hand-coins me-2"></i>Gestión de Pagos</h2>
                <div class="d-flex gap-2">
                    <button class="btn btn-warning btn-sm" @click="generateInterests" v-if="viewMode === 'history'">
                        <i class="ph ph-lightning me-1"></i>Generar Intereses
                    </button>
                    <button class="btn btn-primary btn-sm" @click="showNewPaymentModal">
                        <i class="ph ph-plus me-1"></i>Registrar Pago
                    </button>
                </div>
            </div>

            <!-- Modos de Vista -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-2 d-flex gap-2">
                    <button class="btn flex-grow-1 border-0" 
                            :class="viewMode === 'history' ? 'btn-primary shadow-sm' : 'btn-light text-muted'"
                            @click="viewMode = 'history'">
                        <i class="ph ph-clock-counter-clockwise me-2"></i>Historial de Pagos
                    </button>
                    <button class="btn flex-grow-1 border-0" 
                            :class="viewMode === 'planilla' ? 'btn-primary shadow-sm' : 'btn-light text-muted'"
                            @click="viewMode = 'planilla'">
                        <i class="ph ph-clipboard-text me-2"></i>Estado de Pagos
                    </button>
                </div>
            </div>

            <!-- Contenido según modo -->
            <div v-if="viewMode === 'history'" class="fade-in">
                <!-- Filtros Historial -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body p-4">
                        <div class="row g-3 mb-3">
                            <div class="col-md-4">
                                <label class="form-label small fw-bold text-muted mb-1">Buscar Alumno (Nombre/DNI)</label>
                                <div class="input-group input-group-sm">
                                    <span class="input-group-text bg-white border-end-0"><i class="ph ph-magnifying-glass text-muted"></i></span>
                                    <input type="text" class="form-control border-start-0 ps-0" v-model="filters.search" @input="fetchPayments" placeholder="Ej: Perez o 30000000...">
                                </div>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label small fw-bold text-muted mb-1">Carrera</label>
                                <select class="form-select form-select-sm" v-model="filters.career" @change="fetchPayments">
                                    <option value="">Todas las Carreras</option>
                                    <option v-for="c in careers" :key="c.id" :value="c.title">{{ c.title }}</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label small fw-bold text-muted mb-1">Comisión</label>
                                <select class="form-select form-select-sm" v-model="filters.commission" @change="fetchPayments">
                                    <option value="">Todas las Comisiones</option>
                                    <option v-for="com in commissions" :key="com" :value="com">Comisión {{ com }}</option>
                                </select>
                            </div>
                        </div>
                        <div class="row g-3">
                            <div class="col-md-3">
                                <label class="form-label small fw-bold text-muted mb-1">Desde</label>
                                <input type="date" class="form-control form-control-sm" v-model="filters.start_date" @change="fetchPayments">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small fw-bold text-muted mb-1">Hasta</label>
                                <input type="date" class="form-control form-control-sm" v-model="filters.end_date" @change="fetchPayments">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small fw-bold text-muted mb-1">Método</label>
                                <select class="form-select form-select-sm" v-model="filters.method" @change="fetchPayments">
                                    <option value="">Todos</option>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Transferencia">Transferencia</option>
                                    <option value="Tarjeta">Tarjeta</option>
                                </select>
                            </div>
                            <div class="col-md-3 d-flex align-items-end">
                                <button class="btn btn-light btn-sm w-100 border" @click="resetFilters">Reset</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resumen -->
                <div class="row mb-4">
                    <div class="col-md-3">
                        <div class="card border-0 shadow-sm bg-primary text-white h-100 p-3">
                            <label class="small opacity-75 fw-bold text-uppercase">Total Recaudado</label>
                            <div class="h3 mb-0">$ {{ formatCurrency(totalAmount) }}</div>
                            <div class="extra-small opacity-75 mt-1">{{ totalCount }} pagos</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card border-0 shadow-sm h-100 p-3">
                            <label class="small text-muted fw-bold text-uppercase">Promedio</label>
                            <div class="h3 mb-0">$ {{ formatCurrency(avgAmount) }}</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card border-0 shadow-sm h-100 p-3">
                            <label class="small text-muted fw-bold text-uppercase">Mínimo</label>
                            <div class="h3 mb-0">$ {{ formatCurrency(minAmount) }}</div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card border-0 shadow-sm h-100 p-3">
                            <label class="small text-muted fw-bold text-uppercase">Operaciones</label>
                            <div class="h3 mb-0">{{ totalCount }}</div>
                        </div>
                    </div>
                </div>

                <!-- Tabla -->
                <div class="card border-0 shadow-sm">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead class="bg-light">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Alumno</th>
                                    <th>Concepto</th>
                                    <th class="text-end">Monto</th>
                                    <th class="text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="p in payments" :key="p.id">
                                    <td class="small">{{ formatDate(p.payment_date) }}</td>
                                    <td>
                                        <div class="fw-bold small text-primary hover-underline" style="cursor: pointer;" @click="$router.push('/student/detail/' + p.student_id)">
                                            {{ p.student_lastname }}, {{ p.student_name }}
                                        </div>
                                        <div class="extra-small text-muted">{{ p.student_dni }}</div>
                                    </td>
                                    <td class="small">{{ p.concept }}</td>
                                    <td class="text-end fw-bold text-success">$ {{ formatCurrency(p.amount) }}</td>
                                    <td class="text-center">
                                        <div class="d-flex justify-content-center gap-1">
                                            <button class="btn btn-ghost-primary btn-icon btn-sm rounded-circle" @click="editPayment(p)"><i class="ph ph-pencil"></i></button>
                                            <button class="btn btn-ghost-danger btn-icon btn-sm rounded-circle" @click="deletePayment(p.id)"><i class="ph ph-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="card-footer bg-white border-0 py-3" v-if="totalPages > 1">
                        <nav class="d-flex justify-content-between align-items-center">
                            <span class="extra-small text-muted">Página {{ page }} de {{ totalPages }}</span>
                            <ul class="pagination pagination-sm mb-0">
                                <li class="page-item" :class="{ disabled: page === 1 }">
                                    <a class="page-link" href="#" @click.prevent="changePage(page - 1)">
                                        <i class="ph ph-caret-left"></i>
                                    </a>
                                </li>
                                <li class="page-item" v-for="p in visiblePages" :key="p" :class="{ active: page === p, disabled: p === '...' }">
                                    <a class="page-link" href="#" @click.prevent="p !== '...' && changePage(p)">{{ p }}</a>
                                </li>
                                <li class="page-item" :class="{ disabled: page === totalPages }">
                                    <a class="page-link" href="#" @click.prevent="changePage(page + 1)">
                                        <i class="ph ph-caret-right"></i>
                                    </a>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            <div v-else-if="viewMode === 'planilla'" class="fade-in">
                <!-- Filtros Curso Completo -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body p-3">
                        <div class="row g-3">
                            <div class="col-md-3">
                                <label class="form-label small fw-bold text-muted mb-1">Buscar</label>
                                <input type="text" class="form-control form-control-sm" v-model="filters.search" @keyup.enter="fetchCourseStatus" placeholder="Filtrar alumnos...">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small fw-bold text-muted mb-1">Carrera</label>
                                <select class="form-select form-select-sm" v-model="filters.career_id">
                                    <option value="">Todas las carreras</option>
                                    <option v-for="c in careers" :key="c.id" :value="c.id">{{ c.title }}</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label class="form-label small fw-bold text-muted mb-1">Período/Año</label>
                                <select class="form-select form-select-sm" v-model="filters.cycle">
                                    <option :value="new Date().getFullYear()">{{ new Date().getFullYear() }}</option>
                                    <option :value="new Date().getFullYear() - 1">{{ new Date().getFullYear() - 1 }}</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label class="form-label small fw-bold text-muted mb-1">Comisión</label>
                                <select class="form-select form-select-sm" v-model="filters.commission">
                                    <option value="">Todas las Comisiones</option>
                                    <option v-for="com in commissions" :key="com" :value="com">Comisión {{ com }}</option>
                                </select>
                            </div>
                            <div class="col-md-2 d-flex align-items-end">
                                <button class="btn btn-primary btn-sm w-100" @click="fetchCourseStatus">
                                    <i class="ph ph-funnel me-1"></i>Filtrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabla Vista Curso Completo -->
                <div v-if="loadingPlanilla" class="text-center py-5">
                    <div class="spinner-border text-primary"></div>
                </div>
                <div v-else class="card border-0 shadow-sm position-relative">
                    <div style="position: sticky; top: 50vh; z-index: 10; height: 0; width: 100%; pointer-events: none;">
                        <button class="btn btn-dark shadow rounded-circle position-absolute d-flex align-items-center justify-content-center" 
                                style="left: 215px; transform: translateY(-50%); width: 40px; height: 40px; opacity: 0.8; pointer-events: auto;"
                                @click="scrollTable('left')" title="Desplazar a la izquierda">
                            <i class="ph ph-caret-left fs-5"></i>
                        </button>
                        <button class="btn btn-dark shadow rounded-circle position-absolute d-flex align-items-center justify-content-center" 
                                style="right: 15px; transform: translateY(-50%); width: 40px; height: 40px; opacity: 0.8; pointer-events: auto;"
                                @click="scrollTable('right')" title="Desplazar a la derecha">
                            <i class="ph ph-caret-right fs-5"></i>
                        </button>
                    </div>
                    
                    <div class="table-responsive" ref="courseTableContainer" style="scroll-behavior: smooth;">
                        <table class="table table-bordered table-sm align-middle mb-0 text-center" style="min-width: 1200px;">
                            <thead class="bg-light">
                                <tr>
                                    <th class="text-start ps-3 align-middle" rowspan="2" style="min-width: 200px; position: sticky; left: 0; background: #f8f9fa; z-index: 1;">Alumno</th>
                                    <th v-for="year in getUniqueYears()" :key="year" :colspan="getPeriodsByYear(year).length" class="text-center small fw-bold border-bottom bg-light">
                                        {{ year }}
                                    </th>
                                </tr>
                                <tr>
                                    <th v-for="period in paymentPeriods" :key="'h-' + period.id" style="width: 70px;" class="small text-muted border-top-0">
                                        {{ period.month.substring(0, 3) }}.
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="s in planilla" :key="s.id">
                                    <td class="text-start ps-3 fw-bold small" style="position: sticky; left: 0; background: white; z-index: 1; border-right: 2px solid #dee2e6;">
                                        <router-link :to="'/student/detail/' + s.id" class="text-decoration-none text-primary hover-underline" title="Ver legajo del alumno">
                                            {{ s.lastname }}, {{ s.name }}
                                        </router-link>
                                        <div class="extra-small text-muted fw-normal">{{ s.career }} - Com. {{ s.commission }}</div>
                                    </td>
                                    <td v-for="period in paymentPeriods" :key="period.id" class="p-1">
                                        <div v-if="getPaymentStatus(s, period.id) === 'paid'" 
                                             class="bg-success text-white rounded w-100 h-100 d-flex align-items-center justify-content-center py-1 payment-node"
                                             style="cursor: pointer; transition: background-color 0.2s;"
                                             data-bs-toggle="tooltip" data-bs-html="true" :title="getTooltipHTML(s, period.id)">
                                            <i class="ph ph-check small"></i>
                                        </div>
                                        <div v-else-if="getPaymentStatus(s, period.id) === 'pending'" 
                                             class="bg-danger text-white rounded w-100 h-100 d-flex align-items-center justify-content-center py-1 payment-node"
                                             style="cursor: pointer; transition: background-color 0.2s;"
                                             data-bs-toggle="tooltip" data-bs-html="true" :title="getTooltipHTML(s, period.id)"
                                             @click="showNewPaymentModal({student_id: s.id, student_name: s.name, student_lastname: s.lastname, student_dni: s.dni})">
                                            <i class="ph ph-x small"></i>
                                        </div>
                                        <div v-else
                                             class="bg-light text-muted border border-dashed rounded w-100 h-100 d-flex align-items-center justify-content-center py-1 payment-node"
                                             style="cursor: pointer; transition: background-color 0.2s;"
                                             data-bs-toggle="tooltip" title="Futuro">
                                            <i class="ph ph-minus small"></i>
                                        </div>
                                    </td>
                                </tr>
                                <tr v-if="planilla.length === 0">
                                    <td :colspan="paymentPeriods.length + 1" class="text-center py-4 text-muted small">
                                        {{ (!filters.career_id && !filters.commission && !filters.search) ? 'Seleccione una carrera, comisión o busque un alumno para visualizar los datos.' : 'No se encontraron alumnos.' }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="card-footer bg-white py-3">
                        <div class="d-flex gap-4 small fw-bold text-muted justify-content-center">
                            <div class="d-flex align-items-center gap-1"><div style="width:12px;height:12px;" class="bg-success rounded"></div> Cubiertos</div>
                            <div class="d-flex align-items-center gap-1"><div style="width:12px;height:12px;" class="bg-danger rounded"></div> Adeuda</div>
                            <div class="d-flex align-items-center gap-1"><div style="width:12px;height:12px;" class="bg-light border rounded"></div> Futuro</div>
                        </div>
                    </div>
                </div>
            </div>
            <style>
                .payment-node:hover {
                    transform: scale(1.15) !important;
                    z-index: 10;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }
                .tooltip-inner {
                    text-align: left;
                    padding: 8px 12px;
                }
            </style>
        </div>
    `,
    data() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        return {
            payments: [],
            careers: [],
            commissions: ['A', 'B', 'C', 'D', 'E', 'Z'],
            totalAmount: 0,
            avgAmount: 0,
            minAmount: 0,
            totalCount: 0,
            loading: false,
            page: 1,
            perPage: 20,
            viewMode: 'history', // 'history' o 'planilla'
            loadingPlanilla: false,
            planilla: [],
            filters: {
                search: '',
                career: '',
                career_id: '',
                commission: '',
                start_date: firstDay.toISOString().split('T')[0],
                end_date: today.toISOString().split('T')[0],
                method: '',
                cycle: today.getFullYear()
            },
            metadata: { payment_concepts: [], payment_types: [] },
            tooltipInstances: []
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.totalCount / this.perPage);
        },
        visiblePages() {
            const pages = [];
            const total = this.totalPages;
            const current = this.page;
            
            if (total <= 10) {
                for (let i = 1; i <= total; i++) pages.push(i);
            } else {
                pages.push(1);
                if (current > 4) pages.push('...');
                
                const start = Math.max(2, current - 2);
                const end = Math.min(total - 1, current + 2);
                
                for (let i = start; i <= end; i++) pages.push(i);
                
                if (current < total - 3) pages.push('...');
                pages.push(total);
            }
            return pages;
        },
        paymentPeriods() {
            const year = parseInt(this.filters.cycle) || new Date().getFullYear();
            const prevYear = year - 1;
            return [
                { id: 'dic' + year.toString().slice(-2), month: 'Diciembre', year: year },
                { id: 'nov' + year.toString().slice(-2), month: 'Noviembre', year: year },
                { id: 'oct' + year.toString().slice(-2), month: 'Octubre', year: year },
                { id: 'sep' + year.toString().slice(-2), month: 'Septiembre', year: year },
                { id: 'ago' + year.toString().slice(-2), month: 'Agosto', year: year },
                { id: 'jul' + year.toString().slice(-2), month: 'Julio', year: year },
                { id: 'jun' + year.toString().slice(-2), month: 'Junio', year: year },
                { id: 'may' + year.toString().slice(-2), month: 'Mayo', year: year },
                { id: 'abr' + year.toString().slice(-2), month: 'Abril', year: year },
                { id: 'mar' + year.toString().slice(-2), month: 'Marzo', year: year },
                { id: 'mat' + year.toString().slice(-2), month: 'Matrícula', year: year },
                { id: 'dic' + prevYear.toString().slice(-2), month: 'Diciembre', year: prevYear },
                { id: 'nov' + prevYear.toString().slice(-2), month: 'Noviembre', year: prevYear },
                { id: 'oct' + prevYear.toString().slice(-2), month: 'Octubre', year: prevYear },
                { id: 'sep' + prevYear.toString().slice(-2), month: 'Septiembre', year: prevYear },
                { id: 'ago' + prevYear.toString().slice(-2), month: 'Agosto', year: prevYear },
                { id: 'jul' + prevYear.toString().slice(-2), month: 'Julio', year: prevYear },
                { id: 'jun' + prevYear.toString().slice(-2), month: 'Junio', year: prevYear },
                { id: 'may' + prevYear.toString().slice(-2), month: 'Mayo', year: prevYear },
                { id: 'abr' + prevYear.toString().slice(-2), month: 'Abril', year: prevYear },
                { id: 'mar' + prevYear.toString().slice(-2), month: 'Marzo', year: prevYear },
                { id: 'mat' + prevYear.toString().slice(-2), month: 'Matrícula', year: prevYear },
            ];
        }
    },
    mounted() {
        this.fetchMetadata();
        this.fetchCareers();
        this.fetchPayments();
        this.$nextTick(() => {
            this.initTooltips();
        });
    },
    updated() {
        this.$nextTick(() => {
            this.destroyTooltips();
            this.initTooltips();
        });
    },
    unmounted() {
        this.destroyTooltips();
    },
    watch: {
        viewMode(val) {
            if (val === 'planilla') {
                this.fetchCourseStatus();
            } else {
                this.fetchPayments();
            }
        }
    },
    methods: {
        async fetchMetadata() {
            try {
                const response = await fetch(window.API_BASE + '/api/metadata/student-types');
                const result = await response.json();
                if (result.status === 'success') {
                    this.metadata = result.data;
                }
            } catch (error) {
                console.error("Error fetching metadata:", error);
            }
        },
        async fetchCareers() {
            try {
                const response = await fetch(window.API_BASE + '/api/careers');
                const result = await response.json();
                if (result.status === 'success') {
                    this.careers = result.data;
                }
            } catch (error) {
                console.error("Error fetching careers:", error);
            }
        },
        async fetchPayments(resetPage = true) {
            if (resetPage) this.page = 1;
            this.loading = true;
            try {
                const queryFilters = { ...this.filters };
                // Eliminar filtros vacíos para no enviarlos
                Object.keys(queryFilters).forEach(key => {
                    if (queryFilters[key] === '') delete queryFilters[key];
                });

                const params = new URLSearchParams({
                    ...queryFilters,
                    page: this.page,
                    per_page: this.perPage
                });
                const response = await fetch(window.API_BASE + `/api/payments?${params.toString()}`);
                const result = await response.json();
                if (result.status === 'success') {
                    this.payments = result.data.data;
                    this.totalAmount = result.data.total_amount;
                    this.avgAmount = result.data.avg_amount;
                    this.minAmount = result.data.min_amount;
                    this.totalCount = result.data.total_count;
                }
            } catch (error) {
                console.error("Error fetching payments:", error);
            } finally {
                this.loading = false;
            }
        },
        async fetchCourseStatus() {
            if (!this.filters.career_id && !this.filters.commission && !this.filters.search) {
                this.planilla = [];
                return;
            }
            this.loadingPlanilla = true;
            try {
                const params = new URLSearchParams({
                    career_id: this.filters.career_id,
                    commission: this.filters.commission,
                    search: this.filters.search,
                    cycle: this.filters.cycle
                });
                const response = await fetch(window.API_BASE + `/api/payments/course-status?${params}`);
                const result = await response.json();
                if (result.status === 'success') {
                    this.planilla = result.data;
                }
            } catch (err) {
                console.error("Error fetching course status:", err);
            } finally {
                this.loadingPlanilla = false;
            }
        },
        getUniqueYears() {
            const years = this.paymentPeriods.map(p => p.year);
            return [...new Set(years)];
        },
        getPeriodsByYear(year) {
            return this.paymentPeriods.filter(p => p.year === year);
        },
        getPayment(student, periodId) {
            if (!student.payments) return null;
            return student.payments.find(p => {
                if (!p.due_date) return false;
                const date = new Date(p.due_date);
                const y = date.getUTCFullYear().toString().slice(-2);
                let m = '';
                if (p.type === 'Matrícula' || (p.concept && p.concept.toLowerCase().includes('matr'))) {
                    m = 'mat';
                } else {
                    const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
                    m = months[date.getUTCMonth()];
                }
                return (m + y) === periodId;
            });
        },
        getPaymentStatus(student, periodId) {
            const payment = this.getPayment(student, periodId);
            if (!payment) return 'future';

            if (payment.status === 'Pagado') return 'paid';
            if (payment.status === 'Anulado') return 'future';
            
            if (payment.status === 'Pendiente') {
                const today = new Date();
                today.setHours(0,0,0,0);
                const due = new Date(payment.due_date);
                due.setMinutes(due.getMinutes() + due.getTimezoneOffset());
                
                if (due >= today) return 'future'; 
                return 'pending'; 
            }
            return 'future';
        },
        getTooltipHTML(student, periodId) {
            const payment = this.getPayment(student, periodId);
            if (!payment || payment.status === 'future') return 'Futuro';
            
            const statusType = this.getPaymentStatus(student, periodId);
            if (statusType === 'future' && payment.status !== 'Pendiente') return 'Futuro';
            
            let badgeClass = 'bg-secondary';
            if (statusType === 'paid') badgeClass = 'bg-success';
            else if (statusType === 'pending') badgeClass = 'bg-danger';
            else if (payment.status === 'Pendiente') badgeClass = 'bg-warning text-dark';
            
            const statusText = payment.status === 'Pendiente' && statusType === 'pending' ? 'Vencido' : payment.status;
            
            const formattedAmount = this.formatCurrency(payment.amount, payment);
            return '<div class="mb-1"><strong>' + payment.concept + '</strong></div>' +
                   '<div class="text-white mb-1"><i class="ph ph-currency-dollar"></i> ' + formattedAmount + '</div>' +
                   '<span class="badge ' + badgeClass + ' mt-1">' + statusText + '</span>';
        },
        scrollTable(direction) {
            const container = this.$refs.courseTableContainer;
            if (container) {
                const scrollAmount = 400;
                if (direction === 'left') {
                    container.scrollLeft -= scrollAmount;
                } else {
                    container.scrollLeft += scrollAmount;
                }
            }
        },
        initTooltips() {
            const tooltipTriggerList = [].slice.call(this.$el.querySelectorAll('[data-bs-toggle="tooltip"]'));
            this.tooltipInstances = tooltipTriggerList.map(function (tooltipTriggerEl) {
                return new bootstrap.Tooltip(tooltipTriggerEl, {
                    html: true
                });
            });
        },
        destroyTooltips() {
            if (this.tooltipInstances) {
                this.tooltipInstances.forEach(t => t.dispose());
                this.tooltipInstances = [];
            }
        },
        async generateInterests() {
            const confirmed = await Swal.fire({
                title: '¿Generar Intereses del Mes?',
                text: 'Se aplicarán recargos (Interés 1 e Interés 2) a todas las cuotas vencidas que no los tengan.',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, generar'
            });

            if (confirmed.isConfirmed) {
                try {
                    const response = await fetch(window.API_BASE + '/api/payments/generate-interests', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    const res = await response.json();
                    
                    if (res.status === 'success') {
                        Swal.fire(
                            'Generados!',
                            'Se han generado ' + res.total_generated + ' recargos por mora.',
                            'success'
                        );
                        this.fetchPayments();
                    } else {
                        Swal.fire('Error', res.message || 'Error al generar intereses', 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
                }
            }
        },
        changePage(p) {
            this.page = p;
            this.fetchPayments(false);
        },
        resetFilters() {
            const today = new Date();
            const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
            this.filters = { 
                search: '', 
                career: '',
                commission: '',
                start_date: firstDay.toISOString().split('T')[0],
                end_date: today.toISOString().split('T')[0], 
                method: '' 
            };
            this.fetchPayments();
        },
        formatCurrency(value) {
            return parseFloat(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
        },
        formatDate(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        },
        async deletePayment(id) {
            const result = await Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta acción no se puede deshacer.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar'
            });

            if (result.isConfirmed) {
                try {
                    const response = await fetch(window.API_BASE + `/api/payments/${id}`, { method: 'DELETE' });
                    const res = await response.json();
                    if (res.status === 'success') {
                        Swal.fire('Eliminado', 'el pago ha sido eliminado.', 'success');
                        this.fetchPayments(false);
                    } else {
                        Swal.fire('Error', res.message, 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'No se pudo eliminar el pago.', 'error');
                }
            }
        },
        async showNewPaymentModal(preSelectedStudent = null) {
            const { value: formValues } = await Swal.fire({
                title: preSelectedStudent ? `Cobrar a: ${preSelectedStudent.student_lastname}, ${preSelectedStudent.student_name}` : 'Registrar Nuevo Pago',
                html: `
                    <div class="text-start">
                        ${!preSelectedStudent ? `
                            <label class="form-label small fw-bold">Buscar Alumno (DNI/Apellido)</label>
                            <input id="swal-student-search" class="form-control form-control-sm mb-2" placeholder="Buscar...">
                        ` : ''}
                        
                        <select id="swal-student-id" class="form-select form-select-sm mb-3" ${preSelectedStudent ? 'style="display:none"' : ''}>
                            <option value="${preSelectedStudent ? preSelectedStudent.student_id : ''}" selected>
                                ${preSelectedStudent ? preSelectedStudent.student_lastname + ', ' + preSelectedStudent.student_name + ' (DNI: ' + preSelectedStudent.student_dni + ')' : 'Seleccione un alumno...'}
                            </option>
                        </select>
                        
                        <div class="row g-2">
                            <div class="col-6">
                                <label class="form-label small fw-bold">Fecha</label>
                                <input id="swal-date" type="date" class="form-control form-control-sm mb-3" value="${new Date().toISOString().split('T')[0]}">
                            </div>
                            <div class="col-6">
                                <label class="form-label small fw-bold">Monto</label>
                                <input id="swal-amount" type="number" step="0.01" class="form-control form-control-sm mb-3" placeholder="0.00">
                            </div>
                        </div>

                        <label class="form-label small fw-bold">Concepto</label>
                        <select id="swal-concept" class="form-select form-select-sm mb-3">
                            <option value="">Seleccione concepto...</option>
                            ${(this.metadata?.payment_concepts || []).map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>

                        <label class="form-label small fw-bold">Método</label>
                        <select id="swal-method" class="form-select form-select-sm mb-3">
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Depósito">Depósito</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Registrar',
                cancelButtonText: 'Cancelar',
                didOpen: () => {
                    const searchInput = document.getElementById('swal-student-search');
                    const studentSelect = document.getElementById('swal-student-id');
                    
                    if (searchInput) {
                        searchInput.addEventListener('input', async (e) => {
                            const search = e.target.value;
                            if (search.length < 3) return;
                            
                            try {
                                const response = await fetch(window.API_BASE + `/api/students/autocomplete?q=${search}`);
                                const result = await response.json();
                                if (result.status === 'success') {
                                    studentSelect.innerHTML = '<option value="">Seleccione un alumno...</option>';
                                    result.data.forEach(s => {
                                        const option = document.createElement('option');
                                        option.value = s.id;
                                        option.text = `${s.lastname}, ${s.name} (DNI: ${s.dni})`;
                                        studentSelect.appendChild(option);
                                    });
                                }
                            } catch (err) {
                                console.error(err);
                            }
                        });
                    }
                },
                preConfirm: () => {
                    const student_id = document.getElementById('swal-student-id').value;
                    const amount = document.getElementById('swal-amount').value;
                    const concept = document.getElementById('swal-concept').value;
                    const payment_date = document.getElementById('swal-date').value;
                    const payment_method = document.getElementById('swal-method').value;

                    if (!student_id || !amount || !concept) {
                        Swal.showValidationMessage('Por favor complete los campos obligatorios');
                        return false;
                    }
                    return { student_id, amount, concept, payment_date, payment_method };
                }
            });

            if (formValues) {
                try {
                    const response = await fetch(window.API_BASE + '/api/payments', {
                        method: 'POST',
                        body: JSON.stringify(formValues),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const res = await response.json();
                    if (res.status === 'success') {
                        Swal.fire('¡Éxito!', 'Pago registrado correctamente', 'success');
                        if (this.viewMode === 'planilla') {
                            this.fetchCourseStatus();
                        } else {
                            this.fetchPayments();
                        }
                    } else {
                        Swal.fire('Error', res.message, 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'No se pudo registrar el pago.', 'error');
                }
            }
        },
        async editPayment(payment) {
            const { value: formValues } = await Swal.fire({
                title: 'Editar Pago',
                html: `
                    <div class="text-start">
                        <p class="mb-3 small"><strong>Alumno:</strong> ${payment.student_lastname}, ${payment.student_name}</p>
                        
                        <div class="row g-2">
                            <div class="col-6">
                                <label class="form-label small fw-bold">Fecha</label>
                                <input id="swal-date" type="date" class="form-control form-control-sm mb-3" value="${payment.payment_date.split(' ')[0]}">
                            </div>
                            <div class="col-6">
                                <label class="form-label small fw-bold">Monto</label>
                                <input id="swal-amount" type="number" step="0.01" class="form-control form-control-sm mb-3" value="${payment.amount}">
                            </div>
                        </div>

                        <label class="form-label small fw-bold">Concepto</label>
                        <select id="swal-concept" class="form-select form-select-sm mb-3">
                            ${(this.metadata?.payment_concepts || []).map(c => `<option value="${c}" ${payment.concept === c ? 'selected' : ''}>${c}</option>`).join('')}
                            ${(this.metadata?.payment_concepts || []).includes(payment.concept) ? '' : `<option value="${payment.concept}" selected>${payment.concept}</option>`}
                        </select>

                        <label class="form-label small fw-bold">Método</label>
                        <select id="swal-method" class="form-select form-select-sm mb-3">
                            <option value="Efectivo" ${payment.payment_method === 'Efectivo' ? 'selected' : ''}>Efectivo</option>
                            <option value="Transferencia" ${payment.payment_method === 'Transferencia' ? 'selected' : ''}>Transferencia</option>
                            <option value="Tarjeta" ${payment.payment_method === 'Tarjeta' ? 'selected' : ''}>Tarjeta</option>
                            <option value="Depósito" ${payment.payment_method === 'Depósito' ? 'selected' : ''}>Depósito</option>
                            <option value="Otro" ${payment.payment_method === 'Otro' ? 'selected' : ''}>Otro</option>
                        </select>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Actualizar',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    const amount = document.getElementById('swal-amount').value;
                    const concept = document.getElementById('swal-concept').value;
                    const payment_date = document.getElementById('swal-date').value;
                    const payment_method = document.getElementById('swal-method').value;

                    if (!amount || !concept) {
                        Swal.showValidationMessage('Por favor complete los campos obligatorios');
                        return false;
                    }
                    return { amount, concept, payment_date, payment_method };
                }
            });

            if (formValues) {
                try {
                    const response = await fetch(window.API_BASE + `/api/payments/${payment.id}`, {
                        method: 'PUT',
                        body: JSON.stringify(formValues),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const res = await response.json();
                    if (res.status === 'success') {
                        Swal.fire('¡Éxito!', 'Pago actualizado correctamente', 'success');
                        this.fetchPayments(false);
                    } else {
                        Swal.fire('Error', res.message, 'error');
                    }
                } catch (error) {
                    Swal.fire('Error', 'No se pudo actualizar el pago.', 'error');
                }
            }
        },
        async sendPaymentReminder(student) {
            const confirmed = await Swal.fire({
                title: '¿Enviar recordatorio de pago?',
                text: `Se enviará un email a ${student.student_name} notificando su deuda.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, enviar'
            });

            if (!confirmed.isConfirmed) return;

            try {
                const response = await fetch(window.API_BASE + '/api/reminders/payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ student_id: student.student_id })
                });
                const result = await response.json();
                if (result.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Recordatorio Enviado',
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (error) {
                console.error("Error sending reminder:", error);
                Swal.fire('Error', 'No se pudo enviar el recordatorio.', 'error');
            }
        }
    }
};
