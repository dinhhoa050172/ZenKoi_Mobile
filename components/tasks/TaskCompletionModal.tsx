import { CustomAlert } from '@/components/CustomAlert';
import { useUploadImage } from '@/hooks/useUpload';
import { useCompleteStaffTask } from '@/hooks/useWorkSchedule';
import { WorkSchedule } from '@/lib/api/services/fetchWorkSchedule';
import { parseLocalDate, parseLocalDateTime } from '@/lib/utils/formatDate';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  Trash2,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import PondSvg from '../icons/PondSvg';

interface TaskCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  task: WorkSchedule | null;
  staffId: number;
}

export default function TaskCompletionModal({
  visible,
  onClose,
  task,
  staffId,
}: TaskCompletionModalProps) {
  const [completionNotes, setCompletionNotes] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Custom alert state (replace native Alert)
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertType, setCustomAlertType] = useState<
    'danger' | 'warning' | 'info'
  >('danger');
  const [customAlertOnConfirm, setCustomAlertOnConfirm] = useState<
    (() => void) | null
  >(null);

  const completeTaskMutation = useCompleteStaffTask();
  const uploadImage = useUploadImage();

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible, fadeAnim]);

  const handleComplete = async () => {
    if (!task) return;

    const currentDate = new Date();
    const scheduleDateLocal = parseLocalDate(task.scheduledDate);
    const startTimeLocal = parseLocalDateTime(
      task.scheduledDate,
      task.startTime
    );
    const endTimeLocal = parseLocalDateTime(task.scheduledDate, task.endTime);

    if (!scheduleDateLocal || !startTimeLocal || !endTimeLocal) {
      setCustomAlertTitle('Lỗi');
      setCustomAlertMessage('Không thể phân tích thời gian công việc.');
      setCustomAlertType('danger');
      setCustomAlertOnConfirm(() => null);
      setCustomAlertVisible(true);
      return;
    }

    // Check if it's the scheduled date (compare local date components)
    const isScheduledDate =
      currentDate.getFullYear() === scheduleDateLocal.getFullYear() &&
      currentDate.getMonth() === scheduleDateLocal.getMonth() &&
      currentDate.getDate() === scheduleDateLocal.getDate();

    // Check if current time is within the scheduled time range (local)
    const currentTime = currentDate.getTime();
    const isWithinTimeRange =
      currentTime >= startTimeLocal.getTime() &&
      currentTime <= endTimeLocal.getTime();

    // If the date is different (task is scheduled on another day), allow the
    // user to force-complete with a warning instead of blocking outright.
    if (!isScheduledDate) {
      setCustomAlertTitle('Ngoài ngày lịch');
      setCustomAlertMessage(
        'Lịch công việc không trùng với ngày hiện tại. Bạn có chắc muốn hoàn thành công việc này không?'
      );
      setCustomAlertType('warning');
      setCustomAlertOnConfirm(() => proceedWithCompletion);
      setCustomAlertVisible(true);
      return;
    }

    if (!isWithinTimeRange) {
      setCustomAlertTitle('Ngoài giờ làm việc');
      setCustomAlertMessage(
        `Công việc này chỉ có thể hoàn thành trong khoảng thời gian ${task.startTime} - ${task.endTime}. Bạn có muốn tiếp tục không?`
      );
      setCustomAlertType('warning');
      setCustomAlertOnConfirm(() => proceedWithCompletion);
      setCustomAlertVisible(true);
      return;
    }

    proceedWithCompletion();
  };

  const proceedWithCompletion = async () => {
    if (!task || !completionNotes.trim()) {
      setCustomAlertTitle('Lỗi');
      setCustomAlertMessage('Vui lòng nhập ghi chú hoàn thành công việc.');
      setCustomAlertType('danger');
      setCustomAlertOnConfirm(() => null);
      setCustomAlertVisible(true);
      return;
    }

    if (selectedImages.length === 0) {
      setCustomAlertTitle('Lỗi');
      setCustomAlertMessage('Vui lòng thêm ít nhất 1 hình ảnh minh chứng.');
      setCustomAlertType('danger');
      setCustomAlertOnConfirm(() => null);
      setCustomAlertVisible(true);
      return;
    }

    // Prevent double submission
    if (isLoading || completeTaskMutation.isPending) {
      return;
    }

    setIsLoading(true);
    try {
      // Upload images first if any
      const uploadedUrls: string[] = [];

      if (selectedImages.length > 0) {
        for (const imageUri of selectedImages) {
          const filename = imageUri.split('/').pop() || 'photo.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          const fileForUpload: any = { uri: imageUri, name: filename, type };

          const uploadRes = await uploadImage.mutateAsync({
            file: fileForUpload,
          });
          const remoteUrl = uploadRes?.result?.url;

          if (remoteUrl) {
            uploadedUrls.push(remoteUrl);
          }
        }
      }

      // Complete the task with notes and images
      await completeTaskMutation.mutateAsync({
        workScheduleId: task.id,
        assignement: {
          completionNotes: completionNotes.trim(),
          images: uploadedUrls,
        },
      });

      setCompletionNotes('');
      setSelectedImages([]);

      onClose();
    } catch (error) {
      console.error('Error completing task:', error);
      const msg = (error as any)?.message ?? 'Không thể hoàn thành công việc';
      setCustomAlertTitle('Lỗi');
      setCustomAlertMessage(msg);
      setCustomAlertType('danger');
      setCustomAlertOnConfirm(() => null);
      setCustomAlertVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Image picker functions
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setCustomAlertTitle('Quyền truy cập bị từ chối');
      setCustomAlertMessage('Vui lòng cho phép truy cập ảnh để chọn ảnh');
      setCustomAlertType('warning');
      setCustomAlertVisible(true);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      setSelectedImages([...selectedImages, uri]);
    } catch (err) {
      console.warn('pickImage error', err);
      setCustomAlertTitle('Lỗi');
      setCustomAlertMessage('Không thể chọn ảnh. Thử lại sau.');
      setCustomAlertType('danger');
      setCustomAlertVisible(true);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setCustomAlertTitle('Quyền truy cập bị từ chối');
      setCustomAlertMessage('Vui lòng cho phép truy cập camera để chụp ảnh');
      setCustomAlertType('warning');
      setCustomAlertVisible(true);
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
      setCustomAlertTitle('Lỗi');
      setCustomAlertMessage('Không thể chụp ảnh. Thử lại sau.');
      setCustomAlertType('danger');
      setCustomAlertVisible(true);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setCompletionNotes('');
    setSelectedImages([]);
    onClose();
  };

  if (!task) return null;

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleClose}
      >
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 16,
            backgroundColor: 'rgba(0,0,0,0.6)',
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  scale: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.9, 1],
                  }),
                },
              ],
            }}
            className="w-full max-w-md"
          >
            <View
              className="overflow-hidden rounded-3xl bg-white shadow-2xl"
              style={{ elevation: 10 }}
            >
              {/* Header with Gradient */}
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-6"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-white/20">
                      <CheckCircle size={24} color="white" />
                    </View>
                    <View>
                      <Text className="text-2xl font-black text-white">
                        Hoàn thành
                      </Text>
                      <Text className="text-base text-white/80">
                        Xác nhận công việc
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={handleClose}
                    className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <X size={20} color="white" />
                  </TouchableOpacity>
                </View>
              </LinearGradient>

              <View className="bg-gray-100 p-6">
                {/* Task Info Card */}
                <View
                  className="-mt-4 mb-5 overflow-hidden rounded-2xl bg-white shadow-md"
                  style={{ elevation: 2 }}
                >
                  <View className="p-4">
                    <View className="mb-3 flex-row items-start">
                      <View className="mr-3 mt-2 h-2 w-2 rounded-full bg-green-500" />
                      <Text className="flex-1 text-lg font-bold leading-6 text-gray-900">
                        {task.taskTemplateName}
                      </Text>
                    </View>

                    <View className="gap-2">
                      {/* Time Info */}
                      <View className="flex-row items-center">
                        <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                          <Clock size={16} color="#2563eb" />
                        </View>
                        <View>
                          <Text className="text-sm font-medium uppercase tracking-wide text-gray-500">
                            Thời gian
                          </Text>
                          <Text className="text-base font-semibold text-gray-900">
                            {task.startTime} - {task.endTime}
                          </Text>
                        </View>
                      </View>

                      {/* Date Info */}
                      <View className="flex-row items-center">
                        <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                          <Calendar size={16} color="#7c3aed" />
                        </View>
                        <View>
                          <Text className="text-sm font-medium uppercase tracking-wide text-gray-500">
                            Ngày làm việc
                          </Text>
                          <Text className="text-base font-semibold text-gray-900">
                            {new Date(task.scheduledDate).toLocaleDateString(
                              'vi-VN'
                            )}
                          </Text>
                        </View>
                      </View>

                      {/* Pond Info */}
                      {task.pondAssignments.length > 0 && (
                        <View className="flex-row items-center">
                          <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-cyan-100">
                            <PondSvg size={16} color="#0891b2" />
                          </View>
                          <View className="flex-1">
                            <Text className="text-sm font-medium uppercase tracking-wide text-gray-500">
                              Hồ cá
                            </Text>
                            <Text className="text-base font-semibold text-gray-900">
                              {task.pondAssignments
                                .map((p) => p.pondName)
                                .join(', ')}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                {/* Image Upload Section */}
                <View className="mb-5">
                  <View className="mb-2 flex-row items-center">
                    <Text className="text-base font-bold text-gray-900">
                      Hình ảnh minh chứng
                    </Text>
                    <View className="ml-2 rounded-full bg-red-100 px-2 py-0.5">
                      <Text className="text-sm font-bold text-red-600">
                        Bắt buộc
                      </Text>
                    </View>
                  </View>

                  {/* Image Picker Buttons */}
                  <View className="mb-3 flex-row gap-3">
                    <TouchableOpacity
                      onPress={takePhoto}
                      disabled={isLoading}
                      activeOpacity={0.7}
                      className="flex-1 flex-row items-center justify-center gap-2 rounded-full border-2 border-blue-200 bg-blue-50 py-2 shadow-sm"
                      style={{ elevation: 1 }}
                    >
                      <Camera size={20} color="#2563eb" />
                      <Text className="text-sm font-bold text-blue-600">
                        Chụp ảnh
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={pickImage}
                      disabled={isLoading}
                      activeOpacity={0.7}
                      className="flex-1 flex-row items-center justify-center gap-2 rounded-full border-2 border-purple-200 bg-purple-50 py-3 shadow-sm"
                      style={{ elevation: 1 }}
                    >
                      <ImageIcon size={20} color="#7c3aed" />
                      <Text className="text-sm font-bold text-purple-600">
                        Chọn ảnh
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Image Preview Grid */}
                  {selectedImages.length > 0 && (
                    <View className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white p-3 shadow-sm">
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 12 }}
                      >
                        {selectedImages.map((uri, index) => (
                          <View key={index} className="relative">
                            <Image
                              source={{ uri }}
                              className="h-24 w-24 rounded-xl"
                              style={{ resizeMode: 'cover' }}
                            />
                            <TouchableOpacity
                              onPress={() => removeImage(index)}
                              disabled={isLoading}
                              activeOpacity={0.7}
                              className="absolute -right-2 -top-2 h-7 w-7 items-center justify-center rounded-full bg-red-500 shadow-lg"
                              style={{ elevation: 3 }}
                            >
                              <Trash2 size={14} color="white" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </ScrollView>
                      <View className="mt-2 items-center">
                        <Text className="text-xs text-gray-500">
                          {selectedImages.length} ảnh đã chọn
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* Completion Notes */}
                <View className="mb-5">
                  <View className="mb-2 flex-row items-center">
                    <Text className="text-base font-bold text-gray-900">
                      Ghi chú hoàn thành
                    </Text>
                    <View className="ml-2 rounded-full bg-red-100 px-2 py-0.5">
                      <Text className="text-sm font-bold text-red-600">
                        Bắt buộc
                      </Text>
                    </View>
                  </View>
                  <View className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-sm">
                    <TextInput
                      value={completionNotes}
                      onChangeText={setCompletionNotes}
                      placeholder="Nhập chi tiết về việc hoàn thành công việc, tình trạng, ghi chú..."
                      placeholderTextColor="#9ca3af"
                      multiline
                      numberOfLines={4}
                      className="p-4 text-base leading-6 text-gray-900"
                      style={{
                        textAlignVertical: 'top',
                        minHeight: 120,
                      }}
                      editable={!isLoading}
                    />
                    <View className="items-end border-t border-gray-100 bg-gray-50 px-4 py-2">
                      <Text className="text-xs text-gray-500">
                        {completionNotes.length} ký tự
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleClose}
                    className="flex-1 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white py-4 shadow-sm"
                    disabled={isLoading}
                    activeOpacity={0.7}
                    style={{ elevation: 1 }}
                  >
                    <Text className="text-base font-bold text-gray-700">
                      Hủy bỏ
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleComplete}
                    disabled={
                      isLoading ||
                      !completionNotes.trim() ||
                      selectedImages.length === 0
                    }
                    activeOpacity={0.8}
                    className="flex-1 overflow-hidden rounded-2xl"
                    style={{ elevation: 3 }}
                  >
                    <LinearGradient
                      colors={
                        isLoading ||
                        !completionNotes.trim() ||
                        selectedImages.length === 0
                          ? ['#d1d5db', '#9ca3af']
                          : ['#10b981', '#059669']
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      className="flex-row items-center justify-center py-4"
                    >
                      <CheckCircle size={20} color="white" />
                      <Text className="ml-2 text-base font-bold text-white">
                        {isLoading ? 'Đang xử lý...' : 'Xác nhận'}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        </KeyboardAwareScrollView>
      </Modal>

      <CustomAlert
        visible={customAlertVisible}
        title={customAlertTitle}
        message={customAlertMessage}
        type={customAlertType}
        cancelText={customAlertOnConfirm ? 'Hủy' : undefined}
        confirmText={customAlertOnConfirm ? 'Tiếp tục' : 'Đóng'}
        onCancel={() => setCustomAlertVisible(false)}
        onConfirm={() => {
          setCustomAlertVisible(false);
          if (customAlertOnConfirm) customAlertOnConfirm();
        }}
      />
    </>
  );
}
