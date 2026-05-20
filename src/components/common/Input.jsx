import './Input.css';

export default function Input({
  label,
  type = 'text',
  name,
  value,
  placeholder,
  error,
  helperText,
  icon: Icon,
  required = false,
  disabled = false,
  onChange,
  onBlur,
  className = '',
  ...props
}) {
  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${className}`}>
      {label && (
        <label className="input-group__label" htmlFor={name}>
          {label}
          {required && <span className="input-group__required">*</span>}
        </label>
      )}
      <div className="input-group__wrapper">
        {Icon && (
          <span className="input-group__icon">
            <Icon size={18} />
          </span>
        )}
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={onChange}
          onBlur={onBlur}
          className={`input-group__input ${Icon ? 'input-group__input--with-icon' : ''}`}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <span className={`input-group__message ${error ? 'input-group__message--error' : ''}`}>
          {error || helperText}
        </span>
      )}
    </div>
  );
}
