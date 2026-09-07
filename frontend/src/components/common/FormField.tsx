import { useField } from "formik";
import type { InputHTMLAttributes } from "react";
export default function FormField({
  label,
  name,
  multiline = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  multiline?: boolean;
}) {
  const [field, meta] = useField(name);
  const error = meta.touched && meta.error;
  return (
    <div className="field">
      <label htmlFor={name}>
        {label}
        {props.required && <span aria-hidden="true"> *</span>}
      </label>
      {multiline ? (
        <textarea
          {...field}
          id={name}
          required={props.required}
          maxLength={props.maxLength}
          rows={5}
          aria-invalid={!!error}
          aria-describedby={error ? name + "-error" : undefined}
        />
      ) : (
        <input
          {...field}
          {...props}
          id={name}
          aria-invalid={!!error}
          aria-describedby={error ? name + "-error" : undefined}
        />
      )}
      {error && (
        <p className="field-error" id={name + "-error"} role="alert">
          {meta.error}
        </p>
      )}
    </div>
  );
}
