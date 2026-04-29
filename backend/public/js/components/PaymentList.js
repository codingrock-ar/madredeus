export default {
    template: `
        <div class="container-fluid py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h4 mb-0"><i class="ph ph-hand-coins me-2"></i>Gestión de Pagos</h2>
                <button class="btn btn-primary btn-sm" @click="showNewPaymentModal">
                    <i class="ph ph-plus me-1"></i>Registrar Pago
                </button>
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
                        <i class="ph ph-clipboard-text me-2"></i>Planilla de Cobro
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
                                        <div class="fw-bold small">{{ p.student_lastname }}, {{ p.student_name }}</div>
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
                <!-- Filtros Planilla -->
                <div class="card border-0 shadow-sm mb-4">
                    <div class="card-body p-3">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <input type="text" class="form-control form-control-sm" v-model="filters.search" @input="fetchPlanilla" placeholder="Filtrar alumnos...">
                            </div>
                            <div class="col-md-6">
                                <select class="form-select form-select-sm" v-model="filters.career_id" @change="fetchPlanilla">
                                    <option value="">Todas las carreras</option>
                                    <option v-for="c in careers" :key="c.id" :value="c.id">{{ c.title }}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Planilla por Carrera -->
                <div v-if="loadingPlanilla" class="text-center py-5">
                    <div class="spinner-border text-primary"></div>
                </div>
                <div v-else>
                    <div v-for="career in planilla" :key="career.id" class="mb-5">
                        <h5 class="fw-bold mb-3 border-bottom pb-2 text-primary">{{ career.title }}</h5>
                        <div class="card border-0 shadow-sm">
                            <div class="table-responsive">
                                <table class="table table-sm align-middle mb-0">
                                    <thead class="bg-light extra-small fw-bold">
                                        <tr>
                                            <th class="ps-3">Alumno</th>
                                            <th class="text-center">Comisión</th>
                                            <th class="text-end">Pagado</th>
                                            <th class="text-center">Cuotas</th>
                                            <th class="text-center">Estado</th>
                                            <th class="pe-3 text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="s in career.students" :key="s.student_id" class="small">
                                            <td class="ps-3">
                                                <div class="fw-bold">{{ s.student_lastname }}, {{ s.student_name }}</div>
                                                <div class="extra-small text-muted">{{ s.student_dni }}</div>
                                            </td>
                                            <td class="text-center">{{ s.commission }}</td>
                                            <td class="text-end fw-bold">$ {{ formatCurrency(s.total_paid) }}</td>
                                            <td class="text-center">{{ s.installments_paid }} / 10</td>
                                            <td class="text-center">
                                                <span :class="s.has_debt ? 'badge bg-soft-danger text-danger' : 'badge bg-soft-success text-success'">
                                                    {{ s.has_debt ? 'DEUDA' : 'AL DÍA' }}
                                                </span>
                                            </td>
                                            <td class="pe-3 text-center">
                                                <div class="d-flex gap-1 justify-content-center">
                                                    <router-link :to="'/student/collect/' + s.student_id" class="btn btn-primary btn-xs py-1 px-2">Cobrar</router-link>
                                                    <button v-if="s.has_debt" class="btn btn-soft-warning btn-xs py-1 px-2" @click="sendPaymentReminder(s)" title="Enviar Recordatorio de Pago">
                                                        <i class="ph ph-bell"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
            }
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
        }
    },
    mounted() {
        this.fetchCareers();
        this.fetchPayments();
    },
    watch: {
        viewMode(val) {
            if (val === 'planilla') {
                this.fetchPlanilla();
            } else {
                this.fetchPayments();
            }
        }
    },
    methods: {
        async fetchCareers() {
            try {
                const response = await fetch('/api/careers');
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
                const response = await fetch(`/api/payments?${params.toString()}`);
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
        async fetchPlanilla() {
            this.loadingPlanilla = true;
            try {
                const params = new URLSearchParams({
                    career_id: this.filters.career_id,
                    search: this.filters.search,
                    cycle: this.filters.cycle
                });
                const response = await fetch(`/api/payments/collection-planilla?${params}`);
                const result = await response.json();
                if (result.status === 'success') {
                    this.planilla = result.data;
                }
            } catch (err) {
                console.error("Error fetching planilla:", err);
            } finally {
                this.loadingPlanilla = false;
            }
        },
        changePage(p) {
            this.page = p;
            this.fetchPayments(false);
        },
        async sendPaymentReminder(student) {
            try {
                const response = await fetch('/api/reminders/payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        student_id: student.student_id,
                        debt: (student.expected_installments - student.installments_paid) * 5000 // Heuristic for now
                    })
                });
                const result = await response.json();
                if (result.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Recordatorio Enviado',
                        text: `Se ha enviado un correo a ${student.student_name} avisando sobre la deuda.`,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (err) {
                console.error("Error sending reminder:", err);
                Swal.fire('Error', 'No se pudo enviar el recordatorio.', 'error');
            }
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
                    const response = await fetch(`/api/payments/${id}`, { method: 'DELETE' });
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
        async showNewPaymentModal() {
            const { value: formValues } = await Swal.fire({
                title: 'Registrar Nuevo Pago',
                html: `
                    <div class="text-start">
                        <label class="form-label small fw-bold">Buscar Alumno (DNI/Apellido)</label>
                        <input id="swal-student-search" class="form-control form-control-sm mb-2" placeholder="Buscar...">
                        <select id="swal-student-id" class="form-select form-select-sm mb-3">
                            <option value="">Seleccione un alumno...</option>
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
                            <option value="Matrícula">Matrícula</option>
                            <option value="Cuota 1">Cuota 1</option>
                            <option value="Cuota 2">Cuota 2</option>
                            <option value="Cuota 3">Cuota 3</option>
                            <option value="Cuota 4">Cuota 4</option>
                            <option value="Cuota 5">Cuota 5</option>
                            <option value="Cuota 6">Cuota 6</option>
                            <option value="Cuota 7">Cuota 7</option>
                            <option value="Cuota 8">Cuota 8</option>
                            <option value="Cuota 9">Cuota 9</option>
                            <option value="Cuota 10">Cuota 10</option>
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
                    
                    searchInput.addEventListener('input', async (e) => {
                        const search = e.target.value;
                        if (search.length < 3) return;
                        
                        try {
                            const response = await fetch(`/api/students/autocomplete?q=${search}`);
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
                    const response = await fetch('/api/payments', {
                        method: 'POST',
                        body: JSON.stringify(formValues),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    const res = await response.json();
                    if (res.status === 'success') {
                        Swal.fire('¡Éxito!', 'Pago registrado correctamente', 'success');
                        this.fetchPayments();
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
                            <option value="Matrícula" ${payment.concept === 'Matrícula' ? 'selected' : ''}>Matrícula</option>
                            <option value="Cuota 1" ${payment.concept === 'Cuota 1' ? 'selected' : ''}>Cuota 1</option>
                            <option value="Cuota 2" ${payment.concept === 'Cuota 2' ? 'selected' : ''}>Cuota 2</option>
                            <option value="Cuota 3" ${payment.concept === 'Cuota 3' ? 'selected' : ''}>Cuota 3</option>
                            <option value="Cuota 4" ${payment.concept === 'Cuota 4' ? 'selected' : ''}>Cuota 4</option>
                            <option value="Cuota 5" ${payment.concept === 'Cuota 5' ? 'selected' : ''}>Cuota 5</option>
                            <option value="Cuota 6" ${payment.concept === 'Cuota 6' ? 'selected' : ''}>Cuota 6</option>
                            <option value="Cuota 7" ${payment.concept === 'Cuota 7' ? 'selected' : ''}>Cuota 7</option>
                            <option value="Cuota 8" ${payment.concept === 'Cuota 8' ? 'selected' : ''}>Cuota 8</option>
                            <option value="Cuota 9" ${payment.concept === 'Cuota 9' ? 'selected' : ''}>Cuota 9</option>
                            <option value="Cuota 10" ${payment.concept === 'Cuota 10' ? 'selected' : ''}>Cuota 10</option>
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
                    const response = await fetch(`/api/payments/${payment.id}`, {
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
                const response = await fetch('/api/reminders/payment', {
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
