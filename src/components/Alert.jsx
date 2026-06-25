function Alert({ message, type, iconClass, onClose }) {
  return (
    <div
      className={`alert alert-${type} alert-dismissible fade show`}
      role="alert"
    >
      <i className={iconClass} />
      {message}
      <button type="button" className="btn-close" onClick={onClose}></button>
    </div>
  );
}

export default Alert;
