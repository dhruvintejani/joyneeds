/** Validation for UI preview only. No credentials are submitted or persisted. */
export type AuthMode = "sign-in" | "sign-up";
export type PreviewFields = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  accepted: boolean;
};
export type PreviewErrors = Partial<Record<keyof PreviewFields, string>>;
export const emptyFields: PreviewFields = { fullName: "", email: "", password: "", confirmPassword: "", accepted: false };
export function passwordCriteria(password: string) {
  return {
    length: password.length >= 8 && password.length <= 72,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^A-Za-z0-9\s]/.test(password),
  };
}
export function validatePreview(values: PreviewFields, mode: AuthMode): PreviewErrors {
  const errors: PreviewErrors = {};
  const email = values.email.trim();
  if (!email) errors.email = "Email address is required.";
  else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Enter a valid email address.";
  if (!values.password) errors.password = "Password is required.";
  else if (mode === "sign-in") {
    if (values.password.length > 72) errors.password = "Password is too long.";
  } else if (!Object.values(passwordCriteria(values.password)).every(Boolean)) {
    errors.password = "Use 8–72 characters with uppercase, lowercase, a number and a symbol.";
  }
  if (mode === "sign-up") {
    const name = values.fullName.trim();
    if (!name) errors.fullName = "Full name is required.";
    else if (name.length < 2 || name.length > 60) errors.fullName = "Name must be 2–60 characters.";
    if (!values.confirmPassword) errors.confirmPassword = "Confirm your password.";
    else if (values.confirmPassword !== values.password) errors.confirmPassword = "Passwords do not match.";
    if (!values.accepted) errors.accepted = "Accept the terms and privacy policy.";
  }
  return errors;
}
