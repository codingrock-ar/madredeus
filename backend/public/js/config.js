// MadreDeus Base Configuration (Repository)
// Detectar si estamos en un subdirectorio (ej: /madredeus/)
const pathSegments = window.location.pathname.split('/');
// Si la primera parte del path no es vacía y no es index.html, asumimos que es el subdirectorio del sistema
const baseSubPath = (pathSegments[1] && pathSegments[1] !== 'index.html') ? '/' + pathSegments[1] : '';
window.API_BASE = window.location.origin + baseSubPath;
console.log("API_BASE detectada:", window.API_BASE);