export const formatARS = (amount) => {
  if (!amount) return 'A convenir';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
};
export const formatDate = (date) => new Date(date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'ahora';
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
  if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} h`;
  if (seconds < 604800) return `hace ${Math.floor(seconds / 86400)} días`;
  return formatDate(date);
};
export const getInitials = (name = '') => name.split(' ').slice(0, 2).map((w) => w?.[0] || '').join('').toUpperCase();
export const nameToColor = (name = '') => {
  const colors = ['#6C47FF', '#FF6B35', '#00C48C', '#0096FF', '#FFAB00', '#FF4D4F'];
  const index = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length;
  return colors[index];
};
