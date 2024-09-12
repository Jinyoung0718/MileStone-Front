import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Pagination, Autoplay } from 'swiper/modules';
import { MdRateReview } from 'react-icons/md';
import { GrUpdate } from 'react-icons/gr';
import { RiDeleteBin5Fill } from 'react-icons/ri';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedOption, setSelectedOption] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [openSection, setOpenSection] = useState(null);
  const [reviewContent, setReviewContent] = useState('');
  const [editingReview, setEditingReview] = useState(null);
  const [errorMessage] = useState('');

  useEffect(() => {
    fetchProduct();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/products/${id}`, { withCredentials: true });
      setProduct(response.data);
    } catch (error) {
      setProduct(null);
    }
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const toggleSection = (sectionIndex) => {
    setOpenSection(openSection === sectionIndex ? null : sectionIndex);
  };

  const handleReviewChange = (e) => {
    setReviewContent(e.target.value);
  };

  const handleReviewSubmit = async () => {
    if (!reviewContent.trim()) {
      alert('리뷰 내용을 입력하세요.');
      return;
    }
  
    try {
      if (editingReview) {
        await axios.put(
          `http://localhost:8080/api/reviews/${editingReview.id}`,
          { content: reviewContent },
          { withCredentials: true }
        );
        setEditingReview(null);
      } else {
        await axios.post(
          'http://localhost:8080/api/reviews',
          {
            content: reviewContent,
            productId: id,
          },
          { withCredentials: true }
        );
      }
      setReviewContent('');
      fetchProduct();
    } catch (error) {
      if (error.response) {
        if (error.response.data) {
          alert(error.response.data); // 서버에서 제공한 메시지를 알림으로 표시
        } 
      }
    }
  };
  
  const handleReviewEdit = (review) => {
    setEditingReview(review);
    setReviewContent(review.content);
  };

  const handleReviewDelete = async (reviewId) => {
    try {
      await axios.delete(`http://localhost:8080/api/reviews/${reviewId}`, { withCredentials: true });
      fetchProduct();
    } catch (error) {
      if (error.response) {
        if (error.response.data) {
          alert(error.response.data); // 서버에서 제공한 메시지를 알림으로 표시
        } 
      }
    }
  };
  
  
  const handleWishlistAdd = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    if (wishlist.some(item => item.id === product.id)) {
      alert('이미 추가된 상품입니다');
      return;
    }
    wishlist.push(product);
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    alert('관심상품으로 등록했습니다');
  };

  const handleAddToCart = async () => {
    if (!selectedOption) {
      alert('옵션을 선택해주세요.');
      return;
    }
  
    try {
      await axios.post(
        'http://localhost:8080/api/cart/add',
        { productOptionId: selectedOption, quantity },  
        { withCredentials: true }
      );
      alert('장바구니에 추가되었습니다');
    } catch (error) {
      if (error.response.data.error) {
        alert(error.response.data.error);
      } 
    }
  };
  
  const handleDirectOrder = async () => {
    if (!selectedOption) {
        alert('옵션을 선택해주세요.');
        return;
    }

    try {
        const requestData = { 
            productOptionId: selectedOption, 
            quantity: quantity, 
            productName: product.name,
            price: product.price,
            productImg: product.productImg1 
        };

        const response = await axios.post(
            'http://localhost:8080/api/order/direct',
            requestData,
            { withCredentials: true }
        );
        navigate('/order', { state: { orderData: response.data } });
    } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
            alert(error.response.data.error); 
        }
    }
  };

  if (!product) {
    return <p>로딩 중</p>;
  }

  const productImages = [product.productImg1, product.productImg2, product.productImg3].filter(img => img);

  return (
    <DetailContainer>
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}
      <TopSection>
        <LeftPanel>
          <SwiperContainer>
            <Swiper
              effect="fade"
              loop={true}
              autoplay={{ delay: 2300, disableOnInteraction: false }}
              speed={500}
              modules={[EffectFade, Pagination, Autoplay]}
            >
              {productImages.map((image, index) => (
                <SwiperSlide key={index}>
                  <ProductImage src={image} alt={`${product.name} detail image ${index + 1}`} />
                </SwiperSlide>
              ))}
            </Swiper>
          </SwiperContainer>
        </LeftPanel>
        <RightPanel>
          <ProductName>{product.name}</ProductName>
          <ProductPrice>판매가: {product.price} ₩</ProductPrice>
          <ProductDescription>{product.description}</ProductDescription>
          <OptionsContainer>
            <OptionRow>
              <OptionLabel htmlFor="product-option">옵션 선택</OptionLabel>
              <OptionSelect id="product-option" value={selectedOption} onChange={handleOptionChange}>
                <option value="">- 옵션을 선택해 주세요 -</option>
                {product.productOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.color} / {option.size} / {option.stockQuantity}</option>
                ))}
              </OptionSelect>
            </OptionRow>
            <OptionRow>
              <OptionLabel htmlFor="product-quantity">수량</OptionLabel>
              <QuantityInput id="product-quantity" type="number" value={quantity} onChange={handleQuantityChange} min="1" />
            </OptionRow>
          </OptionsContainer>
            <PurchaseButton onClick={handleDirectOrder}>바로 구매하기</PurchaseButton>
            <ButtonFlex>
              <AddToCartButton onClick={handleAddToCart}>장바구니 담기</AddToCartButton>
              <WishlistButton onClick={handleWishlistAdd}>관심상품 등록</WishlistButton>
            </ButtonFlex>
          <Accordion>
            <AccordionItem>
              <AccordionHeader onClick={() => toggleSection(0)}>
                <span>배송 정보</span>
                <Icon className={openSection === 0 ? 'rotate' : ''}>›</Icon>
              </AccordionHeader>
              <AccordionContent className={openSection === 0 ? 'active' : ''}>
                <StyledParagraph>배송 방법 : 택배</StyledParagraph>
                <StyledParagraph>배송 지역 : 전국지역</StyledParagraph>
                <StyledParagraph>배송 비용 : 3,000</StyledParagraph>
                <StyledParagraph>배송 기간 : 1일 ~ 7일</StyledParagraph>
                <StyledParagraph>배송 안내 : - 산간벽지나 도서지방은 별도의 추가금액을 지불하셔야 하는 경우가 있습니다.</StyledParagraph>
                <StyledParagraph>고객님께서 주문하신 상품은 입금 확인후 배송해 드립니다. 다만, 상품종류에 따라서 상품의 배송이 다소 지연될 수 있습니다.</StyledParagraph>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem>
              <AccordionHeader onClick={() => toggleSection(1)}>
                <span>교환 및 반품 안내</span>
                <Icon className={openSection === 1 ? 'rotate' : ''}>›</Icon>
              </AccordionHeader>
              <AccordionContent className={openSection === 1 ? 'active' : ''}>
                <StyledParagraph>교환 및 반품 주소</StyledParagraph>
                <StyledParagraph>- 충청남도 천안시 동남구 백석대학로 1 </StyledParagraph>
                <StyledParagraph>교환 및 반품이 가능한 경우</StyledParagraph>
                <StyledParagraph>상품을 공급 받으신 날로부터 7일 이내 단, 포장을 개봉하였거나 포장이 훼손되어 상품 가치가 상실된 경우에는 교환/반품이 불가능합니다.</StyledParagraph>
                <StyledParagraph>공급받으신 상품 및 용역의 내용이 표시, 광고 내용과 다르거나 다르게 이행된 경우에는 공급받은 날로부터 3월 이내, 그 사실을 알게 된 날로부터 30일 이내</StyledParagraph>
                <StyledParagraph> 교환 및 반품이 불가능한 경우</StyledParagraph>
                <StyledParagraph>고객님의 책임 있는 사유로 상품 등이 멸실 또는 훼손된 경우. 단, 상품의 내용을 확인하기 위하여 포장 등을 훼손한 경우는 제외</StyledParagraph>
                <StyledParagraph> 고객님의 마음이 바뀌어 교환, 반품을 하실 경우 상품반송 비용은 고객님께서 부담하셔야 합니다. (색상 교환, 사이즈 교환 등 포함)</StyledParagraph>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem>
              <AccordionHeader onClick={() => toggleSection(2)}>
                <span>환불 안내</span>
                <Icon className={openSection === 2 ? 'rotate' : ''}>›</Icon>
              </AccordionHeader>
              <AccordionContent className={openSection === 2 ? 'active' : ''}>
                <StyledParagraph>환불시 반품 확인여부를 확인한 후 3영업일 이내에 결제 금액을 환불해 드립니다.</StyledParagraph>
                <StyledParagraph>신용카드로 결제하신 경우는 신용카드 승인을 취소하여 결제 대금이 청구되지 않게 합니다.</StyledParagraph>
                <StyledParagraph>(단, 신용카드 결제일자에 맞추어 대금이 청구될 수 있으며 이 경우 익월 신용카드 대금청구 시 카드사에서 환급처리됩니다.)</StyledParagraph>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </RightPanel>
      </TopSection>
      <ProductReviews>
        <ReviewTitle>PRODUCT REVIEW</ReviewTitle>
        {product.reviews.length === 0 ? (
          <NoReviewsMessage>아직 리뷰가 없습니다</NoReviewsMessage>
        ) : (
          product.reviews.map(review => (
            <Review key={review.id}>
              {editingReview && editingReview.id === review.id ? (
                <>
                  <ReviewTextarea
                    value={reviewContent}
                    onChange={handleReviewChange}
                    placeholder="내용을 입력하세요"
                  />
                  <ReviewSubmitIcon onClick={handleReviewSubmit}>
                    <GrUpdate />
                  </ReviewSubmitIcon>
                </>
              ) : (
                <>
                  <ReviewContent>{review.content}</ReviewContent>
                  <ReviewAuthor>{review.memberEmail}</ReviewAuthor>
                  <ReviewDate>{new Date(review.createdAt).toLocaleDateString()}</ReviewDate>
                  <ButtonGroup>
                    <EditButton onClick={() => handleReviewEdit(review)}>
                      <GrUpdate />
                    </EditButton>
                    <DeleteButton onClick={() => handleReviewDelete(review.id)}>
                      <RiDeleteBin5Fill />
                    </DeleteButton>
                  </ButtonGroup>
                </>
              )}
            </Review>
          ))
        )}
        <ReviewForm disabled={!!editingReview}>
          <ReviewTitle>WRITE REVIEW</ReviewTitle>
          <ReviewTextarea
            id="review-content" 
            name="reviewContent"  
            value={editingReview ? '' : reviewContent}
            onChange={handleReviewChange}
            placeholder="내용을 입력하세요"
            disabled={!!editingReview}
          />
          <ReviewSubmitIcon onClick={handleReviewSubmit} disabled={!!editingReview}>
            <MdRateReview />
          </ReviewSubmitIcon>
        </ReviewForm>
      </ProductReviews>
    </DetailContainer>
  );
};

