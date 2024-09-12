import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import axios from 'axios';
import { GoPlus } from "react-icons/go";
import { IoCloseSharp } from "react-icons/io5";
import { MdPushPin } from "react-icons/md";
import { FaCheck, FaSearch } from "react-icons/fa";

const AddressModal = ({ onClose, onSelectAddress, FetchDefaultAddress, isOrderPage }) => {
  const [addressList, setAddressList] = useState([]);
  const [newAddress, setNewAddress] = useState({ 
    zipcode: '', 
    address: '', 
    addressDetail: '', 
    tel: '', 
    isDefault: false 
  });

  const fetchAddressList = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/addresses', { withCredentials: true });
      setAddressList(response.data);
      console.log(response.data)
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchAddressList();
  }, []);

  const handleAddressChange = (e) => {
    const {name, value} = e.target;
    setNewAddress(prevAddress => ({
      ...prevAddress,
      [name]: value,
    }));
  };

  const handleAddAddress = async () => {
    try {
      console.log(newAddress);
      await axios.post('http://localhost:8080/api/addresses', newAddress, { withCredentials: true });
      setNewAddress({zipcode: '', address: '', addressDetail: '', tel: '', isDefault: false });

      if (newAddress.isDefault) {
        FetchDefaultAddress();
        fetchAddressList();
      } else {
        fetchAddressList(); 
      }
    } catch (error) {
      alert(Object.values(error.response.data).join('\n'));
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      await axios.delete(`http://localhost:8080/api/addresses/${addressId}`, { withCredentials: true });
      fetchAddressList();
    } catch (error) {
      alert('주소 삭제에 실패했습니다.');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await axios.patch(`http://localhost:8080/api/addresses/${addressId}/default`, null, { withCredentials: true });
      FetchDefaultAddress(); 
      fetchAddressList(); 
    } catch (error) {
      alert('기본 주소 설정에 실패했습니다.');
    }
  };

  const handleSelectAddress = (address) => {
    if (isOrderPage) {
      onSelectAddress(address);
    }
  };

  const openAddressSearch = () => {
    new window.daum.Postcode({
      oncomplete: function (data) {
        const {zonecode, address} = data;
        setNewAddress(prevAddress => ({
          ...prevAddress,
          zipcode: zonecode,
          address: address
        }));
      }
    }).open();
  };

  return (
    <ModalOverlay>
      <ModalContainer>
        <p style={{ fontSize: '1.25rem' }}>회원 주소록</p>
        <AddressList>
          {addressList.map((address) => (
            <AddressItem key={address.id}>
              <div>
                <p>{address.address}</p>
                <p>{address.addressDetail}</p>
                <p>{address.tel}</p>
                <DefaultButton onClick={() => handleSetDefaultAddress(address.id)}>
                  <MdPushPin />
                </DefaultButton>
              </div>
              <ActionButtons>
                {isOrderPage && (
                  <SelectButton onClick={() => handleSelectAddress(address)}>
                    <FaCheck />
                  </SelectButton>
                )}
                <DeleteButton onClick={() => handleDeleteAddress(address.id)}>
                  <IoCloseSharp />
                </DeleteButton>
              </ActionButtons>
            </AddressItem>
          ))}
        </AddressList>
        <Header>
          <p style={{ fontSize: '1rem' }}>새 주소 추가</p>
          <AddressPlusButton onClick={openAddressSearch}><FaSearch /></AddressPlusButton>
        </Header>
        <AddressForm>
            <input
              id="zipcode"
              name="zipcode"
              placeholder="우편번호"
              value={newAddress.zipcode || ''}
              onChange={handleAddressChange}
              readOnly
              autoComplete="postal-code" 
            />
            <input
              id="address"
              name="address"
              placeholder="주소"
              value={newAddress.address || ''}
              onChange={handleAddressChange}
              readOnly
              autoComplete="street-address" 
            />
            <input
              id="addressDetail"
              name="addressDetail"
              placeholder="상세 주소"
              value={newAddress.addressDetail || ''}
              onChange={handleAddressChange}
              autoComplete="address-line2" 
            />
            <input
              id="tel"
              name="tel"
              placeholder="전화 번호"
              value={newAddress.tel || ''}
              onChange={handleAddressChange}
              autoComplete="tel" 
            />
              <label>
            <input
              id="isDefault"
              type="checkbox"
              name="isDefault"
              checked={newAddress.isDefault}
              onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
            />
            고정 주소로 설정
          </label>
          <ButtonGroup>
            <button style={{ fontSize: '1.3rem', marginRight: '0.5rem' }} onClick={handleAddAddress}>
              <GoPlus />
            </button>
            <button style={{ fontSize: '1.3rem' }} onClick={onClose}>
              <IoCloseSharp />
            </button>
          </ButtonGroup>
        </AddressForm>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AddressModal;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

const ModalContainer = styled.div`
  background: white;
  border-radius: 3px;
  padding: 20px;
  max-width: 40rem;
  width: 100%;
`;

const AddressList = styled.div`
  max-height: 10rem;
  overflow-y: auto;  
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;

  p {
    color: black;
    font-size: 0.85rem;
  }
`;

const AddressItem = styled.div`
  margin: 1rem;
  padding: 5px;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between; 
  align-items: center;
`;

const DefaultButton = styled.button`
  color: black;
  background-color: white;
  border: none;
  cursor: pointer;
  font-size: 1.3rem;

  ${(props) => props.isOrderPage && css`
    display: none;
  `}
`;

const SelectButton = styled.button`
  color: black;
  background-color: white;
  font-size: 1rem;
  border: none;
  cursor: pointer;
`;

const DeleteButton = styled.button`
  color: black;
  background-color: white;
  border: none;
  cursor: pointer;
  font-size: 1.3rem;
`;

const AddressForm = styled.div`
  display: flex;
  flex-direction: column;

  input {
    margin-bottom: 10px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }

  label {
    margin-bottom: 10px;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;

  button {
    color: black;
    background-color: white;
    border: none;
    cursor: pointer;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const AddressPlusButton = styled.button`
  background-color: transparent;
  border: none;
  color: black;
  cursor: pointer;
  font-size: 1.1rem;

  &:hover {
    color: #333;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;
