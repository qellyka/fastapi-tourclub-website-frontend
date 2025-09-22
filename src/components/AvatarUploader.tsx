'use client';

import { useState, useRef, DragEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Camera, Loader2, UploadCloud } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageCropperModal } from './ImageCropperModal';

interface AvatarUploaderProps {
  src?: string;
  fallback: string;
}

export function AvatarUploader({ src, fallback }: AvatarUploaderProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | undefined>(undefined);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return api.post('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      toast({ variant: 'success', title: 'Аватар обновлен!' });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.detail || 'Произошла ошибка при загрузке';
      toast({ variant: 'destructive', title: 'Ошибка', description: errorMessage });
    },
  });

  const handleFileSelect = (file: File | null | undefined) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Неверный тип файла', description: 'Пожалуйста, выберите изображение.' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({ variant: 'destructive', title: 'Файл слишком большой', description: 'Максимальный размер аватара - 5МБ.' });
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    const croppedFile = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
    mutation.mutate(croppedFile);
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleClick = () => {
    if (!mutation.isPending) {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      <div 
        className={cn(
          "relative group w-32 h-32 rounded-full cursor-pointer transition-all",
          isDragging && "outline-dashed outline-2 outline-offset-4 outline-primary"
        )}
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragOver={(e) => e.preventDefault()} // Necessary for drop to work
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />
        <Avatar className="w-full h-full">
          <AvatarImage src={src} alt="User avatar" className="object-cover transition-opacity group-hover:opacity-20" />
          <AvatarFallback className="text-4xl transition-opacity group-hover:opacity-20">{fallback}</AvatarFallback>
        </Avatar>

        <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
          {isDragging ? (
              <>
                  <UploadCloud className="w-8 h-8 mb-1" />
                  <span className="text-sm font-semibold">Отпустите файл</span>
              </>
          ) : mutation.isPending ? (
              <Loader2 className="w-10 h-10 animate-spin" />
          ) : (
              <>
                  <Camera className="w-8 h-8 mb-1" />
                  <span className="text-sm font-semibold">Изменить</span>
              </>
          )}
        </div>
      </div>
      {imageToCrop && (
        <ImageCropperModal 
          isOpen={isCropperOpen}
          onClose={() => setIsCropperOpen(false)}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}
