import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPassword: '',
    address: '',
    addressDetail: '',
    tel: '',
    zipcode: '',
    isPhoneVerified: isPhoneVerified,
  });

  const [emailStatus, setEmailStatus] = useState({
    isValid: null,
    errorMessage: '',
  });

  const [phoneStatus, setPhoneStatus] = useState({
    isCodeSent: false,
    errorMessage: '',
  });
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerificationDisabled, setIsVerificationDisabled] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "userEmail") {
      setEmailStatus({ isValid: null, errorMessage: '' });
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!isPhoneVerified) {
      alert("휴대폰 인증이 필요합니다.");
      return;
    }

    if (emailStatus.isValid === false) {
      alert("이메일 인증이 필요합니다.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/members/signup", formData, { withCredentials: true });
      alert("회원가입이 성공적으로 처리되었습니다");
      navigate("/login");
    } catch (error) {
      const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
      alert(`회원가입 실패: ${errorMessage}`);
    }
};


  const validateEmail = async () => {
    try {
      await axios.post("http://localhost:8080/api/members/email", { email: formData.userEmail });
      setEmailStatus({ isValid: true, errorMessage: '' });
    } catch (error) {
      const errorMessage = typeof error.response?.data === 'string' 
        ? error.response.data 
        : error.response?.data?.email || "이메일 인증에 실패했습니다.";
        setEmailStatus({ isValid: false, errorMessage });
    }
  };

  const sendVerificationCode = async () => {
    try {
      await axios.post("http://localhost:8080/api/members/verification-code", { phoneNumber: formData.tel });
      setPhoneStatus({ isCodeSent: true, errorMessage: '' });
      alert("인증 코드가 발송되었습니다.");
    } catch (error) {
      const errorMessage = "인증 코드 발송에 실패했습니다.";
      setPhoneStatus({ isCodeSent: false, errorMessage });
    }
  };

  const verifyCode = async () => {
    try {
      const response = await axios.post("http://localhost:8080/api/members/verification-code/verify", {
        phoneNumber: formData.tel,
        verificationCode: verificationCode
      });
      if (response.status === 200) {
        setIsPhoneVerified(true);
        setIsVerificationDisabled(true);
        alert("휴대폰 인증이 완료되었습니다.");
      }
    } catch (error) {
      setPhoneStatus({ isCodeSent: true, errorMessage: "인증 실패. 올바른 인증 코드를 입력해주세요." });
    }
  };

  const openAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const { zonecode, address } = data;
        setFormData(prevData => ({
          ...prevData,
          zipcode: zonecode,
          address: address
        }));
      }
    }).open();
  };

  return (
    <SignupContainer>
      <SignupForm onSubmit={handleSignup}>
        <Title>Sign up</Title>
        <FormGroup>
          <FormRow>
            <Input 
              id="userName"
              name="userName" 
              type="text" 
              placeholder="가입자 이름" 
              value={formData.userName} 
              onChange={handleChange} 
              autoComplete="username"
              required 
            />
            <EmailInputWrapper>
              {emailStatus.isValid === false && <ErrorMessage>{emailStatus.errorMessage}</ErrorMessage>}
              <EmailInput
                id="userEmail" 
                name="userEmail" 
                type="email" 
                placeholder="Email" 
                value={formData.userEmail} 
                onChange={handleChange} 
                required 
                $isValid={emailStatus.isValid}
                autoComplete="email"
              />
              <EmailButton 
                type="button" 
                onClick={validateEmail} 
                $isValid={emailStatus.isValid}
                disabled={emailStatus.isValid === true}
              >
                {emailStatus.isValid ? "인증 완료" : "이메일 인증"}
              </EmailButton>
            </EmailInputWrapper>
          </FormRow>
          <FormRow>
            <Input 
              id="userPassword"
              name="userPassword" 
              type="password" 
              placeholder="비밀번호" 
              value={formData.userPassword} 
              onChange={handleChange} 
              autoComplete="new-password"
              required 
            />
            <PhoneInputWrapper>
              {phoneStatus.errorMessage && <ErrorMessage>{phoneStatus.errorMessage}</ErrorMessage>}
              <PhoneInput
                id="tel"
                name="tel" 
                type="text" 
                placeholder="전화 번호" 
                value={formData.tel} 
                onChange={handleChange} 
                autoComplete="tel"
                required 
                $isVerified={isPhoneVerified}
              />
              <PhoneButton
                type="button"
                onClick={sendVerificationCode}
                $isVerified={isPhoneVerified}
                disabled={isVerificationDisabled}
              >
                {isPhoneVerified ? "인증 완료" : "인증 코드"}
              </PhoneButton>
            </PhoneInputWrapper>
          </FormRow>
          {phoneStatus.isCodeSent && (
            <FormRow>
              <VerificationWrapper>
                <Input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  placeholder="인증 코드 입력"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
                <VerificationButton 
                  type="button" 
                  onClick={verifyCode} 
                  disabled={isVerificationDisabled}
                >
                  인증 확인
                </VerificationButton>
              </VerificationWrapper>
            </FormRow>
          )}
        </FormGroup>

        <FormGroup>
          <FormRow>
            <Input 
              id="address"
              name="address" 
              type="text" 
              placeholder="주소" 
              value={formData.address} 
              onChange={handleChange} 
              required 
              autoComplete="street-address"
              readOnly 
            />
            <Input 
              id="zipcode"
              name="zipcode" 
              type="text" 
              placeholder="우편 번호" 
              value={formData.zipcode} 
              onChange={handleChange} 
              required 
              autoComplete="postal-code"
              readOnly
            />
            <AddressButton type="button" onClick={openAddressSearch}>주소 검색</AddressButton>
          </FormRow>
          <Input 
            id="addressDetail"
            name="addressDetail" 
            type="text" 
            placeholder="상세 주소" 
            value={formData.addressDetail} 
            onChange={handleChange} 
            required 
            autoComplete="off"
          />
        </FormGroup>

        <SignupButton type="submit">회원가입</SignupButton>
        <Link to="/login">
          <BackButton type="button">뒤로가기</BackButton>
        </Link>
      </SignupForm>
    </SignupContainer>
  );
};

