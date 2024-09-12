import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { RiDeleteBack2Line } from "react-icons/ri";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/cart', { withCredentials: true });
      setCartItems(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveFromCart = async (cartItemId) => {
    try {
        await axios.delete(`http://localhost:8080/api/cart/${cartItemId}`, { withCredentials: true });
        setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
    } catch (error) {
        console.error(error);
    }
};

  const handleSelectItem = (cartItemId) => {
    setSelectedItems(prevSelected => {
      if (prevSelected.includes(cartItemId)) {
        return prevSelected.filter(id => id !== cartItemId);
      } else {
        return [...prevSelected, cartItemId];
      }
    });
  };

  const handleProceedToOrder = async () => {
    const selectedCartItemIds = selectedItems.length > 0
      ? selectedItems
      : cartItems.map(item => item.id);

    try {
      const response = await axios.post('http://localhost:8080/api/order/fromCart', selectedCartItemIds, { withCredentials: true });
      console.log("Order Data from Response:", response.data);
      navigate('/order', { state: { orderData: response.data } });
    } catch (error) {
      console.error(error);
    }
  };

  if (cartItems.length === 0) {
    return <EmptyMessage>장바구니에 상품이 없습니다</EmptyMessage>;
  }

  return (
    <CartContainer>
      <CartHeader>
          <SelectionInfo>선택하신 상품들만 따로 선택 후 주문을 누르시면 해당 상품만 주문 가능합니다. 아무 것도 선택하지 않을 시, 전체 상품이 주문됩니다.</SelectionInfo>
      </CartHeader>
      {cartItems.map(item => (
        <CartItem 
          key={item.id}
          selected={selectedItems.includes(item.id)} 
          onClick={() => handleSelectItem(item.id)}
        >
          <CartItemDetails>
            <CartItemImage src={item.productImg} />
            <CartItemInfo>
              <CartItemName>{item.productName}</CartItemName> 
              <CartItemOption>{item.productOption.color} / {item.productOption.size}</CartItemOption>
              <CartItemQuantity>수량: {item.quantity}</CartItemQuantity>
            </CartItemInfo>
          </CartItemDetails>
          <RemoveButton onClick={(e) => { e.stopPropagation(); handleRemoveFromCart(item.id); }}>
            <RiDeleteBack2Line size={"1.3rem"} />
          </RemoveButton>
        </CartItem>
      ))}
      <ButtonContainer>
        <ProceedToOrderButton onClick={handleProceedToOrder}>Order</ProceedToOrderButton>
      </ButtonContainer>
    </CartContainer>
  );
};

export default CartPage;

const CartContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 75rem;
  margin: 7rem auto;
  padding: 1rem;
`;

const CartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const SelectionInfo = styled.span`
  color: #888;
  font-size: 0.9rem;
`;

const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ddd;
  margin-bottom: 1rem;
  border-radius: 5px;
  background-color: ${props => (props.selected ? '#e0e0e0' : '#fff')};
  cursor: pointer;
`;

const CartItemDetails = styled.div`
  display: flex;
  align-items: center;
`;

const CartItemImage = styled.img`
  width: 6rem;
  height: 8rem;
  object-fit: cover;
  margin-right: 1rem;
`;

const CartItemInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const CartItemName = styled.p`
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
`;

const CartItemOption = styled.p`
  margin: 0.2rem 0;
  font-size: 0.9rem;
`;

const CartItemQuantity = styled.p`
  margin: 0;
  font-size: 0.9rem;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: #6f6666;
  }
`;

const EmptyMessage = styled.p`
  font-size: 1rem;
  text-align: center;
  color: black;
  margin-top: 22rem;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 1rem;
`;

const ProceedToOrderButton = styled.button`
  background-color: black;
  color: white;
  padding: 0.7rem 3rem;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  font-size: 0.85rem;

  &:hover {
    background-color: #333;
  }
`;
