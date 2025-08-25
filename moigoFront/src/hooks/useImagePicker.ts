import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

type UseImagePickerResult = {
  images: string[];
  error: string | null;
  pickImage: () => Promise<void>;
  pickMultipleImages: () => Promise<void>;
  setImages: (uris: string[]) => void;
  addImage: (uri: string) => void;
  removeImage: (uri: string) => void;
  clearImages: () => void;
};

export function useImagePicker(): UseImagePickerResult {
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async (): Promise<void> => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setError('사진 접근 권한이 필요합니다.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImageUri = result.assets[0].uri;
        if (!images.includes(newImageUri)) {
          setImages(prev => [...prev, newImageUri]);
        }
        setError(null);
      } else if (result.canceled) {
        setError('이미지 선택이 취소되었습니다.');
      } else {
        setError('이미지를 불러오는 데 실패했습니다.');
      }
    } catch (e: any) {
      setError(e?.message || '알 수 없는 오류 발생');
    }
  };

  const pickMultipleImages = async (): Promise<void> => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        setError('사진 접근 권한이 필요합니다.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        allowsMultipleSelection: true,
        selectionLimit: 10,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImageUris = result.assets.map(asset => asset.uri);
        const uniqueNewUris = newImageUris.filter(uri => !images.includes(uri));
        setImages(prev => [...prev, ...uniqueNewUris]);
        setError(null);
      } else if (result.canceled) {
        setError('이미지 선택이 취소되었습니다.');
      } else {
        setError('이미지를 불러오는 데 실패했습니다.');
      }
    } catch (e: any) {
      setError(e?.message || '알 수 없는 오류 발생');
    }
  };

  const addImage = (uri: string) => {
    if (!images.includes(uri)) {
      setImages(prev => [...prev, uri]);
    }
  };

  const removeImage = (uri: string) => {
    setImages(prev => prev.filter(img => img !== uri));
  };

  const clearImages = () => {
    setImages([]);
  };

  return { 
    images, 
    error, 
    pickImage, 
    pickMultipleImages, 
    setImages, 
    addImage, 
    removeImage, 
    clearImages 
  };
}
