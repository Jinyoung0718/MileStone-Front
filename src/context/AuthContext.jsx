import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const sessionId = Cookies.get('SESSIONID');
      if (sessionId) {
        try {
          const response = await axios.get('http://localhost:8080/api/members/status', {
            withCredentials: true,
          });

          const { memberStatus, userEmail } = response.data;
          setIsLoggedIn(true);
          setIsAdmin(memberStatus === 'ADMIN');
          setUserEmail(userEmail);
        } catch (error) {
          console.error('세션 확인 중 오류 발생:', error);
          setIsLoggedIn(false);
          setIsAdmin(false);
          setUserEmail(null);
          Cookies.remove('SESSIONID');
          alert('세션이 만료되었습니다. 다시 로그인 해주세요.');
          navigate('/login');
        }
      } else {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUserEmail(null);
      }
    };

    checkSession();
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, setIsLoggedIn, userEmail}}>
      {children}
    </AuthContext.Provider>
  );
};
