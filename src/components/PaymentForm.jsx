import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import "react-responsive-modal/styles.css";
import { Modal } from "react-responsive-modal";
import toast from "react-hot-toast";

const stripePromise = loadStripe(
  "pk_test_51SD8BfGq6KTOxh40UIVQpOYwwhXzt5qblmW6lCUJegnzuAGOGLz7b5NdfRhhlEB5F09INbJ0T4K1hFmv21kzwpZ500xMntTtVp"
);

const PaymentFormInner = ({ onClose, onComplete }) => {
  const stripe = useStripe();
  const elements = useElements();

  const handlePayClick = async () => {
    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/course/confirmed`,
      },
      redirect: "if_required", // Prevents automatic redirect
    });

    if (result.error) {
      console.log(result.error.message);
      toast.error(result.error.message);
      onClose(false);
    } else {
      if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
        onComplete();
      }
    }
  };

  return (
    <>
      <PaymentElement />
      <div className="d-flex justify-content-center">
        <button
          type="button"
          className="btn primary-btn6 mt-3"
          style={{ padding: "10px 38px", lineHeight: "1.0" }}
          onClick={handlePayClick}
          disabled={!stripe}
        >
          Pay Now
        </button>
      </div>
    </>
  );
};

const PaymentForm = ({ clientSecret, isShow, onClose, onComplete }) => {
  // passing the client secret obtained from the server
  const options = { clientSecret: clientSecret };

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
      open={isShow}
      onClose={() => onClose(false)}
      center
      styles={customStyles}
      showCloseIcon={true}
      focusTrapped={true}
      animationDuration={300}
    >
      <div
        className="modal-content border-0"
        style={{ borderRadius: "15px", fontFamily: "Cabin" }}
      >
        <div
          className="modal-header border-0 pb-2"
          style={{
            background: "linear-gradient(135deg, #f86ca7 0%, #ff7f18 100%)",
            borderRadius: "15px 15px 0 0",
            color: "white",
          }}
        >
          <div className="d-flex align-items-center w-100">
            <span className="fs-6 me-3 text-success" style={{ color: "white" }}>
              ✅
            </span>
            <h6 className="modal-title mb-0 text-white fw-semibold">
              Complete Your Payment
            </h6>
          </div>
        </div>
        <div className="modal-body px-4 py-4">
          {clientSecret && (
            <Elements stripe={stripePromise} options={options}>
              <PaymentFormInner onClose={onClose} onComplete={onComplete} />
            </Elements>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default PaymentForm;
