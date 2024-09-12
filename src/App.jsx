import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import Navbar from "./component/Navbar";
import Footer from "./component/Footer";
import MainPage from './pages/MainPage/MainPage';
import Login from "./pages/LoginPage/Login";
import Signup from "./pages/SignupPage/Signup";
import MyPage from './pages/MyPage/MyPage';
import ProductPage from "./pages/ProductPage/ProductPage";
import ProductDetailPage from "../src/pages/ProductPage/ProductDetailPage"
import WishList from ".././src/pages/WishListPage/WishList"
import CartPage from "../src/pages/CartPage/CartPage"
import OrderPage from "./pages/OrderPage/OrderPage";
import CommunityPage from "./pages/CommunityPage/CommunityPage";
import CommunityDetailPage from "./pages/CommunityPage/CommunityDetailPage"
import CreatePost from './pages/CommunityPage/CreatePost';
import Inquiry from "./pages/InquiryPage/Inquiry";
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import PrivateRoute  from "./routes/PrivateRoute";
import styled from "styled-components";
import "./App.css";
import { AuthProvider } from "./context/AuthContext"; 

const Layout = () => {
  return (
    <LayoutContainer>
      <Navbar />
      <ContentContainer>
        <Outlet />
      </ContentContainer>
      <Footer />
    </LayoutContainer>
  );
};


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<MainPage />} /> 
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />

            <Route element={<PrivateRoute />}>
              <Route path="MyPage" element={<MyPage />} />
              <Route path="inquiry" element={<Inquiry />} />
              <Route path="products" element={<ProductPage />} />
              <Route path="wishlist" element={<WishList />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="order" element={<OrderPage />} />
              <Route path="notice" element={<CommunityPage />} />
              <Route path="notice/create" element={<CreatePost />} />
              <Route path="notice/:id" element={<CommunityDetailPage />} />
            </Route>
        
            <Route path="*" element={<NotFoundPage />} /> 
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  user-select:none;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  flex: 1;
`;
