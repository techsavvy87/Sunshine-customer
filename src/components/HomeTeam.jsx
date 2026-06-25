import React, { useRef } from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import teamData from "../utils/team_data.json";

function HomeTeam() {
  const swiperRef = useRef(null);

  const slideToLeft = () => {
    swiperRef.current?.slidePrev();
  };

  const slideToRight = () => {
    swiperRef.current?.slideNext();
  };

  return (
    <div className="team-area mb-120 position-relative">
      <div className="swiper-btn-wrap d-flex align-items-center justify-content-between">
        <div className="slider-btn prev-btn-2" onClick={slideToLeft}>
          <i className="bi bi-arrow-left" />
        </div>
        <div className="slider-btn next-btn-2" onClick={slideToRight}>
          <i className="bi bi-arrow-right" />
        </div>
      </div>
      <div className="container">
        <div className="row mb-50">
          <div className="col-lg-12 d-flex justify-content-center">
            <div className="section-title1 text-center">
              <span>
                <img src="assets/images/icon/section-vec-l1.svg" alt="" />
                Our Team
                <img src="assets/images/icon/section-vec-r1.svg" alt="" />
              </span>
              <h2>See Our PawPrints Team members</h2>
            </div>
          </div>
        </div>
        <div className="row">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={4}
            scrollbar={{ draggable: true }}
            loop={true}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            className="swiper team-slider-1"
          >
            <div className="swiper-wrapper">
              {teamData.map((item) => {
                return (
                  <SwiperSlide key={item.id} className="swiper-slide">
                    <div className="single-team-card">
                      <div className="member-img">
                        <img className="img-fluid" src={item.image} alt="" />
                      </div>
                      <div className="member-content">
                        <span>{item.designation}</span>
                        <h3>{item.name}</h3>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </div>
          </Swiper>
        </div>
      </div>
    </div>
  );
}

export default HomeTeam;
