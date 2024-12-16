import React from 'react';
import { KAKAO_AUTH_URL } from "../Config/KakaoConfig";
import kakaoLogo from '../assets/images/kakao.png';   // Kakao 로그인 이미지

function KakaoLogin() {
    return (
        <button
            type="button"
            onClick={() => window.location.href = KAKAO_AUTH_URL}
            style={{ background: 'none', border: 'none', padding: 0 }}
        >
            <img src={kakaoLogo} alt="Kakao Login" style={{ width: '260px', height: '60px', cursor: 'pointer' }} />
        </button>
    );
}

export default KakaoLogin;
