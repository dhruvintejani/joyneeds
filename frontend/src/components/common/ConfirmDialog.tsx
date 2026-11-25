import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AlertTriangle, X } from "lucide-react";
import "./confirm-dialog.css";
type Options = { title: string; message: string; confirmLabel?: string };
type Request = Options & { resolve: (value: boolean) => void };
const Context = createContext<(options: Options) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(Context);
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<Request | null>(null);
  const current = useRef<Request | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const ask = useCallback((options: Options) => new Promise<boolean>(resolve => {
    if (current.current) { resolve(false); return; }
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const next = { ...options, resolve }; current.current = next; setRequest(next);
  }), []);
  const finish = useCallback((value: boolean) => {
    const pending = current.current; if (!pending) return;
    current.current = null;
    if (dialog.current?.open) dialog.current.close();
    setRequest(null); pending.resolve(value);
    trigger.current?.focus(); trigger.current = null;
  }, []);
  useEffect(() => {
    if (!request || !dialog.current) return;
    if (!dialog.current.open) dialog.current.showModal();
    dialog.current.querySelector<HTMLButtonElement>("[data-cancel]")?.focus();
  }, [request]);
  useEffect(() => () => { current.current?.resolve(false); current.current = null; }, []);
  return <Context.Provider value={ask}>{children}
    <dialog ref={dialog} className="jn-confirm-dialog" aria-labelledby="jn-confirm-title" aria-describedby="jn-confirm-description" onCancel={event => { event.preventDefault(); finish(false); }} onClick={event => { if (event.target === event.currentTarget) finish(false); }}>
      {request && <section className="jn-confirm-content">
        <button type="button" className="jn-confirm-close" aria-label="Close confirmation" onClick={() => finish(false)}><X size={20}/></button>
        <span className="jn-confirm-symbol"><AlertTriangle size={25} aria-hidden="true"/></span>
        <h2 id="jn-confirm-title">{request.title}</h2>
        <p id="jn-confirm-description">{request.message}</p>
        <div className="jn-confirm-actions"><button type="button" data-cancel onClick={() => finish(false)}>Cancel</button><button type="button" className="jn-confirm-primary" onClick={() => finish(true)}>{request.confirmLabel || "Confirm"}</button></div>
      </section>}
    </dialog>
  </Context.Provider>;
}
