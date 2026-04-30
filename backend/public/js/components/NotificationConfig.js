export default {
    template: `
        <div class="container-fluid py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h4 mb-0"><i class="ph ph-envelope-simple me-2"></i>Plantillas de Correo</h2>
            </div>

            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary"></div>
            </div>

            <div v-else class="row">
                <div class="col-md-4">
                    <div class="list-group shadow-sm border-0">
                        <button v-for="t in templates" 
                                :key="t.id"
                                @click="selectTemplate(t)"
                                class="list-group-item list-group-item-action border-0 py-3 d-flex align-items-center justify-content-between"
                                :class="{'active fw-bold': selectedTemplate?.id === t.id}">
                            <div>
                                <i class="ph ph-file-text me-2"></i> {{ t.description }}
                            </div>
                            <i class="ph ph-caret-right"></i>
                        </button>
                    </div>
                </div>

                <div class="col-md-8">
                    <div v-if="selectedTemplate" class="card border-0 shadow-sm fade-in">
                        <div class="card-header bg-white border-bottom py-3">
                            <h5 class="mb-0 fw-bold">{{ selectedTemplate.description }}</h5>
                            <small class="text-muted">Key: {{ selectedTemplate.template_key }}</small>
                        </div>
                        <div class="card-body p-4">
                            <div class="mb-3">
                                <label class="form-label fw-bold small">Asunto del Email</label>
                                <input type="text" class="form-control" v-model="editData.subject">
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold small">Cuerpo del Mensaje</label>
                                <textarea class="form-control" rows="12" v-model="editData.body" style="font-family: monospace;"></textarea>
                                <div class="mt-2 text-muted extra-small">
                                    <strong>Variables disponibles:</strong> {name}, {lastname}, {docs}, {concept}, {amount}, {date}
                                </div>
                            </div>
                            
                            <div class="alert alert-info border-0 py-2">
                                <i class="ph ph-info me-2"></i> El texto entre llaves { } se reemplazará automáticamente con los datos del alumno o el pago.
                            </div>

                            <div class="d-flex justify-content-end gap-2 mt-4">
                                <button class="btn btn-light px-4" @click="resetTemplate">Descartar</button>
                                <button class="btn btn-primary px-4" @click="saveTemplate" :disabled="saving">
                                    <i v-if="saving" class="ph ph-spinner-gap animate-spin me-2"></i>
                                    Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </div>
                    <div v-else class="card border-0 shadow-sm p-5 text-center text-muted bg-light">
                        <i class="ph ph-cursor-click fs-1 mb-2"></i>
                        <p>Selecciona una plantilla para comenzar a editar.</p>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            templates: [],
            selectedTemplate: null,
            editData: {
                subject: '',
                body: ''
            },
            loading: true,
            saving: false
        };
    },
    mounted() {
        this.fetchTemplates();
    },
    methods: {
        async fetchTemplates() {
            this.loading = true;
            try {
                const response = await fetch(window.API_BASE + '/api/config/notifications');
                const result = await response.json();
                if (result.status === 'success') {
                    this.templates = result.data;
                }
            } catch (err) {
                console.error(err);
            } finally {
                this.loading = false;
            }
        },
        selectTemplate(t) {
            this.selectedTemplate = t;
            this.editData = {
                subject: t.subject,
                body: t.body
            };
        },
        resetTemplate() {
            if (this.selectedTemplate) {
                this.editData = {
                    subject: this.selectedTemplate.subject,
                    body: this.selectedTemplate.body
                };
            }
        },
        async saveTemplate() {
            this.saving = true;
            try {
                const response = await fetch(window.API_BASE + `/api/config/notifications/${this.selectedTemplate.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(this.editData)
                });
                const result = await response.json();
                if (result.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Guardado!',
                        text: 'La plantilla se actualizó correctamente.',
                        timer: 2000,
                        showConfirmButton: false
                    });
                    await this.fetchTemplates();
                    // Refrescar el seleccionado
                    const updated = this.templates.find(t => t.id === this.selectedTemplate.id);
                    if (updated) this.selectedTemplate = updated;
                }
            } catch (err) {
                Swal.fire('Error', 'No se pudo guardar la plantilla.', 'error');
            } finally {
                this.saving = false;
            }
        }
    }
};
