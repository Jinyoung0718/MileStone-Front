import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';
import AddressModal from '../MyPage/AddressModal ';
import { AuthContext } from '../../context/AuthContext';
import { FaThList } from "react-icons/fa";
import { RiDeleteBack2Fill } from "react-icons/ri";

const MyPage = () => {
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const { setIsLoggedIn } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDefaultAddress();
    fetchOrders();
  }, []);

  const fetchDefaultAddress = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/addresses/default', {
        withCredentials: true,
      });
      setDefaultAddress(response.data);
    } catch (error) {
      console.error(error.response?.data || error.message); 
    }
  };
  


  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/order/orderList', {
        withCredentials: true,
      });
      const activeOrders = response.data.filter(order => order.status !== 'CANCELLED');
      setOrders(activeOrders);
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCancelOrder = async (orderId, status) => {
    if (status === "DELIVERED") {
      try {
        await axios.delete('http://localhost:8080/api/order/delete', {
          params: { orderId },
          withCredentials: true,
        });
        alert('주문이 삭제되었습니다.');
        setOrders((prevOrders) => prevOrders.filter(order => order.id !== orderId));
      } catch (error) {
        alert('주문 삭제에 실패했습니다.');
      }
    } else {
      try {
        await axios.post(
          'http://localhost:8080/api/order/cancel',
          null,
          {
            params: { orderId },
            withCredentials: true,
          }
        );
        alert('주문이 취소되었습니다.');
        fetchOrders();
      } catch (error) {
        alert('주문 취소에 실패했습니다.');
      }
    }
  };
  

  const handleUnregister = async () => {
    const confirmUnregister = window.confirm('정말로 회원 탈퇴를 하시겠습니까?');
    if (confirmUnregister) {
      try {
        await axios.patch('http://localhost:8080/api/members/unRegister', null, {
          withCredentials: true,
        });
        alert('회원 탈퇴가 완료되었습니다.');
        setIsLoggedIn(false);
        navigate('/');
      } catch (error) {
        alert('회원 탈퇴에 실패했습니다.');
      }
    }
  };

  const toggleOrderDetails = (orderId) => {
    setSelectedOrderId(selectedOrderId === orderId ? null : orderId);
  };

  return (
    <Container>
      <SectionContainer>
        <SectionTitle>고객 정보</SectionTitle>
        <ManageAddressButton onClick={handleOpenModal}><FaThList /></ManageAddressButton>
      </SectionContainer>
      {defaultAddress ? (
        <AddressSection>
          <AddressInfo>
            <AddressValue>이름:</AddressValue>
            <AddressValue>{defaultAddress.userName}</AddressValue>

            <AddressValue>이메일:</AddressValue>
            <AddressValue>{defaultAddress.userEmail}</AddressValue>

            <AddressValue>주소:</AddressValue>
            <AddressValue>{defaultAddress.address}</AddressValue>

            <AddressValue>상세 주소:</AddressValue>
            <AddressValue>{defaultAddress.addressDetail}</AddressValue>

            <AddressValue>전화번호:</AddressValue>
            <AddressValue>{defaultAddress.tel}</AddressValue>

            <AddressValue>가입일:</AddressValue>
            <AddressValue>{defaultAddress.registrationDate}</AddressValue>
          </AddressInfo>
        </AddressSection>
      ) : (
        <p>기본 주소가 설정되지 않았습니다.</p>
      )}

      {isModalOpen && (
        <AddressModal onClose={handleCloseModal} FetchDefaultAddress={fetchDefaultAddress} isOrderPage={false} />
      )}

      <SectionTitle>주문 내역</SectionTitle>
      {orders.length === 0 ? (
        <EmptyStateMessage>주문하신 내역이 없습니다</EmptyStateMessage>
      ) : (
        <OrderGrid>
          {orders.map(order => (
            <OrderCard key={order.id}>
              <DetailItem>주문 날짜: {order.orderDate}</DetailItem>
              <OrderItems onClick={() => toggleOrderDetails(order.id)}>
                {order.orderItems.map(item => (
                  <ProductItem key={item.id}>
                    <ProductImage src={item.productImg} alt={item.productName} />
                    <ProductInfo>
                      <ProductName>{item.productName}</ProductName>
                      <ProductOption>{item.productOption.color} / {item.productOption.size}</ProductOption>
                      <ProductPrice>{item.price} ₩</ProductPrice>
                      <ProductQuantity>수량: {item.quantity}</ProductQuantity>
                    </ProductInfo>
                  </ProductItem>
                ))}
              </OrderItems>
              {selectedOrderId === order.id && (
                <OrderDetails>
                  <DetailItem>Status: {order.status}</DetailItem>
                  <DetailItem>배송지: {order.deliveryAddress}</DetailItem>
                  <DetailItem>상세주소: {order.deliveryDetail}</DetailItem>
                  <DetailItem>수신자 전화번호: {order.phoneNumber}</DetailItem>
                  <DetailItem>수신자 성함: {order.recipientName}</DetailItem>
                  <DetailItem>배송 시 요청사항: {order.requestMessage}</DetailItem>
                  <CancelButton onClick={() => handleCancelOrder(order.id, order.status)}><RiDeleteBack2Fill /></CancelButton>
                </OrderDetails>
              )}
            </OrderCard>
          ))}
        </OrderGrid>
      )}
      <UnregisterButton onClick={handleUnregister}>회원 탈퇴</UnregisterButton>
    </Container>
  );
};

