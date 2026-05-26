/**
 * RoleBadge — Displays a user role as a color-coded pill.
 *
 * @param {{ role: 'STUDENT'|'TUTOR'|'ADMIN', className?: string }} props
 */

const roleConfig = {
  STUDENT: { classes: 'bg-accent-blue-muted text-accent-blue', label: 'Student' },
  TUTOR:   { classes: 'bg-success-muted text-brand',           label: 'Tutor' },
  ADMIN:   { classes: 'bg-accent-purple-muted text-accent-purple', label: 'Admin' },
};

export default function RoleBadge({ role, className = '' }) {
  const config = roleConfig[role] ?? roleConfig.STUDENT;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${config.classes} ${className}`}
    >
      {config.label}
    </span>
  );
}
