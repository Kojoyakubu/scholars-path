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
        fontSize: '11pt', // Standardized font size
        lineHeight: '1.25', // Slightly tighter for space
        color: '#000',
        background: '#fff',
        padding: '8mm', // Reduced padding to gain more vertical space
        maxWidth: '210mm',
        margin: '0 auto',
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 style={{ fontSize: '15pt', textAlign: 'center', margin: '0 0 8pt 0', borderBottom: '1px solid #000' }}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ fontSize: '12pt', marginTop: '8pt', marginBottom: '3pt', borderLeft: '3px solid #000', paddingLeft: '5pt' }}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ fontSize: '11pt', marginTop: '6pt', marginBottom: '2pt', fontWeight: 'bold' }}>{children}</h3>
          ),
          p: ({ children }) => (
            <p style={{ margin: '2pt 0' }}>{children}</p>
          ),
          ul: ({ children }) => (
            <ul style={{ margin: '1pt 0', paddingLeft: '15pt' }}>{children}</ul>
          ),
          li: ({ children }) => (
            <li style={{ marginBottom: '1pt' }}>{children}</li>
          ),
          table: ({ children }) => (
            <div style={{ pageBreakInside: 'avoid' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', margin: '6pt 0', tableLayout: 'fixed' }}>
                {children}
              </table>
            </div>
          ),
          tr: ({ children }) => {
            const childrenArray = React.Children.toArray(children);
            // Specifically target the 3-column Lesson Phases table
            if (childrenArray.length === 3) {
              return (
                <tr style={{ pageBreakInside: 'avoid' }}>
                  {childrenArray.map((child, index) => {
                    // Force 25% - 50% - 25% layout for all rows in this table
                    const width = index === 1 ? '50%' : '25%';
                    return React.cloneElement(child, {
                      style: { ...child?.props?.style, width, fontSize: '11pt', border: '1px solid #000', padding: '3pt' }
                    });
                  })}
                </tr>
              );
            }
            return <tr>{children}</tr>;
          },
          th: ({ children }) => (
            <th style={{ border: '1px solid #000', padding: '3pt', background: '#f2f2f2', textAlign: 'left', fontSize: '11pt' }}>{children}</th>
          ),
          td: ({ children }) => (
            <td style={{ border: '1px solid #000', padding: '3pt', verticalAlign: 'top', fontSize: '11pt' }}>{children}</td>
          ),
        }}
      >
        {note.content || ''}
      </ReactMarkdown>

      {/* COMPACT FOOTER - Integrated to save space */}
      <div style={{ marginTop: '10pt', fontSize: '10pt', pageBreakInside: 'avoid' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000', padding: '3pt', width: '50%' }}><strong>Facilitator:</strong></td>
              <td style={{ border: '1px solid #000', padding: '3pt', width: '50%' }}><strong>Vetted By:</strong></td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #000', padding: '3pt' }}><strong>Signature:</strong></td>
              <td style={{ border: '1px solid #000', padding: '3pt' }}><strong>Date:</strong></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LessonNotePdfView;