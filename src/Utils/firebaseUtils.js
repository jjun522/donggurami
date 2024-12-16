import { db } from '../Config/firebaseConfig'; // Firestore DB 가져오기
import { collection, doc, setDoc, getDoc, updateDoc, serverTimestamp ,getDocs} from 'firebase/firestore'; // Firestore 관련 함수 가져오기

export const initializeUserCoupons = async (userId, userName) => {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
        throw new Error("사용자 데이터가 존재하지 않습니다.");
    }

    const store = userDoc.data().store || "slipwork"; // 기본 매장을 slipwork로 설정
    const sanitizedUserName = userName.replace(/[/.]/g, "_");
    const couponsDocRef = doc(db, `coupons/${store}/users`, userId);

    const couponsDoc = await getDoc(couponsDocRef);
    if (!couponsDoc.exists()) {
        const initialCoupons = {};
        for (let i = 1; i <= 15; i++) {
            initialCoupons[`coupon${i}`] = false;
        }
        await setDoc(couponsDocRef, initialCoupons);
    }
    return userDoc.data();
};


export const getUserCoupons = async (userId, store) => {
    const couponsDocRef = doc(db, `coupons/${store}/users`, userId);
    const couponsDoc = await getDoc(couponsDocRef);

    if (couponsDoc.exists()) {
        return couponsDoc.data();
    } else {
        throw new Error(`쿠폰 데이터가 없습니다: ${store}/${userId}`);
    }
};


export const updateCouponStatus = async (userId, store, couponId) => {
    const couponsDocRef = doc(db, `coupons/${store}/users`, userId); // 경로 수정
    const couponField = `coupon${couponId}`;
    const timestampField = `${couponField}_usedAt`;

    try {
        const userDoc = await getDoc(couponsDocRef);

        if (!userDoc.exists()) {
            console.error(`Document not found at path: coupons/${store}/users/${userId}`);
            return false;
        }

        const userData = userDoc.data();

        if (!(couponField in userData)) {
            console.error(`Field "${couponField}" does not exist in Firestore document:`, userData);
            return false;
        }

        if (userData[couponField] === false) {
            await updateDoc(couponsDocRef, {
                [couponField]: true,
                [timestampField]: serverTimestamp(),
            });
            return true;
        } else {
            console.warn(`Coupon "${couponField}" is already used.`);
            return false;
        }
    } catch (e) {
        console.error('Error updating coupon status:', e);
        throw e;
    }
};




// Firestore에서 총 사용자 수(문서 수) 확인 함수
export const checkTotalUsers = async () => {
    const usersCollectionRef = collection(db, "users");
    const usersSnapshot = await getDocs(usersCollectionRef);
    const totalUserCount = usersSnapshot.size; // 현재 'users' 컬렉션의 총 문서 수 확인
    return totalUserCount;
};

// Firestore에 사용자를 추가하기 전에 총 사용자 수를 확인하고 제한하는 함수
export const addUserWithLimitCheck = async (userId, userName,userRole = 'customer') => {
    // 총 사용자 수 확인
    const totalUsers = await checkTotalUsers();

    if (totalUsers >= 12) { // 총 사용자 수가 10명 이상인 경우
        alert("최대 사용자 수에 도달했습니다. 새로운 사용자는 등록할 수 없습니다.");
        return false; // 사용자 추가 불가
    }

    const sanitizedUserName = userName.replace(/[/.]/g, "_");
    // 수정된 부분: collection 참조를 제거하고, doc 함수에 db와 컬렉션 이름, 문서 ID를 직접 전달
    const userDocRef = doc(db, "users", userId); // collection(db, "users")가 아닌 정확한 문서 경로 생성

    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) { // 사용자가 존재하지 않는 경우에만 추가
        await setDoc(userDocRef, {
            displayName: sanitizedUserName,
            uid: userId,
            role: userRole, // 역할 필드 추가 (기본값은 'customer', 필요에 따라 'owner' 전달 가능)
            store: null,
            createdAt: serverTimestamp() // 사용자 생성 시간 기록
        });
    } else {
    }
    return true;
};


export const getSubscriptionPeriod = async (userId) => {
    try {
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            const data = userDoc.data();
            const subscriptionPeriod = data.subscriptionPeriod;

            // subscriptionPeriod가 존재하고, startDate와 endDate가 있다면 반환
            if (subscriptionPeriod && subscriptionPeriod.startDate && subscriptionPeriod.endDate) {
                return {
                    startDate: subscriptionPeriod.startDate,
                    endDate: subscriptionPeriod.endDate,
                };
            }
        }
        // 기본 날짜 범위 반환
        return { startDate: '2024.10.01', endDate: '2024.10.31' };
    } catch (error) {
        console.error("Error fetching subscription period:", error);
        return { startDate: '2024.10.01', endDate: '2024.10.31' }; // 오류 시 기본 날짜 반환
    }
};


export const getStoreName = async (storeId) => {
    try {
        const storeDocRef = doc(db, "stores", storeId);
        const storeDoc = await getDoc(storeDocRef);
        if (storeDoc.exists()) {
            return storeDoc.data().storeName;
        }
        return null;
    } catch (error) {
        console.error("Error fetching store name:", error);
        throw error;
    }
};