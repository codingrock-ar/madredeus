export default {
    template: `
        <div class="container-fluid py-4">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="h4 mb-0"><i class="ph ph-upload-simple me-2"></i>Importar Pagos Masivos</h2>
                <button class="btn btn-outline-secondary btn-sm" @click="$router.push('/payments')">
                    <i class="ph ph-arrow-left me-1"></i>Volver a Pagos
                </button>
            </div>

            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <!-- Paso 1: Subir Archivo -->
                    <div v-if="step === 1" class="text-center py-5 fade-in">
                        <div class="mb-4">
                            <i class="ph ph-file-xls text-success" style="font-size: 4rem;"></i>
                        </div>
                        <h5 class="mb-3">Selecciona o arrastra el archivo aquí</h5>
                        <p class="text-muted small mb-4">Formatos soportados: .xlsx, .csv</p>
                        
                        <input type="file" ref="fileInput" class="d-none" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" @change="handleFileSelected">
                        <button class="btn btn-primary px-4" @click="$refs.fileInput.click()">
                            Elegir Archivo
                        </button>
                        
                        <div class="mt-3 text-muted small" v-if="selectedFile">
                            Archivo seleccionado: <strong>{{ selectedFile.name }}</strong>
                            <button class="btn btn-link btn-sm text-danger" @click="selectedFile = null; $refs.fileInput.value = ''">Quitar</button>
                            <div class="mt-3">
                                <button class="btn btn-success" @click="uploadAndExtractHeaders" :disabled="loading">
                                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                    Siguiente: Mapear Columnas
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Paso 2: Mapear Columnas -->
                    <div v-else-if="step === 2" class="fade-in">
                        <h5 class="mb-4 text-primary"><i class="ph ph-columns me-2"></i>Paso 2: Mapear Columnas</h5>
                        <p class="text-muted small">Selecciona qué columna del archivo corresponde a cada dato requerido por el sistema.</p>
                        
                        <div class="row g-4 mb-4">
                            <div class="col-md-6" v-for="(field, key) in requiredFields" :key="key">
                                <div class="card bg-light border-0 p-3 h-100">
                                    <label class="form-label fw-bold mb-1">{{ field.label }} <span v-if="field.required" class="text-danger">*</span></label>
                                    <p class="extra-small text-muted mb-2">{{ field.description }}</p>
                                    <select class="form-select" v-model="mapping[key]">
                                        <option value="">-- Ignorar / No mapear --</option>
                                        <option v-for="(header, index) in fileHeaders" :key="index" :value="index">
                                            Columna {{ getColumnLetter(index) }}: {{ header || '(Sin Nombre)' }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="alert alert-info border-0 small">
                            <i class="ph ph-info me-2"></i>Se procesarán <strong>{{ fileDataCount }}</strong> filas detectadas en el archivo.
                        </div>

                        <div class="d-flex justify-content-between mt-4">
                            <button class="btn btn-light border" @click="step = 1">Atrás</button>
                            <button class="btn btn-success px-4" @click="processImport" :disabled="loading || !isValidMapping">
                                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                Iniciar Importación
                            </button>
                        </div>
                    </div>

                    <!-- Paso 3: Resultados -->
                    <div v-else-if="step === 3" class="fade-in">
                        <div class="text-center mb-4">
                            <div class="d-inline-flex align-items-center justify-content-center bg-soft-success text-success rounded-circle mb-3" style="width: 64px; height: 64px;">
                                <i class="ph ph-check-circle" style="font-size: 32px;"></i>
                            </div>
                            <h5 class="mb-1">Importación Finalizada</h5>
                            <p class="text-muted">Se ha completado el proceso de importación masiva.</p>
                        </div>

                        <div class="row mb-4">
                            <div class="col-md-4">
                                <div class="card border-0 bg-light p-3 text-center h-100">
                                    <div class="h2 mb-0 text-dark">{{ results.total }}</div>
                                    <div class="small text-muted text-uppercase fw-bold">Total Filas</div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card border-0 bg-soft-success p-3 text-center h-100">
                                    <div class="h2 mb-0 text-success">{{ results.success }}</div>
                                    <div class="small text-success text-uppercase fw-bold">Importados con Éxito</div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card border-0 bg-soft-danger p-3 text-center h-100">
                                    <div class="h2 mb-0 text-danger">{{ results.errors }}</div>
                                    <div class="small text-danger text-uppercase fw-bold">Errores</div>
                                </div>
                            </div>
                        </div>

                        <div v-if="results.errorList && results.errorList.length > 0" class="mt-4">
                            <h6 class="text-danger mb-3"><i class="ph ph-warning-circle me-1"></i>Detalle de Errores</h6>
                            <div class="table-responsive">
                                <table class="table table-sm table-bordered">
                                    <thead class="bg-light">
                                        <tr>
                                            <th>Fila</th>
                                            <th>DNI</th>
                                            <th>Error</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(err, idx) in results.errorList" :key="idx">
                                            <td>{{ err.row }}</td>
                                            <td>{{ err.dni || '-' }}</td>
                                            <td class="text-danger">{{ err.message }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div class="text-center mt-5">
                            <button class="btn btn-primary" @click="resetForm">Realizar otra importación</button>
                            <button class="btn btn-light ms-2" @click="$router.push('/payments')">Ir a Historial</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            step: 1,
            loading: false,
            selectedFile: null,
            uploadedFilePath: null,
            fileHeaders: [],
            fileDataCount: 0,
            requiredFields: {
                dni: { label: 'DNI del Alumno', description: 'Para identificar al alumno (Columna F en la imagen)', required: true },
                amount: { label: 'Monto Cobrado', description: 'Monto abonado (Columna M en la imagen)', required: true },
                payment_date: { label: 'Fecha de Pago', description: 'Ej: 19/5/2026 (Columna A en la imagen)', required: true },
                concept: { label: 'Concepto / Período', description: 'Ej: Mayo, Matricula (Columna N en la imagen)', required: false },
                payment_method: { label: 'Método de Pago', description: 'Ej: mercado Pago, Galicia (Opcional)', required: false }
            },
            mapping: {
                dni: '',
                amount: '',
                payment_date: '',
                concept: '',
                payment_method: ''
            },
            results: {
                total: 0,
                success: 0,
                errors: 0,
                errorList: []
            }
        }
    },
    computed: {
        isValidMapping() {
            // Validar que los campos requeridos estén mapeados
            for (const key in this.requiredFields) {
                if (this.requiredFields[key].required && this.mapping[key] === '') {
                    return false;
                }
            }
            return true;
        }
    },
    methods: {
        handleFileSelected(event) {
            const file = event.target.files[0];
            if (file) {
                this.selectedFile = file;
            }
        },
        getColumnLetter(index) {
            let temp = index;
            let letter = '';
            while (temp >= 0) {
                letter = String.fromCharCode(65 + (temp % 26)) + letter;
                temp = Math.floor(temp / 26) - 1;
            }
            return letter;
        },
        async uploadAndExtractHeaders() {
            if (!this.selectedFile) return;
            this.loading = true;
            
            const formData = new FormData();
            formData.append('file', this.selectedFile);

            try {
                const response = await fetch(window.API_BASE + '/api/payments/import/headers', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    this.fileHeaders = result.data.headers;
                    this.fileDataCount = result.data.count;
                    this.uploadedFilePath = result.data.filepath; // Guardamos el path temporal
                    this.step = 2; // Pasar al mapeo
                    
                    // Auto-mapear si es posible (básico)
                    this.autoMapHeaders();
                } else {
                    Swal.fire('Error', result.message || 'No se pudo leer el archivo', 'error');
                }
            } catch (error) {
                console.error("Error al subir archivo:", error);
                Swal.fire('Error', 'Ocurrió un error al enviar el archivo al servidor', 'error');
            } finally {
                this.loading = false;
            }
        },
        autoMapHeaders() {
            // Intentar mapear basado en la descripción de la imagen del usuario
            // Si el archivo tiene suficientes columnas (al menos 14 para llegar a la N)
            if (this.fileHeaders.length >= 14) {
                // A = 0, B = 1, F = 5, M = 12, N = 13
                if (this.mapping.dni === '') this.mapping.dni = 5; // Columna F
                if (this.mapping.amount === '') this.mapping.amount = 12; // Columna M
                if (this.mapping.payment_date === '') this.mapping.payment_date = 0; // Columna A
                if (this.mapping.concept === '') this.mapping.concept = 13; // Columna N
                if (this.mapping.payment_method === '') this.mapping.payment_method = 3; // Columna D (mercado Pago etc)
            }
        },
        async processImport() {
            this.loading = true;
            try {
                const response = await fetch(window.API_BASE + '/api/payments/import/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filepath: this.uploadedFilePath,
                        mapping: this.mapping
                    })
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    this.results = result.data;
                    this.step = 3; // Mostrar resultados
                } else {
                    Swal.fire('Error', result.message || 'Ocurrió un error en la importación', 'error');
                }
            } catch (error) {
                console.error("Error al procesar importación:", error);
                Swal.fire('Error', 'Error de red o de servidor al procesar los pagos', 'error');
            } finally {
                this.loading = false;
            }
        },
        resetForm() {
            this.step = 1;
            this.selectedFile = null;
            this.uploadedFilePath = null;
            this.fileHeaders = [];
            this.mapping = {
                dni: '',
                amount: '',
                payment_date: '',
                concept: '',
                payment_method: ''
            };
            if(this.$refs.fileInput) {
                this.$refs.fileInput.value = '';
            }
        }
    }
}
