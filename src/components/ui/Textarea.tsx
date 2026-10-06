import React from "react";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  maxLength?: number;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, maxLength = 200, value, onChange, className = "", ...props }, ref) => {
    const textareaId = id || props.name;
    const currentLength = typeof value === "string" ? value.length : 0;
    const isNearLimit = currentLength >= maxLength - 20;

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label
              htmlFor={textareaId}
              className="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              {label}
            </label>
          )}
          <span
            className={`text-xs font-mono ${
              currentLength >= maxLength
                ? "text-rose-600 dark:text-rose-400 font-bold"
                : isNearLimit
                ? "text-amber-600 dark:text-amber-400"
                : "text-slate-400 dark:text-slate-500"
            }`}
          >
            {currentLength}/{maxLength}
          </span>
        </div>
        <textarea
          ref={ref}
          id={textareaId}
          maxLength={maxLength}
          value={value}
          onChange={onChange}
          rows={3}
          className={`w-full px-3.5 py-2.5 text-sm rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 resize-none ${
            error
              ? "border-rose-400 dark:border-rose-500/70 focus:border-rose-500 focus:ring-rose-500"
              : "border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600"
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-600 dark:text-rose-400 font-medium">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
