import React, { useContext, useEffect, useState, useRef, useCallback  } from 'react';
import { AuthContext } from "../../context/AuthContext";
import styled from 'styled-components';
import axios from 'axios';
import { FiMessageSquare} from 'react-icons/fi'; 
import { MdDeleteSweep } from "react-icons/md";

const InquiryPage = () => {
  
  const { isAdmin, userEmail} = useContext(AuthContext);
  const [rooms, setRooms] = useState([]); 
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isRequesting, setIsRequesting] = useState(false);
  const [roomId, setRoomId] = useState(null);
  const [messages, setMessages] = useState([]); 
  const [messageContent, setMessageContent] = useState("");

  const wsChatRef = useRef(null);
  const wsChatNotifiRef = useRef(null);
  
  const fetchRooms = useCallback(async () => {
    try {
      const response = isAdmin 
        ? await axios.get('http://localhost:8080/api/chat/admin/rooms', { withCredentials: true })
        : await axios.get('http://localhost:8080/api/chat/user/rooms', { withCredentials: true });
      setRooms(response.data);
    } catch (error) {
      console.error('방 목록을 불러오는 중 오류 발생:', error);
    }
  }, [isAdmin]); 

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]); 
  
  const connectWebSocket = useCallback((roomId) => {
    if (!wsChatRef.current) {
      wsChatRef.current = new WebSocket(`ws://localhost:8080/ws/chat`);
      wsChatRef.current.onmessage = (message) => {
        try {
          const data = JSON.parse(message.data);
          console.log("새로운 메시지:", data);
    
          if (data.message === "관리자가 상담 요청을 수락하였습니다") {
              setSelectedRoom({ roomId: data.roomId });
              setIsRequesting(false); 
              setMessages([]);
          } else if (data.message === "관리자가 채팅을 종료하였습니다") {
             setSelectedRoom(null); 
             fetchRooms(); 
           } else {
            setMessages((prevMessages) => [...prevMessages, data]);
            console.log("새로운 메시지:", data);
           }
         } catch (error) {
          console.error("메시지 파싱 오류:", error);
        }
       };
    }
  }, [fetchRooms])

  // 알림 WebSocket 연결
  useEffect(() => {
    const connectNotificationWebSocket = () => {
      if (!wsChatNotifiRef.current) {
        wsChatNotifiRef.current = new WebSocket(`ws://localhost:8080/ws/chat/notifications`);

        wsChatNotifiRef.current.onmessage = (message) => {
          const data = JSON.parse(message.data);

         if (data.message.includes("님이 상담 해드립니다")) {
            connectWebSocket(data.roomId);
          }
        };
     }
   };

    connectNotificationWebSocket();

   return () => {
        if (wsChatNotifiRef.current) {
          wsChatNotifiRef.current.close();
          wsChatNotifiRef.current = null;
        }
      };
    }, [connectWebSocket]);
    
    // 상담 종료 시 WebSocket 연결 해제
    const disconnectWebSocket = () => {
      if (wsChatRef.current) {
        wsChatRef.current.close();
        wsChatRef.current = null;
      }
    };
  
  // 문의 신청
  const handleApplyClick = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/chat/request', {}, { withCredentials: true });
      const newRoomId = response.data; 
      setRoomId(newRoomId);
      setIsRequesting(true);
      connectWebSocket(newRoomId);
    } catch (error) {
      alert(error.response.data);
    }
  };

  // 상담 취소
  const handleCancelClick = async () => {
    try {
      await axios.delete(`http://localhost:8080/api/chat/request/cancel/${roomId}`, { withCredentials: true });
      setIsRequesting(false); 
      setRoomId(null); 
    } catch (error) {
      console.error('상담 취소 중 오류 발생:', error);
    }
  };  

  // 상담 요청 수락
  const handleAcceptClick = async (roomId) => {
    try {
      await axios.patch(`http://localhost:8080/api/chat/request/${roomId}/accept`, {}, { withCredentials: true });
      setSelectedRoom({ roomId });
      setIsRequesting(false);
      connectWebSocket(roomId); 
      await fetchRooms();  
    } catch (error) {
      alert(error.response.data);
    }
  };

  // 상담 종료
  const handleEndChatClick = async (roomId) => {
    try {
      await axios.patch(`http://localhost:8080/api/chat/end/${roomId}`, {}, { withCredentials: true });
      setSelectedRoom(null);
      disconnectWebSocket(); 
      await fetchRooms();  
    } catch (error) {
      alert("채팅 종료 중 오류가 발생했습니다.");
    }
  };

  // 방 삭제 기능
  const handleDeleteRoom = async (roomId) => {
    try {
      await axios.delete(`http://localhost:8080/api/chat/${roomId}`, { withCredentials: true });
      alert("채팅방이 삭제되었습니다.");
      await fetchRooms();  
      setSelectedRoom(null);
    } catch (error) {
      alert("방 삭제 중 오류가 발생했습니다.");
    }
  };

  // 메시지 보내기
  const handleSendMessage = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/message/${selectedRoom.roomId}/send`,
        { content: messageContent },  
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    
      let chatMessageDTO = response.data;
      setMessages((prevMessages) => [...prevMessages, chatMessageDTO]);
      setMessageContent("");
    } catch (error) {
      alert("채팅방이 비활성화 상태입니다");
    }
  };

  // 방 선택
  const handleRoomSelect = async (room) => {
    setMessages([]);
    setSelectedRoom(room);
    setMessageContent([])
    
    try {
      const response = await axios.get(`http://localhost:8080/api/message/${room.roomId}/history`, { withCredentials: true });
      setMessages(response.data); 
    } catch (error) {
      console.error('이전 메시지를 불러오는 중 오류 발생:', error);
    }
  };

  return (
    <Container>
      <RoomList>
        <RoomListBody>
        {rooms.length > 0 ? (
          rooms.map((room) => (
            <RoomItem key={room.roomId} onClick={() => handleRoomSelect(room)} active={selectedRoom?.roomId === room.roomId}>
              {isAdmin ? (
                <RoomInfo onClick={() => handleAcceptClick(room.roomId)}>
                  사용자 이메일: {room.userEmail}
                </RoomInfo>
              ) : (
                <RoomItemContent>
                  <RoomInfo>Room: {room.createdAt}</RoomInfo>
                  <MdDeleteSweep onClick={(e) => {
                    e.stopPropagation(); 
                    handleDeleteRoom(room.roomId);
                  }}/>
                </RoomItemContent>
              )}
            </RoomItem>
          ))
        ) : (
          <NoRoomsMessage>불러올 방이 없습니다.</NoRoomsMessage>
        )}
        </RoomListBody>
        {!isAdmin && (
          <ApplyButton onClick={handleApplyClick}>
            <FiMessageSquare size={18} style={{ marginRight: '0.5rem' }} /> 문의 신청
          </ApplyButton>
            )}
      </RoomList>


      <ChatRoom>
        {selectedRoom ? (
          <ChatRoomContent>
            <ChatRoomContent>
            <ChatMessages>
              {messages.map((message, index) => (
                <Message 
                  key={index} 
                  right={message.senderEmail === userEmail}>
                  {message.content}
                </Message>
              ))}
            </ChatMessages>
          </ChatRoomContent>
            <ChatInputContainer>
              <ChatInput 
                placeholder="메시지를 입력하세요..." 
                value={messageContent} 
                style={isAdmin ? { width: '60%' } : {}}
                onChange={(e) => setMessageContent(e.target.value)} 
              />
              <SendButton onClick={handleSendMessage} style={isAdmin ? { width: '4.2%' } : {}}>전송</SendButton>
              {isAdmin && (
                <EndChatButton onClick={() => handleEndChatClick(selectedRoom.roomId)}>
                  종료
                </EndChatButton>
              )}
            </ChatInputContainer>
          </ChatRoomContent>
        ) : (
          <EmptyChatRoom>채팅방을 선택하세요</EmptyChatRoom>
        )}
      </ChatRoom>
      
      
      {isRequesting && (
        <RequestingOverlay>
          <RequestingMessage>상담 요청 중입니다...</RequestingMessage>
          <CancelButton onClick={handleCancelClick}>상담을 취소하시겠습니까?</CancelButton>
        </RequestingOverlay>
      )}
    </Container>
  );
};

