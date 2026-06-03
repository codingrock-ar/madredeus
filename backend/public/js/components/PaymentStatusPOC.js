export default {
    template: `
        <div class="container-fluid py-4 fade-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 class="h4 mb-1">
                        <i class="ph ph-flask text-warning me-2"></i>Estado de Pagos (POC)
                    </h2>
                    <p class="text-muted small mb-0">Vista amigable con histórico (Año anterior + Actual).</p>
                </div>
                <button class="btn btn-outline-secondary btn-sm" @click="$router.push('/students')">
                    <i class="ph ph-arrow-left me-1"></i>Volver al Listado
                </button>
            </div>

            <!-- Modos de Vista -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-2 d-flex gap-2">
                    <button class="btn flex-grow-1 border-0" 
                            :class="viewMode === 'individual' ? 'btn-primary shadow-sm' : 'btn-light text-muted'"
                            @click="viewMode = 'individual'">
                        <i class="ph ph-user me-2"></i>Vista por Alumno
                    </button>
                    <button class="btn flex-grow-1 border-0" 
                            :class="viewMode === 'course' ? 'btn-primary shadow-sm' : 'btn-light text-muted'"
                            @click="viewMode = 'course'">
                        <i class="ph ph-users-three me-2"></i>Vista de Curso Completo
                    </button>
                </div>
            </div>

            <!-- Vista Individual -->
            <div v-if="viewMode === 'individual'" class="fade-in">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body p-4">
                        <div class="row align-items-end">
                            <div class="col-md-4">
                                <label class="form-label small fw-bold text-muted mb-1">Seleccionar Alumno (Mock)</label>
                                <select class="form-select" v-model="selectedStudentId">
                                    <option v-for="s in mockStudents" :key="s.id" :value="s.id">
                                        {{ s.lastname }}, {{ s.name }} ({{ s.career }})
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="selectedStudent" class="card border-0 shadow-sm">
                    <div class="card-header bg-white border-0 pt-4 pb-2 px-4 d-flex align-items-center gap-3">
                        <div class="avatar bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 50px; height: 50px; font-size: 1.2rem;">
                            {{ selectedStudent.name.charAt(0) }}{{ selectedStudent.lastname.charAt(0) }}
                        </div>
                        <div>
                            <h5 class="mb-0">
                                <router-link :to="'/student/detail/' + selectedStudent.id" class="text-decoration-none text-dark hover-primary" title="Ver legajo del alumno">
                                    {{ selectedStudent.lastname }}, {{ selectedStudent.name }}
                                </router-link>
                            </h5>
                            <div class="small text-muted">{{ selectedStudent.career }} - Comisión {{ selectedStudent.commission }}</div>
                        </div>
                    </div>
                    <div class="card-body p-4">
                        <h6 class="fw-bold mb-4">Historial de Pagos (2025 - 2026)</h6>
                        
                        <!-- Timeline Horizontal Amigable con scroll si es muy largo -->
                        <div class="d-flex flex-nowrap overflow-auto gap-3 pb-3" style="cursor: grab;">
                            <div v-for="period in paymentPeriods" :key="period.id" class="text-center" style="min-width: 80px;">
                                <div class="small fw-bold text-muted mb-1">{{ period.month }}</div>
                                <div class="extra-small text-secondary mb-2">{{ period.year }}</div>
                                
                                <div v-if="getPaymentStatus(selectedStudent, period.id) === 'paid'" 
                                     class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto shadow-sm payment-node" 
                                     style="width: 45px; height: 45px; cursor: pointer; transition: transform 0.2s;" 
                                     data-bs-toggle="tooltip" data-bs-html="true" :title="getTooltipHTML(selectedStudent, period.id)">
                                    <i class="ph ph-check fs-4"></i>
                                </div>
                                
                                <div v-else-if="getPaymentStatus(selectedStudent, period.id) === 'pending'" 
                                     class="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center mx-auto shadow-sm payment-node" 
                                     style="width: 45px; height: 45px; cursor: pointer; transition: transform 0.2s;" 
                                     data-bs-toggle="tooltip" data-bs-html="true" :title="getTooltipHTML(selectedStudent, period.id)">
                                    <i class="ph ph-x fs-4"></i>
                                </div>
                                
                                <div v-else
                                     class="rounded-circle bg-light text-muted border border-dashed d-flex align-items-center justify-content-center mx-auto payment-node" 
                                     style="width: 45px; height: 45px; cursor: pointer; transition: transform 0.2s;" 
                                     data-bs-toggle="tooltip" title="Futuro">
                                    <i class="ph ph-minus fs-4"></i>
                                </div>
                            </div>
                        </div>

                        <!-- Resumen -->
                        <div class="row mt-5">
                            <div class="col-md-4">
                                <div class="bg-light rounded-3 p-3 text-center border">
                                    <div class="h2 text-success mb-0">{{ selectedStudent.payments.filter(p => p.status === 'paid').length }}</div>
                                    <div class="small fw-bold text-muted text-uppercase">Cuotas Cubiertas</div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="bg-light rounded-3 p-3 text-center border">
                                    <div class="h2 text-danger mb-0">{{ selectedStudent.payments.filter(p => p.status === 'pending').length }}</div>
                                    <div class="small fw-bold text-muted text-uppercase">Cuotas Adeudadas</div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="bg-light rounded-3 p-3 text-center border">
                                    <div class="h2 text-secondary mb-0">{{ selectedStudent.payments.filter(p => p.status === 'future').length }}</div>
                                    <div class="small fw-bold text-muted text-uppercase">Próximos Venc.</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Vista Curso Completo -->
            <div v-else-if="viewMode === 'course'" class="fade-in">
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body p-3">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-muted mb-1">Carrera</label>
                                <select class="form-select form-select-sm">
                                    <option>Enfermería (Ejemplo)</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold text-muted mb-1">Comisión</label>
                                <select class="form-select form-select-sm">
                                    <option>Comisión A (Ejemplo)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm position-relative">
                    <!-- Botones de Desplazamiento Horizontal -->
                    <button class="btn btn-dark shadow rounded-circle position-absolute d-flex align-items-center justify-content-center" 
                            style="left: 215px; top: 50%; transform: translateY(-50%); z-index: 10; width: 40px; height: 40px; opacity: 0.8;"
                            @click="scrollTable('left')" title="Desplazar a la izquierda">
                        <i class="ph ph-caret-left fs-5"></i>
                    </button>
                    <button class="btn btn-dark shadow rounded-circle position-absolute d-flex align-items-center justify-content-center" 
                            style="right: 15px; top: 50%; transform: translateY(-50%); z-index: 10; width: 40px; height: 40px; opacity: 0.8;"
                            @click="scrollTable('right')" title="Desplazar a la derecha">
                        <i class="ph ph-caret-right fs-5"></i>
                    </button>
                    
                    <div class="table-responsive" ref="courseTableContainer" style="scroll-behavior: smooth;">
                        <table class="table table-bordered table-sm align-middle mb-0 text-center" style="min-width: 1800px;">
                            <thead class="bg-light">
                                <tr>
                                    <th class="text-start ps-3 align-middle" rowspan="2" style="min-width: 200px; position: sticky; left: 0; background: #f8f9fa; z-index: 1;">Alumno</th>
                                    <th v-for="year in getUniqueYears()" :key="year" :colspan="getPeriodsByYear(year).length" class="text-center small fw-bold border-bottom" :class="year === 2026 ? 'bg-light-primary' : (year === 2025 ? 'bg-white' : 'bg-light')">
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
                                <tr v-for="s in mockStudents" :key="s.id">
                                    <td class="text-start ps-3 fw-bold small" style="position: sticky; left: 0; background: white; z-index: 1; border-right: 2px solid #dee2e6;">
                                        <router-link :to="'/student/detail/' + s.id" class="text-decoration-none text-primary hover-underline" title="Ver legajo del alumno">
                                            {{ s.lastname }}, {{ s.name }}
                                        </router-link>
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
                                             data-bs-toggle="tooltip" data-bs-html="true" :title="getTooltipHTML(s, period.id)">
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
                .bg-light-primary {
                    background-color: #f0f7ff !important;
                }
                .tooltip-inner {
                    text-align: left;
                    padding: 8px 12px;
                }
            </style>
        </div>
    `,
    data() {
        return {
            viewMode: 'individual',
            selectedStudentId: 1,
            paymentPeriods: [
                { id: 'jul26', month: 'Julio', year: 2026 },
                { id: 'jun26', month: 'Junio', year: 2026 },
                { id: 'may26', month: 'Mayo', year: 2026 },
                { id: 'abr26', month: 'Abril', year: 2026 },
                { id: 'mar26', month: 'Marzo', year: 2026 },
                { id: 'mat26', month: 'Matrícula', year: 2026 },
                { id: 'dic25', month: 'Diciembre', year: 2025 },
                { id: 'nov25', month: 'Noviembre', year: 2025 },
                { id: 'oct25', month: 'Octubre', year: 2025 },
                { id: 'sep25', month: 'Septiembre', year: 2025 },
                { id: 'ago25', month: 'Agosto', year: 2025 },
                { id: 'jul25', month: 'Julio', year: 2025 },
                { id: 'jun25', month: 'Junio', year: 2025 },
                { id: 'may25', month: 'Mayo', year: 2025 },
                { id: 'abr25', month: 'Abril', year: 2025 },
                { id: 'mar25', month: 'Marzo', year: 2025 },
                { id: 'mat25', month: 'Matrícula', year: 2025 },
                { id: 'dic24', month: 'Diciembre', year: 2024 },
                { id: 'nov24', month: 'Noviembre', year: 2024 },
                { id: 'oct24', month: 'Octubre', year: 2024 },
                { id: 'sep24', month: 'Septiembre', year: 2024 },
                { id: 'ago24', month: 'Agosto', year: 2024 },
                { id: 'jul24', month: 'Julio', year: 2024 },
                { id: 'jun24', month: 'Junio', year: 2024 },
                { id: 'may24', month: 'Mayo', year: 2024 },
                { id: 'abr24', month: 'Abril', year: 2024 },
                { id: 'mar24', month: 'Marzo', year: 2024 },
            ],
            mockStudents: [
                {
                    id: 1,
                    name: 'Juan',
                    lastname: 'Perez',
                    career: 'Enfermería',
                    commission: 'A',
                    payments: [
                        { periodId: 'ago25', status: 'paid', amount: 15000, concept: 'Cuota Agosto 2025' },
                        { periodId: 'sep25', status: 'paid', amount: 15000, concept: 'Cuota Septiembre 2025' },
                        { periodId: 'oct25', status: 'paid', amount: 15000, concept: 'Cuota Octubre 2025' },
                        { periodId: 'nov25', status: 'paid', amount: 15000, concept: 'Cuota Noviembre 2025' },
                        { periodId: 'dic25', status: 'paid', amount: 15000, concept: 'Cuota Diciembre 2025' },
                        { periodId: 'mat26', status: 'paid', amount: 25000, concept: 'Matrícula 2026' },
                        { periodId: 'mar26', status: 'paid', amount: 20000, concept: 'Cuota Marzo 2026' },
                        { periodId: 'abr26', status: 'paid', amount: 20000, concept: 'Cuota Abril 2026' },
                        { periodId: 'may26', status: 'pending', amount: 20000, concept: 'Cuota Mayo 2026' },
                        { periodId: 'jun26', status: 'pending', amount: 20000, concept: 'Cuota Junio 2026' },
                        { periodId: 'jul26', status: 'future' }
                    ]
                },
                {
                    id: 2,
                    name: 'Maria',
                    lastname: 'Gomez',
                    career: 'Enfermería',
                    commission: 'A',
                    payments: [
                        { periodId: 'ago25', status: 'paid', amount: 15000, concept: 'Cuota Agosto 2025' },
                        { periodId: 'sep25', status: 'paid', amount: 15000, concept: 'Cuota Septiembre 2025' },
                        { periodId: 'oct25', status: 'paid', amount: 15000, concept: 'Cuota Octubre 2025' },
                        { periodId: 'nov25', status: 'paid', amount: 15000, concept: 'Cuota Noviembre 2025' },
                        { periodId: 'dic25', status: 'paid', amount: 15000, concept: 'Cuota Diciembre 2025' },
                        { periodId: 'mat26', status: 'paid', amount: 25000, concept: 'Matrícula 2026' },
                        { periodId: 'mar26', status: 'paid', amount: 20000, concept: 'Cuota Marzo 2026' },
                        { periodId: 'abr26', status: 'paid', amount: 20000, concept: 'Cuota Abril 2026' },
                        { periodId: 'may26', status: 'paid', amount: 20000, concept: 'Cuota Mayo 2026' },
                        { periodId: 'jun26', status: 'paid', amount: 20000, concept: 'Cuota Junio 2026' },
                        { periodId: 'jul26', status: 'future' }
                    ]
                },
                {
                    id: 3,
                    name: 'Carlos',
                    lastname: 'Lopez',
                    career: 'Enfermería',
                    commission: 'A',
                    payments: [
                        { periodId: 'ago25', status: 'paid', amount: 15000, concept: 'Cuota Agosto 2025' },
                        { periodId: 'sep25', status: 'paid', amount: 15000, concept: 'Cuota Septiembre 2025' },
                        { periodId: 'oct25', status: 'paid', amount: 15000, concept: 'Cuota Octubre 2025' },
                        { periodId: 'nov25', status: 'pending', amount: 15000, concept: 'Cuota Noviembre 2025' },
                        { periodId: 'dic25', status: 'pending', amount: 15000, concept: 'Cuota Diciembre 2025' },
                        { periodId: 'mat26', status: 'pending', amount: 25000, concept: 'Matrícula 2026' },
                        { periodId: 'mar26', status: 'pending', amount: 20000, concept: 'Cuota Marzo 2026' },
                        { periodId: 'abr26', status: 'pending', amount: 20000, concept: 'Cuota Abril 2026' },
                        { periodId: 'may26', status: 'pending', amount: 20000, concept: 'Cuota Mayo 2026' },
                        { periodId: 'jun26', status: 'pending', amount: 20000, concept: 'Cuota Junio 2026' },
                        { periodId: 'jul26', status: 'future' }
                    ]
                }
            ],
            tooltipInstances: []
        };
    },
    computed: {
        selectedStudent() {
            return this.mockStudents.find(s => s.id === this.selectedStudentId);
        }
    },
    methods: {
        getUniqueYears() {
            const years = this.paymentPeriods.map(p => p.year);
            return [...new Set(years)];
        },
        getPeriodsByYear(year) {
            return this.paymentPeriods.filter(p => p.year === year);
        },
        getPayment(student, periodId) {
            return student.payments.find(p => p.periodId === periodId);
        },
        getPaymentStatus(student, periodId) {
            const payment = this.getPayment(student, periodId);
            return payment ? payment.status : 'future';
        },
        getTooltipHTML(student, periodId) {
            const payment = this.getPayment(student, periodId);
            if (!payment || payment.status === 'future') return 'Futuro';
            
            const badgeClass = payment.status === 'paid' ? 'bg-success' : 'bg-danger';
            const statusText = payment.status === 'paid' ? 'Pagado' : 'Adeudado';
            
            return '<div class="mb-1"><strong>' + payment.concept + '</strong></div>' +
                   '<div class="text-white mb-1"><i class="ph ph-currency-dollar"></i> $' + payment.amount.toLocaleString('es-AR') + '</div>' +
                   '<span class="badge ' + badgeClass + ' mt-1">' + statusText + '</span>';
        },
        scrollTable(direction) {
            const container = this.$refs.courseTableContainer;
            if (container) {
                const scrollAmount = 400; // Pixeles a desplazar por click
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
        }
    },
    mounted() {
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
    }
};
