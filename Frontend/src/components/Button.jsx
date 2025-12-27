import React from 'react';

/**
 * Reusable Button component with variants.
 * Props: variant ('primary' | 'outline' | 'gradient'), size ('sm'|'md'), full (boolean)
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  className = '',
  ...rest
}) {
  const classes = [
    'btn-core',
    `btn-${variant}`,
    `btn-${size}`,
    full ? 'btn-full' : '',
    className
  ].filter(Boolean).join(' ');
  return (
    <button className={classes} {...rest}>{children}</button>
  );
}
