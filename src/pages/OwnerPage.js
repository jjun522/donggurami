import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';
import './OwnerPage.css';
import logo from "../assets/images/dg_logo2.png";

function OwnerPage() {
    const [couponsData, setCouponsData] = useState([]);
    const [expandedUserIndex, setExpandedUserIndex] = useState(null);

    useEffect(() => {
        const fetchCouponData = async () => {
            const couponsCollectionRef = collection(db, 'coupons/slipwork/users'); // Slipwork 데이터 경로
            const couponsSnapshot = await getDocs(couponsCollectionRef);
            const data = [];

            for (const docSnapshot of couponsSnapshot.docs) {
                const userId = docSnapshot.id;
                const userCoupons = docSnapshot.data();

                // 사용자 이름 가져오기
                const userDocRef = doc(db, 'users', userId); // 'users' 컬렉션에서 사용자 데이터 가져오기
                const userDoc = await getDoc(userDocRef);
                const fullUserName = userDoc.exists() ? userDoc.data().displayName || 'Unknown' : 'Unknown';

                // 이름만 추출 (공백 이전 부분)
                const userName = fullUserName.split('_')[0];

                // 사용된 쿠폰 개수 계산
                const couponKeys = Object.keys(userCoupons).filter(key => key.startsWith('coupon') && !key.includes('_usedAt'));
                const totalCoupons = couponKeys.length;
                const usedCoupons = couponKeys.filter(key => userCoupons[key] === true).length;

                data.push({
                    userName, // 사용자 이름 (앞부분만)
                    userId, // 사용자 ID
                    coupons: userCoupons, // 쿠폰 데이터
                    totalCoupons,
                    usedCoupons,
                });
            }

            setCouponsData(data);
        };

        fetchCouponData();
    }, []);

    const toggleUserSection = (index) => {
        setExpandedUserIndex(expandedUserIndex === index ? null : index);
    };

    return (
        <div className="owner-page">
            <img src={logo} alt="Logo" className="logo-img" />
            <h1>Slipwork 사용자 구독권 확인하기</h1>
            <p className="sub-title">선 결제를 똑똑하고 간편하게, 동구라미</p>

            <div className="user-list">
                {couponsData.map((user, index) => (
                    <div key={user.userId} className="user-section">
                        <div
                            className="user-header"
                            onClick={() => toggleUserSection(index)}
                        >
                            <h2>{user.userName}님의 구독권 사용 내역</h2>
                            <div className="coupon-usage-bar">
                                <div
                                    className="used-bar"
                                    style={{ width: `${(user.usedCoupons / user.totalCoupons) * 100}%` }}
                                ></div>
                            </div>
                            <div className="coupon-usage-count">
                                {user.usedCoupons} / {user.totalCoupons}
                            </div>
                        </div>
                        {expandedUserIndex === index && (
                            <table className="coupon-table">
                                <thead>
                                <tr>
                                    <th>쿠폰 번호</th>
                                    <th>사용 여부</th>
                                    <th>사용 날짜</th>
                                </tr>
                                </thead>
                                <tbody>
                                {Object.keys(user.coupons)
                                    .filter(key => key.startsWith('coupon') && !key.includes('_usedAt'))
                                    .sort((a, b) => {
                                        const numA = parseInt(a.replace('coupon', ''));
                                        const numB = parseInt(b.replace('coupon', ''));
                                        return numA - numB;
                                    })
                                    .map(couponKey => (
                                        <tr key={couponKey}>
                                            <td>{couponKey.replace('coupon', '쿠폰 ')}</td>
                                            <td>{user.coupons[couponKey] ? '사용됨' : '미사용'}</td>
                                            <td>
                                                {user.coupons[couponKey] && user.coupons[`${couponKey}_usedAt`]
                                                    ? user.coupons[`${couponKey}_usedAt`].toDate().toLocaleString()
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default OwnerPage;
