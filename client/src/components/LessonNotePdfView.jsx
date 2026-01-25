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
        fontSize: '11pt',
        lineHeight: '1.3',
        color: '#000',
        background: '#fff',
        padding: '5mm 10mm 10mm 10mm', 
        maxWidth: '210mm',
        margin: '0 auto',
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 style={{ 
              fontSize: '16pt', 
              textAlign: 'center', 
              margin: '0 0 10pt 0', // Explicitly set top margin to 0
              borderBottom: '1px solid #000',
              paddingBottom: '2pt' 
            }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ fontSize: '13pt', marginTop: '10pt', marginBottom: '4pt', color: '#333', borderLeft: '4px solid #ccc', paddingLeft: '5pt' }}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ fontSize: '11pt', marginTop: '8pt', marginBottom: '2pt' }}>{children}</h3>
          ),
          p: ({ children }) => (
            <p style={{ margin: '4pt 0' }}>{children}</p>
          ),
          ul: ({ children }) => (
            <ul style={{ margin: '2pt 0', paddingLeft: '15pt' }}>{children}</ul>
          ),
          li: ({ children }) => (
            <li style={{ marginBottom: '2pt' }}>{children}</li>
          ),
          table: ({ children }) => (
            <div style={{ overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8pt 0', fontSize: '11pt' }}>
                {children}
              </table>
            </div>
          ),
          tr: ({ children }) => {
            const childrenArray = React.Children.toArray(children);
            if (childrenArray.length === 3) {
              return (
                <tr>
                  {childrenArray.map((child, index) => {
                    const width = index === 1 ? '50%' : '25%';
                    return React.cloneElement(child, {
                      style: { ...child.props.style, width }
                    });
                  })}
                </tr>
              );
            }
            return <tr>{children}</tr>;
          },
          th: ({ children, style }) => (
            <th style={{ ...style, border: '1px solid #000', padding: '4pt', background: '#f2f2f2', textAlign: 'left', fontWeight: 'bold' }}>{children}</th>
          ),
          td: ({ children, style }) => (
            <td style={{ ...style, border: '1px solid #000', padding: '4pt', verticalAlign: 'top' }}>{children}</td>
          ),
        }}
      >
        {note.content || ''}
      </ReactMarkdown>
    </div>
  );
};

export default LessonNotePdfView;