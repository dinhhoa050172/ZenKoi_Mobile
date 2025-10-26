import {
  UploadRequest,
  UploadResponse,
  uploadServices,
} from '@/lib/api/services/fetchUpload';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

/*
 * Hook to upload an image
 */
export function useUploadImage() {
  return useMutation({
    mutationFn: async (request: UploadRequest) =>
      await uploadServices.uploadImage(request),
    onSuccess: (data: UploadResponse) => {
      Toast.show({
        type: 'success',
        text1: 'Tải ảnh lên thành công',
      });
      return data;
    },
    onError: (error: Error) => {
      Toast.show({
        type: 'error',
        text1: 'Tải ảnh lên thất bại',
        text2: error.message || 'Vui lòng thử lại sau',
        position: 'top',
      });
    },
  });
}
