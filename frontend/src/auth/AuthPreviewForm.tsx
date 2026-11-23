import { useId, useState, type FormEvent } from "react";
import { ArrowRight, Check, Eye, EyeOff, Info, LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import {
  emptyFields, passwordCriteria, validatePreview,
  type AuthMode, type PreviewFields,
} from "./authPreviewValidation";

/** Fully interactive UI preview; never sends, saves or authenticates credentials. */
export default function AuthPreviewForm({ mode }: { mode: AuthMode }) {
  const signup = mode === "sign-up";
  const id = useId().replace(/:/g, "");
  const [values, setValues] = useState<PreviewFields>({ ...emptyFields });
  const [touched, setTouched] = useState<Partial<Record<keyof PreviewFields, boolean>>>({});
  const [tried, setTried] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [notice, setNotice] = useState<"validated" | "google" | "forgot" | null>(null);
  const errors = validatePreview(values, mode);
  const criteria = passwordCriteria(values.password);
  const strength = Object.values(criteria).filter(Boolean).length;

  const update = <K extends keyof PreviewFields>(key: K, value: PreviewFields[K]) => {
    setValues(old => ({ ...old, [key]: value }));
    setNotice(null);
  };
  const blur = (key: keyof PreviewFields) => setTouched(old => ({ ...old, [key]: true }));
  const invalid = (key: keyof PreviewFields) => Boolean((tried || touched[key]) && errors[key]);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTried(true);
    setNotice(null);
    if (Object.keys(validatePreview(values, mode)).length) return;
    // Clear sensitive input after client-only validation.
    setValues(old => ({ ...old, password: "", confirmPassword: "" }));
    setNotice("validated");
  };

  return <div className="jn-preview-auth" aria-label={signup ? "Signup form preview" : "Sign in form preview"}>
    <p className="jn-preview-state"><Info size={16} aria-hidden="true" /><span>Interactive form preview. Secure account access is being configured.</span></p>
    <button className="jn-preview-google" type="button" onClick={() => setNotice("google")}>
      <span className="jn-preview-google-g" aria-hidden="true">G</span> Continue with Google
    </button>
    <div className="jn-preview-separator"><span>or continue with email</span></div>

    <form onSubmit={submit} noValidate className="jn-preview-form">
      {signup && <div className="jn-preview-field">
        <label htmlFor={id+"-name"}>Full name <b>*</b></label>
        <div className={"jn-preview-input"+(invalid("fullName") ? " invalid" : "")}>
          <UserRound size={18} aria-hidden="true" />
          <input id={id+"-name"} type="text" placeholder="Your full name" autoComplete="name" maxLength={61} value={values.fullName}
            onChange={e => update("fullName", e.target.value)} onBlur={() => blur("fullName")}
            aria-invalid={invalid("fullName")} aria-describedby={invalid("fullName") ? id+"-name-error" : undefined} />
        </div>
        {invalid("fullName") && <p id={id+"-name-error"} className="jn-preview-error" role="alert">{errors.fullName}</p>}
      </div>}
      <div className="jn-preview-field">
        <label htmlFor={id+"-email"}>Email address <b>*</b></label>
        <div className={"jn-preview-input"+(invalid("email") ? " invalid" : "")}>
          <Mail size={18} aria-hidden="true"/>
          <input id={id+"-email"} type="email" inputMode="email" autoComplete="email" maxLength={254}
            placeholder="you@example.com" value={values.email}
            onChange={e => update("email", e.target.value)} onBlur={() => blur("email")}
            aria-invalid={invalid("email")} aria-describedby={invalid("email") ? id+"-email-error" : undefined}/>
        </div>
        {invalid("email") && <p id={id+"-email-error"} className="jn-preview-error" role="alert">{errors.email}</p>}
      </div>
      <div className="jn-preview-field">
        <div className="jn-preview-label-row">
          <label htmlFor={id+"-password"}>Password <b>*</b></label>
          {!signup && <button type="button" className="jn-preview-forgot" onClick={() => setNotice("forgot")}>Forgot password?</button>}
        </div>
        <div className={"jn-preview-input"+(invalid("password") ? " invalid" : "")}>
          <LockKeyhole size={18} aria-hidden="true"/>
          <input id={id+"-password"} type={passwordVisible ? "text" : "password"}
            placeholder={signup ? "Create a strong password" : "Enter your password"}
            autoComplete={signup ? "new-password" : "current-password"} maxLength={73}
            value={values.password} onChange={e => update("password", e.target.value)} onBlur={() => blur("password")}
            aria-invalid={invalid("password")}
            aria-describedby={invalid("password") ? id+"-password-error" : signup ? id+"-strength" : undefined}/>
          <button className="jn-preview-eye" type="button" onClick={() => setPasswordVisible(v => !v)}
            aria-label={passwordVisible ? "Hide password" : "Show password"} aria-pressed={passwordVisible}>
            {passwordVisible ? <EyeOff size={18}/> : <Eye size={18}/>}
          </button>
        </div>
        {invalid("password") && <p id={id+"-password-error"} className="jn-preview-error" role="alert">{errors.password}</p>}
        {signup && <div className="jn-preview-strength" id={id+"-strength"}>
          <div className="jn-preview-meter" role="meter" aria-label="Password strength" aria-valuemin={0} aria-valuemax={5} aria-valuenow={strength}>
            {[0,1,2,3,4].map(n => <span key={n} className={n < strength ? "filled" : ""}/>)}
          </div>
          <p>{!values.password ? "Password strength" : strength === 5 ? "Strong password" : "Make your password stronger"}</p>
          <div className="jn-preview-requirements">
            {[
              ["8–72 characters",criteria.length],
              ["Upper & lowercase",criteria.upper && criteria.lower],
              ["One number",criteria.number],
              ["One symbol",criteria.symbol],
            ].map(([label, met]) => <span key={String(label)} className={met ? "met" : ""}><Check size={12}/>{label}</span>)}
          </div>
        </div>}
      </div>
      {signup && <div className="jn-preview-field">
        <label htmlFor={id+"-confirm"}>Confirm password <b>*</b></label>
        <div className={"jn-preview-input"+(invalid("confirmPassword") ? " invalid" : "")}>
          <LockKeyhole size={18} aria-hidden="true"/>
          <input id={id+"-confirm"} type={confirmVisible ? "text" : "password"} autoComplete="new-password"
            placeholder="Enter your password again" maxLength={73} value={values.confirmPassword}
            onChange={e => update("confirmPassword",e.target.value)} onBlur={() => blur("confirmPassword")}
            aria-invalid={invalid("confirmPassword")} aria-describedby={invalid("confirmPassword") ? id+"-confirm-error" : undefined}/>
          <button type="button" className="jn-preview-eye" onClick={() => setConfirmVisible(v => !v)}
            aria-label={confirmVisible ? "Hide confirmation password" : "Show confirmation password"} aria-pressed={confirmVisible}>
            {confirmVisible ? <EyeOff size={18}/> : <Eye size={18}/>}
          </button>
        </div>
        {invalid("confirmPassword") && <p id={id+"-confirm-error"} className="jn-preview-error" role="alert">{errors.confirmPassword}</p>}
      </div>}
      {signup && <div className="jn-preview-terms">
        <label><input type="checkbox" checked={values.accepted} onChange={e => update("accepted",e.target.checked)}
          onBlur={() => blur("accepted")} aria-invalid={invalid("accepted")} />
          <span>I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy-policy">Privacy Policy</Link>.</span>
        </label>
        {invalid("accepted") && <p className="jn-preview-error" role="alert">{errors.accepted}</p>}
      </div>}
      <button className="jn-preview-submit" type="submit">{signup ? "Create account" : "Sign in"}<ArrowRight size={18} aria-hidden="true"/></button>
      {notice && <p className="jn-preview-notice" role="status"><Info size={17} aria-hidden="true"/><span>{
        notice === "validated"
          ? signup ? "Your form passes frontend validation. No account was created or data submitted." : "Your form passes frontend validation. No sign-in occurred."
          : notice === "google" ? "Google sign-in is a preview until Clerk is connected. No login was attempted."
          : "Password reset will be enabled with Clerk. No email was sent."
      }</span></p>}
    </form>
    <p className="jn-preview-privacy"><LockKeyhole size={14} aria-hidden="true"/> Passwords are never sent or stored by this preview.</p>
  </div>;
}
