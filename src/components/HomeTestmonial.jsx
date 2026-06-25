import React, { useRef } from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import testimonialData from "../utils/testimonial_data.json";

function HomeTestimonial() {
  const swiperRef = useRef(null);

  const slideToLeft = () => {
    swiperRef.current?.slidePrev();
  };

  const slideToRight = () => {
    swiperRef.current?.slideNext();
  };

  return (
    <div className="h1-testimonial-area mb-120">
      <div className="container-fluid">
        <div className="row mb-50">
          <div className="col-lg-12 d-flex justify-content-center">
            <div className="section-title1 text-center">
              <span>
                <img src="assets/images/icon/section-vec-l2.svg" alt="" />
                Testimonial
                <img src="assets/images/icon/section-vec-r2.svg" alt="" />
              </span>
              <h2 className="text-white">valueable words from Customers</h2>
            </div>
          </div>
        </div>
        <div className="row justify-content-end">
          <div className="col-xxl-10 col-md-11  p-sm-0">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={4}
              scrollbar={{ draggable: true }}
              loop={true}
              className="swiper h1-testimonial-slider"
              onSwiper={(swiper) => (swiperRef.current = swiper)}
            >
              <div className="swiper-wrapper">
                {testimonialData.map((item) => {
                  return (
                    <SwiperSlide key={item.id} className="swiper-slide">
                      <div className="testimonial-card">
                        <div className="testimonial-img">
                          <img
                            className="img-fluid"
                            src={item.home1Image}
                            alt=""
                          />
                        </div>
                        <div className="testimonial-content">
                          <ul className="review">
                            <li>
                              <i className="bi bi-star-fill" />
                            </li>
                            <li>
                              <i className="bi bi-star-fill" />
                            </li>
                            <li>
                              <i className="bi bi-star-fill" />
                            </li>
                            <li>
                              <i className="bi bi-star-fill" />
                            </li>
                            <li>
                              <i className="bi bi-star-fill" />
                            </li>
                          </ul>
                          <p>{item.review}</p>
                          <div className="author-area">
                            <h4>{item.authorName}</h4>
                            <span>Customer</span>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  );
                })}
              </div>
            </Swiper>
          </div>
          <div className="col-md-11">
            <div className="swiper-btn-wrap d-flex align-items-center justify-content-center">
              <div className="slider-btn prev-btn-1" onClick={slideToLeft}>
                <i style={{ cursor: "pointer" }} className="bi bi-arrow-left" />
              </div>
              <div className="slider-btn next-btn-1" onClick={slideToRight}>
                <i
                  style={{ cursor: "pointer" }}
                  className="bi bi-arrow-right"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeTestimonial;
