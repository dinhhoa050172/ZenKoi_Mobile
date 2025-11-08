import { useUpdateWorkScheduleStatus } from '@/hooks/useWorkSchedule';
import {
  WorkSchedule,
  WorkScheduleStatus,
} from '@/lib/api/services/fetchWorkSchedule';
import { CheckCircle, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

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
  const [isLoading, setIsLoading] = useState(false);

  const updateStatusMutation = useUpdateWorkScheduleStatus();

  const handleComplete = async () => {
    if (!task) return;

    // Check if current date/time is within the scheduled work period
    const currentDate = new Date();
    const scheduleDate = new Date(task.scheduledDate);
    const startTime = new Date(`${task.scheduledDate}T${task.startTime}`);
    const endTime = new Date(`${task.scheduledDate}T${task.endTime}`);

    // Check if it's the scheduled date
    const isScheduledDate =
      currentDate.getDate() === scheduleDate.getDate() &&
      currentDate.getMonth() === scheduleDate.getMonth() &&
      currentDate.getFullYear() === scheduleDate.getFullYear();

    // Check if current time is within the scheduled time range
    const currentTime = currentDate.getTime();
    const isWithinTimeRange =
      currentTime >= startTime.getTime() && currentTime <= endTime.getTime();

    if (!isScheduledDate) {
      Alert.alert(
        'Không thể hoàn thành',
        'Chỉ có thể hoàn thành công việc vào ngày được lên lịch.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!isWithinTimeRange) {
      Alert.alert(
        'Ngoài giờ làm việc',
        `Công việc này chỉ có thể hoàn thành trong khoảng thời gian ${task.startTime} - ${task.endTime}. Bạn có muốn tiếp tục không?`,
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Tiếp tục', onPress: () => proceedWithCompletion() },
        ]
      );
      return;
    }

    proceedWithCompletion();
  };

  const proceedWithCompletion = async () => {
    if (!task || !completionNotes.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ghi chú hoàn thành công việc.');
      return;
    }

    setIsLoading(true);
    try {
      await updateStatusMutation.mutateAsync({
        id: task.id,
        status: WorkScheduleStatus.COMPLETED,
        notes: completionNotes.trim(),
      });

      setCompletionNotes('');
      onClose();
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setCompletionNotes('');
    onClose();
  };

  if (!task) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 items-center justify-center bg-black/50 p-4">
          <View className="w-full max-w-md rounded-2xl bg-white p-6">
            {/* Header */}
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-xl font-bold text-gray-900">
                Hoàn thành công việc
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="p-1"
                disabled={isLoading}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {/* Task Info */}
            <View className="mb-4 rounded-xl bg-gray-50 p-4">
              <Text className="mb-2 font-semibold text-gray-900">
                {task.taskTemplateName}
              </Text>
              <Text className="mb-1 text-sm text-gray-600">
                Thời gian: {task.startTime} - {task.endTime}
              </Text>
              <Text className="text-sm text-gray-600">
                Ngày: {new Date(task.scheduledDate).toLocaleDateString('vi-VN')}
              </Text>
              {task.pondAssignments.length > 0 && (
                <Text className="mt-1 text-sm text-gray-600">
                  Hồ: {task.pondAssignments.map((p) => p.pondName).join(', ')}
                </Text>
              )}
            </View>

            {/* Completion Notes */}
            <View className="mb-6">
              <Text className="mb-2 text-base font-medium text-gray-900">
                Ghi chú hoàn thành <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={completionNotes}
                onChangeText={setCompletionNotes}
                placeholder="Nhập ghi chú về việc hoàn thành công việc..."
                multiline
                numberOfLines={4}
                className="rounded-lg border border-gray-300 bg-white p-3 text-base text-gray-900"
                style={{ textAlignVertical: 'top' }}
                editable={!isLoading}
              />
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-3"
                disabled={isLoading}
              >
                <Text className="text-center font-medium text-gray-700">
                  Hủy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleComplete}
                className={`flex-1 flex-row items-center justify-center rounded-lg px-4 py-3 ${
                  isLoading || !completionNotes.trim()
                    ? 'bg-gray-300'
                    : 'bg-green-600'
                }`}
                disabled={isLoading || !completionNotes.trim()}
              >
                <CheckCircle
                  size={18}
                  color={
                    isLoading || !completionNotes.trim() ? '#9ca3af' : 'white'
                  }
                />
                <Text
                  className={`ml-2 font-medium ${
                    isLoading || !completionNotes.trim()
                      ? 'text-gray-500'
                      : 'text-white'
                  }`}
                >
                  {isLoading ? 'Đang xử lý...' : 'Hoàn thành'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
