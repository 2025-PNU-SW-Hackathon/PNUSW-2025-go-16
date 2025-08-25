import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

type UseImagePickerResult = {
  image: string | null;
  error: string | null;
  pickImage: () => Promise<void>;
  setImage: (uri: string | null) => void;
};

export function useImagePicker(): UseImagePickerResult {
  const [image, setImage] = useState<string | null>(null);
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
        setImage(result.assets[0].uri);
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

  return { image, error, pickImage, setImage };
}
