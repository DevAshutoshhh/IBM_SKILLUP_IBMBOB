import { useId, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface FieldShellProps {
  label: string;
  help?: string;
  error?: string;
  optional?: boolean;
  optionalLabel?: string;
  children: (ids: { describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

/**
 * Shared label / help-text / error scaffolding. Keeping it in one place means
 * every field in the app is described the same way to assistive technology.
 */
function FieldShell({ label, help, error, optional, optionalLabel, children }: FieldShellProps) {
  const helpId = useId();
  const errorId = useId();
  const describedBy = [help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <div className="field__label-row">
        <span className="field__label">{label}</span>
        {optional ? <span className="field__optional">{optionalLabel}</span> : null}
      </div>
      {help ? (
        <p className="field__help" id={helpId}>
          {help}
        </p>
      ) : null}
      {children({ describedBy, invalid: Boolean(error) })}
      {error ? (
        <p className="field__error" id={errorId}>
          <AlertCircle aria-hidden="true" size={16} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface Choice<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface RadioGroupProps<T extends string> {
  label: string;
  help?: string;
  error?: string;
  optional?: boolean;
  optionalLabel?: string;
  name: string;
  value: T | null;
  choices: Choice<T>[];
  onChange: (value: T) => void;
  /** Renders wide, single-column options rather than a responsive grid. */
  stacked?: boolean;
}

export function RadioGroup<T extends string>({
  label,
  help,
  error,
  optional,
  optionalLabel,
  name,
  value,
  choices,
  onChange,
  stacked = false,
}: RadioGroupProps<T>) {
  return (
    <FieldShell label={label} help={help} error={error} optional={optional} optionalLabel={optionalLabel}>
      {({ describedBy, invalid }) => (
        <div
          role="radiogroup"
          aria-label={label}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className={`choice-grid${stacked ? ' choice-grid--stacked' : ''}`}
        >
          {choices.map((choice) => {
            const id = `${name}-${choice.value}`;
            const checked = value === choice.value;
            return (
              <label key={choice.value} className={`choice${checked ? ' choice--selected' : ''}`} htmlFor={id}>
                <input
                  type="radio"
                  id={id}
                  name={name}
                  value={choice.value}
                  checked={checked}
                  onChange={() => onChange(choice.value)}
                  className="choice__input"
                />
                <span className="choice__text">
                  <span className="choice__title">{choice.label}</span>
                  {choice.description ? <span className="choice__description">{choice.description}</span> : null}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </FieldShell>
  );
}

interface CheckboxGroupProps<T extends string> {
  label: string;
  help?: string;
  error?: string;
  optional?: boolean;
  optionalLabel?: string;
  name: string;
  values: T[];
  choices: Choice<T>[];
  onChange: (values: T[]) => void;
}

export function CheckboxGroup<T extends string>({
  label,
  help,
  error,
  optional,
  optionalLabel,
  name,
  values,
  choices,
  onChange,
}: CheckboxGroupProps<T>) {
  const toggle = (value: T) => {
    onChange(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  return (
    <FieldShell label={label} help={help} error={error} optional={optional} optionalLabel={optionalLabel}>
      {({ describedBy, invalid }) => (
        <div
          role="group"
          aria-label={label}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          className="choice-grid"
        >
          {choices.map((choice) => {
            const id = `${name}-${choice.value}`;
            const checked = values.includes(choice.value);
            return (
              <label key={choice.value} className={`choice${checked ? ' choice--selected' : ''}`} htmlFor={id}>
                <input
                  type="checkbox"
                  id={id}
                  name={name}
                  value={choice.value}
                  checked={checked}
                  onChange={() => toggle(choice.value)}
                  className="choice__input"
                />
                <span className="choice__text">
                  <span className="choice__title">{choice.label}</span>
                  {choice.description ? <span className="choice__description">{choice.description}</span> : null}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </FieldShell>
  );
}

interface SelectFieldProps {
  label: string;
  help?: string;
  error?: string;
  value: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

export function SelectField({ label, help, error, value, placeholder, options, onChange }: SelectFieldProps) {
  const selectId = useId();
  const helpId = useId();
  const errorId = useId();
  const describedBy = [help ? helpId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`field${error ? ' field--invalid' : ''}`}>
      <label className="field__label" htmlFor={selectId}>
        {label}
      </label>
      {help ? (
        <p className="field__help" id={helpId}>
          {help}
        </p>
      ) : null}
      <select
        id={selectId}
        className="select"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="field__error" id={errorId}>
          <AlertCircle aria-hidden="true" size={16} />
          {error}
        </p>
      ) : null}
    </div>
  );
}
