export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <h5 class="fw-bold mb-4"><i class="ph ph-student me-2"></i>Inscripción a Carrera</h5>
            
            <form @submit.prevent="submitInscription" class="row g-3">
                <!-- Estudiante -->
                <div class="col-md-6 position-relative">
                    <label class="form-label small fw-bold">Estudiante</label>
                    <div class="input-group">
                        <span class="input-group-text bg-white border-end-0"><i class="ph ph-user text-muted"></i></span>
                        <input type="text" class="form-control border-start-0" 
                               placeholder="Buscar por DNI o Apellido..." 
                               v-model="studentSearch" 
                               @input="onSearchInput"
                               :disabled="!!selectedStudent">
                        <button v-if="selectedStudent" class="btn btn-outline-danger" type="button" @click="clearStudent">
                            <i class="ph ph-x"></i>
                        </button>
                    </div>

                    <!-- Autocomplete Dropdown -->
                    <ul class="autocomplete-results shadow-lg list-group position-absolute w-100" 
                        style="z-index: 1000; top: 70px;"
                        v-if="showAutocomplete && suggestions.length > 0">
                        <li class="list-group-item list-group-item-action py-2 d-flex align-items-center gap-2"
                            v-for="s in suggestions" :key="s.id" @click="selectStudent(s)" style="cursor: pointer;">
                            <div class="avatar-sm bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px; font-size: 0.75rem;">
                                {{ s.name.charAt(0) }}{{ s.lastname.charAt(0) }}
                            </div>
                            <div>
                                <div class="fw-bold small">{{ s.lastname }}, {{ s.name }}</div>
                                <div class="extra-small text-muted">DNI: {{ s.dni }}</div>
                            </div>
                        </li>
                    </ul>
                </div>
                
                <!-- Carrera -->
                <div class="col-md-6">
                    <label class="form-label small fw-bold">Carrera a Inscribir</label>
                    <select class="form-select" v-model="form.career_id" required>
                        <option value="" disabled>Seleccionar carrera...</option>
                        <option v-for="c in careers" :key="c.id" :value="c.id">
                            {{ c.title }}
                        </option>
                    </select>
                </div>

                <div class="col-md-3">
                    <label class="form-label small fw-bold">Ciclo Lectivo</label>
                    <select class="form-select" v-model="form.academic_cycle" required>
                        <option v-for="cycle in cycles" :key="cycle.id" :value="cycle.name">
                            {{ cycle.name }}
                        </option>
                    </select>
                </div>

                <div class="col-md-3">
                    <label class="form-label small fw-bold">Turno</label>
                    <select class="form-select" v-model="form.shift" required>
                        <option value="TM">Mañana (TM)</option>
                        <option value="TT">Tarde (TT)</option>
                        <option value="TN">Noche (TN)</option>
                    </select>
                </div>

                <div class="col-md-3">
                    <label class="form-label small fw-bold">Comisión</label>
                    <select class="form-select" v-model="form.commission" required>
                        <option value="A">Comisión A</option>
                        <option value="B">Comisión B</option>
                        <option value="C">Comisión C</option>
                        <option value="D">Comisión D</option>
                    </select>
                </div>

                <div class="col-md-2">
                    <label class="form-label small fw-bold">Fecha Inscripción</label>
                    <input type="date" class="form-control" v-model="form.inscription_date" required>
                </div>
                
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Estado</label>
                    <select class="form-select" v-model="form.status" required>
                        <option value="Estadío 0">Estadío 0</option>
                        <option value="En Curso">En Curso</option>
                        <option value="Abandono">Abandono</option>
                        <option value="Egresado">Egresado</option>
                    </select>
                </div>

                <!-- ALERTA DOCUMENTACIÓN -->
                <div class="col-12 mt-4" v-if="selectedStudent">
                    <div class="card border-warning bg-light-warning">
                        <div class="card-body py-2 px-3">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <h6 class="fw-bold text-warning-emphasis mb-0 small"><i class="ph ph-warning-circle me-2"></i>Control de Documentación Requerida</h6>
                                <button v-if="hasMissingDocs" type="button" class="btn btn-warning btn-xs py-0 px-2" @click="sendDocReminder" :disabled="sendingReminder">
                                    <span v-if="sendingReminder" class="spinner-border spinner-border-sm me-1"></span>
                                    <i v-else class="ph ph-paper-plane-tilt me-1"></i>Enviar Recordatorio
                                </button>
                            </div>
                            <div class="row g-2">
                                <div class="col-md-4" v-for="doc in docChecklist" :key="doc.key">
                                    <div class="d-flex align-items-center gap-2 small">
                                        <i :class="selectedStudent[doc.key] ? 'ph-check-circle text-success' : 'ph-x-circle text-danger'" class="ph fs-6"></i>
                                        <span :class="{'text-decoration-line-through text-muted': selectedStudent[doc.key]}">{{ doc.label }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="col-12 text-end mt-4">
                    <button type="button" class="btn btn-light me-2" @click="$router.push('/students')">Cancelar</button>
                    <button type="submit" class="btn btn-primary px-4" :disabled="!selectedStudent || loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
                        Confirmar Inscripción
                    </button>
                </div>
            </form>
        </div>
    </div>
    `,
    data() {
        return {
            loading: false,
            sendingReminder: false,
            studentSearch: '',
            selectedStudent: null,
            suggestions: [],
            showAutocomplete: false,
            careers: [],
            cycles: [],
            form: {
                career_id: '',
                academic_cycle: '',
                shift: 'TM',
                commission: 'A',
                inscription_date: new Date().toISOString().split('T')[0],
                status: 'En Curso'
            },
            docChecklist: [
                { key: 'req_dni_photocopy', label: 'Fotocopia DNI' },
                { key: 'req_degree_photocopy', label: 'Copia Título' },
                { key: 'req_two_photos', label: 'Dos fotos 4x4' },
                { key: 'req_psychophysical', label: 'Apto Psicofísico' },
                { key: 'req_student_book', label: 'Libreta Est.' },
                { key: 'req_vaccines', label: 'Vacunas' }
            ]
        }
    },
    computed: {
        hasMissingDocs() {
            if (!this.selectedStudent) return false;
            return this.docChecklist.some(doc => !this.selectedStudent[doc.key]);
        }
    },
    async mounted() {
        await this.fetchInitialData();
        document.addEventListener('click', this.handleClickOutside);
    },
    unmounted() {
        document.removeEventListener('click', this.handleClickOutside);
    },
    methods: {
        async fetchInitialData() {
            try {
                const [cRes, cyRes] = await Promise.all([
                    fetch('/api/careers'),
                    fetch('/api/config/cycles')
                ]);
                const cData = await cRes.json();
                const cyData = await cyRes.json();
                if (cData.status === 'success') this.careers = cData.data;
                if (cyData.status === 'success') {
                    this.cycles = cyData.data.filter(c => c.status === 'active');
                }
            } catch (err) {
                console.error("Error fetching dependencies:", err);
            }
        },
        async onSearchInput() {
            if (this.studentSearch.length < 3) {
                this.suggestions = [];
                this.showAutocomplete = false;
                return;
            }
            try {
                const res = await fetch(`/api/students/autocomplete?q=${this.studentSearch}`);
                const data = await res.json();
                if (data.status === 'success') {
                    this.suggestions = data.data;
                    this.showAutocomplete = true;
                }
            } catch (err) {
                console.error(err);
            }
        },
        async selectStudent(s) {
            this.loading = true;
            try {
                const res = await fetch(`/api/students/${s.id}`);
                const data = await res.json();
                if (data.status === 'success') {
                    this.selectedStudent = data.data;
                    this.studentSearch = `${s.lastname}, ${s.name}`;
                    this.showAutocomplete = false;
                }
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        clearStudent() {
            this.selectedStudent = null;
            this.studentSearch = '';
        },
        handleClickOutside(e) {
            if (!this.$el.contains(e.target)) {
                this.showAutocomplete = false;
            }
        },
        async submitInscription() {
            if (!this.selectedStudent) return;
            
            const result = await Swal.fire({
                title: '¿Confirmar inscripción?',
                text: `Se inscribirá a ${this.selectedStudent.lastname} en la carrera seleccionada.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, inscribir'
            });

            if (!result.isConfirmed) return;

            this.loading = true;
            try {
                const res = await fetch(`/api/students/${this.selectedStudent.id}/inscriptions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.form)
                });
                const data = await res.json();
                if (data.status === 'success') {
                    Swal.fire('¡Éxito!', 'Inscripción realizada correctamente', 'success');
                    this.$router.push('/student/detail/' + this.selectedStudent.id);
                } else {
                    Swal.fire('Error', data.error || 'No se pudo realizar la inscripción', 'error');
                }
            } catch (err) {
                Swal.fire('Error', 'Error de conexión', 'error');
            } finally {
                this.loading = false;
            }
        },
        async sendDocReminder() {
            if (!this.selectedStudent) return;
            this.sendingReminder = true;
            try {
                const response = await fetch('/api/reminders/documentation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ student_id: this.selectedStudent.id })
                });
                const result = await response.json();
                if (result.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: 'Recordatorio Enviado',
                        text: `Se ha notificado a ${this.selectedStudent.name} sobre la documentación faltante.`,
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                } else {
                    Swal.fire('Error', result.message, 'error');
                }
            } catch (err) {
                console.error(err);
                Swal.fire('Error', 'No se pudo enviar el recordatorio.', 'error');
            } finally {
                this.sendingReminder = false;
            }
        }
    }
}
