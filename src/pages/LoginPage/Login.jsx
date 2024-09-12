import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      await axios.post(
        'http://localhost:8080/api/members/login',
        { userEmail: email, userPassword: password },
        { withCredentials: true }
      );
  
      setIsLoggedIn(true);
      navigate('/');
    } catch (error) {
      const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
  
      if (errorMessage.includes('비활성화된 계정입니다')) {
        const shouldReactivate = window.confirm('비활성화된 계정입니다. 복구하시겠습니까?');
        if (shouldReactivate) {
          try {
            await axios.post(
              'http://localhost:8080/api/members/reactivate',
              { userEmail: email, userPassword: password },
              { withCredentials: true }
            );
            alert('계정이 복구되었습니다. 다시 로그인해주세요.');
          } catch (reactivateError) {
            alert('계정 복구에 실패했습니다.');
          }
        }
      } else {
        alert('로그인 실패: ' + errorMessage);
      }
    }
  };
  

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleLogin}>
        <Title>Log in</Title>
        <Input 
          type="email" 
          placeholder="이메일" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          id="email"  
          name="email"  
          autoComplete="email"  
        />
        <Input 
          type="password" 
          placeholder="비밀번호" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          id="password"  
          name="password"  
          autoComplete="current-password"  
        />
        <Button type="submit">로그인</Button>
        <Link to="/signup">
          <Button2 type="button">회원가입</Button2>
        </Link>
      </LoginForm>
    </LoginContainer>
  );  
}

export default Login;

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
`;

const LoginForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 300px;
  gap: 20px;
  background-color: white;
  padding: 40px;
  border-radius: 5px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const Input = styled.input`
  padding: 15px;
  border: 2px solid #ddd;
  background-color: white;
  color: #333;
  border-radius: 5px;

  ::placeholder {
    color: #bbb;
  }
`;

const Button = styled.button`
  padding: 15px;
  border: none;
  background-color: black;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgb(40, 40, 40);
  }
`;

const Button2 = styled.button`
  width: 18.8rem;
  padding: 15px;
  border-radius: 5px;
  background-color: white;
  color: black;
  border: 2px solid black;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgb(240, 240, 240);
  }
`;
