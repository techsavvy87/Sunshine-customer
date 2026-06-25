import { Link } from "react-router-dom";
import { Navigation, Pagination, Scrollbar, A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
// import "swiper/css";
// import "swiper/css/navigation";
// import "swiper/css/pagination";
// import "swiper/css/scrollbar";

function HomeService() {
  return (
    <div className="h1-service-area pt-120 mb-120">
      <div className="container">
        <div className="row">
          <div className="col-lg-12 d-flex justify-content-center">
            <div className="section-title1 text-center">
              <span>
                <img src="assets/images/icon/section-vec-l1.svg" alt="" />
                Services
                <img src="assets/images/icon/section-vec-r1.svg" alt="" />
              </span>
              <h2>Experience our worship</h2>
            </div>
          </div>
        </div>
        <div className="row d-sm-flex d-none">
          <div className="col-lg-12">
            <div className="swiper-btn-wrap d-flex align-items-center justify-content-between">
              <div className="slider-btn prev-btn-1">
                <i style={{ cursor: "pointer" }} className="bi bi-arrow-left" />
              </div>
              <div className="slider-btn next-btn-1">
                <i
                  style={{ cursor: "pointer" }}
                  className="bi bi-arrow-right"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <Swiper
            modules={[Navigation, Pagination, Scrollbar, A11y]}
            spaceBetween={20}
            slidesPerView={4}
            pagination={{ clickable: true }}
            scrollbar={{ draggable: true }}
            className="swiper home1-services-slider"
          >
            <div className="swiper-wrapper">
              <SwiperSlide className="swiper-slide">
                <div className="services-card1">
                  <img
                    className="services-card-vec"
                    src="assets/images/bg/services-card-vec.png"
                    alt=""
                  />
                  <div className="icon">
                    <img src="assets/images/icon/daycare-center2.svg" alt="" />
                  </div>
                  <div className="content">
                    <h3>
                      <Link to="/service-details">Daycare</Link>
                    </h3>
                    <p>
                      Pellentesque maximus augue orciquista ut aliquet risus In
                      hac habitasse.
                    </p>
                  </div>
                  <Link to="/service-details">
                    <span className="more-btn">
                      More Details
                      <img src="assets/images/icon/btn-arrow1.svg" alt="" />
                    </span>
                  </Link>
                </div>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <div className="services-card1 two">
                  <img
                    className="services-card-vec"
                    src="assets/images/bg/services-card-vec.png"
                    alt=""
                  />
                  <div className="icon">
                    <img src="assets/images/icon/grooming2.svg" alt="" />
                  </div>
                  <div className="content">
                    <h3>
                      <Link to="/service-details">Grooming</Link>
                    </h3>
                    <p>
                      Pellentesque maximus augue orciquista ut aliquet risus In
                      hac habitasse.
                    </p>
                  </div>
                  <Link to="/service-details">
                    <span className="more-btn">
                      More Details
                      <img src="assets/images/icon/btn-arrow1.svg" alt="" />
                    </span>
                  </Link>
                </div>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <div className="services-card1 three">
                  <img
                    className="services-card-vec"
                    src="assets/images/bg/services-card-vec.png"
                    alt=""
                  />
                  <div className="icon">
                    <img src="assets/images/icon/boarding2.svg" alt="" />
                  </div>
                  <div className="content">
                    <h3>
                      <Link to="/service-details">Boarding</Link>
                    </h3>
                    <p>
                      Pellentesque maximus augue orciquista ut aliquet risus In
                      hac habitasse.
                    </p>
                  </div>
                  <Link to="/service-details">
                    <span className="more-btn">
                      More Details
                      <img src="assets/images/icon/btn-arrow1.svg" alt="" />
                    </span>
                  </Link>
                </div>
              </SwiperSlide>
              <SwiperSlide className="swiper-slide">
                <div className="services-card1 four">
                  <img
                    className="services-card-vec"
                    src="assets/images/bg/services-card-vec.png"
                    alt=""
                  />
                  <div className="icon">
                    <img src="assets/images/icon/veterinary2.svg" alt="" />
                  </div>
                  <div className="content">
                    <h3>
                      <Link to="/service-details">veterinary</Link>
                    </h3>
                    <p>
                      Pellentesque maximus augue orciquista ut aliquet risus In
                      hac habitasse.
                    </p>
                  </div>
                  <Link to="/service-details">
                    <span className="more-btn">
                      More Details
                      <img src="assets/images/icon/btn-arrow1.svg" alt="" />
                    </span>
                  </Link>
                </div>
              </SwiperSlide>
            </div>
          </Swiper>
        </div>
      </div>
    </div>
  );
}

export default HomeService;
