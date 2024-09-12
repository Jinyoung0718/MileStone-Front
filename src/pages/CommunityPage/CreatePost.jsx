import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IoCreate } from "react-icons/io5";
import { AuthContext } from '../../context/AuthContext';

const CreatePost = () => {
  const { isAdmin } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      alert('권한이 없습니다.');
      navigate('/community');
    }
  }, [isAdmin, navigate]);

  const handleCreatePost = () => {
    if (!title || !content) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    axios.post('http://localhost:8080/api/boards', {
      title: title,
      content: content
    }, { withCredentials: true })
      .then(response => {
        navigate(`/notice/${response.data.id}`);
      })
      .catch(error => {
        console.error(error);
      });
  };

  return (
    <CreatePostWrapper>
      <CreatePostContainer>
        <h2 style={{fontWeight: 500, fontSize: '1.2rem', marginBottom: '4%'}}>게시글 작성</h2>
        <FormField>
          <label>제목</label>
          <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
        </FormField>
        <FormField>
          <label>내용</label>
          <TextArea value={content} onChange={(e) => setContent(e.target.value)} />
        </FormField>
        <IconButton onClick={handleCreatePost}>
          <IoCreate />
          <p style={{fontSize:"0.75rem"}}>POST</p>
        </IconButton>
      </CreatePostContainer>
    </CreatePostWrapper>
  );
};

export default CreatePost;

const CreatePostWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh; 
`;

const CreatePostContainer = styled.div`
  width: 70%;
  padding: 2rem;
`;

const FormField = styled.div`
  margin-bottom: 15px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  height: 100px;
  resize: vertical;
`;

const IconButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.1rem 1rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #888;
  }

  svg {
    margin-right: 8px; 
  }
`;
