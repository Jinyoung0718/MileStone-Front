import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []); 

  const fetchProducts = async (category = '') => {
    try {
      const response = category
        ? await axios.get(`http://localhost:8080/api/products/category/${category}`, { withCredentials: true })
        : await axios.get('http://localhost:8080/api/products', { withCredentials: true });
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    setCategories(['Outerwear', 'Tops', 'Accessories']);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchProducts(category);
  };

  return (
    <Container>
      <Sidebar>
        <CategoryList>
          <CategoryItem
            selected={selectedCategory === ''}
            onClick={() => handleCategoryChange('')}
          >
            All
          </CategoryItem>
          {categories.map(category => (
            <CategoryItem
              key={category}
              selected={category === selectedCategory}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </CategoryItem>
          ))}
        </CategoryList>
      </Sidebar>
      <ProductGrid>
        {products.map(product => (
          <ProductCard key={product.id}>
            <StyledLink to={`/products/${product.id}`}>
              <ProductImage src={product.productImg} alt={product.name} />
              <ProductName>{product.name}</ProductName>
              <ProductPrice>{product.price} ₩</ProductPrice>
            </StyledLink>
          </ProductCard>
        ))}
      </ProductGrid>
    </Container>
  );
};

export default ProductPage;

const Container = styled.div`
  display: flex;
`;

const Sidebar = styled.div`
  width: 12rem;
`;

const CategoryList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 5rem;  
`;

const CategoryItem = styled.li`
  padding: 10px;
  cursor: pointer;
  background-color: ${({ selected }) => (selected ? '#ddd' : 'transparent')};
  &:hover {
    background-color: #ddd;
  }
`;

const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
  gap: 10px;
  flex: 1;
  padding: 1.5rem;
  margin-top: 3.4rem;
`;

const ProductCard = styled.div`
  border: 1px solid #ddd;
  padding: 10px;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
`;

const ProductImage = styled.img`
  width: 100%;
  height: 20rem; 
  object-fit: cover;
  transition: transform 0.3s;

  ${ProductCard}:hover & {
    transform: scale(1.03);
  }
`;

const ProductName = styled.h3`
  margin: 10px 0;
  font-size: 1rem;
  color: black;
`;

const ProductPrice = styled.p`
  color: #555;
  margin: 0;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;

  &:hover ${ProductName}, &:hover ${ProductPrice} {
    color: inherit;
    text-decoration: none;
  }
`;
