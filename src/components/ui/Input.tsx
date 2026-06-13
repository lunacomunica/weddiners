import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  glass?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, glass = false, className = "", id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={`text-sm font-medium font-body ${glass ? "text-white/90" : "text-noir/80"}`}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            "w-full px-4 py-3 rounded-md border transition-all duration-150 font-body text-base",
            "focus:outline-none focus:ring-2",
            glass
              ? "bg-white/15 border-white/30 text-white placeholder:text-white/40 focus:ring-white/30 focus:border-white/60 backdrop-blur-sm"
              : "bg-white border-noir/15 text-noir placeholder:text-smoke/60 focus:ring-gold/40 focus:border-gold",
            error ? "border-rose focus:ring-rose/30 focus:border-rose" : "",
            className,
          ].join(" ")}
          {...props}
        />
        {hint && !error && <p className={`text-xs ${glass ? "text-white/50" : "text-smoke"}`}>{hint}</p>}
        {error && <p className="text-xs text-rose">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
