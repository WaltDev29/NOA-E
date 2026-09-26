import React from 'react';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { Link } from '../router/Router';

export const MainPage: React.FC = () => {
  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      <Header />

      <main className="w-full pt-16 bg-background min-h-screen flex-1 flex flex-col">
        <div className="flex flex-col w-full">
          {/* Subtle Ambient Glow Orbs */}
          <div className="relative w-full max-w-7xl mx-auto px-margin overflow-hidden">
            <div className="absolute -top-32 right-12 w-96 h-96 bg-primary-container/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-80 -left-20 w-80 h-80 bg-secondary-container/25 rounded-full blur-[100px] pointer-events-none" />

            {/* 1. Hero Section */}
            <section className="relative pt-space-xl pb-space-lg w-full">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
                {/* Left: Text Content */}
                <div className="lg:col-span-7 flex flex-col items-start z-10">
                  {/* Top Pill Badge */}
                  <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high/70 backdrop-blur-md shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                    <span className="font-label-badge text-label-badge text-primary tracking-wide">
                      Node로 배우고, 직접 만들고, 경험하는
                    </span>
                  </div>

                  {/* Main Headline */}
                  <h1 className="mt-space-md font-display-hero text-display-hero text-on-surface tracking-tight">
                    나만의 AI Agent,<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary-container to-secondary">
                      NOA-E
                    </span>
                  </h1>

                  {/* English Platform Subtitle */}
                  <p className="mt-space-xs font-headline-sm text-headline-sm text-on-surface-variant font-medium tracking-wide">
                    Node-Oriented Agent - Education
                  </p>

                  {/* Core Description */}
                  <p className="mt-space-md font-body-lg text-body-lg text-outline leading-relaxed max-w-xl">
                    다양한 Node들을 연결하여 AI Agent를 직접 설계하고 제작, 실행, 체험할 수 있는 노드 기반 차세대 교육 플랫폼입니다.
                  </p>

                  {/* Action Buttons */}
                  <div className="mt-space-xl flex flex-wrap items-center gap-space-md">
                    <Link
                      to="/noa-e/studio"
                      className="px-space-xl py-space-sm rounded-lg bg-gradient-to-r from-primary-container to-secondary-container text-on-primary font-headline-sm text-headline-sm font-semibold shadow-lg shadow-primary-container/30 hover:shadow-primary-container/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center"
                    >
                      시작하기
                    </Link>
                    <Link
                      to="/noa-e/nodes"
                      className="px-space-lg py-space-sm rounded-lg bg-surface-container-high/80 text-on-surface font-body-md text-body-md hover:bg-surface-variant shadow-sm transition-all flex items-center gap-space-xs"
                    >
                      <span className="material-symbols-outlined text-[18px] text-tertiary">play_arrow</span>
                      <span>노드 탐색 및 튜토리얼</span>
                    </Link>
                  </div>
                </div>

                {/* Right: Isometric Visual Composition */}
                <div className="lg:col-span-5 relative w-full h-[400px] flex items-center justify-center">
                  {/* Background Radiant Grid Glow */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-surface-container-low/40 via-surface-container/60 to-primary-container/10 rounded-2xl" />

                  {/* Dynamic SVG Network Diagram with Cute Friendly Bot & Nodes */}
                  <svg
                    className="relative z-10 w-full h-full max-w-[480px] drop-shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
                    fill="none"
                    viewBox="0 0 500 420"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <linearGradient gradientUnits="userSpaceOnUse" id="lineGrad1" x1="120" x2="250" y1="110" y2="200">
                        <stop stopColor="#4d8eff" />
                        <stop offset="1" stopColor="#acedff" />
                      </linearGradient>
                      <linearGradient gradientUnits="userSpaceOnUse" id="lineGrad2" x1="380" x2="250" y1="90" y2="200">
                        <stop stopColor="#571bc1" />
                        <stop offset="1" stopColor="#4d8eff" />
                      </linearGradient>
                      <linearGradient gradientUnits="userSpaceOnUse" id="lineGrad3" x1="400" x2="250" y1="290" y2="200">
                        <stop stopColor="#4cd7f6" />
                        <stop offset="1" stopColor="#4d8eff" />
                      </linearGradient>
                      <linearGradient gradientUnits="userSpaceOnUse" id="lineGrad4" x1="110" x2="250" y1="270" y2="200">
                        <stop stopColor="#4d8eff" />
                        <stop offset="1" stopColor="#c4abff" />
                      </linearGradient>
                      <radialGradient cx="50%" cy="50%" id="botAura" r="50%">
                        <stop offset="0%" stopColor="#4d8eff" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="#0b1326" stopOpacity="0" />
                      </radialGradient>
                    </defs>

                    {/* Edge Connection Curves */}
                    <path d="M 120 110 Q 185 140 250 200" stroke="url(#lineGrad1)" strokeDasharray="6 4" strokeOpacity="0.8" strokeWidth="2.5" />
                    <path d="M 380 90 Q 320 140 250 200" stroke="url(#lineGrad2)" strokeDasharray="6 4" strokeOpacity="0.8" strokeWidth="2.5" />
                    <path d="M 400 290 Q 330 270 250 200" stroke="url(#lineGrad3)" strokeDasharray="6 4" strokeOpacity="0.8" strokeWidth="2.5" />
                    <path d="M 110 270 Q 180 250 250 200" stroke="url(#lineGrad4)" strokeDasharray="6 4" strokeOpacity="0.8" strokeWidth="2.5" />
                    <path d="M 250 70 L 250 160" stroke="#4d8eff" strokeDasharray="4 4" strokeOpacity="0.6" strokeWidth="2" />

                    {/* Center Aura */}
                    <circle cx="250" cy="205" fill="url(#botAura)" r="90" />

                    {/* Center AI Bot Node Capsule */}
                    <g transform="translate(200, 155)">
                      <rect fill="#171f33" height="96" rx="28" stroke="#4d8eff" strokeWidth="2" width="100" />
                      <rect fill="#060e20" height="46" rx="14" width="70" x="15" y="18" />
                      <circle cx="36" cy="40" fill="#4cd7f6" r="7" />
                      <circle cx="38" cy="38" fill="#ffffff" r="2.5" />
                      <circle cx="64" cy="40" fill="#4cd7f6" r="7" />
                      <circle cx="66" cy="38" fill="#ffffff" r="2.5" />
                      <path d="M 8 36 Q 2 36 2 44 Q 2 52 8 52" fill="#4d8eff" />
                      <path d="M 92 36 Q 98 36 98 44 Q 98 52 92 52" fill="#4d8eff" />
                      <path d="M 45 49 Q 50 54 55 49" fill="none" stroke="#acedff" strokeLinecap="round" strokeWidth="2" />
                      <rect fill="#222a3d" height="15" rx="7.5" width="50" x="25" y="72" />
                      <text fill="#adc6ff" fontFamily="'JetBrains Mono', monospace" fontSize="9" fontWeight="700" textAnchor="middle" x="50" y="83">
                        AI AGENT
                      </text>
                    </g>

                    {/* Top Node: Web Search */}
                    <g transform="translate(225, 45)">
                      <rect fill="#171f33" height="50" rx="16" stroke="#4cd7f6" strokeWidth="1.5" width="50" />
                      <circle cx="25" cy="25" fill="#009eb9" fillOpacity="0.3" r="14" />
                      <path d="M25 15C19.5 15 15 19.5 15 25C15 30.5 19.5 35 25 35C30.5 35 35 30.5 35 25C35 19.5 30.5 15 25 15ZM25 33C20.6 33 17 29.4 17 25C17 20.6 20.6 17 25 17C29.4 17 33 20.6 33 25C33 29.4 29.4 33 25 33Z" fill="#4cd7f6" />
                      <path d="M25 15C22 18 20 22 20 25C20 28 22 32 25 35C28 32 30 28 30 25C30 22 28 18 25 15Z" fill="none" stroke="#4cd7f6" strokeWidth="1.2" />
                      <line stroke="#4cd7f6" strokeWidth="1.2" x1="16" x2="34" y1="25" y2="25" />
                    </g>

                    {/* Top-Left Node: Device/API */}
                    <g transform="translate(85, 80)">
                      <rect fill="#171f33" height="56" rx="18" stroke="#4d8eff" strokeWidth="1.5" width="65" />
                      <rect fill="#4d8eff" fillOpacity="0.2" height="28" rx="5" stroke="#adc6ff" strokeWidth="1.5" width="25" x="20" y="14" />
                      <circle cx="32.5" cy="36" fill="#ffffff" r="1.5" />
                    </g>

                    {/* Top-Right Node: LLM */}
                    <g transform="translate(345, 60)">
                      <rect fill="#222a3d" height="60" rx="18" stroke="#c4abff" strokeWidth="1.5" width="78" />
                      <text fill="#d0bcff" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="14" fontWeight="800" textAnchor="middle" x="39" y="36">
                        LLM
                      </text>
                    </g>

                    {/* Bottom-Left Node: Database Storage */}
                    <g transform="translate(75, 240)">
                      <rect fill="#171f33" height="60" rx="18" stroke="#4d8eff" strokeWidth="1.5" width="70" />
                      <ellipse cx="35" cy="20" fill="#4d8eff" fillOpacity="0.4" rx="15" ry="5" stroke="#4d8eff" strokeWidth="1.2" />
                      <path d="M 20 20 v 8 a 15 5 0 0 0 30 0 v -8" fill="none" stroke="#4d8eff" strokeWidth="1.2" />
                      <path d="M 20 28 v 8 a 15 5 0 0 0 30 0 v -8" fill="none" stroke="#4d8eff" strokeWidth="1.2" />
                    </g>

                    {/* Bottom-Right Node: Code Execution </ > */}
                    <g transform="translate(365, 255)">
                      <rect fill="#171f33" height="60" rx="18" stroke="#4cd7f6" strokeWidth="1.5" width="74" />
                      <text fill="#4cd7f6" fontFamily="'JetBrains Mono', monospace" fontSize="16" fontWeight="700" textAnchor="middle" x="37" y="37">
                        &lt; / &gt;
                      </text>
                    </g>

                    {/* Floating Data Packets */}
                    <circle cx="185" cy="155" fill="#acedff" r="3.5">
                      <animate attributeName="opacity" dur="2s" repeatCount="indefinite" values="0.3;1;0.3" />
                    </circle>
                    <circle cx="315" cy="145" fill="#c4abff" r="3.5">
                      <animate attributeName="opacity" dur="2.4s" repeatCount="indefinite" values="1;0.3;1" />
                    </circle>
                    <circle cx="320" cy="245" fill="#4cd7f6" r="3.5">
                      <animate attributeName="opacity" dur="1.8s" repeatCount="indefinite" values="0.2;0.9;0.2" />
                    </circle>
                  </svg>
                </div>
              </div>
            </section>

            {/* 2. 5-Step Process Feature Cards Row */}
            <section className="mt-space-xl w-full">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-space-md">
                {/* Step 1: 배우기 */}
                <div className="group p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col items-center text-center shadow-sm hover:shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-inner">
                    <span className="material-symbols-outlined text-[24px]">school</span>
                  </div>
                  <span className="mt-space-md font-headline-sm text-headline-sm text-on-surface font-bold">배우기</span>
                  <p className="mt-space-xs font-body-sm text-body-sm text-outline leading-tight">
                    AI와 Agent에 대한<br />기본 개념을 학습해요.
                  </p>
                </div>

                {/* Step 2: 설계하기 */}
                <div className="group p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col items-center text-center shadow-sm hover:shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-primary-container group-hover:scale-110 transition-transform shadow-inner">
                    <span className="material-symbols-outlined text-[24px]">architecture</span>
                  </div>
                  <span className="mt-space-md font-headline-sm text-headline-sm text-on-surface font-bold">설계하기</span>
                  <p className="mt-space-xs font-body-sm text-body-sm text-outline leading-tight">
                    Node를 연결하여<br />나만의 Agent를 설계해요.
                  </p>
                </div>

                {/* Step 3: 제작하기 */}
                <div className="group p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col items-center text-center shadow-sm hover:shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-secondary group-hover:scale-110 transition-transform shadow-inner">
                    <span className="material-symbols-outlined text-[24px]">build</span>
                  </div>
                  <span className="mt-space-md font-headline-sm text-headline-sm text-on-surface font-bold">제작하기</span>
                  <p className="mt-space-xs font-body-sm text-body-sm text-outline leading-tight">
                    설계한 Agent를<br />직접 만들어보세요.
                  </p>
                </div>

                {/* Step 4: 실행하기 */}
                <div className="group p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col items-center text-center shadow-sm hover:shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-tertiary group-hover:scale-110 transition-transform shadow-inner">
                    <span className="material-symbols-outlined text-[24px]">play_circle</span>
                  </div>
                  <span className="mt-space-md font-headline-sm text-headline-sm text-on-surface font-bold">실행하기</span>
                  <p className="mt-space-xs font-body-sm text-body-sm text-outline leading-tight">
                    제작한 Agent를 실행하고<br />동작을 확인해요.
                  </p>
                </div>

                {/* Step 5: 체험하기 */}
                <div className="group p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col items-center text-center shadow-sm hover:shadow-lg col-span-2 sm:col-span-1">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-tertiary-fixed-dim group-hover:scale-110 transition-transform shadow-inner">
                    <span className="material-symbols-outlined text-[24px]">smart_toy</span>
                  </div>
                  <span className="mt-space-md font-headline-sm text-headline-sm text-on-surface font-bold">체험하기</span>
                  <p className="mt-space-xs font-body-sm text-body-sm text-outline leading-tight">
                    실제 시나리오에서<br />직접 체험해보세요.
                  </p>
                </div>
              </div>
            </section>

            {/* 3. Popular Templates (인기 템플릿) Section */}
            <section className="mt-space-xl mb-space-xl w-full">
              {/* Section Header */}
              <div className="flex items-center justify-between mb-space-md">
                <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-space-xs">
                  인기 템플릿
                </h2>
                <Link
                  to="/noa-e/nodes"
                  className="font-body-sm text-body-sm text-outline hover:text-primary transition-colors flex items-center gap-1 group"
                >
                  <span>더보기</span>
                  <span className="material-symbols-outlined text-[16px] group-hover:translate-x-0.5 transition-transform">
                    chevron_right
                  </span>
                </Link>
              </div>

              {/* 4 Template Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
                {/* Card 1: AI 챗봇 */}
                <div className="p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between shadow-sm hover:shadow-md group">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary mb-space-md group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                      <span className="material-symbols-outlined text-[20px]">chat</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">AI 챗봇</h3>
                    <p className="mt-space-xs font-body-sm text-body-sm text-outline leading-snug">
                      기본적인 대화형 AI Agent를 만들 수 있는 템플릿입니다.
                    </p>
                  </div>
                  <div className="mt-space-lg flex items-center justify-between">
                    <span className="px-space-sm py-0.5 rounded bg-surface-container-highest text-primary font-label-badge text-label-badge font-semibold">
                      기초
                    </span>
                    <Link
                      to="/noa-e/studio"
                      aria-label="템플릿 열기"
                      className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-outline group-hover:text-on-surface group-hover:bg-surface-bright transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>

                {/* Card 2: 웹 검색 어시스턴트 */}
                <div className="p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between shadow-sm hover:shadow-md group">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-tertiary mb-space-md group-hover:bg-tertiary-container group-hover:text-on-tertiary-container transition-colors">
                      <span className="material-symbols-outlined text-[20px]">search</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">웹 검색 어시스턴트</h3>
                    <p className="mt-space-xs font-body-sm text-body-sm text-outline leading-snug">
                      웹에서 정보를 검색하여 요약해주는 Agent입니다.
                    </p>
                  </div>
                  <div className="mt-space-lg flex items-center justify-between">
                    <span className="px-space-sm py-0.5 rounded bg-surface-container-highest text-tertiary font-label-badge text-label-badge font-semibold">
                      실습
                    </span>
                    <Link
                      to="/noa-e/studio"
                      aria-label="템플릿 열기"
                      className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-outline group-hover:text-on-surface group-hover:bg-surface-bright transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>

                {/* Card 3: 문서 요약기 */}
                <div className="p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between shadow-sm hover:shadow-md group">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary mb-space-md group-hover:bg-secondary-container group-hover:text-on-secondary-container transition-colors">
                      <span className="material-symbols-outlined text-[20px]">description</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">문서 요약기</h3>
                    <p className="mt-space-xs font-body-sm text-body-sm text-outline leading-snug">
                      긴 문서를 요약해주는 Agent입니다.
                    </p>
                  </div>
                  <div className="mt-space-lg flex items-center justify-between">
                    <span className="px-space-sm py-0.5 rounded bg-surface-container-highest text-secondary font-label-badge text-label-badge font-semibold">
                      실습
                    </span>
                    <Link
                      to="/noa-e/studio"
                      aria-label="템플릿 열기"
                      className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-outline group-hover:text-on-surface group-hover:bg-surface-bright transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>

                {/* Card 4: 이미지 생성 도우미 */}
                <div className="p-space-lg rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between shadow-sm hover:shadow-md group">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary mb-space-md group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors">
                      <span className="material-symbols-outlined text-[20px]">image</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">이미지 생성 도우미</h3>
                    <p className="mt-space-xs font-body-sm text-body-sm text-outline leading-snug">
                      텍스트로 이미지를 생성하는 Agent입니다.
                    </p>
                  </div>
                  <div className="mt-space-lg flex items-center justify-between">
                    <span className="px-space-sm py-0.5 rounded bg-surface-container-highest text-primary font-label-badge text-label-badge font-semibold">
                      실습
                    </span>
                    <Link
                      to="/noa-e/studio"
                      aria-label="템플릿 열기"
                      className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center text-outline group-hover:text-on-surface group-hover:bg-surface-bright transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
