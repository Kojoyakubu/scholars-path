// /client/src/utils/imageExtractor.js

// Parse HTML string looking for [IMAGE]...[/IMAGE] blocks containing JSON.
// Returns an array of segments that either contain text or an image meta object.
// This allows the caller to render text and images in sequence.
export function segmentHtmlWithImages(html = '') {
  const regex = /\[IMAGE\][\s\S]*?\[\/IMAGE\]/gi;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(html))) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', html: html.slice(lastIndex, match.index) });
    }
    const jsonStr = match[0].replace(/\[IMAGE\]|\[\/IMAGE\]/gi, '').trim();
    let data = null;
    try {
      data = JSON.parse(jsonStr);
    } catch (err) {
      console.warn('Invalid image JSON block', jsonStr);
    }
    segments.push({ type: 'image', meta: data });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < html.length) {
    segments.push({ type: 'text', html: html.slice(lastIndex) });
  }

  return segments;
}

// remove any image JSON blocks from a string, leaving only the text/html
export function removeImageBlocks(html = '') {
  return html.replace(/\[IMAGE\][\s\S]*?\[\/IMAGE\]/gi, '');
}
