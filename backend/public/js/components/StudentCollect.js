export default {
    template: `
    <div class="fade-in" v-if="student">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item"><router-link to="/students">Alumnos</router-link></li>
                    <li class="breadcrumb-item"><router-link :to="'/student/detail/' + student.id">{{ student.lastname }}</router-link></li>
                    <li class="breadcrumb-item active">Cobrar</li>
                </ol>
            </nav>
        </div>

        <div class="card-modern p-4">
            <div class="d-flex align-items-center mb-4">
                <img :src="student.photo || 'https://ui-avatars.com/api/?name=' + student.name + '+' + student.lastname" class="rounded-circle me-3" style="width: 64px;">
                <div>
                    <h4 class="mb-0 fw-bold">{{ student.lastname }}, {{ student.name }}</h4>
                    <p class="text-muted mb-0">ID: #{{ student.id }} | DNI: {{ student.dni }}</p>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-md-7">
                    <h5 class="fw-bold mb-3">Conceptos Pendientes</h5>
                    <div class="list-group">
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
                            <div>
                                <h6 class="mb-0">Cuota Abril 2024</h6>
                                <p class="text-muted extra-small mb-0">Vencimiento: 10/04/2024</p>
                            </div>
                            <div class="text-end">
                                <div class="fw-bold text-primary">$12.500,00</div>
                                <button class="btn btn-sm btn-primary mt-1" @click="collect('Cuota Abril')">Cobrar</button>
                            </div>
                        </div>
                        <div class="list-group-item list-group-item-action d-flex justify-content-between align-items-center p-3">
                            <div>
                                <h6 class="mb-0">Material de Estudio - Radiología I</h6>
                                <p class="text-muted extra-small mb-0">Apuntes y guías</p>
                            </div>
                            <div class="text-end">
                                <div class="fw-bold text-primary">$2.500,00</div>
                                <button class="btn btn-sm btn-primary mt-1" @click="collect('Apuntes')">Cobrar</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-md-5">
                    <div class="bg-light p-4 rounded-3 h-100">
                        <h5 class="fw-bold mb-3">Información Administrativa</h5>
                        <p class="small mb-2"><strong>Último Pago:</strong> 10/03/2024 (Cuota Marzo)</p>
                        <p class="small mb-4"><strong>Situación:</strong> <span class="badge bg-success">Al Día</span></p>
                        
                        <div class="border-top pt-3 mb-4">
                            <h6 class="fw-bold small mb-2">Forma de Pago</h6>
                            <select class="form-select form-select-sm mb-3">
                                <option>Efectivo</option>
                                <option>Transferencia</option>
                                <option>Tarjeta de Crédito/Débito</option>
                            </select>
                        </div>
                        <button class="btn btn-dark w-100" @click="alert('Enviando recordatorio de pago...')">Enviar Recordatorio</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else class="text-center py-5">
        <div class="spinner-border text-primary" role="status"></div>
    </div>
    `,
    data() {
        return {
            student: null,
            loading: true
        }
    },
    async mounted() {
        const id = this.$route.params.id;
        if (id) {
            await this.fetchStudent(id);
        }
    },
    methods: {
        async fetchStudent(id) {
            try {
                const response = await fetch(window.API_BASE + '/api/students/' + id);
                const result = await response.json();
                if (result.status === 'success') {
                    this.student = result.data;
                }
            } catch (error) {
                console.error("Error fetching student for collect:", error);
            }
        },
        collect(concept) {
            alert('Procesando cobro de: ' + concept + '. Se generará el recibo correspondiente.');
        }
    }
}
