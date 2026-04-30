export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4 border-0 shadow-sm">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h5 class="fw-bold mb-0 text-primary">
                    <i class="ph ph-gear-six me-2"></i>Configuración de Pagos y Aranceles
                </h5>
                <button class="btn btn-primary btn-sm px-3" @click="saveAll" :disabled="saving">
                    <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                    <i v-else class="ph ph-floppy-disk me-2"></i>Guardar Cambios
                </button>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">Cargando configuración...</p>
            </div>

            <div v-else class="row g-4">
                <!-- Aranceles Base -->
                <div class="col-md-6">
                    <div class="card h-100 border-light-subtle">
                        <div class="card-header bg-light py-2 fw-bold small text-uppercase">Aranceles Base</div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Costo de Cuota Mensual ($)</label>
                                <input type="number" class="form-control" v-model="configs.quota_base_amount">
                                <div class="form-text extra-small">Valor por defecto al generar planes de pago.</div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Costo de Matrícula ($)</label>
                                <input type="number" class="form-control" v-model="configs.matricula_base_amount">
                                <div class="form-text extra-small">Valor por defecto para la inscripción.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Intereses por Mora -->
                <div class="col-md-6">
                    <div class="card h-100 border-light-subtle">
                        <div class="card-header bg-light py-2 fw-bold small text-uppercase">Reglas de Interés por Mora</div>
                        <div class="card-body">
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Interés después del día 10 (%)</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" v-model="configs.interest_after_10">
                                    <span class="input-group-text">%</span>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label small fw-bold">Interés después del día 20 (%)</label>
                                <div class="input-group">
                                    <input type="number" class="form-control" v-model="configs.interest_after_20">
                                    <span class="input-group-text">%</span>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-6">
                                    <label class="form-label small fw-bold">Monto Fijo (+10 días)</label>
                                    <input type="number" class="form-control" v-model="configs.interest_fixed_after_10">
                                </div>
                                <div class="col-6">
                                    <label class="form-label small fw-bold">Monto Fijo (+20 días)</label>
                                    <input type="number" class="form-control" v-model="configs.interest_fixed_after_20">
                                </div>
                            </div>
                            <div class="form-text extra-small mt-2">Los intereses se calculan sobre el valor de la cuota al momento del pago.</div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="successMessage" class="alert alert-success mt-4 fade-in">
                <i class="ph ph-check-circle me-2"></i>{{ successMessage }}
            </div>
            <div v-if="error" class="alert alert-danger mt-4 fade-in">
                <i class="ph ph-warning-circle me-2"></i>{{ error }}
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            loading: true,
            saving: false,
            configs: {},
            rawConfigs: [],
            successMessage: '',
            error: ''
        }
    },
    methods: {
        async fetchConfigs() {
            try {
                const response = await fetch(window.API_BASE + '/api/config/payments');
                const result = await response.json();
                if (result.status === 'success') {
                    this.rawConfigs = result.data;
                    const map = {};
                    result.data.forEach(c => {
                        map[c.config_key] = c.config_value;
                    });
                    this.configs = map;
                }
            } catch (e) {
                this.error = 'Error al cargar configuración';
            } finally {
                this.loading = false;
            }
        },
        async saveAll() {
            this.saving = true;
            this.error = '';
            this.successMessage = '';
            
            try {
                const promises = Object.keys(this.configs).map(key => {
                    return fetch(window.API_BASE + '/api/config/payments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ config_key: key, config_value: this.configs[key] })
                    });
                });

                await Promise.all(promises);
                this.successMessage = 'Configuración guardada exitosamente';
                setTimeout(() => this.successMessage = '', 3000);
            } catch (e) {
                this.error = 'Error al guardar algunos cambios';
            } finally {
                this.saving = false;
            }
        }
    },
    mounted() {
        this.fetchConfigs();
    }
}
