'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UploadCloud, Link } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (url: string) => void;
  bucketName: 'tkirbis-news-media' | 'tkirbis-article-media';
  mediaType: 'image' | 'video';
}

export function MediaInsertModal({ isOpen, onClose, onInsert, bucketName, mediaType }: MediaInsertModalProps) {
  const { toast } = useToast();
  const [url, setUrl] = useState('');

  const mutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const uploadUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload/files?bucket_name=${bucketName}`;
      return axios.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
    },
    onSuccess: (response) => {
      const newUrl = response.data.detail;
      toast({ variant: 'success', title: 'Файл успешно загружен!' });
      onInsert(newUrl);
      handleClose();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Произошла ошибка при загрузке';
      toast({ variant: 'destructive', title: 'Ошибка загрузки', description: errorMessage });
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      mutation.mutate(file);
    }
  }, [mutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: mediaType === 'image' 
      ? { 'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp'] }
      : { 'video/*': ['.mp4', '.webm', '.ogg'] },
  });

  const handleInsertFromUrl = () => {
    if (url) {
      onInsert(url);
      handleClose();
    }
  };

  const handleClose = () => {
    setUrl('');
    mutation.reset();
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Вставить {mediaType === 'image' ? 'изображение' : 'видео'}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Загрузить файл</TabsTrigger>
            <TabsTrigger value="url">По ссылке</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="pt-4">
            {mutation.isPending ? (
              <div className="flex flex-col items-center justify-center space-y-4 h-48">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Загрузка файла...</p>
              </div>
            ) : (
              <div {...getRootProps()} className={cn("flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors", isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/30 hover:border-primary/50")}>
                <input {...getInputProps()} />
                <UploadCloud className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Перетащите файл сюда или нажмите для выбора</p>
                <p className="text-xs text-muted-foreground/70 mt-1">{mediaType === 'image' ? 'Изображение' : 'Видео'}</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="url" className="pt-4">
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Вставьте прямую ссылку на медиафайл.</p>
                <div className="flex items-center space-x-2">
                    <Link className="h-9 w-9 p-2 text-muted-foreground" />
                    <Input 
                        id="url-input" 
                        value={url} 
                        onChange={(e) => setUrl(e.target.value)} 
                        placeholder={mediaType === 'image' ? "https://.../image.jpg" : "https://.../video.mp4"}
                        onKeyDown={(e) => e.key === 'Enter' && handleInsertFromUrl()}
                    />
                </div>
                <Button onClick={handleInsertFromUrl} className="w-full">Вставить</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
