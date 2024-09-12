import React, { useContext, useEffect, useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { GiShoppingCart } from "react-icons/gi";
import { FaBell } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import Cookies from 'js-cookie';

const Navbar = () => {
  const { isLoggedIn, isAdmin, setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const wsNotificationRef = useRef(null);
  const wsOrderStatusRef = useRef(null);
  const wsCommentNoticeRef = useRef(null);
  const wsOffline = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

    useEffect(() => {
      const sessionId = Cookies.get('SESSIONID');
      if (sessionId) {
        setIsLoggedIn(true);
      } else{
        setIsLoggedIn(false);
      }
    }, [setIsLoggedIn]);


  const fetchRooms = useCallback(async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/chat/admin/rooms', { withCredentials: true });
      console.log("방 목록 업데이트:", response.data);
    } catch (error) {
      console.error('방 목록을 불러오는 중 오류 발생:', error);
    }
  }, []);
  
  // WebSocket 연결
  useEffect(() => {
    const connectWebSocket = (url, ref, handleMessage) => {
      if (!isLoggedIn) return;
      
      ref.current = new WebSocket(url);  
    
      ref.current.onopen = () => {
        console.log("WebSocket 연결이 열렸습니다:", url);
      };
    
      ref.current.onmessage = (message) => {
        console.log("WebSocket 메시지 수신:", message.data);
        handleMessage(message);
      };
    
      ref.current.onclose = () => {
        console.log("WebSocket 연결이 닫혔습니다:", url);
      };
    
      ref.current.onerror = (error) => {
        console.error("WebSocket 오류:", error);
      };
    };

  // 알림 WebSocket 연결
  const connectNotificationWebSocket = () => {
    connectWebSocket('ws://localhost:8080/ws/chat/notifications', wsNotificationRef, (message) => {
      try {
        const data = JSON.parse(message.data);
        if (data.message.includes("상담 요청")) {
          fetchRooms();}
          setNotifications((prevNotifications) => [
          ...prevNotifications,
          { id: uuidv4(), message: data.message }, 
        ]);
        setHasNewNotification(true); 
      } catch (error) {
        console.error("메시지 파싱 오류:", error);
      }
    });
  };

  // 주문 상태 WebSocket 연결
  const connectOrderStatusWebSocket = () => {
    connectWebSocket('ws://localhost:8080/ws/order-status', wsOrderStatusRef, (message) => {
      const data = message.data;
      if (data.includes('주문 상태')) {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          { id: uuidv4(), message: message.data },
        ]);
        setHasNewNotification(true);
      }
    });
  };

  // 댓글 알림 WebSocket 연결
  const connectCommentNoticeWebSocket = () => {
    connectWebSocket('ws://localhost:8080/ws/comment-notice', wsCommentNoticeRef, (message) => {
      const data = message.data;
      if (data.includes('새로운 대댓글')) {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          { id: uuidv4(), message: message.data },
        ]);
        setHasNewNotification(true);
      }
    });
  };

  // 오프라인 웹 소켓
  const connectOfflineWebSocket = () => {
    connectWebSocket("ws://localhost:8080/ws/offline", wsOffline, (message) => {
      let data;

      try {
        data = JSON.parse(message.data);
      } catch (error) {
        data = message.data;
      }

      if (typeof data === 'object' && data.message) {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          { id: uuidv4(), message: data.message }, 
        ]);
      } else if (typeof data === 'string') {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          { id: uuidv4(), message: data }, 
        ]);
      }

      setHasNewNotification(true);
    });
  };
  
  if (isLoggedIn) {
    connectOrderStatusWebSocket();
    connectCommentNoticeWebSocket();
    connectOfflineWebSocket()
    if (isAdmin) {
      connectNotificationWebSocket();
    }
  }
}, [isLoggedIn, isAdmin, fetchRooms]);


  const handleLogout = async () => {
    try {
      if (wsNotificationRef.current) wsNotificationRef.current.close();
      if (wsOrderStatusRef.current) wsOrderStatusRef.current.close();
      if (wsCommentNoticeRef.current) wsCommentNoticeRef.current.close();
      if (wsOffline.current) wsOffline.current.close();
  
      await axios.post("http://localhost:8080/api/members/logout", {}, { withCredentials: true });
      setIsLoggedIn(false);
      Cookies.remove('SESSIONID');
      navigate("/");
    } catch (error) {
      const errorMessage = error.response && error.response.data ? JSON.stringify(error.response.data) : error.message;
      alert(`로그아웃 실패: ${errorMessage}`);
    }
  };
  

  const handleRemoveNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(prevNotifications => prevNotifications.filter(notification => notification.id !== id));
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  useEffect(() => {
    if (isDropdownOpen) {
      setHasNewNotification(false);
    }
  }, [isDropdownOpen]);
  
  const handleClearAllNotifications = (e) => {
    e.stopPropagation();
    setNotifications([]); 
    setHasNewNotification(false); 
  };


  return (
    <NavContainer $isScrolled={isScrolled}>
      <NavHeader>
        <NavLogo to="/" style={{ color: "black", textDecoration: "none" }}>
          Milestone
        </NavLogo>
        <NavLinkContainer>
          <StyledLink to="/MyPage">MyPage</StyledLink>
          <StyledLink to="/inquiry">Inquiry</StyledLink>
          <StyledLink to="/products">Product</StyledLink>
          <StyledLink to="/notice">Notice</StyledLink>
          <StyledLink to="/wishlist">WishList</StyledLink>
          {isLoggedIn ? (
            <>
              <LoginButton $isScrolled={isScrolled} onClick={handleLogout}>Logout</LoginButton>
              <CartIcon>
                <Link to="/cart">
                  <GiShoppingCart style={{color:'black'}} size={"2.6rem"} />
                </Link>
                <BellIcon onClick={toggleDropdown}>
                  <FaBell size={"2rem"}/>
                  {hasNewNotification && (
                    <NotificationBadge>{notifications.length}</NotificationBadge>
                  )}
                  {isDropdownOpen && (
                    <NotificationDropdown>
                      {notifications.length > 0 ? (
                        <>
                          {notifications.map((notification) => (
                            <NotificationItem key={notification.id}>
                              {notification.message}
                              <RemoveButton onClick={(e) => handleRemoveNotification(notification.id, e)}>X</RemoveButton>
                            </NotificationItem>
                          ))}
                          <ClearAllButton onClick={handleClearAllNotifications}>Clear All</ClearAllButton> 
                        </>
                      ) : (
                        <NotificationItem>소식이 없습니다.</NotificationItem>
                      )}
                    </NotificationDropdown>
                  )}
                </BellIcon>
              </CartIcon>
            </>
          ) : (
            <Link to="/login">
              <LoginButton $isScrolled={isScrolled}>Login</LoginButton>
            </Link>
          )}
        </NavLinkContainer>
      </NavHeader>
    </NavContainer>
  );
};

