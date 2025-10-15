'use client';

import { Editor, EditorContent, JSONContent } from '@tiptap/react'; // Corrected import
import StarterKit from '@tiptap/starter-kit';
import { useState, useEffect } from 'react';
import Image from '@tiptap/extension-image';
import { Iframe } from '@/lib/tiptap-iframe';
import { TiptapToolbar } from './TiptapToolbar';

interface TiptapEditorProps {
  value: string; // Still takes HTML as initial value
  onChange: (content: { html: string, json: JSONContent }) => void; // Changed to object
  bucketName: 'tkirbis-news-media' | 'tkirbis-article-media';
}

const TiptapEditor = ({ value, onChange, bucketName }: TiptapEditorProps) => {
  const [editor, setEditor] = useState<Editor | null>(null);

  // Effect to initialize and destroy the editor
  useEffect(() => {
    const tiptapEditor = new Editor({
      extensions: [StarterKit, Image, Iframe],
      content: typeof value === 'string' ? value : '',
      editorProps: {
        attributes: {
          class: 'prose dark:prose-invert max-w-none focus:outline-none border rounded-md p-4 min-h-[300px]',
          'data-gramm': 'false',
          'data-gramm_editor': 'false',
        },
      },
      onUpdate: ({ editor }) => {
        onChange({ html: editor.getHTML(), json: editor.getJSON() }); // Pass both HTML and JSON
      },
    });

    setEditor(tiptapEditor);

    return () => {
      tiptapEditor.destroy();
    };
    // We want this to run only once on mount, so we pass an empty dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Effect to update content from parent
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  return (
    <div className="flex flex-col gap-2">
      <TiptapToolbar editor={editor} bucketName={bucketName} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default TiptapEditor;
