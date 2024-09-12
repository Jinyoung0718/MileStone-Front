import { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { Link } from "react-router-dom";

export default function ProductionSection() {
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

    if (ref.current) {
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
          <ImageContainer>
            <StyledImage
              src="https://images.unsplash.com/photo-1545064931-b20012fe04e8?q=80&w=2535&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Nature"
            />
          </ImageContainer>
          <IntroTextContainer>
            <Divider />
            <IntroText $isVisible={isVisible}>
              Milestone's Upcycling Collection
            </IntroText>
            <SubText $isVisible={isVisible}>
              Milestone은 업사이클링을 통해 폐기물을 창의적이고 의미 있는 예술 상품으로 재창조하였으며, 더 좋은 질과 더 나은 길을 제시하고자 합니다.
            </SubText>
            <StyledButton $isVisible={isVisible} to="/Products">
              More...
            </StyledButton>
          </IntroTextContainer>
        </ContentContainer>
      </FullHeightSection>
    </div>
  );
}

const FullHeightSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 90vh;
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
  left: -5rem;
  top: 50%;
  transform: translateY(-52%);
  height: 190%;
  border: none;
  border-right: 1px solid #333;
`;

const RightToleftAnimation = keyframes`
  from {
    transform: translateX(40%);
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
      animation: ${RightToleftAnimation} 1s ease-out;
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
      animation: ${RightToleftAnimation} 1s ease-out;
    `}
`;

const ImageContainer = styled.div`
  max-width: 40%;
  text-align: center;
  margin-right: 4rem;
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
      animation: ${RightToleftAnimation} 1s ease-out;
    `}
`;
