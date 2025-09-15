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

type Props = {
  editor: Editor | null;
};

export function TiptapToolbar({ editor }: Props) {
  const { toast } = useToast();
  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };
  
  const addVideo = () => {
    const url = window.prompt('YouTube/Vimeo URL');
    if (url) {
        // A simple regex to extract video ID from YouTube/Vimeo URLs
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
              title: 'Ошибка!',
              description: 'Неверный URL видео.',
              variant: 'destructive',
            });
        }
    }
  };


  return (
    <div className="border border-input bg-transparent rounded-md p-1 flex flex-wrap gap-1">
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('strike') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
       <Button
        type="button"
        size="sm"
        variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        size="sm"
        variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={addImage}>
        <ImageIcon className="h-4 w-4" />
      </Button>
      <Button type="button" size="sm" variant="ghost" onClick={addVideo}>
        <Video className="h-4 w-4" />
      </Button>
    </div>
  );
}
