"use client";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IconCheck, IconCopy } from "@tabler/icons-react";

type CodeBlockProps = {
  language: string;
  filename: string;
  highlightLines?: number[];
  onSelection?: (payload: { text: string; lines: number[] }) => void;
} & (
  | {
      code: string;
      tabs?: never;
    }
  | {
      code?: never;
      tabs: Array<{
        name: string;
        code: string;
        language?: string;
        highlightLines?: number[];
      }>;
    }
);

export const CodeBlock = ({
  language,
  filename,
  code,
  highlightLines,
  tabs = [],
  onSelection,
}: CodeBlockProps) => {
  const [copied, setCopied] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState(0);
  const [localHighlights, setLocalHighlights] = React.useState<number[]>(Array.isArray(highlightLines) ? highlightLines : []);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const prevPropHighlights = React.useRef<number[] | undefined>(highlightLines);

  const tabsExist = tabs.length > 0;

  const copyToClipboard = async () => {
    const textToCopy = tabsExist ? tabs[activeTab].code : code;
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeCode = tabsExist ? tabs[activeTab].code : code;
  const activeLanguage = tabsExist
    ? tabs[activeTab].language || language
    : language;
  const activeHighlightLines = tabsExist
    ? tabs[activeTab].highlightLines || localHighlights
    : (localHighlights.length ? localHighlights : (highlightLines || []));

  React.useEffect(() => {
    // Only sync from prop when it's provided and actually changed (by reference or length)
    if (!highlightLines) return;
    if (prevPropHighlights.current === highlightLines) return;
    prevPropHighlights.current = highlightLines;
    setLocalHighlights(highlightLines);
  }, [highlightLines]);

  React.useEffect(() => {
    const onClick = (e: MouseEvent) => {
      let range: Range | null = null;
      const anyDoc: any = document as any;
      if (anyDoc.caretRangeFromPoint) {
        range = anyDoc.caretRangeFromPoint(e.clientX, e.clientY);
      } else if (anyDoc.caretPositionFromPoint) {
        const pos = anyDoc.caretPositionFromPoint(e.clientX, e.clientY);
        if (pos) {
          range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
        }
      }
      if (!range) return;
      const node = range.startContainer as Node;
      const offset = range.startOffset as number;
      if (node.nodeType !== Node.TEXT_NODE) return;
      const text = (node.textContent || '');
      if (!text.length) return;

      const isWordChar = (ch: string) => /[A-Za-z0-9_\-]/.test(ch);
      let left = offset;
      while (left > 0 && isWordChar(text[left - 1])) left--;
      let right = offset;
      while (right < text.length && isWordChar(text[right])) right++;
      const token = text.slice(left, right).replace(/["',]/g, '').trim();
      if (!token) return;

      const source = tabsExist ? tabs[activeTab].code : code || '';
      if (!source) return;
      const lines = source.split('\n');
      const matches: number[] = [];
      lines.forEach((line, idx) => {
        if (line.includes(token)) matches.push(idx + 1);
      });
      if (matches.length) {
        setLocalHighlights(matches);
        onSelection?.({ text: token, lines: matches });
      }
    };
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }, [activeTab, tabsExist, code, onSelection, tabs]);

  return (
    <div ref={containerRef} className="relative w-full rounded-lg bg-slate-900 p-4 font-mono text-sm overflow-x-auto">
      <div className="flex flex-col gap-2">
        {tabsExist && (
          <div className="flex  overflow-x-auto">
            {tabs.map((tab, index) => (
              <button
                key={index}
                onClick={() => setActiveTab(index)}
                className={`px-3 !py-2 text-xs transition-colors font-sans ${
                  activeTab === index
                    ? "text-white"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        )}
        {!tabsExist && filename && (
          <div className="flex justify-between items-center py-2">
            <div className="text-xs text-zinc-400">{filename}</div>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-sans"
            >
              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
            </button>
          </div>
        )}
      </div>
      <SyntaxHighlighter
        language={activeLanguage}
        style={atomDark}
        customStyle={{
          margin: 0,
          padding: 0,
          background: "transparent",
          fontSize: "0.875rem", // text-sm equivalent
        }}
        wrapLines={true}
        showLineNumbers={true}
        lineProps={(lineNumber) => ({
          "data-line": lineNumber,

          style: {
            backgroundColor: activeHighlightLines.includes(lineNumber)
              ? "rgba(99,102,241,0.2)"
              : "transparent",
            display: "block",
            width: "100%",
            cursor: "text",
            userSelect: "text",
          },
        })}
        PreTag="div"
        onClick={(e: any) => {
          const source = tabsExist ? tabs[activeTab].code : code || '';
          const lines = source.split('\n');
          const lineEl = (e.target as HTMLElement).closest('[data-line]') as HTMLElement | null;
          const clickedLine = lineEl ? parseInt(lineEl.getAttribute('data-line') || '0', 10) : 0;

          // caret word under click
          let range: Range | null = null;
          const anyDoc: any = document as any;
          if (anyDoc.caretRangeFromPoint) {
            range = anyDoc.caretRangeFromPoint(e.clientX, e.clientY);
          } else if (anyDoc.caretPositionFromPoint) {
            const pos = anyDoc.caretPositionFromPoint(e.clientX, e.clientY);
            if (pos) {
              range = document.createRange();
              range.setStart(pos.offsetNode, pos.offset);
              range.collapse(true);
            }
          }
          let token = '';
          if (range && range.startContainer?.nodeType === Node.TEXT_NODE) {
            const text = String(range.startContainer.textContent || '');
            const offset = range.startOffset || 0;
            const isWordChar = (ch: string) => /[A-Za-z0-9_\-]/.test(ch);
            let left = offset;
            while (left > 0 && isWordChar(text[left - 1])) left--;
            let right = offset;
            while (right < text.length && isWordChar(text[right])) right++;
            token = text.slice(left, right).replace(/["',]/g, '').trim();
          }

          // compute base line: if token is known, prefer nearest occurrence; otherwise clicked line
          const matchIdxs: number[] = [];
          lines.forEach((ln, idx) => { if (token && ln.includes(token)) matchIdxs.push(idx + 1); });
          const baseLine = matchIdxs.length
            ? matchIdxs.reduce((best, n) => (Math.abs(n - clickedLine) < Math.abs(best - clickedLine) ? n : best), matchIdxs[0])
            : clickedLine;

          // Build a stack of opening braces from top to baseLine to find true container start
          const countOpens = (s: string) => (s.match(/\{/g) || []).length;
          const countCloses = (s: string) => (s.match(/\}/g) || []).length;
          const stack: number[] = [];
          for (let i = 1; i <= baseLine; i++) {
            const opens = countOpens(lines[i - 1] || '');
            const closes = countCloses(lines[i - 1] || '');
            for (let k = 0; k < opens; k++) stack.push(i);
            for (let k = 0; k < closes; k++) stack.pop();
          }
          const start = stack.length ? stack[stack.length - 1] : baseLine;

          // From start, walk forward with depth to find matching close
          let depth = 0;
          let end = start;
          for (let j = start; j <= lines.length; j++) {
            depth += countOpens(lines[j - 1] || '');
            depth -= countCloses(lines[j - 1] || '');
            if (depth === 0) { end = j; break; }
          }
          const rangeLines: number[] = []; for (let n = start; n <= end; n++) rangeLines.push(n);
          setLocalHighlights(rangeLines);
          onSelection?.({ text: token || '', lines: rangeLines });
        }}
      >
        {String(activeCode)}
      </SyntaxHighlighter>
    </div>
  );
};
