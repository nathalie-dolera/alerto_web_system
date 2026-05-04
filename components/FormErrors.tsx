"use client";

interface FormErrorsProps {
  errors?: Record<string, string>;
  generalError?: string;
}

export function FormErrors({ errors, generalError }: FormErrorsProps) {
  if (!errors && !generalError) {
    return null;
  }

  return (
    <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 mb-4">
      {generalError && (
        <div className="text-sm text-red-500 mb-3 text-center font-medium">
          {generalError}
        </div>
      )}
      {errors && Object.entries(errors).length > 0 && (
        <div className="space-y-2">
          {Object.entries(errors).map(([field, message]) => (
            <div key={field} className="text-sm text-red-500 flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              <span>{message?.message || message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface FieldErrorProps {
  error?: string;
}

export function FieldError({ error }: FieldErrorProps) {
  if (!error) {
    return null;
  }

  return <p className="text-xs text-red-500 mt-1">{error}</p>;
}

interface SuccessMessageProps {
  message: string;
}

export function SuccessMessage({ message }: SuccessMessageProps) {
  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 mb-4">
      <p className="text-sm text-emerald-500 text-center font-medium">{message}</p>
    </div>
  );
}
