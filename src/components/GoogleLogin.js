import React, {useState} from 'react';
import { GoogleAuthProvider, signInWithPopup,setPersistence,browserLocalPersistence } from 'firebase/auth';
import { authService } from '../Config/firebaseConfig';
import googleLogo from '../assets/images/google.png';
import { addUserWithLimitCheck } from '../Utils/firebaseUtils'; // Firestore 관련 함수 가져오기
import { checkUserExists } from '../Utils/authUtils'; // 사용자 존재 확인 함수
import RoleBasedRedirect from '../components/RoleBasedRedirect'; // 역할 기반 리디렉션 컴포넌트


const GoogleLogin = () => {
    const [user, setUser] = useState(null);

    const handleGoogleSign = async () => {
        try {

            await setPersistence(authService, browserLocalPersistence); // 지속성을 LOCAL로 설정


            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(authService, provider);

            const user = result.user;

            // Firestore에서 사용자가 이미 존재하는지 확인
            const userExists = await checkUserExists(user.uid);

            if (!userExists) { // 신규 사용자일 경우만 사용자 수 제한 확인
                const success = await addUserWithLimitCheck(user.uid, user.displayName || "unknown");
                if (!success) {
                    return; // 최대 사용자 수 도달로 새로운 사용자 추가 불가
                }
            }
            setUser(user)
        } catch (err) {
            console.error("로그인 실패:", err);
        }
    };

    return (
        <div>
            <button onClick={handleGoogleSign} style={{ background: 'none', border: 'none', padding: 0 }}>
                <img src={googleLogo} alt="Google Login" style={{ width: '260px', height: '60px', cursor: 'pointer' }} />
            </button>
            {user && <RoleBasedRedirect user={user} />} {/* RoleBasedRedirect 컴포넌트로 리디렉션 */}
         </div>

    );
};

export default GoogleLogin;
