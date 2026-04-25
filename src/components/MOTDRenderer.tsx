'use client';

import { memo, useMemo } from 'react';
import { parseMOTD } from '@/lib/minecraft';

interface MOTDRendererProps {
  motd: {
    raw: string[];
    clean: string[];
    html: string[];
  };
}

// Basic HTML sanitizer - only allow safe tags and attributes for Minecraft MOTD
function sanitizeHTML(html: string): string {
  if (!html) return '';

  // Remove script tags and their content
  let sanitized = html.replace(/<script[^>]*>.*?<\/script>/gi, '');

  // Remove on* event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*\S+/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, 'blocked:');

  // Only allow specific safe tags for MOTD: <span>, <br>, <b>, <i>, <u>, <strike>
  // Remove all other tags but keep their content
  sanitized = sanitized.replace(/<(?!\/?(span|br|b|i|u|strike)\b)[^>]*>/gi, '');

  return sanitized;
}

export const MOTDRenderer = memo(function MOTDRenderer({ motd }: MOTDRendererProps) {
  // Memoize parsed content to avoid re-parsing
  const parsedContent = useMemo(() => {
    return motd.clean.map((_, index) => {
      const htmlContent = motd.html[index];
      return htmlContent || parseMOTD(motd.raw[index] || '');
    });
  }, [motd]);

  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
      <div className="text-xs text-gray-500 mb-2 font-medium">MOTD (Message of the Day)</div>
      <div className="space-y-1">
        {parsedContent.map((content, index) => (
          <div
            key={index}
            className="font-mono text-sm md:text-base animate-fade-in"
            style={{ animationDelay: `${index * 50}ms`, willChange: 'opacity' }}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(content) }}
          />
        ))}
      </div>
    </div>
  );
});
