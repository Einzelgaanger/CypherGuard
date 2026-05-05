"use client";


import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X } from 'lucide-react';

interface PhotoUploadProps {
  onPhotoSelected: (file: File) => void;
  selectedPhoto?: File | null;
  onRemovePhoto?: () => void;
  required?: boolean;
}

export function PhotoUpload({ 
  onPhotoSelected, 
  selectedPhoto, 
  onRemovePhoto,
  required = false 
}: PhotoUploadProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onPhotoSelected(file);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {selectedPhoto ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="secondary" className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                {selectedPhoto.name}
              </Badge>
              {onRemovePhoto && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRemovePhoto}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {selectedPhoto && (
              <img
                src={URL.createObjectURL(selectedPhoto)}
                alt="Selected"
                className="w-full rounded-lg max-h-48 object-cover"
              />
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">
                {required ? 'Photo required for check-in' : 'Add a photo (optional)'}
              </p>
            </div>

            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex flex-col items-center gap-2 h-auto p-4"
              >
                <Upload className="w-6 h-6" />
                <span className="text-sm">Upload Photo</span>
              </Button>
            </div>

            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 