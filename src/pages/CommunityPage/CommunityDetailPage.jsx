import React, { useEffect, useState, useContext} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import { RiChatDeleteFill } from "react-icons/ri";
import { FaPen, FaReply } from "react-icons/fa";
import { IoMdArrowRoundBack } from "react-icons/io";

const CommunityDetailPage = () => {
  const { id } = useParams();
  const { isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [replyContent, setReplyContent] = useState('');
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');

  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8080/api/boards/${id}`, { withCredentials: true })
        .then(response => {
          setPost(response.data);
          setEditedTitle(response.data.title);
          setEditedContent(response.data.content);
          const structuredComments = structureComments(response.data.comments);
          setComments(structuredComments);
        })
    .catch(error => {
      if (error.response) {
        alert(error.response.data);
      } 
    });
    }
  }, [id]);

  const structureComments = (comments) => {
    const commentMap = {};
    const structuredComments = [];

    comments.forEach(comment => {
      comment.childComments = [];
      commentMap[comment.commentId] = comment;

      if (comment.parentCommentId) {
        commentMap[comment.parentCommentId].childComments.push(comment);
      } else {
        structuredComments.push(comment);
      }
    });

    return structuredComments;
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    const updatedData = {
      title: editedTitle,
      content: editedContent,
    };

    axios.put(`http://localhost:8080/api/boards/${id}`, updatedData, { withCredentials: true })
      .then(response => {
        setPost(response.data);
        setIsEditing(false);
      })
      .catch(error => {
        if (error.response) {
          alert(error.response.data);
        } 
      });
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!commentContent.trim()) {
      alert('댓글 내용을 입력하세요.');
      return;
    }

    const commentData = { content: commentContent };

    axios.post(`http://localhost:8080/api/boards/${id}/comments`, commentData, { withCredentials: true })
      .then(response => {
        setComments([response.data, ...comments]);
        setCommentContent('');
      })
      .catch(error => {
        alert(error.response.data.error);
      });
  };

  const handleReplySubmit = (e, parentCommentId) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      alert('대댓글 내용을 입력하세요.');
      return;
    }

    const replyData = { content: replyContent, parentCommentId };

    axios.post(`http://localhost:8080/api/boards/${id}/comments`, replyData, { withCredentials: true })
      .then(response => {
        setComments(comments.map(comment =>
          comment.commentId === parentCommentId ? {
            ...comment,
            childComments: [...(comment.childComments || []), response.data]
          } : comment
        ));
        setReplyContent('');
        setReplyToCommentId(null);
      })
    .catch(error => {
      if (error.response) {
        alert(error.response.data);
      } 
    });
  };

  const handleDeleteComment = (commentId, parentCommentId = null) => {
    axios.delete(`http://localhost:8080/api/boards/comments/${commentId}`, { withCredentials: true })
      .then(() => {
        if (parentCommentId) {
          setComments(comments.map(comment =>
            comment.commentId === parentCommentId ? {
              ...comment,
              childComments: comment.childComments.filter(child => child.commentId !== commentId)
            } : comment
          ));
        } else {
          setComments(comments.filter(comment => comment.commentId !== commentId));
        }
      })
      .catch(error => {
        if (error.response) {
          alert(error.response.data);
        } 
      });
  };

const handleDeletePost = () => {
  axios.delete(`http://localhost:8080/api/boards/${id}`, { withCredentials: true })
    .then(() => {
      navigate('/notice');
    })
    .catch(error => {
      if (error.response) {
        alert(error.response.data);
      } 
    });
};


  const handleReplyButtonClick = (commentId) => {
    setReplyToCommentId(prev => (prev === commentId ? null : commentId));
  };

  if (!post) {
    return <div>로딩 중...</div>;
  }

  return (
    <DetailContainer>
      <BackButton onClick={() => navigate('/notice')}>
        <IoMdArrowRoundBack />
      </BackButton>
      {isEditing ? (
        <EditForm onSubmit={handleEditSubmit}>
          <EditInput
            id="editTitle"
            name="editTitle"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Title"
          />
          <EditTextarea
            id="editContent"
            name="editContent"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            placeholder="Content"
          />
          <SaveButton type="submit">Save</SaveButton>
        </EditForm>
      ) : (
        <TitleContainer>
          <TitleRow>
            <DetailTitle>{post.title}</DetailTitle>
            <EmailAndEdit>
              <AuthorEmail>{post.authorEmail}</AuthorEmail>
              <p style={{ fontSize: '0.8rem', color: "#888" }}>조회수: {post.viewCount}</p>
              {isAdmin && (
              <EditButton onClick={() => setIsEditing(true)}>
                <FaPen />
              </EditButton>
              )}
            </EmailAndEdit>
          </TitleRow>
          <DetailContent>{post.content}</DetailContent>
        </TitleContainer>
      )}
      <CommentSection>
        <CommentHeader>Comments</CommentHeader>
        <CommentList>
          {comments.map((comment) => (
            <div key={comment.commentId}>
              <CommentItem>
                <CommentAuthor>{comment.authorEmail}</CommentAuthor>
                <CommentText>{comment.content}</CommentText>
                <ReplyButton onClick={() => handleReplyButtonClick(comment.commentId)}>
                  <FaReply />
                </ReplyButton>
                <DeleteCommentButton onClick={() => handleDeleteComment(comment.commentId)}>
                  <RiChatDeleteFill />
                </DeleteCommentButton>
              </CommentItem>
              {comment.childComments && comment.childComments.map((child) => (
                <ChildCommentItem key={child.commentId}>
                  <CommentAuthor>{child.authorEmail}</CommentAuthor>
                  <CommentText>{child.content}</CommentText>
                  <DeleteCommentButton onClick={() => handleDeleteComment(child.commentId, comment.commentId)}>
                    <RiChatDeleteFill />
                  </DeleteCommentButton>
                </ChildCommentItem>
              ))}
              {replyToCommentId === comment.commentId && (
                <ReplyForm onSubmit={(e) => handleReplySubmit(e, comment.commentId)}>
                  <ReplyInput
                    id="replyContent"
                    name="replyContent"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="내용을 입력하세요"
                  />
                  <SubmitIcon>
                    <FaPen />
                  </SubmitIcon>
                </ReplyForm>
              )}
            </div>
          ))}
          {comments.length === 0 && (
            <NoCommentsMessage>댓글이 아직 없습니다.</NoCommentsMessage>
          )}
        </CommentList>
        <CommentForm onSubmit={handleCommentSubmit}>
          <CommentInput
            id="commentContent"
            name="commentContent"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="내용을 입력하세요"
          />
          <SubmitIcon onClick={handleCommentSubmit}>
            <FaPen />
          </SubmitIcon>
        </CommentForm>
      </CommentSection>
      {isAdmin && (
      <DeleteButton onClick={handleDeletePost}>
        <RiChatDeleteFill />
        Delete Post
      </DeleteButton>
      )}
    </DetailContainer>
  );
};