export default MyPage;


const Container = styled.div`
  padding: 2rem;
  margin: 6rem auto;
  max-width: 75rem;
  border-radius: 8px;
`;

const SectionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.p`
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
  margin: 0;
`;

const AddressSection = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0.8rem;
  margin-bottom: 2rem;
`;

const AddressInfo = styled.div`
  display: grid;
  grid-template-columns: 8rem 2fr; 
  gap: 0.8rem;  
`;

const AddressValue = styled.p`
  color: black;
  font-size: 0.9rem;
`;

const ManageAddressButton = styled.button`
  font-size: 1.5rem;
  color: black;
  border: none;
  cursor: pointer;
  background-color: white;
`;

const OrderGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
`;

const OrderCard = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #ddd;
`;

const OrderItems = styled.div`
  display: flex;
  gap: 1rem;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
`;

const ProductItem = styled.div`
  display: flex;
  align-items: center;
`;

const ProductImage = styled.img`
  width: 8rem;
  height: 10rem;
  object-fit: cover;
  border-radius: 2px;
`;

const ProductInfo = styled.div`
  margin-left: 1rem;
  display: flex;
  flex-direction: column;
`;

const ProductName = styled.p`
  color: #333;
`;

const ProductOption = styled.p`
  font-size: 0.875rem;
  color: #777;
`;

const ProductPrice = styled.p`
  font-size: 0.875rem;
  color: #333;
`;

const ProductQuantity = styled.p`
  font-size: 0.875rem;
  color: #333;
`;

const OrderDetails = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  border-top: 1px solid #ddd;
  animation: fadeIn 0.3s ease-in-out;
  display: flex;
  flex-direction: column;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const DetailItem = styled.p`
  font-size: 0.875rem;
  color: #333;
  margin: 0.5rem 0;
`;

const CancelButton = styled.button`
  background-color: white;
  color: black;
  font-size: 1.5rem;
  border: none;
  align-self: flex-start;
  margin-top: 1rem;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: red;
  }
`;

const EmptyStateMessage = styled.p`
  font-size: 1rem;
  color: #999;
  text-align: center;
  margin: 2rem 0;
`;

const UnregisterButton = styled.button`
  font-size: 0.8rem;
  margin-top: 3rem;
  padding: 0.5rem 2rem;
  background-color: grey;
  color: white;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  &:hover {
    background-color: black;
  }
`;
