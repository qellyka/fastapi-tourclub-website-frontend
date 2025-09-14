'use client';

import DOMPurify from 'isomorphic-dompurify';

interface RichTextRendererProps {
  html: string;
}

export default function RichTextRenderer({ html }: RichTextRendererProps) {
  // Sanitize the HTML to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(html);

  return (
    <div 
      className="prose lg:prose-xl max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