export default ProductDetailPage;

const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 1rem;
  max-width: 75rem;
  margin: 5rem auto;
  gap: 20px;
`;

const TopSection = styled.div`
  display: flex;
  gap: 20px;
`;

const LeftPanel = styled.div`
  flex: 1;
  margin-top: 3rem;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 4rem 6rem;
  border-left: 1px solid #eaeaea;
  box-sizing: border-box;
`;

const SwiperContainer = styled.div`
  width: 100%;
  max-width: 36rem; 
`;

const ProductImage = styled.img`
  width: 100%; 
  height: auto; 
  object-fit: cover; 
  user-select: none;
`;

const ProductName = styled.h2`
  margin: 0;
  padding: 0;
  font-size: 1.5rem;
  font-weight: bold;
`;

const ProductPrice = styled.div`
  color: #333;
  font-size: 1.2rem;
  font-weight: 550;
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const ProductDescription = styled.p`
  font-size: 1rem;
  color: #666;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column; 
  margin-top: 2rem;
  user-select: none;
`;

const OptionLabel = styled.label`
  flex: 1;
`;

const OptionSelect = styled.select` 
  padding: 5px 5px;
  border: 1px solid #ccc; 
  width: 100%; 
  max-width: 20rem; 
  text-align: center;
  flex: 2; 
  &:focus {
    border-color: #007bff; 
    outline: none; 
  }
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  font-size: 1rem;
`;

