// src/utils/notifications.js

/**
 * Muestra una notificación temporal en la pantalla.
 * @param {string} message - El mensaje a mostrar.
 * @param {'success' | 'error'} type - El tipo de notificación (determina el color y el ícono).
 */
export function showNotification(message, type) {
  const container = document.getElementById('notification-container');
  if (!container) {
    console.error('No se encontró el contenedor de notificaciones.');
    return;
  }

  // Creamos el elemento de la notificación
  const notification = document.createElement('div');
  notification.className = `
    p-4 rounded-lg shadow-xl mb-4 transition-all duration-300 transform
    flex items-center space-x-3 text-white
    ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
    translate-x-full opacity-0
  `;
  
  // Determinamos el ícono basado en el tipo de notificación
  const icon = type === 'success' 
    ? '<i class="fas fa-check-circle"></i>' 
    : '<i class="fas fa-times-circle"></i>';

  notification.innerHTML = `
    <span class="text-xl">${icon}</span>
    <p>${message}</p>
  `;

  // Añadimos la notificación al contenedor
  container.appendChild(notification);

  // Animamos la entrada de la notificación
  setTimeout(() => {
    notification.classList.remove('translate-x-full', 'opacity-0');
    notification.classList.add('translate-x-0', 'opacity-100');
  }, 100);

  // Eliminamos la notificación después de 5 segundos
  setTimeout(() => {
    notification.classList.remove('translate-x-0', 'opacity-100');
    notification.classList.add('translate-x-full', 'opacity-0');
    // Eliminamos el elemento del DOM después de la transición
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}
