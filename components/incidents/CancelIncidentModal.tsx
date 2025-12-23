import { useUploadImage } from '@/hooks/useUpload';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Camera,
  FileText,
  Image as ImageIcon,
  X,
  XCircle,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

interface CancelIncidentModalProps {
  visible: boolean;
  onClose: () => void;
  onCancel: (resolutionNotes: string, resolutionImages: string[]) => void;
  isSubmitting?: boolean;
  incidentTitle?: string;
}

export default function CancelIncidentModal({
  visible,
  onClose,
  onCancel,
  isSubmitting = false,
  incidentTitle = 'sự cố này',
}: CancelIncidentModalProps) {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadImageMutation = useUploadImage();

  const handleSubmit = async () => {
    if (!resolutionNotes.trim() || isSubmitting || isUploading) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];

      // Upload new images (skip existing URLs)
      for (const imageUri of selectedImages) {
        if (imageUri.startsWith('http')) {
          uploadedUrls.push(imageUri);
          continue;
        }

        const filename =
          imageUri.split('/').pop() || 'incident-cancellation.jpg';
        const match = /\.([\w]+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        const fileForUpload = {
          uri: imageUri,
          name: filename,
          type,
        };

        const result = await uploadImageMutation.mutateAsync({
          file: fileForUpload as any,
        });
        if (result?.result?.url) uploadedUrls.push(result.result.url);
      }

      onCancel(resolutionNotes.trim(), uploadedUrls);
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Không thể tải ảnh lên. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isUploading) return;
    setResolutionNotes('');
    setSelectedImages([]);
    setIsUploading(false);
    onClose();
  };

  // Image picker functions
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Vui lòng cho phép truy cập ảnh để chọn ảnh');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newImages = result.assets.map((asset) => asset.uri);
        setSelectedImages((prev) => [...prev, ...newImages]);
      }
    } catch (err) {
      console.warn('pickImage error', err);
      alert('Không thể chọn ảnh. Thử lại sau.');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Vui lòng cho phép truy cập camera để chụp ảnh');
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      setSelectedImages([...selectedImages, uri]);
    } catch (err) {
      console.warn('takePhoto error', err);
      alert('Không thể chụp ảnh. Thử lại sau.');
    }
  };

  const removeImage = (index: number) => {
    if (isSubmitting || isUploading) return;
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const isFormValid = resolutionNotes.trim().length > 0;
  const isLoading = isSubmitting || isUploading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/60">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={handleClose}
        >
          <View className="flex-1 justify-center px-6">
            <TouchableOpacity activeOpacity={1}>
              <View
                className="max-w-full overflow-hidden rounded-3xl bg-white shadow-2xl "
                style={{ maxHeight: '90%' }}
              >
                {/* Header */}
                <LinearGradient
                  colors={['#ef4444', '#dc2626', '#b91c1c']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="relative overflow-hidden px-6 py-4"
                >
                  {/* Decorative Elements */}
                  <View className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/10" />
                  <View className="absolute -left-4 top-12 h-12 w-12 rounded-full bg-white/5" />

                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-4">
                      <View className="mb-2 flex-row items-center">
                        <View className="mr-3 rounded-full bg-white/20 p-3">
                          <XCircle size={24} color="white" />
                        </View>
                        <Text className="text-xl font-bold text-white">
                          Hủy sự cố
                        </Text>
                      </View>
                      <Text className="text-sm text-red-100">
                        Đánh dấu &ldquo;{incidentTitle}&rdquo; đã được hủy
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={handleClose}
                      className="rounded-full bg-white/20 p-2 backdrop-blur-sm"
                      disabled={isLoading}
                      style={{ opacity: isLoading ? 0.5 : 1 }}
                    >
                      <X size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>

                {/* Content */}
                <KeyboardAwareScrollView
                  contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingTop: 40,
                    paddingBottom: 24,
                  }}
                  bottomOffset={40}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  <View className="space-y-6">
                    {/* Warning Notice */}
                    {/* <View className="rounded-2xl border border-red-200 bg-red-50 p-4">
                      <View className="mb-2 flex-row items-center">
                        <AlertTriangle size={20} color="#dc2626" />
                        <Text className="ml-2 text-sm font-semibold text-red-800">
                          Cảnh báo
                        </Text>
                      </View>
                      <Text className="text-sm leading-5 text-red-700">
                        Sau khi hủy, sự cố sẽ không thể khôi phục. Vui lòng ghi
                        rõ lý do hủy để tham khảo sau này.
                      </Text>
                    </View> */}

                    {/* Image Upload Section */}
                    <View>
                      <View className="mb-3 flex-row items-center">
                        <ImageIcon size={20} color="#374151" />
                        <Text className="ml-2 text-base font-semibold text-slate-900">
                          Hình ảnh minh chứng
                        </Text>
                      </View>

                      {/* Image Picker Buttons */}
                      <View className="mb-3 flex-row gap-3">
                        <TouchableOpacity
                          onPress={takePhoto}
                          disabled={isLoading}
                          activeOpacity={0.7}
                          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-red-50 py-3 shadow-sm"
                          style={{ opacity: isLoading ? 0.5 : 1 }}
                        >
                          <Camera size={20} color="#dc2626" />
                          <Text className="text-sm font-bold text-red-700">
                            Chụp ảnh
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          onPress={pickImage}
                          disabled={isLoading}
                          activeOpacity={0.7}
                          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-red-50 py-3 shadow-sm"
                          style={{ opacity: isLoading ? 0.5 : 1 }}
                        >
                          <ImageIcon size={20} color="#dc2626" />
                          <Text className="text-sm font-bold text-red-700">
                            Chọn ảnh
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Image Preview Grid */}
                      {selectedImages.length > 0 && (
                        <View className="overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-3 shadow-sm">
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 12 }}
                          >
                            {selectedImages.map((uri, index) => (
                              <View
                                key={index}
                                className="relative overflow-hidden rounded-3xl"
                              >
                                <Image
                                  source={{ uri }}
                                  style={{
                                    width: 120,
                                    height: 120,
                                    resizeMode: 'cover',
                                  }}
                                />
                                <TouchableOpacity
                                  onPress={() => removeImage(index)}
                                  disabled={isLoading}
                                  activeOpacity={0.7}
                                  className="absolute right-2 top-2 overflow-hidden rounded-full bg-red-500 p-2 shadow-lg"
                                  style={{ opacity: isLoading ? 0.5 : 1 }}
                                >
                                  <X size={14} color="white" />
                                </TouchableOpacity>
                              </View>
                            ))}
                          </ScrollView>
                          <View className="my-2 items-center">
                            <Text className="text-xs text-slate-500">
                              {selectedImages.length} ảnh đã chọn
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Cancellation Notes Input */}
                    <View>
                      <View className="mb-3 flex-row items-center">
                        <FileText size={20} color="#374151" />
                        <Text className="ml-2 text-base font-semibold text-slate-900">
                          Lý do hủy sự cố{' '}
                          <Text className="text-red-500">*</Text>
                        </Text>
                      </View>

                      <View className="rounded-2xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
                        <TextInput
                          className="min-h-[120px] rounded-2xl bg-white p-4 text-base text-slate-900 shadow-sm"
                          placeholder="Mô tả lý do tại sao sự cố này cần được hủy, các thông tin liên quan..."
                          placeholderTextColor="#94a3b8"
                          value={resolutionNotes}
                          onChangeText={setResolutionNotes}
                          multiline
                          numberOfLines={6}
                          textAlignVertical="top"
                          editable={!isLoading}
                          style={{
                            fontSize: 16,
                            lineHeight: 24,
                          }}
                        />
                      </View>

                      {/* Character counter */}
                      <Text className="mt-2 text-right text-sm text-slate-500">
                        {resolutionNotes.length} / 1000 ký tự
                      </Text>
                    </View>
                  </View>
                </KeyboardAwareScrollView>

                {/* Footer Actions */}
                <View className="border-t border-slate-100 bg-white px-6 py-4">
                  <View className="flex-row gap-4">
                    {/* Cancel Button */}
                    <TouchableOpacity
                      onPress={handleClose}
                      disabled={isLoading}
                      className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 py-4"
                      style={{ opacity: isLoading ? 0.5 : 1 }}
                    >
                      <Text className="text-center text-base font-semibold text-slate-700">
                        Đóng
                      </Text>
                    </TouchableOpacity>

                    {/* Submit Button */}
                    <TouchableOpacity
                      onPress={handleSubmit}
                      disabled={!isFormValid || isSubmitting}
                      className="flex-1 overflow-hidden rounded-2xl"
                      style={{
                        opacity: !isFormValid || isSubmitting ? 0.5 : 1,
                      }}
                    >
                      <LinearGradient
                        colors={
                          isFormValid && !isSubmitting
                            ? ['#ef4444', '#dc2626']
                            : ['#94a3b8', '#64748b']
                        }
                        className="py-4"
                      >
                        <View className="flex-row items-center justify-center">
                          {isSubmitting ? (
                            <View className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <XCircle size={20} color="white" className="mr-2" />
                          )}
                          <Text className="text-base font-bold text-white">
                            {isSubmitting ? 'Đang xử lý...' : 'Hủy'}
                          </Text>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
