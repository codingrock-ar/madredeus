export default {
    template: `
    <div class="fade-in">
        <div class="card-modern p-5 text-center">
            <h5 v-if="lastCollectionDate" class="text-danger fw-bold mb-4">COBRANZA EJECUTADA EL {{ formatDate(lastCollectionDate) }}</h5>
            <h2>Bienvenido al Sistema Madre Deus</h2>
            <p class="text-muted mt-3">Utilice el menú lateral para acceder a las diferentes secciones.</p>
        </div>
    </div>
    `,
    data() {
        return {
            lastCollectionDate: null
        }
    },
    async mounted() {
        try {
            const response = await fetch(window.API_BASE + '/api/payments/last-execution');
            const result = await response.json();
            if (result.status === 'success' && result.date) {
                this.lastCollectionDate = result.date;
            }
        } catch (e) {
            console.error("Error al obtener última cobranza:", e);
        }
    },
    methods: {
        formatDate(dateStr) {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}`;
        }
    }
}
