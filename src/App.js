import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CallbackPage from './components/CallbackPage';
import CouponsPage from './pages/CouponsPage';
import CouponDetailPage from './pages/CouponDetailPage';
import OwnerPage from './pages/OwnerPage';
import StoreSelectionPage from './pages/StoreSelectionPage'; // 스토어 선택 페이지
import { useAuth } from './Utils/authUtils';
import { Navigate } from 'react-router-dom';

function App() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div></div>; // 로딩 중 UI
    }

    return (
        <div className="App">
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/auth/kakao/callback" element={<CallbackPage />} />
                <Route
                    path="/store-selection"
                    element={currentUser?.store === null ? <StoreSelectionPage /> : <Navigate to="/coupons" />}
                />
                <Route path="/coupons" element={currentUser?.store ? <CouponsPage /> : <Navigate to="/store-selection" />} />

                <Route path="/coupon/:id" element={<CouponDetailPage />} />
                <Route
                    path="/owner"
                    element={currentUser?.role === 'owner' ? <OwnerPage /> : <Navigate to="/coupons" />}
                />
            </Routes>
        </div>
    );
}

export default App;
