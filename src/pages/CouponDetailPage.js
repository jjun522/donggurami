import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './couponDetailPage.css';
import logo from '../assets/images/dg_logo2.png';
import { updateCouponStatus, getSubscriptionPeriod, getStoreName } from '../Utils/firebaseUtils';
import { checkAuthStatus } from '../Utils/authUtils';

function CouponDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [subscriptionPeriod, setSubscriptionPeriod] = useState({ startDate: '', endDate: '' });
    const [store, setStore] = useState('');
    const [storeName, setStoreName] = useState('');

    useEffect(() => {
        const unsubscribe = checkAuthStatus(async (authUser) => {
            if (authUser) {
                setUser(authUser);

                const periodData = await getSubscriptionPeriod(authUser.uid);
                if (periodData) {
                    setSubscriptionPeriod(periodData);
                }

                const userStore = authUser.store || 'slipwork';
                setStore(userStore);

                const storeData = await getStoreName(userStore);
                setStoreName(storeData || '슬립워크');
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleCouponClick = async () => {
        if (user) {
            try {
                const success = await updateCouponStatus(user.uid, store, parseInt(id));
                if (success) {
                    alert('쿠폰이 성공적으로 사용되었습니다!');
                    navigate('/coupons', { state: { updatedCouponId: id } }); // 사용된 쿠폰 ID 전달
                } else {
                    alert('이미 사용된 쿠폰입니다.');
                }
            } catch (error) {
                console.error('Error using coupon:', error);
                alert('쿠폰 사용 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        }
    };

    return (
        <div className="coupon-detail-page">
            <header className="header">
                <img src={logo} alt="Logo" className="logo-img" />
                <h1 className="header-title">{storeName} 카페 구독권 사용하기</h1>
                <p className="description">‘오늘의 커피 받기’를 누르면 구독권 1회가 차감됩니다</p>
            </header>

            <div className="coupon-button-container">
                <button className="coupon-use-button" onClick={handleCouponClick}>
                    오늘의 커피 받기
                    <p className="sub-text">사장님이 눌러주세요!</p>
                </button>
            </div>

            <div className="subscription-period-container">
                <p className="period-label">사용 가능 기간</p>
                <p className="period-date">
                    {subscriptionPeriod.startDate} ~ {subscriptionPeriod.endDate}
                </p>
            </div>
        </div>
    );
}

export default CouponDetailPage;
