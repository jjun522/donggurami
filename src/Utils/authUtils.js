import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { authService, db } from '../Config/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Firestore에서 사용자가 이미 존재하는지 확인
export const checkUserExists = async (userId) => {
    try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        return userDoc.exists();
    } catch (error) {
        console.error("Error checking user existence:", error);
        return false; // 기본값 반환
    }
};

// 사용자 인증 상태를 확인하고, 변경될 때마다 콜백 함수를 실행
export const checkAuthStatus = (callback) => {
    const unsubscribe = onAuthStateChanged(authService, (user) => {
        callback(user);
    });

    return unsubscribe;
};

// useAuth 훅: 현재 인증된 사용자 정보를 제공
export const useAuth = () => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(authService, async (user) => {
            try {
                if (user) {
                    // Firestore에서 사용자의 role 및 store 정보를 가져옴
                    const userDocRef = doc(db, 'users', user.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setCurrentUser({
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName || "Unknown User",
                            role: userData.role || 'customer', // 기본값 'customer'
                            store: userData.store || null, // 기본값 'slipwork'
                        });
                    } else {
                        // Firestore 문서가 없을 경우 기본값 설정
                        setCurrentUser({
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName || "Unknown User",
                            role: 'customer',
                            store: null,
                        });
                    }
                } else {
                    setCurrentUser(null); // 인증되지 않은 상태
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setCurrentUser(null); // 오류 발생 시 사용자 정보를 초기화
            } finally {
                setLoading(false); // 로딩 상태 해제
            }
        });

        return () => unsubscribe();
    }, []);

    return { currentUser, loading };
};
