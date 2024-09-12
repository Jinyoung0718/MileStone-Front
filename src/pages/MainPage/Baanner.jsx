import styled, { keyframes } from "styled-components";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "./Banner.css";

export default function Banner() {
  return (
    <Swiper
      effect="fade"
      pagination={{ clickable: true }}
      modules={[Navigation, EffectFade, Pagination, Autoplay]}
      loop={true}
      autoplay={{ delay: 5000, disableOnInteraction: false }}
      speed={3000}
    >
      <SwiperSlide>
        <SlideContent>
          <StyledImage
            src="https://images.unsplash.com/photo-1504179175816-14bdcc59eec2?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="지평선 숲 이미지"
          />
          <Text className="fade-in-left">For a meaningful change</Text>
        </SlideContent>
      </SwiperSlide>
      <SwiperSlide>
        <SlideContent>
          <StyledImage
            src="https://images.unsplash.com/photo-1470137430626-983a37b8ea46?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="잔디 이미지"
          />
          <Text className="fade-in-top">Inspiring a green future</Text>
        </SlideContent>
      </SwiperSlide>
      <SwiperSlide>
        <SlideContent>
          <StyledImage
            src="https://images.unsplash.com/photo-1596987851982-3b90e09ab4ac?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="울창한 숲 이미지"
          />
          <Text className="fade-in-right">Sustainable Fashion</Text>
        </SlideContent>
      </SwiperSlide>
    </Swiper>
  );
}

const SlideContent = styled.div`
  position: relative;
  height: 100vh;
  width: 100%;
`;

const fadeInTop = keyframes`
  from {
    opacity: 0;
    transform: translateY(-130px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-130px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const fadeInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(130px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const StyledImage = styled.img`
  width: 100%;
  max-height: 100vh;
  object-fit: cover;
`;

const Text = styled.div`
  text-transform: uppercase;
  position: absolute;
  top: 50%;
  color: white;
  transform: translateY(0);
  font-size: 2.2rem;
  padding: 0 2rem;
  text-align: center;

  &.fade-in-left {
    animation: ${fadeInLeft} 1s ease-out 0.5s;
  }

  &.fade-in-top {
    animation: ${fadeInTop} 1s ease-out 0.5s;
  }

  &.fade-in-right {
    animation: ${fadeInRight} 1s ease-out 0.5s;
  }
`;
