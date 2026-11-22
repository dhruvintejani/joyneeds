import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronDown } from "lucide-react";

export type SelectOption = { value: string; label: string };
type Props = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
};
/** Lightweight, keyboard-operable single-select menu for catalog controls. */
export default function PremiumSelect({ label, value, options, onChange, className = "" }: Props) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrapper = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const optionEls = useRef<Array<HTMLButtonElement | null>>([]);
  const active = Math.max(0, options.findIndex((option) => option.value === value));
  useEffect(() => {
    if (!open) return;
    optionEls.current[active]?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!wrapper.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeEscape);
    return () => { document.removeEventListener("pointerdown", closeOutside); document.removeEventListener("keydown", closeEscape); };
  }, [active, open]);
  function choose(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }
  function onOptionKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      optionEls.current[(index + (event.key === "ArrowDown" ? 1 : options.length - 1)) % options.length]?.focus();
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      optionEls.current[event.key === "Home" ? 0 : options.length - 1]?.focus();
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }
  return (
    <div ref={wrapper} className={"jn-select " + className}>
      <button ref={trigger} className={"jn-select-trigger" + (open ? " is-open" : "")} type="button"
        aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(event) => {
          if (!open && ["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); setOpen(true); }
        }}>
        <span>{options.find((item) => item.value === value)?.label ?? options[0]?.label ?? label}</span>
        <ChevronDown size={16} className="jn-select-chevron" aria-hidden="true"/>
      </button>
      {open && <div className="jn-select-menu" id={id} role="listbox" aria-label={label}>
        {options.map((item, index) => (
          <button key={item.value} ref={(el) => { optionEls.current[index] = el; }}
            type="button" role="option" aria-selected={item.value === value}
            className={"jn-select-option" + (item.value === value ? " selected" : "")}
            onKeyDown={(event) => onOptionKey(event, index)}
            onClick={() => choose(item.value)}>
            <span>{item.label}</span>{item.value === value && <Check size={15} aria-hidden="true"/>}
          </button>
        ))}
      </div>}
    </div>
  );
}
