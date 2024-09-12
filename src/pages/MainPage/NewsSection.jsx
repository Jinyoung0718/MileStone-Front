import { useState, useEffect, useRef } from "react";
import styled, { keyframes, css } from "styled-components";
import { Link } from "react-router-dom";

export default function NewsSection() {
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
          <IntroTextContainer>
            <IntroText $isVisible={isVisible}>
              MileStone`s Inquiry
            </IntroText>
            <SubText $isVisible={isVisible}>        
              Milestone은 1 대1 문의에 상시 대기중이며, 언제든지 편하게 문의주시면 됩니다.
            </SubText>
            <StyledButton $isVisible={isVisible} to="/inquiry">
              More...
            </StyledButton>
            <Divider />
          </IntroTextContainer>
          <ImageContainer>
            <StyledImage
              src="https://images.unsplash.com/photo-1569688356467-21c75ed73e16?q=80&w=2574&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
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
  right: -1rem;
  top: 50%;
  transform: translateY(-52%);
  height: 280%;
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
  max-width: 37%;
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
