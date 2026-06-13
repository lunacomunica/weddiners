import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-noir/80 font-body">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={4}
          className={[
            "w-full px-4 py-3 rounded-md border border-noir/15 bg-white text-noir placeholder:text-smoke/60",
            "focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold",
            "transition-all duration-150 font-body text-base resize-y",
            error ? "border-rose focus:ring-rose/30 focus:border-rose" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {hint && !error && <p className="text-xs text-smoke">{hint}</p>}
        {error && <p className="text-xs text-rose">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
