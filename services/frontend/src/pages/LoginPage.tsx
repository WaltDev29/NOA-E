import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from '../router/Router';
import logoImg from '../assets/logo.png';
import axios from 'axios';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // redirect 파라미터 확인
  const searchParams = new URLSearchParams(window.location.search);
  const redirectUrl = searchParams.get('redirect') || '/noa-e/studio';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      await login({ email: email.trim(), password });
      navigate(redirectUrl);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setErrorMsg(err.response.data.detail);
      } else {
        setErrorMsg('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md rounded-3xl bg-surface-container-low/80 border border-outline-variant/40 p-8 shadow-2xl backdrop-blur-2xl relative z-10 flex flex-col gap-6">
        {/* Header / Brand */}
        <div className="flex flex-col items-center text-center">
          <Link to="/noa-e" className="mb-4 inline-block hover:scale-105 transition-transform">
            <img src={logoImg} alt="NOA-E" className="h-10 w-auto object-contain" />
          </Link>
          <h1 className="font-headline-md text-2xl font-bold text-on-surface">
            NOA-E 로그인
          </h1>
          <p className="text-xs text-on-surface-variant mt-1.5">
            AI Agent 비주얼 스튜디오에 오신 것을 환영합니다.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-error-container/40 border border-error/30 text-error text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
              <span>이메일</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@noa-e.com"
              required
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
              <span>비밀번호</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-inverse-primary via-primary-container to-secondary-container text-on-surface font-semibold text-sm shadow-[0_0_20px_rgba(77,142,255,0.4)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>로그인 중...</span>
              </>
            ) : (
              <>
                <span>로그인</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="pt-4 border-t border-outline-variant/20 flex flex-col items-center gap-3 text-center">
          <p className="text-xs text-on-surface-variant">
            아직 계정이 없으신가요?{' '}
            <Link
              to={`/noa-e/register?redirect=${encodeURIComponent(redirectUrl)}`}
              className="text-primary font-semibold hover:underline ml-1"
            >
              회원가입하기
            </Link>
          </p>
          <Link
            to="/noa-e"
            className="text-xs text-outline hover:text-on-surface transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">home</span>
            <span>홈으로 돌아가기</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
