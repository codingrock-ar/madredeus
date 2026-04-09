export default {
    template: `
    <div class="fade-in">
        <div v-if="individualStudent" class="card-modern bg-soft-primary border-primary p-4 mb-4 shadow-sm fade-in">
            <div class="row align-items-center">
                <div class="col-md-2 text-center">
                    <div class="avatar-lg bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold mx-auto shadow" style="width: 80px; height: 80px; font-size: 1.5rem;">
                        {{ individualStudent.name.charAt(0) }}{{ individualStudent.lastname.charAt(0) }}
                    </div>
                </div>
                <div class="col-md-7">
                    <div class="badge bg-primary mb-2">MODO INDIVIDUAL</div>
                    <h3 class="fw-bold mb-1">{{ individualStudent.lastname }}, {{ individualStudent.name }}</h3>
                    <p class="mb-0 text-muted">
                        <span class="fw-bold">Legajo:</span> #{{ individualStudent.id }} | 
                        <span class="fw-bold">Carrera Actual:</span> {{ shared.career }} |
                        <span class="fw-bold">Turno/Com:</span> {{ source.shift }} - {{ source.commission }}
                    </p>
                </div>
                <div class="col-md-3 text-end">
                    <button class="btn btn-light border btn-sm shadow-xs" @click="resetIndividual">
                        <i class="ph ph-arrow-left me-1"></i> Volver a General
                    </button>
                </div>
            </div>
        </div>

        <!-- SELECCIÓN DE CARRERA (Solo modo general) -->
        <div v-if="!individualStudent" class="card-modern p-4 mb-4">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h5 class="fw-bold mb-1">
                        <i class="ph ph-fast-forward me-2 text-primary"></i>Promoción de Alumnos
                    </h5>
                    <p class="text-muted small mb-0">Seleccione la carrera para iniciar el proceso de configuración.</p>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-bold">Carrera</label>
                    <select class="form-select border-primary" v-model="shared.career" @change="onCareerChange" :disabled="showResults">
                        <option value="">Seleccione Carrera</option>
                        <option v-for="c in careers" :key="c.id" :value="c.title">{{ c.title }}</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- CONFIGURACIÓN DE PROMOCIÓN -->
        <div v-if="!showResults" class="card-modern p-4" :class="{'opacity-50': !shared.career}">
            <div class="row g-4 align-items-center">
                <!-- ORIGEN -->
                <div class="col-md-5">
                    <div class="p-3 bg-light rounded border border-dashed">
                        <h6 class="fw-bold text-muted mb-3"><i class="ph ph-hash me-1"></i>ORIGEN (Actual)</h6>
                        <div class="mb-3">
                            <label class="form-label small">Periodo</label>
                            <select class="form-select form-select-sm" v-model="source.period" @change="onSourcePeriodChange" :disabled="!shared.career">
                                <option value="">Seleccione Periodo</option>
                                <option v-for="p in sourceCareerPeriods" :key="p" :value="p">{{ p }}</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small">Turno</label>
                            <select class="form-select form-select-sm" v-model="source.shift" @change="onSourceShiftChange" :disabled="!source.period">
                                <option value="">Seleccione Turno</option>
                                <option v-for="t in sourceShifts" :key="t" :value="t">{{ t }}</option>
                            </select>
                        </div>
                        <div class="mb-0">
                            <label class="form-label small">Comisión</label>
                            <select class="form-select form-select-sm" v-model="source.commission" :disabled="!source.shift">
                                <option value="">Seleccione Comisión</option>
                                <option v-for="co in sourceCommissions" :key="co" :value="co">{{ co }}</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- FLECHA DIVISORA -->
                <div class="col-md-2 text-center d-none d-md-block">
                    <div class="avatar avatar-lg bg-soft-primary rounded-circle mx-auto mb-2">
                        <i class="ph ph-arrow-right fs-2"></i>
                    </div>
                    <div class="small fw-bold text-primary">Promocionar a</div>
                </div>

                <!-- DESTINO -->
                <div class="col-md-5">
                    <div class="p-3 bg-soft-primary rounded border border-primary">
                        <h6 class="fw-bold text-primary mb-3"><i class="ph ph-rocket-launch me-1"></i>DESTINO (Nuevo)</h6>
                        <div class="mb-3">
                            <label class="form-label small">Periodo</label>
                            <select class="form-select form-select-sm" v-model="target.period" @change="onTargetPeriodChange" :disabled="!isSourceComplete">
                                <option value="">Seleccione Periodo</option>
                                <option v-for="p in targetCareerPeriods" :key="p" :value="p" :disabled="isPeriodDisabled(p)">
                                    {{ p }}
                                </option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label small">Turno</label>
                            <select class="form-select form-select-sm" v-model="target.shift" @change="onTargetShiftChange" :disabled="!target.period">
                                <option value="">Seleccione Turno</option>
                                <option v-for="t in targetShifts" :key="t" :value="t">{{ t }}</option>
                            </select>
                        </div>
                        <div class="mb-0">
                            <label class="form-label small">Comisión</label>
                            <select class="form-select form-select-sm" v-model="target.commission" :disabled="!target.shift">
                                <option value="">Seleccione Comisión</option>
                                <option v-for="co in targetCommissions" :key="co" :value="co">{{ co }}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CHECKS Y ACCIÓN -->
            <div v-if="isSourceComplete" class="mt-4 pt-3 border-top">
                <div class="row align-items-center">
                    <div class="col-md-7">
                        <div class="d-flex gap-4">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="checkCondicion" v-model="checks.condicion">
                                <label class="form-check-label small" for="checkCondicion">Solo regulares</label>
                            </div>
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="checkDeudas" v-model="checks.deudas">
                                <label class="form-check-label small" for="checkDeudas">Sin deudas</label>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-5 text-end">
                        <button v-if="!isProcessing" @click="startPromotion" class="btn btn-primary px-4" :disabled="!isValid">
                            <i class="ph ph-check-circle me-1"></i> Promocionar Alumnos
                        </button>
                        <div v-else class="text-primary small">
                            <div class="spinner-border spinner-border-sm me-1" role="status"></div> Procesando...
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- RESULTADOS DETALLADOS -->
        <div v-if="showResults" class="card-modern p-4 fade-in">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="fw-bold mb-0">Resultados del Proceso</h5>
                <button class="btn btn-sm btn-outline-secondary" @click="resetView">
                    <i class="ph ph-arrow-left me-1"></i> Volver a Configurar
                </button>
            </div>

            <div class="row g-3 mb-4">
                <div class="col-md-6">
                    <div class="p-3 bg-soft-success rounded border border-success text-center">
                        <div class="h2 fw-bold text-success mb-0">{{ results.promoted_count }}</div>
                        <div class="small fw-bold">Promocionados con Éxito</div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="p-3 bg-soft-danger rounded border border-danger text-center">
                        <div class="h2 fw-bold text-danger mb-0">{{ results.failed_count }}</div>
                        <div class="small fw-bold">No se pudieron Promocionar</div>
                    </div>
                </div>
            </div>

            <!-- LISTADO DE FALLIDOS -->
            <div v-if="results.failed_list.length > 0" class="mt-4">
                <h6 class="fw-bold mb-3"><i class="ph ph-warning me-1 text-danger"></i> Alumnos pendientes de revisión</h6>
                <div class="table-responsive border rounded">
                    <table class="table table-hover align-middle mb-0 small">
                        <thead class="table-light">
                            <tr>
                                <th>Alumno</th>
                                <th>Motivo del Incumplimiento</th>
                                <th class="text-end">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="student in results.failed_list" :key="student.id">
                                <td class="fw-bold">{{ student.lastname }}, {{ student.name }}</td>
                                <td>
                                    <span class="badge badge-soft-danger">{{ student.reason }}</span>
                                </td>
                                <td class="text-end">
                                    <button class="btn btn-xs btn-primary py-1 px-2" @click="manualPromote(student)">
                                        Promocionar Manual
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div v-if="results.failed_count === 0" class="alert alert-success text-center p-4">
                <i class="ph ph-check-circle fs-1 d-block mb-2"></i>
                <h6 class="fw-bold">¡Todo salió perfecto!</h6>
                <p class="mb-0">Todos los alumnos seleccionados han sido promocionados correctamente.</p>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            careers: [],
            mappings: { career_shifts: {}, shift_commissions: {} },
            shared: { career: '' },
            source: { shift: '', commission: '', period: '' },
            target: { shift: '', commission: '', period: '' },
            checks: { condicion: true, deudas: false },
            isProcessing: false,
            showResults: false,
            results: { promoted_count: 0, failed_count: 0, promoted_list: [], failed_list: [] },
            filters: { student_id: null },
            individualStudent: null
        }
    },
    computed: {
        sourceCareerPeriods() {
            const career = this.careers.find(c => c.title === this.shared.career);
            const duration = career ? parseInt(career.duration) : 10;
            const numericPeriods = Array.from({length: duration}, (_, i) => i + 1);
            return [...numericPeriods, 'Egresó', 'Finalizó Cursada'];
        },
        targetCareerPeriods() {
            return this.sourceCareerPeriods;
        },
        sourceShifts() { return this.mappings.career_shifts[this.shared.career] || this.mappings.career_shifts['default'] || []; },
        targetShifts() { return this.mappings.career_shifts[this.shared.career] || this.mappings.career_shifts['default'] || []; },
        sourceCommissions() { return this.mappings.shift_commissions[this.source.shift] || this.mappings.shift_commissions['default'] || []; },
        targetCommissions() { return this.mappings.shift_commissions[this.target.shift] || this.mappings.shift_commissions['default'] || []; },
        isSourceComplete() {
            return this.shared.career && this.source.period && this.source.shift && this.source.commission;
        },
        isValid() {
            return this.isSourceComplete && 
                   this.target.period && this.target.shift && this.target.commission &&
                   !this.isPeriodDisabled(this.target.period);
        }
    },
    async mounted() {
        await this.fetchData();
        const studentId = this.$route.query.student_id;
        if (studentId) {
            this.fetchIndividualStudent(studentId);
        }
    },
    methods: {
        async fetchIndividualStudent(id) {
            try {
                const response = await fetch(`/api/students/${id}`);
                const result = await response.json();
                if (result.status === 'success') {
                    const s = result.data;
                    this.individualStudent = s;
                    this.shared.career = s.career;
                    this.source.period = s.academic_cycle;
                    this.source.shift = s.shift;
                    this.source.commission = s.commission;
                    this.filters.student_id = id;
                    
                    // Pre-seleccionar destino por defecto (siguiente periodo)
                    if (this.source.period && !isNaN(this.source.period)) {
                        this.target.period = (parseInt(this.source.period) + 1).toString();
                        this.target.shift = this.source.shift;
                        this.target.commission = this.source.commission;
                    }
                }
            } catch (error) {
                console.error("Error fetching individual student:", error);
            }
        },
        onCareerChange() {
            if (this.individualStudent) return;
            this.source = { shift: '', commission: '', period: '' };
            this.target = { shift: '', commission: '', period: '' };
        },
        onSourcePeriodChange() { this.source.shift = ''; this.source.commission = ''; },
        onSourceShiftChange() { this.source.commission = ''; },
        onTargetPeriodChange() { this.target.shift = ''; this.target.commission = ''; },
        onTargetShiftChange() { this.target.commission = ''; },
        
        isPeriodDisabled(p) {
            if (!this.source.period) return true;
            const allPeriods = this.sourceCareerPeriods;
            const sourceIdx = allPeriods.indexOf(this.source.period.toString());
            const targetIdx = allPeriods.indexOf(p.toString());
            return targetIdx <= sourceIdx;
        },
        resetIndividual() {
            this.individualStudent = null;
            this.filters.student_id = null;
            this.shared.career = '';
            this.source = { shift: '', commission: '', period: '' };
            this.$router.push('/students/promotion');
        },
        async fetchData() {
            try {
                const [careersRes, metaRes] = await Promise.all([
                    fetch('/api/careers'),
                    fetch('/api/metadata/student-types')
                ]);
                const careersData = await careersRes.json();
                const metaData = await metaRes.json();
                if (careersData.status === 'success') this.careers = careersData.data;
                if (metaData.status === 'success') {
                    this.mappings.career_shifts = metaData.data.career_shifts || {};
                    this.mappings.shift_commissions = metaData.data.shift_commissions || {};
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        },
        async startPromotion() {
            const confirm = await Swal.fire({
                title: '¿Confirmar Promoción?',
                text: `Estás por promocionar los alumnos de ${this.source.shift} - ${this.source.commission} al periodo ${this.target.period}.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Sí, Promocionar',
                cancelButtonText: 'Cancelar'
            });

            if (!confirm.isConfirmed) return;

            this.isProcessing = true;
            try {
                const response = await fetch('/api/promotion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source_career: this.shared.career,
                        source_shift: this.source.shift,
                        source_commission: this.source.commission,
                        source_period: this.source.period,
                        target_career: this.shared.career,
                        target_shift: this.target.shift,
                        target_commission: this.target.commission,
                        target_period: this.target.period,
                        check_condicion: this.checks.condicion,
                        check_deudas: this.checks.deudas,
                        filters: this.filters
                    })
                });
                const res = await response.json();
                if (res.status === 'success') {
                    this.results = res.data;
                    this.showResults = true;
                } else {
                    Swal.fire('Error', res.error || 'Error al procesar', 'error');
                }
            } catch (error) {
                Swal.fire('Error', 'Error de conexión', 'error');
            } finally {
                this.isProcessing = false;
            }
        },
        async manualPromote(student) {
            const confirm = await Swal.fire({
                title: 'Promoción Manual',
                text: `¿Deseas promocionar a ${student.lastname}, ${student.name} a pesar de no cumplir los requisitos?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Sí, Promocionar'
            });

            if (!confirm.isConfirmed) return;

            try {
                const response = await fetch('/api/promotion', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        bypass_ids: [student.id],
                        target_career: this.shared.career,
                        target_shift: this.target.shift,
                        target_commission: this.target.commission,
                        target_period: this.target.period
                    })
                });
                const res = await response.json();
                if (res.status === 'success') {
                    Swal.fire('Éxito', 'Alumno promocionado correctamente', 'success');
                    // Remove from failed list
                    this.results.failed_list = this.results.failed_list.filter(s => s.id !== student.id);
                    this.results.failed_count--;
                    this.results.promoted_count++;
                }
            } catch (error) {
                Swal.fire('Error', 'No se pudo realizar la acción', 'error');
            }
        },
        resetView() {
            this.showResults = false;
            this.onCareerChange();
        }
    }
}
