function Card({ children, className = '', ...props }) {
  return (
    <div className={`shared-card ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Card