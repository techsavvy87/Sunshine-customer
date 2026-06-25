import Breadcrumb from "../components/Breadcrumb";
import { Fragment, useState } from "react";
import toast from "react-hot-toast";
import { post } from "../utils/axios";

const ContactUS = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
      };

      const res = await post("/contact", payload);

      if (!res || (res.status && res.status >= 400)) {
        throw new Error("Failed to send message");
      }

      toast.success("Thank you! Your message has been sent.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      toast.error(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Breadcrumb pageName="Contact Us" pageTitle="Contact Us" />
      <Fragment>
        <div>
          <div className="contact-pages pt-120 mb-120">
            <div className="container">
              <div className="row align-items-center g-lg-4 gy-5">
                <div className="col-lg-5">
                  <div className="contact-left">
                    <div className="hotline mb-80">
                      <h3>Call Us Now</h3>
                      <div className="icon">
                        <img src="assets/images/icon/phone-icon4.svg" alt="" />
                      </div>
                      <div className="info">
                        <h6>
                          <a href="tel:+15552345678">+1 (555) 234-5678</a>
                        </h6>
                        <h6>
                          <a href="tel:+15559876543">+1 (555) 987-6543</a>
                        </h6>
                      </div>
                    </div>
                    <div className="location">
                      <h3>Our Location</h3>
                      <div className="icon">
                        <img src="assets/images/icon/location4.svg" alt="" />
                      </div>
                      <div className="info">
                        <h6>
                          <a href="#">
                            1247 Oak Street,
                            <br />
                            Austin, TX 78701, USA
                          </a>
                        </h6>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-7">
                  <div className="contact-form">
                    <h2>Have Any Questions</h2>
                    <form onSubmit={handleSubmit}>
                      <div className="row">
                        <div className="col-lg-12 mb-40">
                          <div className="form-inner">
                            <input
                              type="text"
                              name="name"
                              placeholder="Enter your name"
                              value={formData.name}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 mb-40">
                          <div className="form-inner">
                            <input
                              type="email"
                              name="email"
                              placeholder="Enter your email"
                              value={formData.email}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 mb-40">
                          <div className="form-inner">
                            <input
                              type="text"
                              name="subject"
                              placeholder="Subject"
                              value={formData.subject}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-lg-12 mb-40">
                          <div className="form-inner">
                            <textarea
                              name="message"
                              placeholder="Your message"
                              value={formData.message}
                              onChange={handleChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="form-inner">
                            <button
                              className="primary-btn1"
                              type="submit"
                              disabled={submitting}
                            >
                              {submitting && (
                                <span
                                  className="spinner-border spinner-border-sm me-2"
                                  role="status"
                                  aria-hidden="true"
                                />
                              )}
                              {submitting ? "Sending..." : "Send Message"}{" "}
                              {!submitting && (
                                <i className="bi bi-arrow-right" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="location-map">
            <div className="vector">
              <img src="assets/images/bg/map-vector.png" alt="" />
            </div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48330.162702269045!2d-74.29798882771155!3d40.792034138683825!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c3ab00d85ee855%3A0x93a15ba40269dd0!2sWest%20Orange%2C%20NJ%2007052%2C%20USA!5e0!3m2!1sen!2sbd!4v1658243800106!5m2!1sen!2sbd"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Fragment>
    </div>
  );
};

export default ContactUS;
