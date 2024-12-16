import React, { useEffect,useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { REST_API_KEY, REDIRECT_URI, CLIENT_SECRET } from '../Config/KakaoConfig';
import {browserLocalPersistence, OAuthProvider, setPersistence, signInWithCredential} from 'firebase/auth';
import { authService } from '../Config/firebaseConfig';
import { checkUserExists } from '../Utils/authUtils'; // 사용자 존재 확인 함수
import { addUserWithLimitCheck } from '../Utils/firebaseUtils'; // Firestore 관련 함수 가져오기
import RoleBasedRedirect from '../components/RoleBasedRedirect'; // 역할 기반 리디렉션 컴포넌트


function CallbackPage() {
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const handleKakaoLogin = async () => {
            const searchParams = new URLSearchParams(location.search);
            const code = searchParams.get('code');

            if (code) {
                const payload = {
                    grant_type: "authorization_code",
                    client_id: REST_API_KEY,
                    redirect_uri: REDIRECT_URI,
                    code: code,
                    client_secret: CLIENT_SECRET,
                };

                try {
                    const response = await axios.post('https://kauth.kakao.com/oauth/token', new URLSearchParams(payload), {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" }
                    });

                   // const accessToken = response.data.access_token;

                    // Firebase에 카카오 인증 처리
                    const provider = new OAuthProvider('oidc.kakao');
                    const credential = provider.credential({
                        idToken: response.data.id_token,
                    });

                    await setPersistence(authService, browserLocalPersistence);


                    const result = await signInWithCredential(authService, credential);

                    const user = result.user;

                    // Firestore에서 사용자가 이미 존재하는지 확인
                    const userExists = await checkUserExists(user.uid);

                    if (!userExists) { // 신규 사용자일 경우만 사용자 수 제한 확인
                        const success = await addUserWithLimitCheck(user.uid, user.displayName || "unknown");
                        if (!success) {
                            return; // 최대 사용자 수 도달로 새로운 사용자 추가 불가
                        }
                    }


                    // 기존 사용자이거나 신규 사용자 등록 성공 시
                    setUser(user);
                } catch (error) {
                    console.error('Error fetching access token:', error);
                }
            } else {
                console.error('No code found in URL');
            }
        };

        handleKakaoLogin();
    }, [location]);

    return user ? <RoleBasedRedirect user={user} /> : <div></div>;

}

export default CallbackPage;


