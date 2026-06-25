import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import PageLoader from "../components/PageLoader";
import { get } from "../utils/axios";

const PaymentSuccess = () => {
  const location = useLocation();

  const { invoice_id } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    if (!invoice_id) return;

    const fetchInvoice = async () => {
      setLoading(true);
      try {
        const res = await get(`/invoice/${invoice_id}`);
        if (res.data?.status) {
          setInvoice(res.data.result);
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div>
      <Breadcrumb pageName="Payment Successful" pageTitle="Thank you" />
      <div className="pt-70 pb-80" style={{ fontFamily: "cabin" }}>
        <div className="container checkout-section">
          <div className="payment-form">
            <div className="form-wrap box--shadow payment-methods text-center p-5">
              <div className="mb-1">
                <i
                  className="bi bi-check-circle"
                  style={{ fontSize: 80, color: "var(--primary-color3)" }}
                ></i>
              </div>
              <h2 className="mb-2 text-dark">Payment Received</h2>
              <p className="text-muted mb-4 mt-3">
                Thank you — your payment was processed successfully. We have
                sent a receipt to your email.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap mt-4">
                {invoice && (
                  <Link
                    to={`/invoice/${invoice.id}`}
                    className="btn primary-btn5"
                    style={{ padding: "10px 38px" }}
                  >
                    View Invoice
                  </Link>
                )}
                <Link
                  to="/"
                  className="btn primary-btn6"
                  style={{ padding: "10px 38px" }}
                >
                  Book Another Service
                </Link>
              </div>
              <div className="mt-4 text-muted small">
                If you have questions about your invoice, please contact our
                support.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
