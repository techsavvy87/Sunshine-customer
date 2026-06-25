import Breadcrumb from "../components/Breadcrumb";

const About = () => {
  return (
    <div>
      <Breadcrumb pageName="About Us" pageTitle="About Us" />
      <div className="h1-story-area two mb-60 pt-120">
        <div className="container">
          <div className="row g-lg-4 gy-5">
            <div className="col-lg-6">
              <div className="section-title1">
                <span>
                  <img src="assets/images/icon/section-vec-l1.svg" alt="" />
                  Our Story
                  <img src="assets/images/icon/section-vec-r1.svg" alt="" />
                </span>
                <h2 style={{ fontSize: "2.6rem" }}>
                  come to know what we have done about pets.
                </h2>
              </div>
              <div className="story-content">
                <p>
                  We’ve built our services around one simple belief: pets
                  deserve care that’s thoughtful, transparent, and centered on
                  their well-being. From grooming and training to daycare and
                  boarding, every service is designed to keep pets safe,
                  comfortable, and happy—while giving pet parents complete peace
                  of mind. Our team combines experience, compassion, and modern
                  tools to ensure every visit is handled with care. We focus on
                  clear communication, consistent processes, and personalized
                  attention for every pet we serve.
                </p>
                <div className="story-title-reviews">
                  <h3>
                    We Think Working Process may <span>increase</span> mindset.
                  </h3>
                  <div className="review">
                    <p>
                      Based on <a href="#">20,921 reviews</a>
                    </p>
                    <img src="assets/images/icon/trastpilot.svg" alt="" />
                  </div>
                </div>
                <p>
                  Our clear and structured process helps us deliver consistent,
                  high-quality care. From approvals to appointment tracking and
                  checkout, everything is designed to keep your pet safe and
                  your experience simple and stress-free.
                </p>
              </div>
            </div>
            <div className="col-lg-6 d-flex justify-content-lg-end justify-content-center">
              <div className="story-img">
                <img
                  className="img-fluid"
                  src="assets/images/bg/story-img1.png"
                  alt=""
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h1-choose-area mb-120">
        <div className="container">
          <div className="row g-5 gy-5 justify-content-center">
            <div className="col-lg-7 col-md-8">
              <div className="about-video">
                <video
                  className="img-fluid"
                  src="assets/video/booking_flow.mp4"
                  autoPlay
                  muted
                  loop
                  controls
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="section-title1 pt-4">
                <span>
                  <img src="assets/images/icon/section-vec-l1.svg" alt="" />
                  Why Choose Us
                  <img src="assets/images/icon/section-vec-r1.svg" alt="" />
                </span>
                <h2 style={{ fontSize: "2.6rem" }}>
                  we provide the best care services.
                </h2>
              </div>
              <div className="choose-content">
                <p>
                  Welcome to Your Pet Care Portal 🐾 Our customer portal makes
                  it easy to book services, manage appointments, and complete
                  payments — all in one place. Here’s how it works:
                </p>
              </div>
            </div>
          </div>
          <div className="row px-5">
            <div className="col-12">
              <div className="choose-content">
                <div className="accordion" id="accordionExample">
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingOne">
                      <button
                        className="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseOne"
                        aria-expanded="true"
                        aria-controls="collapseOne"
                      >
                        01. Choose a Service
                      </button>
                    </h2>
                    <div
                      id="collapseOne"
                      className="accordion-collapse collapse show"
                      aria-labelledby="headingOne"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="accordion-body">
                        Browse our available services (such as Grooming,
                        Daycare, Training, or Boarding) and select the service
                        you’d like to book for your pet.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingTwo">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseTwo"
                        aria-expanded="false"
                        aria-controls="collapseTwo"
                      >
                        02. Book an Appointment
                      </button>
                    </h2>
                    <div
                      id="collapseTwo"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingTwo"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="accordion-body">
                        On the booking form, select your pet, choose a date and
                        available time slot, add any additional services if
                        needed, and click Book to submit your request. <br />
                        👉 Note: Your appointment will be scheduled successfully
                        once:
                        <ul>
                          <li>Your customer profile is approved</li>
                          <li>Your pet’s questionnaire is approved</li>
                          <li>
                            Your pet’s vaccination status is confirmed by our
                            staff
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingThree">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseThree"
                        aria-expanded="false"
                        aria-controls="collapseThree"
                      >
                        03. View Your Appointments
                      </button>
                    </h2>
                    <div
                      id="collapseThree"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingThree"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="accordion-body">
                        Go to the My Appointments tab to:
                        <ul>
                          <li>
                            See a list of all your upcoming and past
                            appointments
                          </li>
                          <li>
                            View detailed information for each appointment,
                            including status and service details
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingFour">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseFour"
                        aria-expanded="false"
                        aria-controls="collapseFour"
                      >
                        04. Appointment Progress
                      </button>
                    </h2>
                    <div
                      id="collapseFour"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingFour"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="accordion-body">
                        Once your appointment begins, our staff will update its
                        progress like Check-In, In Progress, and Check-Out. You
                        can follow each step directly from the appointment
                        details page.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item">
                    <h2 className="accordion-header" id="headingFive">
                      <button
                        className="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#collapseFive"
                        aria-expanded="false"
                        aria-controls="collapseFive"
                      >
                        05. Payments & Checkout
                      </button>
                    </h2>
                    <div
                      id="collapseFive"
                      className="accordion-collapse collapse"
                      aria-labelledby="headingFive"
                      data-bs-parent="#accordionExample"
                    >
                      <div className="accordion-body">
                        After the service is completed:
                        <ul>
                          <li>Our staff will send you an invoice</li>
                          <li>
                            Click the Checkout button to review your order and
                            make payment
                          </li>
                          <li>
                            Once payment is completed, the appointment is marked
                            as Completed
                          </li>
                        </ul>
                        💡 Important: <br />
                        For certain service types, payment may be required
                        upfront before the service begins.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
