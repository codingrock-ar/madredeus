export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4 mb-4 bg-light border">
            <h6 class="fw-bold mb-3 text-uppercase small text-muted" style="letter-spacing: 1px;">Filtros de Búsqueda</h6>
            <div class="row g-3 align-items-end">
                <!-- Fila 1: Legajo -->
                <div class="col-md-3">
                    <label class="form-label small fw-bold">Nro de Legajo</label>
                    <input type="text" class="form-control form-control-sm" v-model="filters.legajo" placeholder="Ej: 1234">
                </div>
                
                <div class="col-md-9 text-end">
                    <button class="btn btn-light btn-sm px-4 me-2" @click="resetFilters" :disabled="loading">
                        <i class="ph ph-arrow-counter-clockwise me-1"></i> Limpiar
                    </button>
                    <button class="btn btn-primary btn-sm px-4 me-2" @click="fetchReport" :disabled="loading">
                        <i class="ph ph-magnifying-glass me-1" v-if="!loading"></i>
                        <span class="spinner-border spinner-border-sm me-1" v-else></span>
                        Buscar
                    </button>
                    <button class="btn btn-success btn-sm px-4" @click="exportExcel" :disabled="loading || !students.length">
                        <i class="ph ph-file-xls me-1"></i> Exportar ({{ students.length }})
                    </button>
                </div>

                <!-- Fila 2: Otros Filtros -->
                <div class="col-md-3">
                    <label class="form-label small fw-bold">Carrera</label>
                    <select class="form-select form-select-sm" v-model="filters.career">
                        <option value="">Todos</option>
                        <option v-for="c in careers" :key="c.id" :value="c.title">{{ c.title }}</option>
                    </select>
                </div>
                <div class="col-md-1">
                    <label class="form-label small fw-bold">Periodo</label>
                    <select class="form-select form-select-sm" v-model="filters.periodo">
                        <option value="">Todos</option>
                        <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
                    </select>
                </div>
                <div class="col-md-1">
                    <label class="form-label small fw-bold">Turno</label>
                    <select class="form-select form-select-sm" v-model="filters.turno">
                        <option value="">Todos</option>
                        <option v-for="s in shifts" :key="s" :value="s">{{ s }}</option>
                    </select>
                </div>
                <div class="col-md-1">
                    <label class="form-label small fw-bold">Comision</label>
                    <select class="form-select form-select-sm" v-model="filters.comision">
                        <option value="">Todos</option>
                        <option v-for="c in commissions" :key="c" :value="c">{{ c }}</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Ciclo Lectivo</label>
                    <select class="form-select form-select-sm" v-model="filters.ciclo">
                        <option value="">Todos</option>
                        <option v-for="y in cycles" :key="y.id" :value="y.name">{{ y.name }}</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <label class="form-label small fw-bold">Estado</label>
                    <select class="form-select form-select-sm" v-model="filters.estado">
                        <option value="">Todos</option>
                        <option value="En Curso">En Curso</option>
                        <option value="Abandono">Abandono</option>
                        <option value="Egresado">Egresado</option>
                        <option value="Finalizó Cursada">Finalizó Cursada</option>
                    </select>
                </div>
                
                <div class="col-md-auto d-flex align-items-center mb-1">
                    <div class="form-check form-check-inline me-3">
                        <input class="form-check-input" type="checkbox" v-model="filters.deudores" id="checkDeudores">
                        <label class="form-check-label small fw-bold" for="checkDeudores">Deudores</label>
                    </div>
                    <div class="form-check form-check-inline me-3">
                        <input class="form-check-input" type="checkbox" v-model="filters.becados" id="checkBecados">
                        <label class="form-check-label small fw-bold" for="checkBecados">Becados</label>
                    </div>
                </div>

                <div class="col-md-2">
                    <label class="form-label small fw-bold">Tipo Beca</label>
                    <select class="form-select form-select-sm" v-model="filters.scholarship_id" :disabled="!filters.becados">
                        <option value="">Todas</option>
                        <option v-for="s in scholarships" :key="s.id" :value="s.id">{{ s.name }}</option>
                    </select>
                </div>
            </div>
            
            <div class="mt-3 small text-muted">
                Cantidad de alumnos: <span class="fw-bold">{{ students.length }}</span>
            </div>
        </div>

        <div class="card-modern overflow-hidden">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light text-uppercase fs-7">
                        <tr>
                            <th class="ps-4">Legajo</th>
                            <th>Alumno</th>
                            <th>DNI</th>
                            <th>Carrera</th>
                            <th>Turno / Com.</th>
                            <th>Periodo</th>
                            <th>Estado</th>
                            <th>Beca</th>
                            <th class="text-center pe-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="student in students" :key="student.id">
                            <td class="ps-4 fw-bold">#{{ student.id }}</td>
                            <td>
                                <router-link :to="'/student/detail/' + student.id" class="text-decoration-none text-dark fw-bold">
                                    {{ student.lastname }}, {{ student.name }}
                                </router-link>
                            </td>
                            <td>{{ student.dni }}</td>
                            <td><span class="small text-muted">{{ student.career }}</span></td>
                            <td>{{ student.shift }} / {{ student.commission }}</td>
                            <td>{{ student.academic_cycle }}</td>
                            <td>
                                <span class="badge" :class="getStatusClass(student.status)">{{ student.status }}</span>
                            </td>
                            <td>
                                <span v-if="student.scholarship_name" class="badge bg-soft-info text-info border">
                                    {{ student.scholarship_name }}
                                </span>
                                <span v-else class="text-muted small">-</span>
                            </td>
                            <td class="text-center pe-4">
                                <button class="btn btn-ghost-primary btn-icon btn-sm rounded-circle" @click="editStudent(student)" title="Editar estado/beca">
                                    <i class="ph ph-note-pencil fs-5"></i>
                                </button>
                            </td>
                        </tr>
                        <tr v-if="!students.length && !loading">
                            <td colspan="8" class="text-center py-5 text-muted">
                                <i class="ph ph-mask-sad fs-2 d-block mb-2"></i>
                                No se encontraron alumnos con los criterios seleccionados.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            students: [],
            careers: [],
            shifts: ['Mañana', 'Tarde', 'Noche'],
            commissions: ['A', 'B', 'C', 'D'],
            cycles: [],
            scholarships: [],
            filters: {
                legajo: '',
                career: '',
                periodo: '',
                turno: '',
                comision: '',
                ciclo: '2024',
                estado: '',
                deudores: false,
                becados: false,
                scholarship_id: ''
            },
            loading: false
        }
    },
    async mounted() {
        await this.fetchMetadata();
    },
    methods: {
        async fetchMetadata() {
            try {
                const [careersRes, cyclesRes, scholarshipsRes] = await Promise.all([
                    fetch('/api/careers'),
                    fetch('/api/config/cycles'),
                    fetch('/api/config/scholarships')
                ]);
                
                const careers = await careersRes.json();
                if (careers.status === 'success') this.careers = careers.data;
                
                const cycles = await cyclesRes.json();
                if (cycles.status === 'success') this.cycles = cycles.data;

                const scholarships = await scholarshipsRes.json();
                if (scholarships.status === 'success') this.scholarships = scholarships.data;

            } catch (error) {
                console.error("Error fetching metadata:", error);
            }
        },
        resetFilters() {
            this.filters = {
                legajo: '',
                career: '',
                periodo: '',
                turno: '',
                comision: '',
                ciclo: '2024',
                estado: '',
                deudores: false,
                becados: false,
                scholarship_id: ''
            };
            this.students = [];
            Swal.fire({
                icon: 'info',
                title: 'Filtros reiniciados',
                toast: true,
                position: 'top-end',
                timer: 2000,
                showConfirmButton: false
            });
        },
        async fetchReport() {
            this.loading = true;
            console.log("Fetching student report with filters:", this.filters);
            try {
                // Filter out empty values to avoid strict matching on empty strings
                const cleanFilters = {};
                Object.keys(this.filters).forEach(key => {
                    if (this.filters[key] !== '' && this.filters[key] !== null) {
                        cleanFilters[key] = this.filters[key];
                    }
                });

                const qs = new URLSearchParams(cleanFilters).toString();
                const response = await fetch('/api/students/report?' + qs);
                const result = await response.json();
                
                if (result.status === 'success') {
                    this.students = result.data;
                    console.log(`Results found: ${this.students.length}`);
                    if (this.students.length > 0) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Búsqueda completada',
                            text: `Se encontraron ${this.students.length} alumnos.`,
                            timer: 2000,
                            showConfirmButton: false,
                            toast: true,
                            position: 'top-end'
                        });
                    } else {
                        Swal.fire({
                            icon: 'info',
                            title: 'Sin resultados',
                            text: 'No se encontraron alumnos con los filtros seleccionados.',
                            toast: true,
                            position: 'top-end',
                            timer: 3000
                        });
                    }
                } else {
                    console.error("API returned error:", result.error);
                    alert("Error al obtener el reporte: " + (result.error || "Error desconocido"));
                }
            } catch (error) {
                console.error("Error fetching report:", error);
                alert("Error de conexión al servidor");
            } finally {
                this.loading = false;
            }
        },
        exportExcel() {
            const qs = new URLSearchParams(this.filters).toString();
            window.location.href = '/api/students/export?' + qs;
        },
        async editStudent(student) {
            const scholarshipOptions = this.scholarships.map(s => `<option value="${s.id}" ${student.scholarship_id == s.id ? 'selected' : ''}>${s.name}</option>`).join('');
            
            const { value: formValues } = await Swal.fire({
                title: `Editar Alumno #${student.id}`,
                html: `
                    <div class="text-start px-3">
                        <label class="form-label small fw-bold mt-2">Estado</label>
                        <select id="swal-status" class="form-select form-select-sm mb-3">
                            <option value="En Curso" ${student.status === 'En Curso' ? 'selected' : ''}>En Curso</option>
                            <option value="Abandono" ${student.status === 'Abandono' ? 'selected' : ''}>Abandono</option>
                            <option value="Egresado" ${student.status === 'Egresado' ? 'selected' : ''}>Egresado</option>
                            <option value="Finalizó Cursada" ${student.status === 'Finalizó Cursada' ? 'selected' : ''}>Finalizó Cursada</option>
                        </select>
                        
                        <label class="form-label small fw-bold">Ciclo Lectivo (Año)</label>
                        <input id="swal-year" type="text" class="form-control form-control-sm mb-3" value="${student.academic_year || ''}">
                        
                        <label class="form-label small fw-bold">Beca</label>
                        <select id="swal-scholarship" class="form-select form-select-sm">
                            <option value="">Sin Beca</option>
                            ${scholarshipOptions}
                        </select>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonText: 'Guardar cambios',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return {
                        status: document.getElementById('swal-status').value,
                        academic_year: document.getElementById('swal-year').value,
                        scholarship_id: document.getElementById('swal-scholarship').value || null
                    }
                }
            });

            if (formValues) {
                this.saveStudentChanges(student, formValues);
            }
        },
        async saveStudentChanges(student, updatedData) {
            this.loading = true;
            try {
                // Preparamos el objeto completo mezclando el actual con los cambios
                // El backend PUT /api/students/{id} suele esperar el objeto completo o parcial dependiente de la implementación
                // Según mapParams en el repositorio, se mapean todos los campos.
                
                const fullData = { ...student, ...updatedData };
                
                const response = await fetch(`/api/students/${student.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fullData)
                });
                
                const result = await response.json();
                if (result.status === 'success') {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Actualizado!',
                        timer: 1500,
                        showConfirmButton: false,
                        toast: true,
                        position: 'top-end'
                    });
                    // Actualizar localmente la fila para no recargar todo si no es necesario
                    Object.assign(student, updatedData);
                    // Pero necesitamos el nombre de la beca si cambió
                    if (updatedData.scholarship_id) {
                        const s = this.scholarships.find(x => x.id == updatedData.scholarship_id);
                        student.scholarship_name = s ? s.name : '';
                    } else {
                        student.scholarship_name = '';
                    }
                } else {
                    Swal.fire('Error', result.error || 'No se pudo actualizar', 'error');
                }
            } catch (error) {
                console.error("Error updating student:", error);
                Swal.fire('Error', 'Error de conexión', 'error');
            } finally {
                this.loading = false;
            }
        },
        getStatusClass(status) {
            switch(status) {
                case 'En Curso': return 'bg-soft-success text-success';
                case 'Abandono': return 'bg-soft-danger text-danger';
                case 'Egresado': return 'bg-soft-info text-info';
                default: return 'bg-soft-warning text-warning';
            }
        }
    }
}
