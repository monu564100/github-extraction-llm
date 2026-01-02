import { memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";

interface MarkdownRendererProps {
  content: string;
  paperMode?: boolean;
}

export const MarkdownRenderer = memo(function MarkdownRenderer({ content, paperMode = false }: MarkdownRendererProps) {
  // Paper/Kindle mode styles - warm sepia tones, serif fonts - OPTIMIZED FOR READABILITY
  if (paperMode) {
    return (
      <div className="kindle-content font-serif space-y-6">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-amber-950 mt-8 mb-6 first:mt-0 font-serif tracking-tight border-b-2 border-amber-800/30 pb-3">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <div className="mt-10 mb-6 first:mt-0">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-900 font-serif flex items-center gap-3">
                  <span className="w-1.5 h-8 bg-amber-600 rounded-full"></span>
                  {children}
                </h2>
                <div className="h-px bg-gradient-to-r from-amber-800/30 via-amber-600/20 to-transparent mt-3"></div>
              </div>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-amber-800 mt-8 mb-4 font-serif flex items-center gap-2">
                <span className="text-amber-600">◆</span>
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-base sm:text-lg md:text-xl font-semibold text-amber-700 mt-6 mb-3 font-serif">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="text-stone-700 mb-5 leading-[2] text-base sm:text-lg md:text-xl font-serif text-justify hyphens-auto first-letter:text-xl first-letter:font-semibold">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-amber-900 bg-amber-100/50 px-1 rounded">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic text-stone-600 border-b border-dotted border-stone-400">{children}</em>
            ),
            ul: ({ children }) => (
              <ul className="mb-6 space-y-3 ml-2 border-l-2 border-amber-200 pl-6">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-none mb-6 space-y-4 ml-2 counter-reset-item">{children}</ol>
            ),
            li: ({ children, ...props }) => {
              // Check if parent is ordered list by looking at the node
              const isOrdered = props.node?.position?.start?.column === 1;
              return (
                <li className="text-stone-700 leading-[1.9] text-base sm:text-lg md:text-xl flex items-start gap-4 group">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-semibold mt-0.5 group-hover:bg-amber-200 transition-colors">
                    •
                  </span>
                  <span className="flex-1 pt-0.5">{children}</span>
                </li>
              );
            },
            code: ({ className, children, ...props }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-amber-100 px-2 py-1 rounded-md text-sm sm:text-base font-mono text-amber-900 border border-amber-200 shadow-sm">
                    {children}
                  </code>
                );
              }
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            pre: ({ children }) => (
              <div className="my-6 rounded-xl overflow-hidden shadow-lg border border-amber-200">
                <div className="bg-amber-900 px-4 py-2 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400/80"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-400/80"></span>
                  <span className="w-3 h-3 rounded-full bg-green-400/80"></span>
                  <span className="ml-2 text-amber-200/60 text-xs font-mono">Code</span>
                </div>
                <pre className="bg-stone-900 p-5 overflow-x-auto">
                  <code className="text-sm sm:text-base font-mono text-stone-200 leading-relaxed">{children}</code>
                </pre>
              </div>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-8 relative">
                <div className="absolute -left-2 top-0 text-6xl text-amber-300/40 font-serif leading-none">"</div>
                <div className="border-l-4 border-amber-600 pl-6 ml-4 py-4 bg-gradient-to-r from-amber-50/80 to-transparent rounded-r-lg">
                  <div className="italic text-stone-600 text-lg sm:text-xl leading-relaxed">
                    {children}
                  </div>
                </div>
              </blockquote>
            ),
            hr: () => (
              <div className="flex items-center justify-center my-10 gap-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-800/30 to-transparent" />
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-600/50"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-600/30"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-600/50"></span>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-800/30 to-transparent" />
              </div>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-700 hover:text-amber-900 underline decoration-amber-500/50 decoration-2 underline-offset-2 hover:decoration-amber-700 transition-colors font-medium"
              >
                {children} ↗
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-8 rounded-xl border border-amber-200 shadow-lg">
                <table className="w-full border-collapse">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gradient-to-r from-amber-100 to-amber-50">
                {children}
              </thead>
            ),
            th: ({ children }) => (
              <th className="px-5 py-4 text-left font-bold border-b-2 border-amber-200 text-amber-900 font-serif text-base sm:text-lg">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-5 py-4 border-b border-amber-100 text-stone-700 text-base sm:text-lg">{children}</td>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-amber-50/50 transition-colors">{children}</tr>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Default dark mode styles
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold text-zinc-100 mt-6 mb-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold text-zinc-200 mt-6 mb-3 flex items-center gap-2 border-b border-zinc-800 pb-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold text-zinc-300 mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-zinc-400 mb-3 leading-relaxed">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-zinc-200">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-500">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside mb-4 space-y-1 ml-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside mb-4 space-y-1 ml-2">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-zinc-400">{children}</li>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-zinc-800 px-1.5 py-0.5 rounded-md text-sm font-mono text-zinc-300">
                  {children}
                </code>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-zinc-900 rounded-xl p-4 overflow-x-auto mb-4 border border-zinc-800">
              <code className="text-sm font-mono text-zinc-300">{children}</code>
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-zinc-600 pl-4 my-4 italic text-zinc-500">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-zinc-800 my-6" />,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-300 hover:text-white underline"
            >
              {children}
            </a>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse border border-zinc-800 rounded-lg">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="bg-zinc-900 px-4 py-2 text-left font-bold border border-zinc-800 text-zinc-200">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2 border border-zinc-800 text-zinc-400">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});
