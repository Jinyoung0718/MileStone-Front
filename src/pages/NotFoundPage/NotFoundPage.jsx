import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundPage = () => {
  return (
    <Container>
      <Content>
        <Title>404</Title>
        <Subtitle>페이지를 찾을 수 없습니다</Subtitle>
        <Message>요청하신 페이지를 찾을 수 없습니다. 주소를 확인하거나, 아래 버튼을 눌러 홈으로 돌아가세요.</Message>
        <HomeLink to="/">홈으로 돌아가기</HomeLink>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 75vh;
`;

const Content = styled.div`
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 10px;
`;

const Title = styled.h1`
  font-size: 6rem;
  margin-bottom: 1rem;
  color: #ff6b6b;
`;

const Subtitle = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #333;
`;

const Message = styled.p`
  font-size: 1rem;
  margin-bottom: 2rem;
  color: #666;
`;

const HomeLink = styled(Link)`
  font-size: 0.9rem;
  color: white;
  background-color: black;
  padding: 0.8rem 1rem;
  text-decoration: none;
  border-radius: 3px;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #333;
  }
`;

export default NotFoundPage;