export default Navbar;


const NavContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: ${({ $isScrolled }) => ($isScrolled ? 'rgba(194, 184, 184, 0.7)' : 'transparent')};
  position: fixed; 
  width: 100%; 
  top: 0;
  z-index: 2; 
`;

const NavHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 85%;
`;

const NavLogo = styled(Link)`
  font-size: 1.8rem;
  font-weight: bold;
  color: black; 
  text-decoration: none;
`;

const NavLinkContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem; 
  align-items: center;
`;

const StyledLink = styled(Link)`
  position: relative;
  color: black;
  text-decoration: none;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: black;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  &:hover::after {
    transform: translateX(0);
  }
`;

const LoginButton = styled.button`
  padding: 10px 20px;
  border: none;
  background-color: ${({ $isScrolled }) => ($isScrolled ? 'white' : 'black')};
  color: ${({ $isScrolled }) => ($isScrolled ? 'black' : 'white')};
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
`;

const CartIcon = styled.div`
  display: flex;
  align-items: center;
  color: black; 
`;

const BellIcon = styled.div`
  position: relative;
  margin-left: 1rem;
  cursor: pointer;
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  background-color: black;
  color: white;
  border-radius: 50%;
  padding: 0.2rem 0.5rem;
  font-size: 0.7rem;
  transform: translate(50%, -50%);
`;

const NotificationDropdown = styled.div`
  position: absolute;
  padding: 0.5rem;
  top: 150%;
  right: 0;
  background-color: black;
  border-radius: 4px;
  width: 20rem;
  max-height: 15rem;
  overflow-y: auto;
  z-index: 1;
`;

const NotificationItem = styled.div`
  padding: 10px;
  border-bottom: 1px solid #eee;
  font-size: 0.7rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
`;

const RemoveButton = styled.button`
  background-color: transparent;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
  margin-left: 1rem;
`;

const ClearAllButton = styled.button`
  background-color: transparent;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 5px;
  width: 100%;
  text-align: center;
  margin-top: 0.5rem;
`;