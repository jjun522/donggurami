import React from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, authService } from '../Config/firebaseConfig';
import { useNavigate } from 'react-router-dom';

function StoreSelectionPage() {
    const navigate = useNavigate();

    const handleStoreSelection = async (storeId) => {
        try {
            const user = authService.currentUser;

            if (!user) {
                throw new Error("User is not authenticated");
            }

            console.log("Selected storeId:", storeId); // storeId 확인
            console.log("Current user:", user.uid); // 현재 사용자 UID 확인

            const userDocRef = doc(db, "users", user.uid);

            // Firestore에서 사용자 문서 확인
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists()) {
                throw new Error("User document does not exist in Firestore");
            }



            // Firestore에서 store 필드 업데이트
            await updateDoc(userDocRef, { store: storeId });
            console.log("Store updated successfully");

            // Firestore에서 업데이트된 문서 확인
            const updatedDoc = await getDoc(userDocRef);
            console.log("Updated document data:", updatedDoc.data());

            // 상태와 관계없이 페이지 이동을 명시적으로 처리
            console.log("Navigating to /coupons...");
            navigate("/coupons"); // 쿠폰 페이지로 이동
        } catch (error) {
            console.error("Error updating store:", error);
        }
    };

    return (
        <div className="store-selection-page">
            <h1>매장을 선택하세요</h1>
            <button onClick={() => handleStoreSelection("slipwork")}>슬립워크</button>
            <button onClick={() => handleStoreSelection("cozygarden")}>코지가든</button>
        </div>
    );
}

export default StoreSelectionPage;
