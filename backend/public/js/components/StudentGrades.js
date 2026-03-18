export default {
    template: `
    <div class="fade-in" v-if="student">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-0">
                    <li class="breadcrumb-item"><router-link to="/students">Alumnos</router-link></li>
                    <li class="breadcrumb-item"><router-link :to="'/student/detail/' + student.id">{{ student.lastname }}</router-link></li>
                    <li class="breadcrumb-item active">Calificaciones</li>
                </ol>
            </nav>
        </div>

        <div class="card-modern p-4">
            <div class="d-flex align-items-center mb-4">
                <img :src="student.photo || 'https://ui-avatars.com/api/?name=' + student.name + '+' + student.lastname" class="rounded-circle me-3" style="width: 64px;">
                <div>
                    <h4 class="mb-0 fw-bold">{{ student.lastname }}, {{ student.name }}</h4>
                    <p class="text-muted mb-0">{{ student.career }} | Ciclo: {{ student.academic_cycle }}</p>
                </div>
            </div>

            <div class="alert alert-info d-flex align-items-center mb-4">
                <i class="ph ph-info me-2 fs-4"></i>
                <div>
                    <strong>Estado de situación:</strong> El alumno se encuentra REGULAR en el ciclo lectivo actual.
                </div>
            </div>

            <h5 class="fw-bold mb-3">Libreta de Calificaciones</h5>
            <div class="table-responsive">
                <table class="table table-hover border">
                    <thead class="table-light">
                        <tr>
                            <th>Materia</th>
                            <th class="text-center">Parcial 1</th>
                            <th class="text-center">Parcial 2</th>
                            <th class="text-center">Recup.</th>
                            <th class="text-center">Final</th>
                            <th class="text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ANATOMOFISIOLOGIA</td>
                            <td class="text-center">8</td>
                            <td class="text-center">7</td>
                            <td class="text-center">-</td>
                            <td class="text-center">9</td>
                            <td class="text-center"><span class="badge bg-success">Aprobado</span></td>
                        </tr>
                        <tr>
                            <td>MICROBIOLOGIA</td>
                            <td class="text-center">9</td>
                            <td class="text-center">8</td>
                            <td class="text-center">-</td>
                            <td class="text-center">-</td>
                            <td class="text-center"><span class="badge bg-primary">Cursando</span></td>
                        </tr>
                        <tr>
                            <td>BIOETICA</td>
                            <td class="text-center">7</td>
                            <td class="text-center">6</td>
                            <td class="text-center">-</td>
                            <td class="text-center">-</td>
                            <td class="text-center"><span class="badge bg-warning">Regular</span></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="mt-4 text-end">
                <button class="btn btn-outline-primary" @click="window.print()"><i class="ph ph-printer me-2"></i>Imprimir Analítico</button>
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
                console.error("Error fetching student for grades:", error);
            }
        }
    }
}