export default Signup;

const SignupContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
`;

const SignupForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 37.5rem;
  gap: 20px;
  background-color: white;
  padding: 40px;
  border-radius: 5px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  text-align: left;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormRow = styled.div`
  display: flex;
  gap: 20px;
`;

const EmailInputWrapper = styled.div`
  display: flex; 
  position: relative;
  width: 100%;
`;

const Input = styled.input`
  flex: 1;
  padding: 15px;
  border: 2px solid #ddd;
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: -20px;
  left: 0;
  color: red;
  font-size: 0.75rem;
`;

const EmailInput = styled(Input)`
  ${(props) =>
    props.$isValid === true &&
    css`
      border-color: green;
    `}
`;

const EmailButton = styled.button`
  font-size: 0.75rem;
  padding: 1rem;
  width: 7rem; 
  border: none;
  background-color: black;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  
  ${(props) =>
    props.$isValid === true &&
    css`
      background-color: green;
      color: white;
    `}
`;
const AddressButton = styled(EmailButton)`
`;

const SignupButton = styled(EmailButton)`
  width: 40%;
`;

const BackButton = styled(EmailButton)`
  width: 40%;
  background-color: white;
  color: black;
  border: 2px solid black;

  &:hover {
    background-color: rgb(240, 240, 240);
  }
`;

const PhoneInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
`;

const PhoneInput = styled(Input)`
  ${(props) =>
    props.$isVerified &&
    css`
      border-color: green;
    `}
`;

const PhoneButton = styled.button`
  position: absolute;
  right: 0;
  height: 100%;
  font-size: 0.75rem;
  padding: 1rem;
  width: 7rem; 
  border: none;
  background-color: black;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
  
  ${(props) =>
    props.$isVerified &&
    css`
      background-color: green;
      border: 2px solid green;
      color: white;
    `}
`;

const VerificationWrapper = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
`;

const VerificationButton = styled.button`
  flex-shrink: 0;
  font-size: 0.75rem;
  padding: 1rem;
  width: 7rem;
  border: none;
  background-color: black;
  color: white;
  cursor: pointer;
  transition: background-color 0.3s;
`;
