import { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { Link } from "react-router-dom";

export default function IntruductionSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      {
        threshold: 0.3,
      }
    );

    if (currentRef) {
      observer.observe(ref.current);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref]);

  return (
    <div ref={ref}>
      <FullHeightSection>
        <ContentContainer>
          <IntroTextContainer>
            <IntroText $isVisible={isVisible}> Milestone...</IntroText>

            <SubText $isVisible={isVisible}>
            MileStone은 다양한 친환경 상품을 판매하며, 기존의 옷 제조과정는 달리 미래 지향적인 상품 제조방식을 택하고 있습니다. 
            </SubText>

            <SubText $isVisible={isVisible}>
              저희 쇼핑몰은 주문 내역, 주소록 관리와 배송 정보 등을 한눈에 확인하고 특히, 
              주소록에서 일반주소 고정주소로 나누어서 즐겨찾는 주소를 등록하여서 관리할 수 있게 하였습니다.
            </SubText>

            <StyledButton $isVisible={isVisible} to="/MyPage">
              More...
            </StyledButton>
            <Divider />
          </IntroTextContainer>
          <ImageContainer>
            <StyledImage
              src="https://images.unsplash.com/photo-1623252055581-a3ef2ffcefe7?q=80&w=2535&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Nature"
            />
          </ImageContainer>
        </ContentContainer>
      </FullHeightSection>
    </div>
  );
}

const FullHeightSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background-color: #f2f2f2;
  color: #333;
`;

const ContentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  width: 80%;
  max-width: 100rem;
`;

const IntroTextContainer = styled.div`
  max-width: 60%;
  position: relative;
`;

const Divider = styled.hr`
  position: absolute;
  right: -1rem;
  top: 50%;
  transform: translateY(-52%);
  height: 200%;
  border: none;
  border-right: 1px solid #333;
`;

const leftToRightAnimation = keyframes`
  from {
    transform: translateX(-40%);
  }
  to {
    transform: translateX(0);
  }
`;

const IntroText = styled.h1`
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  ${({ $isVisible }) =>
    $isVisible &&
    css`
      animation: ${leftToRightAnimation} 1s ease-out;
    `}
`;

const SubText = styled.p`
  font-size: 1.1rem;
  line-height: 1.5;
  max-width: 50rem;
  margin-bottom: 0.25rem;
  ${({ $isVisible }) =>
    $isVisible &&
    css`
      animation: ${leftToRightAnimation} 1s ease-out;
    `}
`;

const ImageContainer = styled.div`
  max-width: 40%;
  text-align: center;
`;

const StyledImage = styled.img`
  max-width: 100%;
  height: auto;
`;

const StyledButton = styled(Link)`
  display: inline-block;
  text-decoration: none;
  padding: 0.8rem 1.6rem;
  margin-top: 2rem;
  border-radius: 10px;
  background-color: black;
  color: white;
  border: none;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.3s;

  &:hover {
    background-color: #333;
    transform: translateY(-3px);
  }

  &:active {
    background-color: #0d33b3;
    transform: translateY(-1px);
  }

  ${({ $isVisible }) =>
    $isVisible &&
    css`
      animation: ${leftToRightAnimation} 1s ease-out;
    `}
`;
