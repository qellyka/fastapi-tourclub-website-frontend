'use client';

import DOMPurify from 'isomorphic-dompurify';

interface RichTextRendererProps {
  html: string;
}

export default function RichTextRenderer({ html }: RichTextRendererProps) {
  // Sanitize the HTML to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['src', 'frameborder', 'allowfullscreen', 'class'],
  });

  return (
    <div 
      className="max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
