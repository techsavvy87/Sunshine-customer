import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";

function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "default", // default, danger, success, warning
}) {
  const getTypeClasses = () => {
    switch (type) {
      case "danger":
        return {
          confirmBtn: "btn btn-danger",
          icon: "⚠️",
          iconColor: "text-danger",
        };
      case "success":
        return {
          confirmBtn: "btn btn-success",
          icon: "✅",
          iconColor: "text-success",
        };
      case "warning":
        return {
          confirmBtn: "btn btn-warning",
          icon: "⚠️",
          iconColor: "text-warning",
        };
      default:
        return {
          confirmBtn: "btn",
          icon: "❓",
          iconColor: "text-primary",
        };
    }
  };

  const typeClasses = getTypeClasses();

  const customStyles = {
    modal: {
      borderRadius: "15px",
      padding: "0",
      maxWidth: "500px",
      width: "90%",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      backdropFilter: "blur(3px)",
    },
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      center
      styles={customStyles}
      showCloseIcon={false}
      focusTrapped={true}
      animationDuration={300}
    >
      <div
        className="modal-content border-0"
        style={{ borderRadius: "15px", fontFamily: "Cabin" }}
      >
        {/* Header */}
        <div
          className="modal-header border-0 pb-2"
          style={{
            background: "linear-gradient(135deg, #f86ca7 0%, #ff7f18 100%)",
            borderRadius: "15px 15px 0 0",
            color: "white",
          }}
        >
          <div className="d-flex align-items-center w-100">
            <span
              className={`fs-6 me-3 ${typeClasses.iconColor}`}
              style={{ color: "white" }}
            >
              {typeClasses.icon}
            </span>
            <h6 className="modal-title mb-0 text-white fw-semibold">{title}</h6>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body px-4 py-4">
          <p className="mb-0 text-dark fs-6 lh-sm" style={{ color: "#333" }}>
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="modal-footer border-0 pt-0 pb-4 px-4">
          <div className="d-flex gap-3 w-100 justify-content-end">
            <button
              type="button"
              className="btn btn-outline-secondary px-3"
              onClick={onClose}
              style={{
                borderRadius: "25px",
                fontWeight: "500",
                border: "2px solid #6c757d",
                minWidth: "80px",
              }}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className={`${typeClasses.confirmBtn} px-3 text-white`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
              style={{
                borderRadius: "25px",
                fontWeight: "500",
                minWidth: "100px",
                backgroundColor: type === "danger" ? "#dc3545" : "#FF6B47",
                border: `2px solid ${
                  type === "danger" ? "#dc3545" : "#FF6B47"
                }`,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (type !== "danger") {
                  e.target.style.backgroundColor = "#e55a3f";
                  e.target.style.borderColor = "#e55a3f";
                }
              }}
              onMouseLeave={(e) => {
                if (type !== "danger") {
                  e.target.style.backgroundColor = "#FF6B47";
                  e.target.style.borderColor = "#FF6B47";
                }
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmModal;
