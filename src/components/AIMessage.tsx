"use client";

type AIMessageProps = {
  content: string;
};

function renderInline(text: string) {
  const parts = text.split(
    /(\*\*.*?\*\*|\*.*?\*)/g
  );

  return parts.map((part, index) => {
    if (
      part.startsWith("**") &&
      part.endsWith("**")
    ) {
      return (
        <strong
          key={index}
          className="font-semibold text-slate-900"
        >
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (
      part.startsWith("*") &&
      part.endsWith("*")
    ) {
      return (
        <em key={index}>
          {part.slice(1, -1)}
        </em>
      );
    }

    return (
      <span key={index}>
        {part}
      </span>
    );
  });
}

export default function AIMessage({
  content,
}: AIMessageProps) {
  const lines = content.split("\n");

  const elements: React.ReactNode[] = [];

  let bulletItems: string[] = [];
  let numberedItems: string[] = [];

  function flushLists() {
    if (bulletItems.length > 0) {
      elements.push(
        <ul
          key={`ul-${elements.length}`}
          className="my-2 list-disc space-y-1 pl-5"
        >
          {bulletItems.map(
            (item, index) => (
              <li key={index}>
                {renderInline(item)}
              </li>
            )
          )}
        </ul>
      );

      bulletItems = [];
    }

    if (numberedItems.length > 0) {
      elements.push(
        <ol
          key={`ol-${elements.length}`}
          className="my-2 list-decimal space-y-1 pl-5"
        >
          {numberedItems.map(
            (item, index) => (
              <li key={index}>
                {renderInline(item)}
              </li>
            )
          )}
        </ol>
      );

      numberedItems = [];
    }
  }

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    /*
     * Horizontal rule
     */
    if (
      trimmed === "---" ||
      trimmed === "***"
    ) {
      flushLists();

      elements.push(
        <hr
          key={`hr-${index}`}
          className="my-3 border-slate-200"
        />
      );

      return;
    }

    /*
     * Empty line
     */
    if (!trimmed) {
      flushLists();

      elements.push(
        <div
          key={`space-${index}`}
          className="h-2"
        />
      );

      return;
    }

    /*
     * Bullet list
     */
    if (
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ")
    ) {
      bulletItems.push(
        trimmed.slice(2)
      );

      return;
    }

    /*
     * Numbered list
     */
    const numberedMatch =
      trimmed.match(
        /^\d+\.\s+(.*)$/
      );

    if (numberedMatch) {
      numberedItems.push(
        numberedMatch[1]
      );

      return;
    }

    /*
     * Normal paragraph
     */
    flushLists();

    elements.push(
      <p
        key={`p-${index}`}
        className="mb-2 last:mb-0"
      >
        {renderInline(trimmed)}
      </p>
    );
  });

  flushLists();

  return (
    <div className="space-y-1">
      {elements}
    </div>
  );
}