const QuantityInput = styled.input`
  padding: 5px;
  border: 1px solid #ccc;
  text-align: center;
  flex: 2; 
  &:focus {
    border-color: #007bff;
    outline: none;
  }
`;

const PurchaseButton = styled(Link)`
  display: inline-block;
  background-color: black;
  color: white;
  padding: 8px 17px;
  border: none;
  cursor: pointer;
  margin-bottom: 2px;
  user-select: none;
  text-decoration: none; 
  text-align: center;
  margin-top: 1rem;

  &:hover {
    background-color: #333; 
    color: #ddd; 
  }
`;

const AddToCartButton = styled.button`
  background-color: transparent;
  color: black;
  margin-top: 8px;
  border: 0.5px solid black;
  padding: 0.5rem 3.2rem;
  cursor: pointer;

  &:hover {
    background-color: #f8f8f8; 
    color: #333;
  }
`;

const WishlistButton = styled.button`
  background-color: transparent;
  color: black;
  margin-top: 8px;
  border: 0.5px solid black;
  padding: 0.5rem 3.2rem;

  &:hover {
    background-color: #f8f8f8;
    color: #333; 
  }
`;

const ButtonFlex = styled.div`
  display: flex;
  align-items: center; 
  justify-content: space-between; 
`;

const AccordionHeader = styled.div`
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  &:hover {
    background-color: #e1e1e1;
  }
  &.active {
    background-color: #ddd;
  }
`;

