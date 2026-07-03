"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

type PortalSelectOption = {
  label: string;
  value: string;
};

type PortalSelectProps = {
  hideLabel?: boolean;
  label: string;
  name: string;
  options: PortalSelectOption[];
  value: string;
};

export function PortalSelect({ hideLabel = false, label, name, options, value }: PortalSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption =
    options.find((option) => option.value === selectedValue) ?? options[0] ?? { label: "", value: "" };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closeOnOutside(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative text-xs font-black uppercase tracking-wide text-slate-400" ref={rootRef}>
      {hideLabel ? <span className="sr-only">{label}</span> : <span>{label}</span>}
      <input name={name} type="hidden" value={selectedValue} />
      <button
        aria-expanded={isOpen}
        aria-label={label}
        className={`portal-input flex h-10 w-full items-center justify-between gap-2 rounded-xl px-3 text-left text-sm font-bold normal-case tracking-normal text-white ${
          hideLabel ? "" : "mt-1"
        }`}
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <span className="truncate">{selectedOption.label}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition ${isOpen ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.45rem)] z-[110] max-h-72 overflow-hidden rounded-2xl border border-white/15 bg-[#08080d] p-1.5 shadow-[0_24px_70px_rgba(0,0,0,0.82)]">
          <div className="max-h-64 overflow-y-auto pr-1">
            {options.map((option) => {
              const active = option.value === selectedValue;

              return (
                <button
                  className={
                    active
                      ? "flex w-full items-center justify-between gap-2 rounded-xl bg-violet-500/18 px-3 py-2 text-left text-sm font-black normal-case tracking-normal text-white"
                      : "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm font-bold normal-case tracking-normal text-slate-300 transition hover:bg-white/[0.06] hover:text-white"
                  }
                  key={`${name}-${option.value}`}
                  onClick={() => {
                    setSelectedValue(option.value);
                    setIsOpen(false);
                  }}
                  type="button"
                >
                  <span className="truncate">{option.label}</span>
                  {active ? <Check className="h-4 w-4 shrink-0 text-cyan-200" aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
