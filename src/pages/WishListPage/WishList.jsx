import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { RiDeleteBin7Fill } from "react-icons/ri";
import { GiConfirmed } from "react-icons/gi";

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState(JSON.parse(localStorage.getItem('wishlist')) || []);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleRemoveFromWishlist = () => {
    const updatedWishlist = wishlist.filter(item => !selectedProducts.includes(item.id));
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setWishlist(updatedWishlist);
    setSelectedProducts([]);
    setIsSelectionMode(false);
  };

  const handleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter(id => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedProducts([]);
    }
  };

  return (
    <WishlistContainer>
      <Header>
        <Title>Wishlist</Title>
        <RemoveButton onClick={isSelectionMode ? handleRemoveFromWishlist : toggleSelectionMode}>
          {isSelectionMode ? <GiConfirmed /> : <RiDeleteBin7Fill />}
        </RemoveButton>
      </Header>
      {wishlist.length === 0 ? (
        <EmptyMessage>위시리스트가 비어 있습니다.</EmptyMessage>
      ) : (
        <ProductList>
          {wishlist.map(item => (
            <ProductWrapper key={item.id} to={isSelectionMode ? "#" : `/products/${item.id}`}>
          <Product
            onClick={(e) => {
              if (isSelectionMode) {
                e.preventDefault();
                handleProductSelection(item.id);
              }
            }}
            $isSelected={selectedProducts.includes(item.id)} 
          >
            <ProductImage src={item.productImg1} alt={item.name} />
            <ProductDetails>
              <ProductName>{item.name}</ProductName>
              <ProductPrice>{item.price.toLocaleString()}$</ProductPrice>
            </ProductDetails>
          </Product>
            </ProductWrapper>
          ))}
        </ProductList>
      )}
    </WishlistContainer>
  );
};

export default WishlistPage;

const WishlistContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 80%;
  margin: 7rem auto;
  padding: 0 2rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 1.3rem;
  color: #333;
  text-decoration-thickness: 0.8px;
`;

const RemoveButton = styled.button`
  background-color: #0e0d0d;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #3e3737;
  }

  svg {
    width: 1.2rem;
    height: 1.2rem;
  }
`;

const EmptyMessage = styled.p`
  font-size: 1rem;
  text-align: center;
  color: black;
  margin-top: 20vh;
`;

const ProductList = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  justify-items: center;
  width: 100%;
`;

const ProductWrapper = styled(Link)`
  margin-top: 1rem;
  text-decoration: none;
  width: 100%;
  max-width: 13rem;
  box-sizing: border-box;
`;

const Product = styled.div`
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  padding: 1rem;
  height: 21rem;
  border-radius: 0.8rem;
  background-color: ${props => (props.$isSelected ? '#e0e0e0' : '#fff')}; 
  width: 100%; 
  transition: background-color 0.3s;
`;

const ProductImage = styled.img`
  width: 100%; 
  height: 16rem;
  object-fit: cover;
  margin-bottom: 10px;
`;

const ProductDetails = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProductName = styled.h2`
  font-size: 1rem;
  margin: 0;
  color: #333;
  text-align: center;
`;

const ProductPrice = styled.p`
  font-size: 1rem;
  color: #666;
  margin: 0;
`;
