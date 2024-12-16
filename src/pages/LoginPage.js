import React from 'react';
import background from '../assets/images/background.png'; // 배경 이미지
import GoogleLogin from '../components/GoogleLogin';  // Google 로그인 컴포넌트
import KakaoLogin from '../components/KakaoLogin';  // Kakao 로그인 컴포넌트
import './loginPage.css';

const LoginPage = () => {
    return (
        <div className="login-page" style={{ backgroundImage: `url(${background})` }}>
            <header className="login-header">
                <h1 className="logo-title">동구라미</h1>
                <p className="welcome-text">환영해요!</p>
            </header>
            <div className="login-content">
                <h2>간편 로그인</h2>
                <div className="login-buttons">  {/* 버튼 그룹 */}
                    <KakaoLogin/>
                    <GoogleLogin/>
                </div>
            </div>

        </div>
    );
};

export default LoginPage;
