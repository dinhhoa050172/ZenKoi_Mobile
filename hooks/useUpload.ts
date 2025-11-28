import {
  ImageResponse,
  UploadRequest,
  VideoResponse,
  uploadServices,
} from '@/lib/api/services/fetchUpload';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

/*
 * Hook to upload an image
 */
export function useUploadImage() {
  return useMutation({
    mutationFn: async (request: UploadRequest) => {
      console.log('Starting upload with file:', request.file);
      const result = await uploadServices.uploadImage(request);
      console.log('Upload result:', result);
      return result;
    },
    onSuccess: (data: ImageResponse) => {
      console.log('Upload success:', data);
      if (!data?.result?.url) {
        console.error('Upload success but no URL in response');
      }
      Toast.show({
        type: 'success',
        text1: 'Tải ảnh lên thành công',
      });
      return data;
    },
    onError: (error: Error) => {
      console.error('Upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Tải ảnh lên thất bại',
        text2: error.message || 'Vui lòng thử lại sau',
        position: 'top',
      });
      throw error;
    },
  });
}

/*
 * Hook to upload a video
 */
export function useUploadVideo() {
  return useMutation({
    mutationFn: async (request: UploadRequest) => {
      console.log('Starting video upload with file:', request.file);
      const result = await uploadServices.uploadVideo(request);
      console.log('Video upload result:', result);
      return result;
    },
    onSuccess: (data: VideoResponse) => {
      console.log('Video upload success:', data);
      if (!data?.result?.url) {
        console.error('Video upload success but no URL in response');
      }
      Toast.show({
        type: 'success',
        text1: 'Tải video lên thành công',
      });
      return data;
    },
    onError: (error: Error) => {
      console.error('Video upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Tải video lên thất bại',
        text2: error.message || 'Vui lòng thử lại sau',
        position: 'top',
      });
      throw error;
    },
  });
}
