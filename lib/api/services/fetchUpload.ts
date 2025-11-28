import apiClient from '../apiClient';

export interface Image {
  publicId: string;
  url: string;
}

export interface Video {
  publicId: string;
  url: string;
  format: string;
  fileType: string;
  size: number;
  originalFilename: string;
}

// React Native file format for upload
export interface RNFile {
  uri: string;
  name: string;
  type: string;
}

export interface UploadRequest {
  file: File | RNFile;
}

export interface ImageResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: Image;
}

export interface VideoResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: Video;
}

export const uploadServices = {
  // Upload a image
  uploadImage: async (request: UploadRequest): Promise<ImageResponse> => {
    // Use the upload method which is designed for file uploads in React Native
    const response = await apiClient.upload<ImageResponse>(
      '/api/upload/upload-image',
      request.file as RNFile,
      'file'
    );

    // Convert HTTP to HTTPS for Cloudinary URLs
    if (response.data?.result?.url) {
      response.data.result.url = response.data.result.url.replace(
        'http://res.cloudinary.com',
        'https://res.cloudinary.com'
      );
    }

    return response.data;
  },

  // Upload a video
  uploadVideo: async (request: UploadRequest): Promise<VideoResponse> => {
    // Use the upload method which is designed for file uploads in React Native
    // This handles FormData properly and supports progress tracking
    const response = await apiClient.upload<VideoResponse>(
      '/api/upload/upload-file',
      request.file as RNFile,
      'file'
    );

    return response.data;
  },
};
