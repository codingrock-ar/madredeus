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
                <div class="card-body p-4">
                    <!-- Fila 1 -->
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
                                <option value="1er Año">1er Año</option>
                                <option value="2do Año">2do Año</option>
                                <option value="3er Año">3er Año</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Fila 2 -->
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
                            <label class="form-label small fw-bold text-muted mb-1">Método de Pago</label>
                            <select class="form-select form-select-sm" v-model="filters.method" @change="fetchPayments">
                                <option value="">Todos los Métodos</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Tarjeta">Tarjeta</option>
                                <option value="Depósito">Depósito</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                        <div class="col-md-3 d-flex align-items-end">
                            <button class="btn btn-light btn-sm w-100 border" @click="resetFilters">
                                <i class="ph ph-arrow-counter-clockwise me-1"></i>Limpiar Filtros
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
                            <div class="small opacity-75 mb-1">Total recaudado</div>
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
                                    <div class="small text-muted">DNI: {{ p.student_dni || 'N/A' }} | ID: {{ p.student_id }}</div>
                                </td>
                                <td>{{ p.concept }}</td>
                                <td>
                                    <span class="badge bg-soft-info text-info small border-info border">{{ p.payment_method }}</span>
                                </td>
                                <td class="text-end fw-bold text-success">
                                    $ {{ formatCurrency(p.amount) }}
                                </td>
                                <td class="text-center">
                                    <div class="d-flex justify-content-center gap-1">
                                        <button class="btn btn-ghost-primary btn-icon btn-sm rounded-circle" @click="editPayment(p)" title="Editar">
                                            <i class="ph ph-pencil"></i>
                                        </button>
                                        <button class="btn btn-ghost-danger btn-icon btn-sm rounded-circle" @click="deletePayment(p.id)" title="Eliminar">
                                            <i class="ph ph-trash"></i>
                                        </button>
                                    </div>
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

        <!-- Modal para Nuevo/Editar Pago se maneja con SweetAlert2 para simplicidad -->
    `,
    data() {
        const today = new Date();
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
        
        return {
            payments: [],
            careers: [],
            commissions: ['A', 'B', 'C', 'D', 'E', 'Z'],
            totalAmount: 0,
            totalCount: 0,
            loading: false,
            page: 1,
            perPage: 20,
            filters: {
                search: '',
                career: '',
                commission: '',
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
        this.fetchCareers();
        this.fetchPayments();
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
        }
    }
};
