import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from '../router/Router';
import logoImg from '../assets/logo.png';
import axios from 'axios';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const redirectUrl = searchParams.get('redirect') || '/noa-e/studio';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim() || !name.trim()) {
      setErrorMsg('이메일, 비밀번호, 이름을 모두 입력해주세요.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    if (password !== passwordConfirm) {
      setErrorMsg('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    if (phoneNumber.trim()) {
      const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
      if (!/^01[016789]\d{7,8}$/.test(cleanPhone)) {
        setErrorMsg('올바른 휴대전화 번호 형식이 아닙니다. (예: 010-1234-5678)');
        return;
      }
    }

    try {
      setIsLoading(true);
      await register({
        email: email.trim(),
        password,
        name: name.trim(),
        phone_number: phoneNumber.trim() || undefined,
      });
      navigate(redirectUrl);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        setErrorMsg(err.response.data.detail);
      } else {
        setErrorMsg('회원가입 처리 중 오류가 발생했습니다. 입력 정보를 확인해주세요.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[350px] h-[350px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Card */}
      <div className="w-full max-w-md rounded-3xl bg-surface-container-low/80 border border-outline-variant/40 p-8 shadow-2xl backdrop-blur-2xl relative z-10 flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <Link to="/noa-e" className="mb-4 inline-block hover:scale-105 transition-transform">
            <img src={logoImg} alt="NOA-E" className="h-10 w-auto object-contain" />
          </Link>
          <h1 className="font-headline-md text-2xl font-bold text-on-surface">
            NOA-E 회원가입
          </h1>
          <p className="text-xs text-on-surface-variant mt-1.5">
            자신만의 AI Agent를 설계하고 시뮬레이션해보세요.
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
              <span>이메일 (필수)</span>
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

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">person</span>
              <span>이름 또는 닉네임 (필수)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              required
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">call</span>
              <span>전화번호 (선택)</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="010-1234-5678"
              className="w-full px-4 py-2.5 rounded-xl bg-surface-container border border-outline-variant/40 text-on-surface text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-outline"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
              <span>비밀번호 (최소 6자 이상)</span>
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

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">check_circle</span>
              <span>비밀번호 확인</span>
            </label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 다시 한 번 입력하세요"
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
                <span>가입 처리 중...</span>
              </>
            ) : (
              <>
                <span>가입하고 시작하기</span>
                <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-3 border-t border-outline-variant/20 flex flex-col items-center gap-3 text-center">
          <p className="text-xs text-on-surface-variant">
            이미 계정이 있으신가요?{' '}
            <Link
              to={`/noa-e/login?redirect=${encodeURIComponent(redirectUrl)}`}
              className="text-primary font-semibold hover:underline ml-1"
            >
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
