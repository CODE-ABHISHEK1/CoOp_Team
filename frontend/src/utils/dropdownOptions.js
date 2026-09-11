import { Circle, Pending, CheckCircle, PauseCircle, ArrowDownward, Remove, ArrowUpward, NotificationsNone, MarkEmailUnread, AlternateEmail } from '@mui/icons-material';

export const STATUS_OPTIONS = [
  { value: 'planning', label: 'Planning', color: '#9CA3AF', icon: <Circle sx={{ fontSize: 18 }} /> },
  { value: 'in-progress', label: 'In Progress', color: '#3B82F6', icon: <Pending sx={{ fontSize: 18 }} /> },
  { value: 'review', label: 'Review', color: '#F59E0B', icon: <PauseCircle sx={{ fontSize: 18 }} /> },
  { value: 'completed', label: 'Completed', color: '#10B981', icon: <CheckCircle sx={{ fontSize: 18 }} /> },
  { value: 'on-hold', label: 'On Hold', color: '#EF4444', icon: <PauseCircle sx={{ fontSize: 18 }} /> },
];

export const TASK_STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do', color: '#9CA3AF', icon: <Circle sx={{ fontSize: 18 }} /> },
  { value: 'in-progress', label: 'In Progress', color: '#3B82F6', icon: <Pending sx={{ fontSize: 18 }} /> },
  { value: 'review', label: 'Review', color: '#F59E0B', icon: <PauseCircle sx={{ fontSize: 18 }} /> },
  { value: 'done', label: 'Done', color: '#10B981', icon: <CheckCircle sx={{ fontSize: 18 }} /> },
];

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low', color: '#10B981', icon: <ArrowDownward sx={{ fontSize: 18 }} /> },
  { value: 'medium', label: 'Medium', color: '#F59E0B', icon: <Remove sx={{ fontSize: 18 }} /> },
  { value: 'high', label: 'High', color: '#EF4444', icon: <ArrowUpward sx={{ fontSize: 18 }} /> },
];

export const NOTIFICATION_FILTER_OPTIONS = [
  { value: 'all', label: 'All Notifications', icon: <NotificationsNone sx={{ fontSize: 18 }} /> },
  { value: 'unread', label: 'Unread Only', icon: <MarkEmailUnread sx={{ fontSize: 18 }} /> },
  { value: 'mentions', label: 'Mentions', icon: <AlternateEmail sx={{ fontSize: 18 }} /> },
];