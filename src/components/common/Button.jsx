import { useState, useCallback } from 'react';
import './Button.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  onClick,
  className = '',
  ...props
}) {
  const [ripple, setRipple] = useState(null);

  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y, key: Date.now() });
    setTimeout(() => setRipple(null), 500);
    if (onClick && !disabled && !loading) onClick(e);
  }, [onClick, disabled, loading]);

  const classes = [
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    fullWidth && 'btn--full',
    disabled && 'btn--disabled',
    loading && 'btn--loading',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {ripple && (
        <span
          className="btn__ripple"
          style={{ left: ripple.x, top: ripple.y }}
          key={ripple.key}
        />
      )}
      {loading && <span className="btn__spinner" />}
      {Icon && iconPosition === 'left' && !loading && (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="btn__icon" />
      )}
      <span className="btn__label">{children}</span>
      {Icon && iconPosition === 'right' && !loading && (
        <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="btn__icon" />
      )}
    </button>
  );
}