const AccordionContent = styled.div`
  padding: 0.35rem 1rem;
  border-bottom: 1px solid #e1e1e1;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  max-height: 0;
  &.active {
    padding: 1rem;
    max-height: 62.5rem; 
  }
`;

const Icon = styled.span`
  font-size: 1.2rem;
  transition: transform 0.3s ease;
  user-select: none;
  &.rotate {
    transform: rotate(90deg);
  }
`;

const Accordion = styled.div`
  margin-top: 1.2rem;
`;

const AccordionItem = styled.div`
  user-select: none;
  &:not(:last-child) {
    ${AccordionHeader} {
      border-bottom: none;
    }
  }
`;

const StyledParagraph = styled.p`
  margin: 0.5rem 0;
  font-size: 0.8rem;
  line-height: 1.4;
`;

const ProductReviews = styled.div`
  margin-top: rem;
  width: 100%;
  max-width: 75rem;
`;

const ReviewTitle = styled.h3`
  margin-bottom: 1rem;
`;

const Review = styled.div`
  margin-bottom: 1rem;
  padding: 0.2rem;
  display: flex;
  flex-direction: column;
`;

const ReviewContent = styled.p`
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #333;
`;

const ReviewAuthor = styled.p`
  font-size: 0.8rem;
  color: #555;
  margin-bottom: 0.5rem;
`;

const ReviewDate = styled.p`
  font-size: 0.8rem;
  color: #aaa;
  margin-bottom: 0.5rem;
`;

const ReviewForm = styled.div`
  margin-top: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;  
`;

const ReviewTextarea = styled.textarea`
  width: 100%;
  max-width: 60rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const ReviewSubmitIcon = styled.button`
  align-self: flex-end;
  padding: 0.5rem;
  background-color: #020202;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #3e4143;
  }

  svg {
    width: 1rem;  
    height: 1rem;  
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const NoReviewsMessage = styled.p`
  color: gray;
  font-size: 0.9em;
`;

const EditButton = styled.button`
  padding: 0.5rem;
  background-color: #050505;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #2f2e2c;
  }

  svg {
    width: 1rem;  
    height: 1rem;  
  }
`;

const DeleteButton = styled.button`
  padding: 0.5rem;
  background-color: #050505;;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #2f2e2c;
  }

  svg {
    width: 1rem;  
    height: 1rem;  
  }
`;

const ErrorMessage = styled.div`
  color: red;
  font-size: 1rem;
  margin-bottom: 1rem;
  text-align: center;
`;
