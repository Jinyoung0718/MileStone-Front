import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaThList, FaSearch } from "react-icons/fa"; 
import AddressModal from '../MyPage/AddressModal ';

const OrderPage = () => {
  const [orderItems, setOrderItems] = useState([]);
  const [defaultAddress, setDefaultAddress] = useState({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.orderData;

  useEffect(() => {
    fetchDefaultAddress();
    if (orderData?.tempOrderItems) {
      setOrderItems(orderData.tempOrderItems);
      setTotalAmount(orderData.totalPrice);
    }
    loadIamportScript();
    return () => {
      if (location.pathname !== '/order') {
        setOrderItems([]);
      }
    };
  }, [orderData, location.pathname]);

  const loadIamportScript = () => {
    const script = document.createElement('script');
    script.src = "https://cdn.iamport.kr/js/iamport.payment-1.2.0.js";
    script.onload = () => {
      if (window.IMP) {
        window.IMP.init('imp00383216'); 
      } else {
        console.error('Iamport SDK 로딩 실패');
      }
    };
    script.onerror = () => {
      console.error('Iamport SDK 작동하지 않음');
    };
    document.head.appendChild(script);
  };

  const fetchDefaultAddress = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/addresses/default', {withCredentials: true});
      setDefaultAddress(response.data);
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  const handlePlaceOrder = async () => {
    if (!defaultAddress.userName || !defaultAddress.address || !defaultAddress.addressDetail || !defaultAddress.tel) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }
  
    try {
      const tempOrderDTO = {
        tempOrderItems: orderItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          productOption: {
            id: item.productOption.id,
            color: item.productOption.color,
            size: item.productOption.size
          },
          productImg: item.productImg,
          price: item.price
        })),
        totalPrice: totalAmount,
        requestMessage: defaultAddress.requestMessage || '',
        recipientName: defaultAddress.userName,
        deliveryAddress: defaultAddress.address,
        deliveryDetail: defaultAddress.addressDetail,
        deliveryZipcode: defaultAddress.zipcode,
        phoneNumber: defaultAddress.tel
      };
  
      const response = await axios.post('http://localhost:8080/api/order/place', tempOrderDTO, {
        withCredentials: true
      });
  
      const merchantUid = response.data;
      requestPay(merchantUid, defaultAddress.requestMessage);
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = Object.values(error.response.data).join("\n");
        alert(`주문 실패:\n${errorMessage}`);
      } else {
        alert("알 수 없는 오류가 발생했습니다.");
      }
    }
  };
  
  const requestPay = (merchantUid, requestMessage) => {
    const { IMP } = window;
    if (!IMP) {
      console.error('Iamport가 제대로 작동하지 않습니다');
      return;
    }

    IMP.request_pay({
      pg: 'html5_inicis',
      pay_method: 'card',
      merchant_uid: merchantUid,
      name: `주문명: ${orderItems.map(item => item.productName).join(', ')}`,
      amount: totalAmount,
      buyer_email: defaultAddress.userEmail,
      buyer_name: defaultAddress.userName,
      buyer_tel: defaultAddress.tel,
      buyer_addr: defaultAddress.address,
      buyer_postcode: defaultAddress.postcode,
      custom_data: {
        requestMessage: requestMessage 
      }
    }, rsp => {
      if (rsp.success) {
        handlePostVerification(rsp.imp_uid, merchantUid);
      } else {
        console.error(rsp.error_msg);
      }
    });
  };

  const handlePostVerification = async (imp_uid, merchantUid) => {
    try {
      const verificationResponse = await axios.post('http://localhost:8080/api/order/complete', {
        impUid: imp_uid,
        merchantUid
      }, {
        withCredentials: true
      });

      if (verificationResponse.data === "주문이 완료되었습니다") {
        alert('주문이 완료되었습니다');
        navigate('/');
      } 
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  const handleAddressChange = (e) => {
    setDefaultAddress({
      ...defaultAddress,
      [e.target.name]: e.target.value
    });
  };

  const handleOpenModal = () => {
    setIsAddressModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsAddressModalOpen(false);
  };

  const handleAddressSelect = (selectedAddress) => {
    setDefaultAddress(selectedAddress);
  };

  const openAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const { zonecode, address } = data;
        setDefaultAddress(prevData => ({
          ...prevData,
          zipcode: zonecode,
          address: address,
          addressDetail: ''
        }));
      }
    }).open();
  };

  if (orderItems.length === 0) {
    return <EmptyMessage>주문할 상품이 없습니다</EmptyMessage>;
  }

  return (
    <OrderContainer>
      <OrderSummary>
        <OrderTitle>주문 상품</OrderTitle>
        {orderItems.map(item => (
          <OrderItem key={item.id}>
            <OrderItemDetails>
              <OrderItemImage src={item.productImg} />
              <OrderItemInfo>
                <OrderItemName>{item.productName}</OrderItemName>
                <OrderItemOption>{item.productOption.color} / {item.productOption.size}</OrderItemOption>
                <OrderItemQuantity>수량: {item.quantity}</OrderItemQuantity>
                <OrderItemPrice>가격: {item.price} ₩</OrderItemPrice>
              </OrderItemInfo>
            </OrderItemDetails>
          </OrderItem>
        ))}
        <TotalAmount>Total Price: {totalAmount} ₩</TotalAmount>
      </OrderSummary>
      <OrderForm>
        <FormHeader>
          <FormTitle>배송 정보</FormTitle>
          <IconContainer>
            <OpenModalButton onClick={handleOpenModal}><FaThList /></OpenModalButton>
            <SearchButton onClick={openAddressSearch}><FaSearch /></SearchButton>
          </IconContainer>
        </FormHeader>

            <FormInput
              name="userName"
              value={defaultAddress.userName || ''}
              placeholder="주문자 성함"
              onChange={handleAddressChange}
              autoComplete="name"
            />

            <FormInput
              name="address"
              value={defaultAddress.address || ''}
              placeholder="주소"
              readOnly
              autoComplete="street-address" 
            />

            <FormInput
              name="addressDetail"
              value={defaultAddress.addressDetail || ''}
              onChange={handleAddressChange}
              placeholder="상세 주소"
              autoComplete="address-line2" 
            />

            <FormInput
              name="tel"
              value={defaultAddress.tel || ''}
              placeholder="핸드폰 번호"
              onChange={handleAddressChange}
              autoComplete="tel"
            />

            <FormTextarea
              name="requestMessage"
              placeholder="주문 시 요청 사항"
              onChange={handleAddressChange}
              autoComplete="off" 
            />


        <PlaceOrderButton onClick={handlePlaceOrder}>Pay for product</PlaceOrderButton>
      </OrderForm>
      {isAddressModalOpen && (
        <AddressModal onClose={handleCloseModal} onSelectAddress={handleAddressSelect} FetchDefaultAddress={fetchDefaultAddress} isOrderPage={true} />
      )}
    </OrderContainer>
  );
};

