import './Select.css';

export default function Select({ label, name, value, options = [], placeholder, error, required, disabled, onChange, className = '' }) {
  return (
    <div className={`select-group ${error ? 'select-group--error' : ''} ${className}`}>
      {label && <label className="select-group__label" htmlFor={name}>{label}{required && <span className="select-group__required">*</span>}</label>}
      <select id={name} name={name} value={value} disabled={disabled} required={required} onChange={onChange} className="select-group__select">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
      {error && <span className="select-group__error">{error}</span>}
    </div>
  );
}
