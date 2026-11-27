function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      className={`shared-button ${variant} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button