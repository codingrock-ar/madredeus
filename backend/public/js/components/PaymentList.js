export default {
    template: `
        <div class="container-fluid py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h4 mb-0"><i class="ph ph-hand-coins me-2"></i>Gestión de Pagos</h2>
                <button class="btn btn-primary btn-sm" @click="showNewPaymentModal">
                    <i class="ph ph-plus me-1"></i>Registrar Pago
                </button>
            </div>

            <!-- Filtros -->
            <div class="card border-0 shadow-sm mb-4">
                <div class="card-body p-3">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <label class="form-label small fw-bold">Buscar Alumno (Nombre/DNI)</label>
                            <div class="input-group input-group-sm">
                                <span class="input-group-text"><i class="ph ph-magnifying-glass"></i></span>
                                <input type="text" class="form-control" v-model="filters.search" @input="fetchPayments" placeholder="Ej: Perez o 30000000...">
                            </div>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label small fw-bold">Desde</label>
                            <input type="date" class="form-control form-control-sm" v-model="filters.start_date" @change="fetchPayments">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label small fw-bold">Hasta</label>
                            <input type="date" class="form-control form-control-sm" v-model="filters.end_date" @change="fetchPayments">
                        </div>
                        <div class="col-md-2">
                            <label class="form-label small fw-bold">Método</label>
                            <select class="form-select form-select-sm" v-model="filters.method" @change="fetchPayments">
                                <option value="">Todos</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Depósito">Depósito</option>
                            </select>
                        </div>
                        <div class="col-md-2 d-flex align-items-end">
                            <button class="btn btn-light btn-sm w-100" @click="resetFilters">
                                <i class="ph ph-arrow-counter-clockwise me-1"></i>Limpiar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Resumen Informativo -->
            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm bg-primary text-white">
                        <div class="card-body p-3 text-center">
                            <div class="small opacity-75 mb-1">Total recaudado (Filtros actuales)</div>
                            <div class="h3 mb-0">$ {{ formatCurrency(totalAmount) }}</div>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body p-3 text-center">
                            <div class="small text-muted mb-1">Total Operaciones</div>
                            <div class="h3 mb-0">{{ totalCount }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de Pagos -->
            <div class="card border-0 shadow-sm">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th class="border-0 small fw-bold">Fecha</th>
                                <th class="border-0 small fw-bold">Alumno</th>
                                <th class="border-0 small fw-bold">Concepto</th>
                                <th class="border-0 small fw-bold">Método</th>
                                <th class="border-0 small fw-bold text-end">Monto</th>
                                <th class="border-0 small fw-bold text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="loading">
                                <td colspan="6" class="text-center py-4">
                                    <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                                    Cargando pagos...
                                </td>
                            </tr>
                            <tr v-else v-for="p in payments" :key="p.id">
                                <td>
                                    <span class="small">{{ formatDate(p.payment_date) }}</span>
                                </td>
                                <td>
                                    <div class="fw-bold">{{ p.student_lastname }}, {{ p.student_name }}</div>
                                    <div class="small text-muted">ID: {{ p.student_id }}</div>
                                </td>
                                <td>{{ p.concept }}</td>
                                <td>
                                    <span class="badge bg-soft-info text-info small border-info border">{{ p.payment_method }}</span>
                                </td>
                                <td class="text-end fw-bold text-success">
                                    $ {{ formatCurrency(p.amount) }}
                                </td>
                                <td class="text-center">
                                    <button class="btn btn-ghost-primary btn-icon btn-sm rounded-circle" disabled>
                                        <i class="ph ph-receipt"></i>
                                    </button>
                                </td>
                            </tr>
                            <tr v-if="!loading && payments.length === 0">
                                <td colspan="6" class="text-center py-4 text-muted">No se encontraron pagos con los filtros seleccionados</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Paginación -->
                <div class="card-footer bg-white border-0 py-3" v-if="totalPages > 1">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="small text-muted">
                            Mostrando {{ payments.length }} de {{ totalCount }} registros
                        </div>
                        <nav>
                            <ul class="pagination pagination-sm mb-0">
                                <li class="page-item" :class="{ disabled: page === 1 }">
                                    <a class="page-link" href="#" @click.prevent="changePage(page - 1)">Anterior</a>
                                </li>
                                <li class="page-item" v-for="p in totalPages" :key="p" :class="{ active: p === page }">
                                    <a class="page-link" href="#" @click.prevent="changePage(p)">{{ p }}</a>
                                </li>
                                <li class="page-item" :class="{ disabled: page === totalPages }">
                                    <a class="page-link" href="#" @click.prevent="changePage(page + 1)">Siguiente</a>
                                </li>
                            </ul>
                        </nav>
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
            totalAmount: 0,
            totalCount: 0,
            loading: false,
            page: 1,
            perPage: 20,
            filters: {
                search: '',
                start_date: firstDay.toISOString().split('T')[0],
                end_date: today.toISOString().split('T')[0],
                method: ''
            }
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.totalCount / this.perPage);
        }
    },
    mounted() {
        this.fetchPayments();
    },
    methods: {
        async fetchPayments(resetPage = true) {
            if (resetPage) this.page = 1;
            this.loading = true;
            try {
                const params = new URLSearchParams({
                    ...this.filters,
                    page: this.page,
                    per_page: this.perPage
                });
                const response = await fetch(`/api/payments?${params.toString()}`);
                const result = await response.json();
                if (result.status === 'success') {
                    this.payments = result.data.data;
                    this.totalAmount = result.data.total_amount;
                    this.totalCount = result.data.total_count;
                }
            } catch (error) {
                console.error("Error fetching payments:", error);
            } finally {
                this.loading = false;
            }
        },
        changePage(p) {
            this.page = p;
            this.fetchPayments(false);
        },
        resetFilters() {
            this.filters = { 
                search: '', 
                start_date: '', 
                end_date: '', 
                method: '' 
            };
            this.fetchPayments();
            Swal.fire({
                icon: 'info',
                title: 'Filtros reiniciados',
                text: 'Cargando todos los registros operativos.',
                toast: true,
                position: 'top-end',
                timer: 2000,
                showConfirmButton: false
            });
        },
        formatCurrency(value) {
            return parseFloat(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2 });
        },
        formatDate(dateStr) {
            return new Date(dateStr).toLocaleDateString('es-AR');
        },
        showNewPaymentModal() {
            alert('Funcionalidad de registro de pago en desarrollo (Phase 3)');
        }
    }
};
