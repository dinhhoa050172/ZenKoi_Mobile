import apiClient from '../apiClient';

export interface Upload {
  publicId: string;
  url: string;
}

export interface UploadRequest {
  file: File;
}

export interface UploadResponse {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  result: Upload;
}

export const uploadServices = {
  // Upload a image
  uploadImage: async (request: UploadRequest): Promise<UploadResponse> => {
    const formdata = new FormData();
    formdata.append('file', request.file);

    const response = await apiClient.post<UploadResponse, FormData>(
      '/api/upload/upload-image',
      formdata
    );
    return response.data;
  },
};
