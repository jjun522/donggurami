// RoleBasedRedirect.js

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../Config/firebaseConfig';

function RoleBasedRedirect({ user }) {
    const navigate = useNavigate();

    useEffect(() => {
        const redirectBasedOnRole = async () => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const userDoc = await getDoc(userDocRef);

                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    if (userData.role === "owner") {
                        navigate("/owner");
                    } else {
                        navigate("/coupons");
                    }
                } else {
                    // 기본적으로 'customer'로 처리
                    navigate("/coupons");
                }
            }
        };

        redirectBasedOnRole();
    }, [user, navigate]);

    return null; // UI를 렌더링하지 않음, 역할에 따른 페이지로 바로 이동
}

export default RoleBasedRedirect;
