import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const LessonNotePdfView = ({ note, elementId }) => {
  if (!note) return null;

  return (
    <div
      id={elementId}
      style={{
        fontFamily: 'Arial, sans-serif',
        fontSize: '12pt',
        lineHeight: '1.5',
        color: '#000',
        background: '#fff',
        padding: '0',
        maxWidth: '210mm',
        margin: '0 auto',
      }}
    >
      {/* TITLE */}
      <h1 style={{ textAlign: 'center', marginBottom: '12pt' }}>
        {note.title || `Lesson Note: ${note.subStrand?.name || ''}`}
      </h1>

      {/* META */}
      <p style={{ textAlign: 'center', fontSize: '10pt', marginBottom: '18pt' }}>
        Created on{' '}
        {new Date(note.createdAt).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
      </p>

      {/* CONTENT */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h2: ({ children }) => (
            <h2 style={{ marginTop: '18pt', marginBottom: '8pt' }}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ marginTop: '14pt', marginBottom: '6pt' }}>{children}</h3>
          ),
          p: ({ children }) => (
            <p style={{ margin: '6pt 0' }}>{children}</p>
          ),
          table: ({ children }) => (
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                margin: '10pt 0',
              }}
            >
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th
              style={{
                border: '1px solid #000',
                padding: '6pt',
                background: '#f0f0f0',
                textAlign: 'left',
              }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              style={{
                border: '1px solid #000',
                padding: '6pt',
                verticalAlign: 'top',
              }}
            >
              {children}
            </td>
          ),
        }}
      >
        {note.content || ''}
      </ReactMarkdown>
    </div>
  );
};

export default LessonNotePdfView;