export default InquiryPage;

const Container = styled.div`
  display: flex;
  height: 90vh;
  margin-top: 5rem;
  background-color: #ffffff;
`;

const RoomList = styled.div`
  width: 30%;
  max-width: 15rem;
  background-color: #f7f7f8;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e0e0e0;
`;

const RoomListBody = styled.div`
  padding: 8px;
  flex-grow: 1;
  overflow-y: auto;
`;

const NoRoomsMessage = styled.div`
  padding: 20px;
  text-align: center;
  color: #888;
`;

const RoomItem = styled.div`
  padding: 0.7rem;
  margin: 0.5rem 0;
  background-color: ${({ active }) => (active ? '#e0e0e0' : 'transparent')};
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  justify-content: space-between; 
  align-items: center;  
  transition: background-color 0.2s;
  &:hover {
    background-color: #d9d9d9;
  }
`;

const RoomItemContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const RoomInfo = styled.div`
  font-size: 0.9rem;
  color: #333;
`;

const ChatRoom = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
`;


const EmptyChatRoom = styled.div`
  font-size: 1rem;
  color: #888;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 6rem;
  height: 100%;
`;

const ChatRoomContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: 100%;
  overflow-y: auto;
`;


const ChatMessages = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
`;

const Message = styled.div`
  background-color: ${({ right }) => (right ? '#007aff' : '#e0e0e0')};
  color: ${({ right }) => (right ? '#ffffff' : '#000000')};
  padding: 12px;
  border-radius: 20px;
  max-width: 60%;
  align-self: ${({ right }) => (right ? 'flex-end' : 'flex-start')};
  margin-bottom: 10px;
  font-size: 0.85rem;
`;

const ChatInputContainer = styled.div`
  display: flex;
  padding: 16px;
  background-color: #f7f7f8;
  border-top: 1px solid #e0e0e0;
  align-items: center;
`;

const ChatInput = styled.input`
  flex-grow: 1;
  padding: 10px;
  border: none;
  border-radius: 20px;
  background-color: #f1f1f1;
  font-size: 0.85rem;
  &:focus {
    outline: none;
  }
`;


const SendButton = styled.button`
  background-color: #007aff;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  margin-left: 10px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #005bb5;
  }
`;

const ApplyButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 550;
  cursor: pointer;
  margin: 16px;
  transition: background-color 0.3s;
  &:hover {
    background-color: #005bb5;
  }
`;

const RequestingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 2;
`;

const RequestingMessage = styled.div`
  font-size: 1.25rem;
  color: white;
  margin-bottom: 20px;
`;

const CancelButton = styled.button`
  background-color: black;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.8rem;
`;

const EndChatButton = styled.button`
  background-color: #ff3b30; 
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 20px;
  margin-left: 10px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.3s;
  align-self: center;

  &:hover {
    background-color: #ff453a;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(255, 59, 48, 0.5);
  }
`;