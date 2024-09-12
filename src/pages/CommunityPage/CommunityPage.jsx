import React, { useState, useEffect, useContext} from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';

const CommunityPage = () => {
  const { isAdmin } = useContext(AuthContext);
  const [boards, setBoards] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('오래된순');
  const [page, setPage] = useState(0);
  const [size] = useState(7);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    console.log("isAdmin:", isAdmin);
  }, [isAdmin]);

  const fetchData = () => {
    const url = search 
      ? 'http://localhost:8080/api/boards/search'
      : 'http://localhost:8080/api/boards';

    const params = {
      page: page,
      size: size,
      sort: sort,
    };

    if (search) {
      params.query = search;
    }

    axios.get(url, { params, withCredentials: true })
      .then(response => {
        setBoards(response.data.content);
        setTotalPages(response.data.totalPages);
      })
      .catch(error => console.error(error));
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, sort]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchData();
  };

  const handleSortChange = (e) => {
    setSort(e.target.value);
    setPage(0);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const getDisplayedPages = () => {
    const pages = [];
    const startPage = Math.floor(page / 5) * 5;
    const endPage = Math.min(startPage + 4, totalPages - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <CommunityPageContainer>
      <FilterContainer onSubmit={handleSearchSubmit}>
        <FilterInput 
          id="search" 
          name="search"
          placeholder="Search"
          value={search}
          onChange={handleSearchChange} 
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchSubmit(e);
            }
          }}
        />
        <SortSelect 
          id="sort"  
          name="sort"
          value={sort}
          onChange={handleSortChange}>
          <option value="최신순">최신순</option>
          <option value="오래된순">오래된순</option>
        </SortSelect>
      </FilterContainer>
      <CommunityBoardList>
        {boards.map((board) => (
          <BoardItem key={board.id}>
            <BoardTitle to={`/notice/${board.id}`}>{board.title}</BoardTitle>
            <BoardMeta>{new Date(board.createdAt).toLocaleDateString()}</BoardMeta>
            <BoardViews>조회수 {board.totalView}</BoardViews>
          </BoardItem>
        ))}
      </CommunityBoardList>
      <Pagination>
        <PageButton onClick={() => handlePageChange(page - 1)} disabled={page === 0}>
          &laquo;
        </PageButton>
        {getDisplayedPages().map((pageIndex) => (
          <PageButton
            key={pageIndex}
            onClick={() => handlePageChange(pageIndex)}
            $active={pageIndex === page}
          >
            {pageIndex + 1}
          </PageButton>
        ))}
        <PageButton onClick={() => handlePageChange(page + 1)} disabled={page === totalPages - 1}>
          &raquo;
        </PageButton>
      </Pagination>
      {isAdmin && (
        <CreateButtonContainer>
          <CreateButton to="/notice/create">CREATE</CreateButton>
        </CreateButtonContainer>
      )}
    </CommunityPageContainer>
  );
};

export default CommunityPage;

const CommunityPageContainer = styled.div`
  width: 80%;
  margin: 15vh auto 20px auto;
  padding: 20px;
`;

const CreateButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
`;

const CreateButton = styled(Link)`
  padding: 10px 15px;
  background-color: black;
  color: white;
  text-decoration: none;
  border-radius: 3px;
  font-size: 0.9rem;

  &:hover {
    background-color: grey;
  }
`;

const CommunityBoardList = styled.div`
  margin-top: 20px;
`;

const BoardItem = styled.div`
  padding: 20px;
  border-bottom: 1px solid #ccc;
  display: flex;
  justify-content: space-between;
  align-items: center;

  &:hover {
    background-color: #f9f9f9;
  }
`;

const BoardTitle = styled(Link)`
  font-size: 1rem;
  color: black;
  text-decoration: none;
  flex: 1;

  &:hover {
    text-decoration: underline;
  }
`;

const BoardMeta = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-left: 10px;
  white-space: nowrap;
`;

const BoardViews = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-left: 10px;
  white-space: nowrap;
`;

const FilterContainer = styled.form`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const FilterInput = styled.input`
  padding: 9px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 1rem;
  width: 13rem;
`;

const SortSelect = styled.select`
  padding: 9px;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-size: 0.9rem;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 20px;
`;

const PageButton = styled.button`
  padding: 10px;
  margin: 0 5px;
  background-color: ${props => (props.$active ? 'black' : 'white')};
  color: ${props => (props.$active ? 'white' : 'black')};
  border: 1px solid black;
  border-radius: 5px;
  cursor: pointer;
`;
