export const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export const getStatusColor = (status) => {
  const colors = { planning: '#9CA3AF', 'in-progress': '#3B82F6', completed: '#10B981', 'on-hold': '#F59E0B', todo: '#9CA3AF', review: '#F59E0B', done: '#10B981' };
  return colors[status] || '#9CA3AF';
};

export const getPriorityColor = (priority) => {
  const colors = { low: '#10B981', medium: '#F59E0B', high: '#EF4444' };
  return colors[priority] || '#9CA3AF';
};