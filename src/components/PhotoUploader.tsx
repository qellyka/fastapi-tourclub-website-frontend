'use client';

import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, UploadCloud, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface PhotoUploaderProps {
  value: string[];
  onChange: (value: string[]) => void;
  isEditable?: boolean;
}

export function PhotoUploader({ value, onChange, isEditable = true }: PhotoUploaderProps) {
  const { toast } = useToast();
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);

  const mutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const uploadUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/upload/files?bucket_name=tkirbis-pass-media`;
      return axios.post(uploadUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
    },
    onSuccess: (response, file) => {
      const newUrl = response.data.detail;
      onChange([...value, newUrl]);
      toast({ variant: 'success', title: 'Фото успешно загружено!' });
    },
    onError: (error: any, file) => {
      const errorMessage = error.response?.data?.detail || 'Произошла ошибка при загрузке';
      toast({ variant: 'destructive', title: 'Ошибка загрузки', description: errorMessage });
    },
    onSettled: (data, error, file) => {
      setUploadingFiles(prev => prev.filter(f => f !== file));
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!isEditable) return;
    setUploadingFiles(prev => [...prev, ...acceptedFiles]);
    acceptedFiles.forEach(file => {
      mutation.mutate(file);
    });
  }, [mutation, isEditable]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: { 'image/*': ['.png', '.gif', '.jpeg', '.jpg', '.webp'] },
    disabled: !isEditable
  });

  const handleRemove = (urlToRemove: string) => {
    if (!isEditable) return;
    onChange(value.filter(url => url !== urlToRemove));
  };

  return (
    <div>
      <div {...getRootProps()} className={cn("flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors", isDragActive ? "border-primary bg-primary/10" : "border-muted-foreground/30 hover:border-primary/50", !isEditable && "cursor-not-allowed opacity-50")}>
        <input {...getInputProps()} />
        <UploadCloud className="h-12 w-12 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">Перетащите фото сюда или нажмите для выбора</p>
      </div>

      {(uploadingFiles.length > 0) && (
        <div className="mt-4">
          <p className="font-semibold mb-2">Загружаемые фото:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {uploadingFiles.map((file, index) => (
              <div key={index} className="relative aspect-square flex items-center justify-center rounded-lg border border-dashed border-primary">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-xs text-center p-1 absolute bottom-1">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {value && value.length > 0 && (
        <div className="mt-4">
          <p className="font-semibold mb-2">Загруженные фото:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {value.map((url) => (
              <div key={url} className="relative aspect-square rounded-lg overflow-hidden">
                <Image src={url} alt="Uploaded photo" layout="fill" objectFit="cover" />
                {isEditable && (
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={() => handleRemove(url)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
