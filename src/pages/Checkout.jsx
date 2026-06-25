import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CountrySelect,
  StateSelect,
  GetCountries,
  GetState,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
import Breadcrumb from "../components/Breadcrumb";
import PageLoader from "../components/PageLoader";
import PaymentForm from "../components/PaymentForm";
import { get, post } from "../utils/axios";

const Checkout = () => {
  const { appoId } = useParams();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [country, setCountry] = useState(null);
  const [state, setState] = useState(null);
  const [stateName, setStateName] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [postCode, setPostCode] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [service, setService] = useState(null);
  const [additionalServices, setAdditionalServices] = useState([]);
  const [secondaryServices, setSecondaryServices] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [estimatedTotal, setEstimatedTotal] = useState(0);
  const [invoiceId, setInvoiceId] = useState("");
  const [coatPriceApplied, setCoatPriceApplied] = useState(false);
  const [totalCoatTypePrice, setTotalCoatTypePrice] = useState(0);

  const [clientSecret, setClientSecret] = useState("");
  const [isOpenPaymentForm, setIsOpenPaymentForm] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  const [isloading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [discount, setDiscount] = useState([]);

  useEffect(() => {
    getCheckoutData();
  }, [appoId]);

  const getCheckoutData = async () => {
    setIsLoading(true);
    try {
      const res = await get(`/checkout/detail/${appoId}`);
      if (res.data.status) {
        const checkoutData = res.data.result;

        const orderData = checkoutData.order_details;
        setService(orderData.main_service);
        setAdditionalServices(orderData.additional_services || []);
        setSecondaryServices(orderData.secondary_services || []);
        setInventoryItems(orderData.inventory_items);
        setEstimatedTotal(orderData.estimated_service_price);
        setInvoiceId(orderData.invoice_id || "");
        setDiscount(checkoutData.discount || []);
        
        // Set coat pricing info
        setCoatPriceApplied(
          orderData.coat_price_applied === true ||
          orderData.coat_price_applied === 1 ||
          orderData.coat_price_applied === "1"
        );
        setTotalCoatTypePrice(Number(orderData.total_coat_type_price || 0));

        const customerData = checkoutData.customer_details;
        setFirstName(customerData.name.split(" ")[0] || "");
        setLastName(customerData.name.split(" ")[1] || "");
        setEmail(customerData.email || "");
        setCountryCode(customerData.country || "");
        setStateName(customerData.state || "");
        setAddress1(customerData.line1 || "");
        setAddress2(customerData.line2 || "");
        setCity(customerData.city || "");
        setPostCode(customerData.postal_code || "");


        // set the Country dropdown and State dropdown
        const countries = await GetCountries();
        const countryUser = countries.find(
          (item) => item.iso2 === customerData.country
        );
        if (countryUser) {
          setCountry(countryUser);

          const states = await GetState(countryUser.id);
          const stateUser = states.find(
            (item) => item.name === customerData.state
          );
          setState(stateUser);
        }
      } else {
        toast.error(res.data.message || "Failed to fetch checkout data.");
      }
    } catch (error) {
      console.error("Error fetching checkout data:", error);
      toast.error("Failed to fetch checkout data.");
    } finally {
      setIsLoading(false);
    }
  };

  const onClickPlaceOrder = async () => {
    if (
      !firstName ||
      !lastName ||
      !country ||
      !state ||
      !address1 ||
      !city ||
      !postCode
    ) {
      toast.error("Please fill in all required billing details.");
      return;
    }

    const totalPrice =
      Number(estimatedTotal) +
      Number(totalCoatTypePrice) +
      (inventoryItems.reduce((acc, curr) => acc + Number(curr.price), 0) || 0) - Number(discount.amount || 0);

    const url = "/payment/stripe";
    const data = {
      name: `${firstName} ${lastName}`,
      email: email,
      amount: parseFloat(totalPrice) * 100,
      line1: address1,
      line2: address2,
      country: countryCode,
      city: city,
      state: stateName,
      postalCode: postCode,
    };

    setLoading(true);
    try {
      const result = await post(url, data);
      const resResult = result.data;
      if (resResult.status) {
        setClientSecret(resResult.result.paymentIntent);
        setPaymentId(resResult.result.paymentId);
        setIsOpenPaymentForm(true);
      } else {
        toast.error(resResult.message);
      }
    } catch (err) {
      console.log("Error: ", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onCompletePayment = async () => {
    const totalPrice =
      Number(estimatedTotal) +
      Number(totalCoatTypePrice) +
      (inventoryItems.reduce((acc, curr) => acc + Number(curr.price), 0) || 0) - Number(discount.amount || 0);

    const url = "/payment/complete";
    const data = {
      amount: parseFloat(totalPrice),
      lastPaymentId: paymentId,
      appointmentId: appoId,
      invoiceId: invoiceId,
    };

    try {
      const result = await post(url, data);
      const resResult = result.data;
      if (resResult.status) {
        navigate("/payment-success", { state: { invoice_id: invoiceId } });
      } else {
        toast.error(resResult.message);
      }
    } catch (err) {
      console.log("Error: ", err);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div>
      <Breadcrumb pageName="Check Out" pageTitle="Check Out" />
      {isloading ? (
        <PageLoader />
      ) : (
        <div className="checkout-section pt-120 pb-120">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-7">
                <div className="form-wrap box--shadow mb-30">
                  <h4 className="title-25 mb-20">Billing Details</h4>
                  <div className="row">
                    <div className="col-lg-6">
                      <div className="form-inner">
                        <label>First Name *</label>
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-inner">
                        <label>Last Name *</label>
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-lg-12">
                      <div className="form-inner">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-inner">
                        <label>Country *</label>
                        <CountrySelect
                          onChange={(_country) => {
                            setCountry(_country);
                            setCountryCode(_country.iso2);
                          }}
                          onTextChange={(_txt) => console.log(_txt)}
                          placeHolder="Select country"
                          value={country}
                          defaultValue={country}
                        />
                      </div>
                    </div>
                    <div className="col-lg-6">
                      <div className="form-inner">
                        <label>State *</label>
                        <StateSelect
                          countryid={country?.id}
                          onChange={(_state) => {
                            setState(_state);
                            setStateName(_state.name);
                          }}
                          onTextChange={(_txt) => console.log(_txt)}
                          value={state}
                          placeHolder="Select state"
                          defaultValue={state}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-inner">
                        <label>Street Address</label>
                        <input
                          value={address1}
                          onChange={(e) => setAddress1(e.target.value)}
                          placeholder="House, Street *"
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-inner">
                        <input
                          value={address2}
                          onChange={(e) => setAddress2(e.target.value)}
                          placeholder="Apt, Suite, Unit etc. (optional)"
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-inner">
                        <input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City *"
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="form-inner">
                        <input
                          value={postCode}
                          onChange={(e) => setPostCode(e.target.value)}
                          placeholder="Post Code *"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <aside className="col-lg-5">
                <div className="added-product-summary mb-20">
                  <h5 className="title-25 checkout-title">Order Summary</h5>
                  <ul className="added-products">
                    <li className="single-product d-flex justify-content-start">
                      <div className="product-img" style={{ height: "80px" }}>
                        {service && (
                          <img
                            src={service.avatar_img_url}
                            style={{ objectFit: "cover", height: "100%" }}
                            className="w-75 rounded"
                          />
                        )}
                      </div>
                      <div className="product-info">
                        <h5 className="product-title text-dark">
                          {service?.name} Service
                        </h5>
                      </div>
                      {service && Number(service.price) > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "25%",
                            right: "10px",
                          }}
                        >
                          <span className="text-dark fw-bold">
                            ${Number(service.price).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </li>
                  </ul>
                  {secondaryServices && secondaryServices.length > 0 && (
                    <div className="additional-services mt-3">
                      <h6 className="title-14 mb-2">Secondary Services</h6>
                      {secondaryServices.map((sec, idx) => (
                        <div
                          key={idx}
                          className="service-item d-flex justify-content-between align-items-start"
                        >
                          <p className="mb-0 text-dark">{sec.name}</p>
                          <div className="text-dark">
                            ${Number(sec.price).toFixed(2) || "0.00"}
                          </div>
                        </div>
                      ))}
                      {coatPriceApplied && Number(totalCoatTypePrice) > 0 && (
                        <div className="service-item d-flex justify-content-between align-items-start">
                          <p className="mb-0 text-dark" style={{ fontSize: "0.9rem", color: "#666" }}>
                            Coat Type Price
                          </p>
                          <div className="text-dark" style={{ fontSize: "0.9rem" }}>
                            ${Number(totalCoatTypePrice).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {additionalServices && additionalServices.length > 0 && (
                    <div className="additional-services mt-3">
                      <h6 className="title-14 mb-2">Additional Services</h6>
                      {additionalServices.map((add, idx) => (
                        <div key={idx}>
                          <div className="service-item d-flex justify-content-between align-items-start">
                            <p className="mb-0 text-dark">{add.name}</p>
                            <div className="text-dark">
                              ${Number(add.price).toFixed(2) || "0.00"}
                            </div>
                          </div>
                        </div>
                      ))}
                      {coatPriceApplied && Number(totalCoatTypePrice) > 0 && (
                        <div className="service-item d-flex justify-content-between align-items-start">
                          <p className="mb-0 text-dark" style={{ fontSize: "0.9rem", color: "#666" }}>
                            Coat Type Price
                          </p>
                          <div className="text-dark" style={{ fontSize: "0.9rem" }}>
                            ${Number(totalCoatTypePrice).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {inventoryItems && inventoryItems.length > 0 && (
                    <div className="additional-services mt-3">
                      <h6 className="title-14 mb-2">Inventory Items</h6>
                      {inventoryItems.map((item, idx) => (
                        <div
                          key={idx}
                          className="service-item d-flex justify-content-between align-items-start"
                        >
                          <p className="mb-0 text-dark">{item.item_name}</p>
                          <div className="text-dark">
                            ${Number(item.price).toFixed(2) || "0.00"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div
                  className="summery-card cost-summery mb-20"
                  style={{ paddingTop: 18 }}
                >
                  <table className="table cost-summery-table">
                    <tbody>
                      <tr>
                        <td className="tax">Estimated Service Total</td>
                        <td className="tax">
                          ${Number(estimatedTotal).toFixed(2) || "0.00"}
                        </td>
                      </tr>
                      {discount && discount.amount > 0 && (
                        <>
                          <tr>
                            <td className="text-dark">Discount</td>
                            <td className="text-dark">
                              -${Number(discount.amount || 0).toFixed(2)}
                            </td>
                          </tr>
                          <tr>
                            <td className="text-dark">Inventory Total</td>
                            <td className="text-dark">
                              $
                              {Number(
                                inventoryItems.reduce(
                                  (acc, curr) => acc + Number(curr.price),
                                  0
                                ) || 0
                              ).toFixed(2)}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
                {service && (
                  <div className="summery-card total-cost mb-10">
                    <table className="table cost-summery-table total-cost">
                      <thead>
                        <tr>
                          <th>Total</th>
                          <th>
                            ${Number(estimatedTotal).toFixed(2)}
                          </th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                )}
                <div className="payment-form-bottom d-flex align-items-start ms-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <label htmlFor="terms">
                    I have read and agree to the website{" "}
                    <Link to="#">Terms and conditions</Link>
                  </label>
                </div>
                <div className="reservation-btn mt-4 ms-3">
                  <button
                    className="primary-btn1 form-btn"
                    style={{ padding: "8px 36px" }}
                    disabled={!agreed}
                    onClick={onClickPlaceOrder}
                  >
                    {loading && (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                        style={{ marginBottom: 2 }}
                      ></span>
                    )}
                    {loading ? "Loading..." : "Place Order"}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
      <PaymentForm
        clientSecret={clientSecret}
        isShow={isOpenPaymentForm}
        onClose={(val) => setIsOpenPaymentForm(val)}
        onComplete={onCompletePayment}
      />
    </div>
  );
};

export default Checkout;
