import React from 'react';
import ReactDOM from 'react-dom/client'; // createRoot() 사용
import { BrowserRouter } from 'react-router-dom';  // BrowserRouter 가져오기
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
);
