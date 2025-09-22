'use client';

import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { MediaInsertModal } from './MediaInsertModal';

type Props = {
  editor: Editor | null;
  bucketName: 'tkirbis-news-media' | 'tkirbis-article-media';
};

type ModalState = {
  isOpen: boolean;
  mediaType: 'image' | 'video';
}

export function TiptapToolbar({ editor, bucketName }: Props) {
  const { toast } = useToast();
  const [modalState, setModalState] = useState<ModalState>({ isOpen: false, mediaType: 'image' });

  if (!editor) {
    return null;
  }

  const handleInsert = (url: string) => {
    if (modalState.mediaType === 'image') {
      editor.chain().focus().setImage({ src: url }).run();
    } else if (modalState.mediaType === 'video') {
      if (url.match(/\.(mp4|webm|ogg)$/i) || url.startsWith(process.env.NEXT_PUBLIC_BACKEND_URL || ' ')) {
        editor.chain().focus().setIframe({ src: url }).run();
        return;
      }

      const videoId = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/|vimeo\.com\/)(\w+)/)?.[1];
      if (videoId) {
          let embedUrl = '';
          if (url.includes('youtube') || url.includes('youtu.be')) {
              embedUrl = `https://www.youtube.com/embed/${videoId}`;
          } else if (url.includes('vimeo')) {
              embedUrl = `https://player.vimeo.com/video/${videoId}`;
          }
          editor.chain().focus().setIframe({ src: embedUrl }).run();
      } else {
        toast({
          variant: 'destructive',
          title: 'Неподдерживаемый URL видео',
          description: 'Вставьте ссылку на YouTube, Vimeo или прямую ссылку на видеофайл.',
        });
      }
    }
  };

  return (
    <>
      <MediaInsertModal 
        isOpen={modalState.isOpen}
        onClose={() => setModalState({ ...modalState, isOpen: false })}
        onInsert={handleInsert}
        bucketName={bucketName}
        mediaType={modalState.mediaType}
      />
      <div className="sticky top-0 z-10 bg-secondary border border-border rounded-md p-1 flex flex-wrap gap-1">
        {/* Formatting Buttons... */}
        <Button type="button" size="sm" variant={editor.isActive('bold') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive('italic') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive('strike') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive('bulletList') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive('orderedList') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Button>
        <Button type="button" size="sm" variant={editor.isActive('blockquote') ? 'default' : 'ghost'} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Button>
        
        {/* Media Buttons */}
        <Button type="button" size="sm" variant="ghost" onClick={() => setModalState({ isOpen: true, mediaType: 'image' })}>
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setModalState({ isOpen: true, mediaType: 'video' })}>
          <Video className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
