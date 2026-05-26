import Button from './Button';

/**
 * FormCard — Surface card that wraps form fields with a title and submit button.
 *
 * @param {string} title
 * @param {React.ReactNode} children — form fields
 * @param {Function} onSubmit
 * @param {string} submitLabel
 * @param {string} className
 */
export default function FormCard({
  title,
  children,
  onSubmit,
  submitLabel = 'Save',
  className = '',
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(e);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-surface border border-border rounded-md p-6 ${className}`}
    >
      {title && (
        <h3 className="text-base font-semibold text-text-primary mb-4">
          {title}
        </h3>
      )}
      <div className="space-y-4">{children}</div>
      <div className="mt-6 flex justify-end">
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
