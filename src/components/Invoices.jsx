import { useState, useEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { get } from "../utils/axios";
import PageLoader from "./PageLoader";

const Invoices = () => {
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getInvoices();
  }, []);

  const getInvoices = async () => {
    setLoading(true);
    try {
      const res = await get("/invoices");
      if (res.data.status) {
        const resultData = res.data.result;
        setInvoices(resultData);
      }
    } catch (err) {
      console.error("Error fetching service details:", err);
    } finally {
      setLoading(false);
    }
  };

  const viewInvoice = (invoiceId) => {
    navigate(`/invoice/${invoiceId}`);
  };

  return (
    <Fragment>
      {loading ? (
        <PageLoader />
      ) : (
        <table
          className="table total-table2 table-bordered"
          style={{ whiteSpace: "nowrap" }}
        >
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Pet</th>
              <th>Service</th>
              <th>Issued Date</th>
              <th>Due Date</th>
              <th>Paid Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td>#{invoice.invoice_number}</td>
                <td>{invoice.appointment?.pet.name}</td>
                <td>{invoice.appointment?.service.name}</td>
                <td>{invoice.issued_at}</td>
                <td>{invoice.due_date}</td>
                <td>{invoice.paid_at}</td>
                <td>{invoice.status}</td>
                <td>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => viewInvoice(invoice.id)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Fragment>
  );
};

export default Invoices;
