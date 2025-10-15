'use client';

import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import { Rnd } from 'react-rnd';

export const ResizableImage = ({ node, updateAttributes, editor }: NodeViewProps) => {
  const { src, alt, width, height } = node.attrs;

  return (
    <NodeViewWrapper style={{ position: 'relative' }}>
      <Rnd
        size={{ width: width || 'auto', height: height || 'auto' }}
        onResizeStop={(e, direction, ref, delta, position) => {
          updateAttributes({
            width: ref.style.width,
            height: ref.style.height,
          });
        }}
        lockAspectRatio
      >
        <img src={src} alt={alt} style={{ width: '100%', height: '100%' }} />
      </Rnd>
    </NodeViewWrapper>
  );
};
