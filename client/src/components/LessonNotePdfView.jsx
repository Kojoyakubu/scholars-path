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
        fontSize: '11pt', // Slightly larger for better readability
        lineHeight: '1.4',
        color: '#000',
        background: '#fff',
        padding: '12mm',
        maxWidth: '210mm',
        margin: '0 auto',
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Main Title (e.g., "Socialisation")
          h1: ({ children }) => (
            <h1 style={{ 
              fontSize: '18pt', 
              textAlign: 'center', 
              margin: '0 0 12pt 0', 
              textTransform: 'uppercase',
              borderBottom: '2px solid #333',
              paddingBottom: '4pt' 
            }}>{children}</h1>
          ),
          // Section Headers (e.g., "Curriculum Standards")
          h2: ({ children }) => (
            <h2 style={{ 
              fontSize: '14pt', 
              marginTop: '12pt', 
              marginBottom: '6pt', 
              backgroundColor: '#f4f4f4',
              padding: '2pt 6pt',
              borderLeft: '5px solid #000'
            }}>{children}</h2>
          ),
          // Sub-headers (e.g., "Lesson Phases")
          h3: ({ children }) => (
            <h3 style={{ fontSize: '12pt', marginTop: '10pt', marginBottom: '4pt', textDecoration: 'underline' }}>{children}</h3>
          ),
          p: ({ children }) => (
            <p style={{ margin: '5pt 0' }}>{children}</p>
          ),
          ul: ({ children }) => (
            <ul style={{ margin: '3pt 0', paddingLeft: '18pt' }}>{children}</ul>
          ),
          table: ({ children }) => (
            <div style={{ width: '100%', margin: '10pt 0' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'collapse', 
                fontSize: '9.5pt' // Better balance for table data
              }}>
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th style={{ border: '1px solid #000', padding: '5pt', background: '#e9e9e9', textAlign: 'left' }}>{children}</th>
          ),
          td: ({ children }) => (
            <td style={{ border: '1px solid #000', padding: '5pt', verticalAlign: 'top' }}>{children}</td>
          ),
        }}
      >
        {note.content || ''}
      </ReactMarkdown>
    </div>
  );
};

export default LessonNotePdfView;