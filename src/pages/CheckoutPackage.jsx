import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { post } from "../utils/axios";

const CheckoutPackage = () => {
  const navigate = useNavigate();
  const { packageId } = useParams();

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
  const [pkg, setPkg] = useState(null);
  const [serviceId, setServiceId] = useState(null);

  const [clientSecret, setClientSecret] = useState("");
  const [isOpenPaymentForm, setIsOpenPaymentForm] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  const [isloading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCheckoutData();
  }, [packageId]);

  const getCheckoutData = async () => {
    setIsLoading(true);
    try {
      const data = {
        package_id: packageId,
      };
      const res = await post("/checkout/package", data);
      if (res.data.status) {
        const checkoutData = res.data.result;

        const orderData = checkoutData.order_details;
        setPkg(orderData.package || null);
        setServiceId(orderData.service_id || null);

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

    const url = "/payment/stripe";
    const data = {
      name: `${firstName} ${lastName}`,
      email: email,
      amount: parseFloat(pkg?.price || 0) * 100,
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
    const url = "/payment/complete";
    const data = {
      amount: parseFloat(pkg.price),
      lastPaymentId: paymentId,
      packageId: packageId,
      serviceId: serviceId,
    };

    try {
      const result = await post(url, data);
      const resResult = result.data;
      if (resResult.status) {
        toast.success("Payment completed successfully!");
        navigate(`/account?tab=packages`);
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
                        {pkg && (
                          <img
                            src={pkg.package_img_url}
                            style={{ objectFit: "cover", height: "100%" }}
                            className="w-75 rounded"
                          />
                        )}
                      </div>
                      <div className="product-info">
                        <h5 className="product-title text-dark">
                          Package Service
                        </h5>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          top: "25%",
                          right: "10px",
                        }}
                      >
                        <span className="text-dark fw-bold">
                          ${Number(pkg?.price).toFixed(2)}
                        </span>
                      </div>
                    </li>
                  </ul>
                  {pkg && (
                    <div className="additional-services mt-3">
                      <h6 className="title-14 mb-2">Package Detail</h6>
                      <div className="service-item">
                        <p className="mb-0 text-dark">{pkg.name}</p>
                      </div>
                      <div className="service-item d-flex gap-5 align-items-start">
                        <p className="mb-0 text-muted" style={{ fontSize: 13 }}>
                          Duration: {pkg.days || "-"} days
                        </p>
                      </div>
                      <div className="service-item d-flex gap-3 align-items-start">
                        <p className="mb-0 text-muted" style={{ fontSize: 13 }}>
                          Services Included:
                        </p>
                        <p className="mb-0 text-muted" style={{ fontSize: 13 }}>
                          {pkg.services.map((service) => (
                            <span
                              className="badge rounded-pill bg-secondary me-2"
                              key={service.id}
                            >
                              {service.name}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
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

export default CheckoutPackage;
