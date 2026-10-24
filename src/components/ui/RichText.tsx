import { Fragment } from 'react';

/** Renders **bold** segments and line breaks without using innerHTML. */
export function RichText({ text, as: Tag = 'span', className }: { text: string; as?: 'span' | 'p' | 'div'; className?: string }) {
  const lines = text.split('\n');
  return (
    <Tag className={className}>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith('**') && part.endsWith('**') && part.length > 4 ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
          )}
        </Fragment>
      ))}
    </Tag>
  );
}
