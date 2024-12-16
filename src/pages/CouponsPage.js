import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './couponsPage.css';
import logo from '../assets/images/dg_logo2.png'; // 상단 로고 이미지
import logo2 from '../assets/images/dg_logo.png'; // 미사용 쿠폰 이미지
import recommendImage from '../assets/images/logo3.png'; // 제휴 매장 추천하기 이미지
import { initializeUserCoupons, getUserCoupons, getSubscriptionPeriod } from '../Utils/firebaseUtils';
import { checkAuthStatus } from '../Utils/authUtils';

function CouponsPage() {
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [usedCount, setUsedCount] = useState(0);
    const [subscriptionPeriod, setSubscriptionPeriod] = useState({ startDate: '', endDate: '' });

    useEffect(() => {
        const unsubscribe = checkAuthStatus(async (authUser) => {
            if (authUser) {
                console.log("Authenticated user:", authUser); // 사용자 인증 확인

                const userName = authUser.displayName || "unknown";
                const userDoc = await initializeUserCoupons(authUser.uid, userName);

                if (userDoc.store) {
                    console.log("User store:", userDoc.store); // 매장 정보 확인

                    const userCoupons = await getUserCoupons(authUser.uid, userDoc.store);
                    console.log("Fetched coupons data:", userCoupons); // 쿠폰 데이터 확인

                    if (userCoupons) {
                        const sortedCoupons = Object.keys(userCoupons)
                            .filter(key => key.startsWith('coupon') && !key.includes('_usedAt'))
                            .map(key => ({
                                id: parseInt(key.replace('coupon', '')),
                                used: userCoupons[key],
                                usedAt: userCoupons[`${key}_usedAt`] || null,
                            }))
                            .sort((a, b) => a.id - b.id);

                        setCoupons(sortedCoupons);
                        setUsedCount(sortedCoupons.filter(coupon => coupon.used).length);
                    }

                    const periodData = await getSubscriptionPeriod(authUser.uid);
                    if (periodData) {
                        console.log("Fetched subscription period:", periodData); // 구독 기간 확인
                        setSubscriptionPeriod(periodData);
                    }
                }
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleCouponClick = (id, used) => {
        if (used) {
            alert("이미 사용된 쿠폰입니다.");
        } else {
            navigate(`/coupon/${id}`);
        }
    };

    return (
        <div className="coupons-page">
            <header className="header">
                <img src={logo} alt="Logo" className="logo-img"/>
                <h1>카페 구독권 사용하기</h1>
                <p>선 결제를 똑똑하고 간편하게, 동구라미</p>
            </header>

            <div className="subscription-card">
                <p className="subscription-title">아메리카노 15회 구독권</p>
                <p className="subscription-period">
                    사용 가능 기간: {subscriptionPeriod.startDate} ~ {subscriptionPeriod.endDate}
                </p>
                <p className="usage-info">사용 구독권 수: {usedCount} 개 | 남은 구독권 수: {15 - usedCount}개</p>
            </div>

            <h2 className="section-title">사용하기</h2>

            <div className="coupons-container">
                {coupons.map(coupon => (
                    <button
                        key={coupon.id}
                        className={`coupon-button ${coupon.used ? 'disabled' : ''}`}
                        onClick={() => handleCouponClick(coupon.id, coupon.used)}
                        disabled={coupon.used}
                    >
                        {coupon.used ? (
                            <span className="coupon-id">{coupon.id}</span>
                        ) : (
                            <img src={logo2} alt="Unused coupon" className="coupon-img"/>
                        )}
                    </button>
                ))}
            </div>
            <div className="coupon-description">
                <img src={logo2} className="coupon-img_down" alt="사용된 구독권 스티커"/>
                <p className="coupon_ex">스티커는 사용한 구독권 1회 입니다.</p>
            </div>

            <footer className="footer">
                <div className="recommendation-card">
                    <p className="recommend-text">구독 매장 추천하기</p>
                    <a href="https://linktr.ee/Donggurami_" target="_blank" rel="noopener noreferrer">
                        <img src={recommendImage} alt="제휴 매장 추천하러 가기" className="recommend-img"/>
                    </a>
                </div>
            </footer>
        </div>
    );
}

export default CouponsPage;
