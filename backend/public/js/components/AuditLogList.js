export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-4">
            <!-- FILTROS DE BÚSQUEDA Y SELECCIÓN -->
            <div class="row g-3 mb-4">
                <div class="col-md-5">
                    <label class="form-label small fw-bold text-muted mb-1">Buscar en Descripción</label>
                    <div class="input-group shadow-sm rounded">
                        <span class="input-group-text bg-white border-end-0"><i class="ph ph-magnifying-glass text-muted"></i></span>
                        <input type="text" class="form-control border-start-0 ps-0" 
                               placeholder="Ej: Cobro estudiante, modificación de estado..." 
                               v-model="filters.search" 
                               @input="debounceFetch">
                    </div>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-bold text-muted mb-1">Rango de Fechas</label>
                    <div class="input-group shadow-sm rounded">
                        <input type="date" class="form-control" v-model="filters.fecha_desde" @change="fetchLogs">
                        <span class="input-group-text bg-light border-start-0 border-end-0">a</span>
                        <input type="date" class="form-control" v-model="filters.fecha_hasta" @change="fetchLogs">
                    </div>
                </div>
                <div class="col-md-3 text-end d-flex align-items-end justify-content-end">
                    <button class="btn btn-outline-success shadow-sm w-100" @click="exportToExcel" style="height: 38px;">
                        <i class="ph ph-file-xls me-1"></i> Exportar a Excel
                    </button>
                </div>
            </div>

            <!-- FILTROS DE RELACIÓN Y CATEGORÍAS -->
            <div class="row g-3 mb-4 p-3 bg-light rounded-3 border-dashed">
                <div class="col-md-4">
                    <label class="form-label small fw-bold text-muted mb-1">Operador / Usuario</label>
                    <select class="form-select shadow-sm" v-model="filters.id_usuario" @change="fetchLogs">
                        <option value="-1">Todos los Operadores</option>
                        <option v-for="user in metadata.users" :key="user.IdUsuario" :value="user.IdUsuario">
                            {{ user.NombreCompleto }} ({{ user.Username }})
                        </option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small fw-bold text-muted mb-1">Tipo de Evento</label>
                    <select class="form-select shadow-sm" v-model="filters.id_tipo_evento" @change="fetchLogs">
                        <option value="-1">Todos los Eventos</option>
                        <option v-for="event in metadata.event_types" :key="event.IdEventoBitacora" :value="event.IdEventoBitacora">
                            {{ event.Descripcion }}
                        </option>
                    </select>
                </div>
                <div class="col-md-4 d-flex align-items-end justify-content-end">
                    <button class="btn btn-outline-secondary w-100 shadow-sm" @click="clearFilters" style="height: 38px;">
                        <i class="ph ph-arrow-counter-clockwise me-1"></i> Limpiar Filtros
                    </button>
                </div>
            </div>

            <!-- TABLA DE AUDITORÍA -->
            <div class="table-responsive">
                <table class="table align-middle table-hover">
                    <thead class="table-light">
                        <tr>
                            <th scope="col" width="100">ID</th>
                            <th scope="col" width="180">Fecha</th>
                            <th scope="col" width="160">Evento</th>
                            <th scope="col">Descripción</th>
                            <th scope="col" width="220">Usuario / Operador</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="loading">
                            <td colspan="5" class="text-center py-5">
                                <div class="spinner-border text-primary" role="status"></div>
                                <div class="mt-2 text-muted">Cargando bitácora de auditoría...</div>
                            </td>
                        </tr>
                        <tr v-else-if="logs.length === 0">
                            <td colspan="5" class="text-center py-5 text-muted">
                                No se encontraron registros de auditoría con los filtros seleccionados.
                            </td>
                        </tr>
                        <tr v-else v-for="log in logs" :key="log.IdBitacora" class="hover-row">
                            <td class="text-muted small fw-mono">#{{ log.IdBitacora }}</td>
                            <td class="fw-semibold small text-dark">{{ formatDate(log.Fecha) }}</td>
                            <td>
                                <span class="badge rounded-pill text-uppercase" :class="getEventBadgeClass(log.IdTipoEvento)">
                                    {{ log.TipoEventoDescripcion || 'Evento ' + log.IdTipoEvento }}
                                </span>
                            </td>
                            <td class="text-secondary fs-7">{{ log.Descripcion }}</td>
                            <td>
                                <div class="d-flex align-items-center gap-2">
                                    <div class="avatar-sm bg-light text-secondary rounded-circle d-flex align-items-center justify-content-center fw-bold small" style="width: 28px; height: 28px; font-size: 0.7rem; border: 1px solid rgba(0,0,0,0.05);">
                                        {{ getInitials(log.NombreUsuario || log.Username) }}
                                    </div>
                                    <div>
                                        <div class="fw-bold fs-7" style="line-height: 1.2;">{{ log.NombreUsuario || 'Operador Histórico' }}</div>
                                        <div class="extra-small text-muted" style="font-size: 0.75rem;">@{{ log.Username || 'user_' + log.IdUsuario }}</div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- PAGINADO -->
            <div class="d-flex justify-content-between align-items-center mt-4 border-top pt-3" v-if="meta.total_pages > 0">
                <div class="small text-muted">
                    Mostrando del <strong>{{ (filters.page - 1) * filters.limit + 1 }}</strong> al 
                    <strong>{{ Math.min(filters.page * filters.limit, meta.total) }}</strong> de 
                    <strong>{{ formatNumber(meta.total) }}</strong> registros
                </div>
                <nav>
                    <ul class="pagination pagination-sm mb-0">
                        <li class="page-item" :class="{ disabled: filters.page === 1 }">
                            <a class="page-link shadow-xs" href="#" @click.prevent="goToPage(filters.page - 1)">
                                <i class="ph ph-caret-left"></i> Anterior
                            </a>
                        </li>
                        <li class="page-item" v-for="p in visiblePages" :key="p" :class="{ active: filters.page === p, disabled: p === '...' }">
                            <a class="page-link shadow-xs" href="#" @click.prevent="p !== '...' && goToPage(p)">{{ p }}</a>
                        </li>
                        <li class="page-item" :class="{ disabled: filters.page === meta.total_pages }">
                            <a class="page-link shadow-xs" href="#" @click.prevent="goToPage(filters.page + 1)">
                                Siguiente <i class="ph ph-caret-right"></i>
                            </a>
                        </li>
                    </ul>
                </nav>
            </div>
        </div>
    </div>
    `,
    data() {
        return {
            logs: [],
            loading: true,
            filters: {
                search: '',
                fecha_desde: '',
                fecha_hasta: '',
                id_usuario: '-1',
                id_tipo_evento: '-1',
                page: 1,
                limit: 50
            },
            meta: {
                total: 0,
                page: 1,
                total_pages: 0
            },
            metadata: {
                event_types: [],
                users: []
            },
            debounceTimeout: null
        }
    },
    computed: {
        visiblePages() {
            const pages = [];
            const total = this.meta.total_pages;
            const current = this.meta.page;
            
            if (total <= 7) {
                for (let i = 1; i <= total; i++) pages.push(i);
            } else {
                pages.push(1);
                if (current > 3) pages.push('...');
                
                const start = Math.max(2, current - 1);
                const end = Math.min(total - 1, current + 1);
                
                for (let i = start; i <= end; i++) pages.push(i);
                
                if (current < total - 2) pages.push('...');
                pages.push(total);
            }
            return pages;
        }
    },
    methods: {
        debounceFetch() {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.filters.page = 1;
                this.fetchLogs();
            }, 400);
        },
        goToPage(p) {
            if (p < 1 || p > this.meta.total_pages) return;
            this.filters.page = p;
            this.fetchLogs();
        },
        async fetchLogs() {
            this.loading = true;
            try {
                const token = localStorage.getItem('token');
                const queryParams = {
                    search: this.filters.search,
                    fecha_desde: this.filters.fecha_desde,
                    fecha_hasta: this.filters.fecha_hasta,
                    id_usuario: this.filters.id_usuario,
                    id_tipo_evento: this.filters.id_tipo_evento,
                    page: this.filters.page,
                    limit: this.filters.limit
                };
                
                // Limpiar vacíos o indefinidos antes de serializar
                Object.keys(queryParams).forEach(key => {
                    if (queryParams[key] === null || queryParams[key] === undefined || queryParams[key] === '') {
                        delete queryParams[key];
                    }
                });

                const query = new URLSearchParams(queryParams).toString();
                const response = await fetch(window.API_BASE + '/api/audit-logs?' + query, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.status === 401) return this.$router.push('/login');
                const result = await response.json();

                if (result.status === 'success') {
                    this.logs = result.data;
                    this.meta = result.meta;
                }
            } catch (error) {
                console.error("Error al cargar la bitácora de auditoría:", error);
            } finally {
                this.loading = false;
            }
        },
        async fetchMetadata() {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(window.API_BASE + '/api/audit-logs/filters', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.status === 'success') {
                    this.metadata = result.data;
                }
            } catch (error) {
                console.error("Error al cargar metadatos de filtros:", error);
            }
        },
        clearFilters() {
            this.filters = {
                search: '',
                fecha_desde: '',
                fecha_hasta: '',
                id_usuario: '-1',
                id_tipo_evento: '-1',
                page: 1,
                limit: 50
            };
            this.fetchLogs();
        },
        formatDate(dateStr) {
            if (!dateStr) return '-';
            const parts = dateStr.split(' ');
            if (parts.length < 2) return dateStr;
            const dateParts = parts[0].split('-');
            const timeParts = parts[1].split(':');
            return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]} ${timeParts[0]}:${timeParts[1]}`;
        },
        getInitials(name) {
            if (!name) return 'OP';
            const clean = name.trim().replace(/\s+/g, ' ');
            const parts = clean.split(' ');
            if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
            return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
        },
        getEventBadgeClass(typeId) {
            switch (parseInt(typeId)) {
                case 1: return 'badge-soft-success'; // Alta
                case 2: return 'badge-soft-danger';  // Baja
                case 3: return 'badge-soft-info';    // Modificación
                case 4: return 'badge-soft-primary'; // Inicio Sesión
                case 5: return 'badge-soft-warning'; // Error
                case 6: return 'badge-soft-warning text-dark border border-warning-subtle'; // Cobro
                default: return 'badge-soft-secondary';
            }
        },
        formatNumber(num) {
            return new Intl.NumberFormat('es-AR').format(num);
        },
        exportToExcel() {
            const headers = ['ID', 'Fecha', 'Tipo Evento', 'Descripción', 'Usuario Operador', 'Username'];
            const rows = [headers];
            
            this.logs.forEach(log => {
                rows.push([
                    log.IdBitacora,
                    this.formatDate(log.Fecha),
                    log.TipoEventoDescripcion || `Evento ${log.IdTipoEvento}`,
                    log.Descripcion.replace(/"/g, '""'),
                    log.NombreUsuario || 'Operador Histórico',
                    log.Username || `user_${log.IdUsuario}`
                ]);
            });

            const csvContent = "data:text/csv;charset=utf-8,\ufeff" 
                + rows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `bitacora_auditoria_${new Date().toISOString().slice(0,10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    },
    async mounted() {
        await this.fetchMetadata();
        await this.fetchLogs();
    }
}
