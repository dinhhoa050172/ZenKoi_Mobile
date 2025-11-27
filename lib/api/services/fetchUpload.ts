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

export interface UploadRequest {
  file: File;
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
    const formdata = new FormData();
    formdata.append('file', request.file);

    const response = await apiClient.post<ImageResponse, FormData>(
      '/api/upload/upload-image',
      formdata
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
    const formdata = new FormData();
    formdata.append('file', request.file);

    const response = await apiClient.post<VideoResponse, FormData>(
      '/api/upload/upload-video',
      formdata
    );

    return response.data;
  },
};
