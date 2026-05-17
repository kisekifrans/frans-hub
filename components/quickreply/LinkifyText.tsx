"use client";

const URL_SPLIT = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]'"])/gi;

export function LinkifyText({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(URL_SPLIT);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//i.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-90"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
