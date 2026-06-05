export default {
    props: {
        payments: {
            type: Array,
            default: () => []
        }
    },
    template: `
        <div class="card border-0 shadow-sm mb-4">
            <div class="card-body p-4 pt-2 fade-in">
                
                <!-- Timeline Horizontal -->
                <div class="position-relative mt-2">
                    <button class="btn btn-dark shadow rounded-circle position-absolute d-flex align-items-center justify-content-center" 
                            style="left: -10px; top: 25%; transform: translateY(-50%); z-index: 10; width: 35px; height: 35px; opacity: 0.8;"
                            @click="scrollTimeline('left')" title="Desplazar a la izquierda">
                        <i class="ph ph-caret-left fs-5"></i>
                    </button>
                    <button class="btn btn-dark shadow rounded-circle position-absolute d-flex align-items-center justify-content-center" 
                            style="right: -10px; top: 25%; transform: translateY(-50%); z-index: 10; width: 35px; height: 35px; opacity: 0.8;"
                            @click="scrollTimeline('right')" title="Desplazar a la derecha">
                        <i class="ph ph-caret-right fs-5"></i>
                    </button>

                    <div class="d-flex flex-nowrap overflow-auto gap-3 pb-3 px-4" ref="timelineContainer" style="scroll-behavior: smooth;">
                        <div v-for="period in paymentPeriods" :key="period.id" class="text-center" style="min-width: 80px;">
                            <div class="small fw-bold text-muted mb-1">{{ period.month }}</div>
                            <div class="extra-small text-secondary mb-2">{{ period.year }}</div>
                            
                            <div v-if="getPaymentStatus(period.id) === 'paid'" 
                                 class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto shadow-sm payment-node" 
                                 style="width: 45px; height: 45px; cursor: pointer; transition: transform 0.2s;" 
                                 data-bs-toggle="tooltip" data-bs-html="true" :title="getTooltipHTML(period.id)">
                                <i class="ph ph-check fs-4"></i>
                            </div>
                            
                            <div v-else-if="getPaymentStatus(period.id) === 'mixed'" 
                                 class="rounded-circle bg-success text-white d-flex align-items-center justify-content-center mx-auto shadow-sm payment-node position-relative" 
                                 style="width: 45px; height: 45px; cursor: pointer; transition: transform 0.2s;" 
                                 data-bs-toggle="tooltip" data-bs-html="true" :title="getTooltipHTML(period.id)">
                                <i class="ph ph-check fs-4"></i>
                                <span class="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-light rounded-circle" title="Pago Parcial/Mixto" style="width: 14px; height: 14px;"></span>
                            </div>

                            <div v-else-if="getPaymentStatus(period.id) === 'pending'" 
                                 class="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center mx-auto shadow-sm payment-node" 
                                 style="width: 45px; height: 45px; cursor: pointer; transition: transform 0.2s;" 
                                 data-bs-toggle="tooltip" data-bs-html="true" :title="getTooltipHTML(period.id)">
                                <i class="ph ph-x fs-4"></i>
                            </div>
                            
                            <div v-else
                                 class="rounded-circle bg-light text-muted border border-dashed d-flex align-items-center justify-content-center mx-auto payment-node" 
                                 style="width: 45px; height: 45px; cursor: pointer; transition: transform 0.2s;" 
                                 data-bs-toggle="tooltip" data-bs-html="true" :title="getTooltipHTML(period.id)">
                                <i class="ph ph-minus fs-4"></i>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Resumen -->
                <div class="row mt-5">
                    <div class="col-md-4">
                        <div class="bg-light rounded-3 p-3 text-center border">
                            <div class="h2 text-success mb-0">{{ countPaid() }}</div>
                            <div class="small fw-bold text-muted text-uppercase">Pagos Completados</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-light rounded-3 p-3 text-center border">
                            <div class="h2 text-danger mb-0">{{ countPending() }}</div>
                            <div class="small fw-bold text-muted text-uppercase">Vencidos a la Fecha</div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-light rounded-3 p-3 text-center border">
                            <div class="h2 text-secondary mb-0">{{ countFuture() }}</div>
                            <div class="small fw-bold text-muted text-uppercase">Próximos Venc.</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
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
            tooltipInstances: []
        };
    },
    methods: {
        getPaymentsForPeriod(periodId) {
            return this.payments.filter(p => {
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
        getPaymentStatus(periodId) {
            const periodPayments = this.getPaymentsForPeriod(periodId);
            if (periodPayments.length === 0) return 'empty';

            let hasPending = false;
            let hasPaid = false;
            let hasFuture = false;

            const today = new Date();
            today.setHours(0,0,0,0);

            periodPayments.forEach(payment => {
                if (payment.status === 'Pagado') hasPaid = true;
                else if (payment.status === 'Pendiente') {
                    const due = new Date(payment.due_date);
                    due.setMinutes(due.getMinutes() + due.getTimezoneOffset());
                    if (due >= today) hasFuture = true;
                    else hasPending = true;
                }
            });

            if (hasPaid && hasPending) return 'mixed';
            if (hasPending) return 'pending';
            if (hasPaid) return 'paid';
            return 'future';
        },
        getTooltipHTML(periodId) {
            const periodPayments = this.getPaymentsForPeriod(periodId);
            if (periodPayments.length === 0) return 'Sin movimientos';
            
            let html = '';
            periodPayments.forEach((payment, idx) => {
                const today = new Date();
                today.setHours(0,0,0,0);
                let isFuture = false;
                let isPending = false;
                let due = null;
                
                if (payment.status === 'Pendiente') {
                    due = new Date(payment.due_date);
                    due.setMinutes(due.getMinutes() + due.getTimezoneOffset());
                    if (due >= today) isFuture = true;
                    else isPending = true;
                }
                
                if (isFuture && payment.status !== 'Pendiente') return; // e.g. Anulado
                
                let badgeClass = 'bg-secondary';
                if (payment.status === 'Pagado') badgeClass = 'bg-success';
                else if (isPending) badgeClass = 'bg-danger';
                else if (payment.status === 'Pendiente') badgeClass = 'bg-warning text-dark';
                
                const statusText = isPending ? 'Vencido' : payment.status;
                
                let val = parseFloat(payment.status === 'Pagado' && parseFloat(payment.paid_amount) > 0 ? payment.paid_amount : payment.amount);
                
                const isLast = idx === periodPayments.length - 1;
                const borderClass = !isLast ? 'border-bottom border-secondary pb-2 mb-2' : '';
                
                html += '<div class="text-start ' + borderClass + '">' +
                        '<div class="mb-1 fw-bold">' + payment.concept + '</div>' +
                        '<div class="text-white mb-1"><i class="ph ph-currency-dollar"></i> ' + val.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2}) + '</div>';
                        
                if (payment.notes) {
                    html += '<div class="text-muted" style="font-size: 0.75rem;"><i class="ph ph-text-align-left"></i> ' + payment.notes + '</div>';
                }
                if (payment.payment_method) {
                    html += '<div class="text-muted" style="font-size: 0.75rem;"><i class="ph ph-wallet"></i> ' + payment.payment_method + '</div>';
                }
                
                html += '<span class="badge ' + badgeClass + ' mt-1">' + statusText + '</span></div>';
            });
            
            return html || 'Futuro';
        },
        countPaid() {
            return this.payments.filter(p => p.status === 'Pagado').length;
        },
        countPending() {
            let count = 0;
            const today = new Date();
            today.setHours(0,0,0,0);
            this.payments.forEach(p => {
                if (p.status === 'Pendiente') {
                    const due = new Date(p.due_date);
                    due.setMinutes(due.getMinutes() + due.getTimezoneOffset());
                    if (due < today) count++;
                }
            });
            return count;
        },
        countFuture() {
            let count = 0;
            const today = new Date();
            today.setHours(0,0,0,0);
            this.payments.forEach(p => {
                if (p.status === 'Pendiente') {
                    const due = new Date(p.due_date);
                    due.setMinutes(due.getMinutes() + due.getTimezoneOffset());
                    if (due >= today) count++;
                }
            });
            return count;
        },
        scrollTimeline(direction) {
            const container = this.$refs.timelineContainer;
            if (container) {
                const scrollAmount = 300;
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
                    html: true,
                    sanitize: false // allow custom html like borders, icons
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
