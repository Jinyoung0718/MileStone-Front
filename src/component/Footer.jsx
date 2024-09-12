import React from "react";
import styled from "styled-components";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <FooterContainer>
      <SocialMediaLinks>
        <SocialLink href="#">
          <FaFacebook />
        </SocialLink>
        <SocialLink href="#">
          <FaTwitter />
        </SocialLink>
        <SocialLink href="#">
          <FaInstagram />
        </SocialLink>
        <SocialLink href="#">
          <FaLinkedin />
        </SocialLink>
      </SocialMediaLinks>

      <FooterText>© 2024 Milestone. All rights reserved.</FooterText>
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  padding: 3rem 1rem;
  background-color: #333;
  color: white;
  text-align: center;
  font-size: 0.9rem;
`;

const SocialMediaLinks = styled.div`
  font-size: 1.5rem;
  margin-top: 1rem;
`;

const SocialLink = styled.a`
  color: white;
  margin: 0 0.5rem;

  &:hover {
    color: #ddd;
  }
`;

const FooterText = styled.p`
  margin-top: 2rem;
`;