export default OrderPage;

const OrderContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 75rem;
  margin: 5rem auto;
  padding: 1rem;
`;

const OrderSummary = styled.div`
  padding: 1rem;
  margin-bottom: 2rem;
`;

const OrderTitle = styled.h2`
  font-weight: 300;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
`;

const OrderItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #ddd;
`;

const OrderItemDetails = styled.div`
  display: flex;
  align-items: center;
`;

const OrderItemImage = styled.img`
  width: 6rem;
  height: 8rem;
  object-fit: cover;
  margin-right: 1rem;
`;

const OrderItemInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const OrderItemName = styled.p`
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
`;

const OrderItemOption = styled.p`
  margin: 0.2rem 0;
  font-size: 0.9rem;
`;

const OrderItemQuantity = styled.p`
  margin: 0;
  font-size: 0.9rem;
`;

const OrderItemPrice = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: #333;
`;

const TotalAmount = styled.p`
  text-align: right;
  font-size: 1.1rem;
  margin-top: 1rem;
`;

const OrderForm = styled.div`
  padding: 1rem;
  width: 100%;
  max-width: 30rem;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const FormTitle = styled.h2`
  font-weight: 300;
  font-size: 1.2rem;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box; 
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box; 
`;

const PlaceOrderButton = styled.button`
  background-color: black;
  color: white;
  padding: 0.6rem 1.3rem;
  border: none;
  cursor: pointer;
  border-radius: 3px;
  margin-top: 1rem;
  align-self: flex-end;

  &:hover {
    background-color: #333;
  }
`;

const EmptyMessage = styled.p`
  font-size: 1rem;
  text-align: center;
  color: black;
  margin-top: 22rem;
`;

const OpenModalButton = styled.button`
  display: flex;
  background-color: white;
  color: black;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
`;

const IconContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SearchButton = styled.button`
  display: flex;
  background-color: white;
  color: black;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
`;
