import React from 'react';
import type { Components } from 'react-markdown';

/**
 * 일반 텍스트에 노출된 Raw URL(http://, https://)을 마크다운 링크 형식 [URL](URL)로 변환합니다.
 * 이미 [텍스트](URL) 또는 <URL> 형태인 마크다운 링크는 그대로 보존하여 중복 변환을 방지합니다.
 */
export const linkifyBareUrls = (text: string): string => {
  if (!text) return '';
  return text.replace(
    /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|<https?:\/\/[^>]+>)|(https?:\/\/[^\s<>)\]]+)/g,
    (match, existingLink, bareUrl) => {
      if (existingLink) {
        return existingLink;
      }
      if (bareUrl) {
        const trailingMatch = bareUrl.match(/([.,;:!?]+)$/);
        const trailing = trailingMatch ? trailingMatch[1] : '';
        const cleanUrl = trailing ? bareUrl.slice(0, -trailing.length) : bareUrl;
        return `[${cleanUrl}](${cleanUrl})${trailing}`;
      }
      return match;
    }
  );
};

/**
 * ReactMarkdown 공통 커스텀 컴포넌트:
 * 모든 마크다운 링크(<a>)에 밑줄과 강조 색상을 부여하고 새 탭에서 열리도록 설정합니다.
 */
export const markdownComponents: Components = {
  a: ({ href, children, ...props }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="text-primary underline underline-offset-4 decoration-primary hover:text-tertiary hover:decoration-tertiary transition-colors font-medium break-all cursor-pointer"
      {...props}
    >
      {children}
    </a>
  ),
};

/**
 * 실행 콘솔(ExecutionPanel) 등 일반 로그 문자열 내의 마크다운 링크([제목](URL)) 및 Raw URL에
 * 밑줄과 클릭 가능한 링크 태그를 적용하여 렌더링합니다.
 */
export const renderTextWithLinks = (text: string): React.ReactNode => {
  if (!text) return text;

  const tokenRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))|(https?:\/\/[^\s<>)\]]+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const mdLabel = match[2];
    const mdUrl = match[3];
    const rawUrl = match[4];

    if (mdLabel && mdUrl) {
      parts.push(
        <a
          key={`md-${match.index}`}
          href={mdUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-primary underline underline-offset-4 decoration-primary hover:text-tertiary hover:decoration-tertiary transition-colors font-medium break-all"
        >
          {mdLabel}
        </a>
      );
    } else if (rawUrl) {
      const trailingMatch = rawUrl.match(/([.,;:!?]+)$/);
      const trailing = trailingMatch ? trailingMatch[1] : '';
      const cleanUrl = trailing ? rawUrl.slice(0, -trailing.length) : rawUrl;
      parts.push(
        <a
          key={`url-${match.index}`}
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-primary underline underline-offset-4 decoration-primary hover:text-tertiary hover:decoration-tertiary transition-colors font-medium break-all"
        >
          {cleanUrl}
        </a>
      );
      if (trailing) {
        parts.push(trailing);
      }
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex === 0) {
    return text;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};

