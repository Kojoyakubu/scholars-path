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
        fontSize: '11pt', // Consistent font size across all pages
        lineHeight: '1.3',
        color: '#000',
        background: '#fff',
        padding: '10mm',
        maxWidth: '210mm',
        margin: '0 auto',
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 style={{ fontSize: '16pt', textAlign: 'center', margin: '0 0 10pt 0', borderBottom: '1px solid #000' }}>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 style={{ fontSize: '13pt', marginTop: '10pt', marginBottom: '4pt', borderLeft: '4px solid #000', paddingLeft: '5pt' }}>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 style={{ fontSize: '11pt', marginTop: '8pt', marginBottom: '2pt' }}>{children}</h3>
          ),
          p: ({ children }) => (
            <p style={{ margin: '3pt 0' }}>{children}</p>
          ),
          ul: ({ children }) => (
            <ul style={{ margin: '2pt 0', paddingLeft: '15pt' }}>{children}</ul>
          ),
          table: ({ children }) => (
            <table style={{ width: '100%', borderCollapse: 'collapse', margin: '8pt 0' }}>
              {children}
            </table>
          ),
          th: ({ children }) => (
            <th style={{ 
              border: '1px solid #000', 
              padding: '4pt', 
              background: '#f2f2f2', 
              fontSize: '11pt' // Matching page 1 font
            }}>{children}</th>
          ),
          td: ({ children, ...props }) => {
            // Logic to detect the table type or column index to apply widths
            // This applies specific widths to the 3-column "Lesson Phases" table
            const isThreeColumn = children && children.length === 3;
            return (
              <td
                style={{
                  border: '1px solid #000',
                  padding: '4pt',
                  verticalAlign: 'top',
                  fontSize: '11pt', // Matching page 1 font
                  width: isThreeColumn ? '25%' : 'auto' // Placeholder; logic continues in 'tr'
                }}
              >
                {children}
              </td>
            );
          },
          // Customizing TR to handle column weighting for Phase tables
          tr: ({ children }) => {
            if (React.Children.count(children) === 3) {
              return (
                <tr>
                  {React.Children.map(children, (child, index) => {
                    const width = index === 1 ? '50%' : '25%'; // Middle column gets double space
                    return React.cloneElement(child, {
                      style: { ...child.props.style, width }
                    });
                  })}
                </tr>
              );
            }
            return <tr>{children}</tr>;
          }
        }}
      >
        {note.content || ''}
      </ReactMarkdown>
      
      {/* Facilitator Footer - Kept small to stay on page 2 */}
      <div style={{ marginTop: '15pt', fontSize: '10pt' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tr>
            <td style={{ border: '1px solid #000', padding: '4pt' }}><strong>Facilitator:</strong></td>
            <td style={{ border: '1px solid #000', padding: '4pt' }}><strong>Vetted By:</strong></td>
          </tr>
          <tr>
            <td style={{ border: '1px solid #000', padding: '4pt' }}><strong>Signature:</strong></td>
            <td style={{ border: '1px solid #000', padding: '4pt' }}><strong>Date:</strong></td>
          </tr>
        </table>
      </div>
    </div>
  );
};

export default LessonNotePdfView;