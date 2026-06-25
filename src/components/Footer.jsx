import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer>
      <div className="container">
        <div className="row pt-90 pb-90 justify-content-center">
          <div className="col-lg-3 col-sm-6 order-lg-1 order-2 d-flex justify-content-sm-start justify-content-start">
            <div className="footer-items contact ">
              <h3>Contacts</h3>
              <div className="hotline mb-30">
                <div className="hotline-icon">
                  <img src="assets/images/icon/phone-icon.svg" alt="" />
                </div>
                <div className="hotline-info">
                  <h6 className="mb-10">
                    <span className="footer-contact-info">
                      +123 176 1111 456
                    </span>
                  </h6>
                  <h6>
                    <span className="footer-contact-info">
                      +123 170 1111 000
                    </span>
                  </h6>
                </div>
              </div>
              <div className="email mb-30">
                <div className="email-icon">
                  <img src="assets/images/icon/envelope.svg" alt="" />
                </div>
                <div className="email-info">
                  <h6 className="mb-10">
                    <span className="footer-contact-info">
                      info@example.com
                    </span>
                  </h6>
                  <h6>
                    <span className="footer-contact-info">
                      info@support.com
                    </span>
                  </h6>
                </div>
              </div>
              <div className="email">
                <div className="email-icon">
                  <img src="assets/images/icon/location.svg" alt="" />
                </div>
                <div className="email-info">
                  <h6 className="mb-10">
                    <span className="footer-contact-info">
                      332 Jim Rosa Lane
                    </span>
                  </h6>
                  <h6>
                    <span className="footer-contact-info">
                      La Habra, California
                    </span>
                  </h6>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 d-flex align-items-center order-lg-2 order-1 justify-content-sm-center justify-content-start">
            <div className="footer-items">
              <h2>
                want <span>to keep</span>
                <br />
                your pet in, <span>our center</span>?
              </h2>
              <div className="book-btn">
                <Link to="/contact">
                  <span className="primary-btn1 px-5 py-2">Book Now</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6 d-flex justify-content-sm-end justify-content-start order-3">
            <div className="footer-items opening-time">
              <h3>Opening Hours</h3>
              <h6 className="mb-25">Mon - Fri: 9.00AM - 6.00PM</h6>
              <h6 className="mb-25">Saturday: 9.00AM - 6.00PM</h6>
              <h6>Sunday: Closed</h6>
              <ul className="social-icons">
                <li>
                  <Link to="https://www.facebook.com/">
                    <i className="bx bxl-facebook" />
                  </Link>
                </li>
                <li>
                  <Link to="https://twitter.com/">
                    <i className="bx bxl-twitter" />
                  </Link>
                </li>
                <li>
                  <Link to="https://www.pinterest.com/">
                    <i className="bx bxl-pinterest-alt" />
                  </Link>
                </li>
                <li>
                  <Link to="https://www.instagram.com/">
                    <i className="bx bxl-instagram" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="row border-top">
          <div className="col-lg-6">
            <div className="copyright-area">
              <p>
                © 2025 PawPrints is Proudly Powered by{" "}
                <Link to="https://www.egenslab.com/"> Sean.</Link>
              </p>
            </div>
          </div>
          <div className="col-lg-6 d-flex justify-content-lg-end justify-content-center">
            <ul className="footer-btm-menu">
              <li>
                <Link to="#">Privacy Policy</Link>
              </li>
              <li>
                <Link to="#">Terms &amp; Conditions</Link>
              </li>
              <li>
                <Link to="#">Services</Link>
              </li>
              <li>
                <Link to="#">Help</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