export default CommunityDetailPage;

const DetailContainer = styled.div`
  width: 80%;
  margin: 15vh auto 20px auto;  
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BackButton = styled.button`
  align-self: flex-start;
  padding: 5px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 50%;
  margin-bottom: 2rem;
  font-size: 0.5rem;
  cursor: pointer;

  &:hover {
    background-color: #888;
  }

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const TitleContainer = styled.div`
  width: 100%;
  margin-bottom: 10px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;


const DetailTitle = styled.h2`
  font-size: 1.1rem;
  color: #333;
  flex-grow: 1;
`;

const AuthorEmail = styled.p`
  font-size: 0.8rem;
  color: #888;
  margin-right: 10px;
`;

const DetailContent = styled.p`
  margin-top: 20px;
  font-size: 1rem;
  color: #666;
  width: 100%;
`;

const CommentSection = styled.div`
  margin-top: 40px;
  width: 100%;
`;

const CommentHeader = styled.h3`
  font-size: 1.35rem;
  color: #333;
  text-align: left;
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  margin: 1.5rem auto;
  width: 80%;  
  position: relative;
`;

const ReplyForm = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: 10px;
  width: 100%;  
  position: relative;
  margin-left: 20px;
`;

const CommentInput = styled.textarea`
  padding: 10px;
  border-radius: 2px;
  font-size: 0.8rem;
  width: 100%;
  height: 3rem; 
`;

const ReplyInput = styled.textarea`
  padding: 10px;
  border-radius: 5px;
  font-size: 0.8rem;
  width: 100%;
  height: 3rem; 
  margin-bottom: 1rem;
`;

const SubmitIcon = styled.button`
  position: absolute;
  right: -5rem;
  top: 1.2rem;
  background-color: black;
  color: white;
  border: none;
  border-radius: 50%;
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: #888;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const CommentList = styled.div`
  margin-top: 20px;
  width: 100%;
`;

const CommentItem = styled.div`
  padding: 10px 0;
  border-bottom: 1px solid #ccc;
  position: relative;
`;

const ChildCommentItem = styled.div`
  padding: 5px 0;
  padding-left: 1.2rem;
  border-bottom: 1px solid #eee;
  position: relative;
`;

const CommentAuthor = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const CommentText = styled.p`
  font-size: 1rem;
  color: #333;
`;

const ReplyButton = styled.button`
  background-color: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  position: absolute;
  right: 40px;
  bottom: 10px;

  svg {
    color: black;
    width: 1rem;
    height: 1rem;
  }
`;

const DeleteCommentButton = styled.button`
  background-color: transparent;
  border: none;
  color: black;
  cursor: pointer;
  font-size: 0.8rem;
  position: absolute;
  right: 10px;
  bottom: 10px;

  &:hover {
    color: darkred;
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #cc0000;
  }

  svg {
    margin-right: 8px; 
  }
`;

const NoCommentsMessage = styled.div`
  font-size: 1rem;
  color: #888; 
  margin-top: 1rem;
  margin-bottom: 5rem;
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 100%;
  align-items: center;
`;

const EditInput = styled.input`
  padding: 10px;
  font-size: 1rem;
  margin-bottom: 1rem;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 2px;
`;

const EditTextarea = styled.textarea`
  padding: 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  width: 100%;
  border-radius: 5px;
  margin-bottom: 10px;
  height: 150px;
`;


const SaveButton = styled.button`
  padding: 10px 20px;
  background-color: black;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;

  &:hover {
    background-color: #444;
  }
`;

const EditButton = styled.button`
  background-color: transparent;
  border: none;
  color: black;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  margin-left: 10px;

  &:hover {
    color: #888;
  }

  svg {
    margin-right: 5px;
  }
`;

const EmailAndEdit = styled.div`
  display: flex;
  align-items: center;
`;