import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import PageLoader from "../components/PageLoader";
import { get } from "../utils/axios";

const Invoice = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!invoiceId) return;
    fetchInvoice();
  }, [invoiceId]);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await get(`/invoice/${invoiceId}`);
      if (res.data?.status) {
        console.log(res.data.result);
        setInvoice(res.data.result);
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Breadcrumb
        pageName={`Invoice #${invoice?.invoice_number}`}
        pageTitle="Invoice"
      />
      {loading || !invoice ? (
        <PageLoader />
      ) : (
        <div className="pt-70 pb-80" style={{ fontFamily: "cabin" }}>
          <div className="container checkout-section">
            <div className="payment-form">
              <div className="form-wrap box--shadow payment-methods">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h3 className="mb-0">Invoice</h3>
                    <div className="text-dark">#{invoice.invoice_number}</div>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm px-3"
                      style={{ height: 32 }}
                      onClick={() => navigate(-1)}
                    >
                      <i
                        className="bi bi-arrow-left me-2"
                        aria-hidden="true"
                      ></i>
                      Back
                    </button>
                    {/* {invoice.pdf_url && (
                      <a
                        href={invoice.pdf_url}
                        className="btn btn-outline-primary btn-sm"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    )} */}
                  </div>
                </div>
                <div className="mb-4">
                  <h5 className="text-dark">Bill To</h5>
                  <div className="row">
                    <div className="col-md-3">
                      <span>Name:</span>
                      <span className="text-dark ms-2">
                        {invoice.first_name + " " + invoice.last_name}
                      </span>
                    </div>
                    <div className="col-md-3">
                      <span>Email:</span>
                      <span className="text-dark ms-2">{invoice.email}</span>
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <h5 className="text-dark">Invoice Details</h5>
                  <div className="row">
                    <div className="col-md-3">
                      <span>Invoice #:</span>
                      <span className="text-dark ms-2">
                        {invoice.invoice_number}
                      </span>
                    </div>
                    <div className="col-md-3">
                      <span>Date:</span>
                      <span className="text-dark ms-2">
                        {invoice.issued_at}
                      </span>
                    </div>
                    <div className="col-md-3">
                      <span>Due:</span>
                      <span className="text-dark ms-2">{invoice.due_date}</span>
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-end">
                  <div className="table-responsive" style={{ width: 600 }}>
                    <table className="table table-borderless">
                      <thead>
                        <tr>
                          <th>Description</th>
                          <th className="text-end">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((it, idx) => (
                          <tr key={idx}>
                            <td>{it.description}</td>
                            <td className="text-end">
                              ${Number(it.price).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="d-flex justify-content-end">
                  <div style={{ width: 300 }}>
                    <div className="d-flex justify-content-between">
                      <div>Service Total</div>
                      <div>
                        $
                        {invoice.items
                          .reduce(
                            (sum, item) =>
                              sum +
                              (item.type === "service"
                                ? parseFloat(item.price)
                                : 0),
                            0
                          )
                          .toFixed(2)}
                      </div>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <div>Service Estimated Total</div>
                      <div>${invoice.estimated_service_price}</div>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <div>Discount</div>
                      <div>-${invoice.discount_amount}</div>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <div>Inventory Total</div>
                      <div>
                        $
                        {invoice.items
                          .reduce(
                            (sum, item) =>
                              sum +
                              (item.type === "inventory"
                                ? parseFloat(item.price)
                                : 0),
                            0
                          )
                          .toFixed(2)}
                      </div>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <div className="text-dark">Total</div>
                      <div className="text-dark">
                        $
                        {(
                          parseFloat(invoice.estimated_service_price) +
                          invoice.items.reduce(
                            (sum, item) =>
                              sum +
                              (item.type === "inventory"
                                ? parseFloat(item.price)
                                : 0),
                            0
                          ) - parseFloat(invoice.discount_amount)
                        ).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
                {invoice.notes && (
                  <div className="mt-4">
                    <h5 className="text-dark">Notes</h5>
                    <div className="text-muted">{invoice.notes}</div>
                  </div>
                )}
              </div>
            </div>
            {invoice.status === "sent" && (
              <div className="text-center mt-5">
                <div className="reservation-btn">
                  <Link
                    to={`/checkout/${invoice.appointment_id}`}
                    className="primary-btn1 form-btn"
                    style={{ padding: "8px 36px" }}
                  >
                    Checkout
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;
