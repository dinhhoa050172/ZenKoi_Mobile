import { useUpdateClassificationRecord } from '@/hooks/useClassificationRecord';
import { ClassificationRecordBreeding } from '@/lib/api/services/fetchBreedingProcess';
import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  FileText,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import FishSvg from '../icons/FishSvg';

interface EditClassificationRecordModalProps {
  visible: boolean;
  onClose: () => void;
  record: ClassificationRecordBreeding | null;
  recordIndex: number;
}

export function EditClassificationRecordModal({
  visible,
  onClose,
  record,
  recordIndex,
}: EditClassificationRecordModalProps) {
  const [count, setCount] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{
    count?: string;
  }>({});

  const updateMutation = useUpdateClassificationRecord();

  const getStageInfo = () => {
    switch (recordIndex) {
      case 0:
      case 1:
        return {
          stage: recordIndex + 1,
          label: 'không đạt chuẩn (Cull)',
          field: 'cullQualifiedCount' as const,
          color: '#ef4444',
          bgColor: '#fef2f2',
          icon: '🗑️',
        };
      case 2:
        return {
          stage: 3,
          label: 'High',
          field: 'highQualifiedCount' as const,
          color: '#3b82f6',
          bgColor: '#eff6ff',
          icon: '⭐',
        };
      case 3:
        return {
          stage: 4,
          label: 'Show',
          field: 'showQualifiedCount' as const,
          color: '#10b981',
          bgColor: '#f0fdf4',
          icon: '🏆',
        };
      default:
        return {
          stage: 1,
          label: 'không đạt chuẩn (Cull)',
          field: 'cullQualifiedCount' as const,
          color: '#ef4444',
          bgColor: '#fef2f2',
          icon: '🗑️',
        };
    }
  };

  const stageInfo = getStageInfo();

  useEffect(() => {
    if (visible && record) {
      const currentCount = record[stageInfo.field] ?? 0;
      setCount(String(currentCount));
      setNotes(record.notes ?? '');
    } else {
      setCount('');
      setNotes('');
      setErrors({});
    }
  }, [visible, record, stageInfo.field]);

  const handleClose = () => {
    setCount('');
    setNotes('');
    setErrors({});
    onClose();
  };

  const handleSave = async () => {
    if (updateMutation.status === 'pending') return;

    setErrors({});

    if (!record) {
      Toast.show({
        type: 'error',
        text1: 'Không tìm thấy bản ghi',
      });
      return;
    }

    const errors: any = {};
    const countValue = count.trim() === '' ? NaN : parseInt(count, 10);

    if (!Number.isFinite(countValue) || countValue < 0) {
      errors.count = 'Vui lòng nhập số lượng hợp lệ';
    }

    setErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      // Build update request with all fields
      const updateData = {
        highQualifiedCount: record.highQualifiedCount ?? 0,
        showQualifiedCount: record.showQualifiedCount ?? 0,
        pondQualifiedCount: record.pondQualifiedCount ?? 0,
        cullQualifiedCount: record.cullQualifiedCount ?? 0,
        notes: notes.trim(),
      };

      // Update only the specific field based on stage
      updateData[stageInfo.field] = countValue;

      await updateMutation.mutateAsync({
        id: record.id,
        data: updateData,
      });

      Toast.show({
        type: 'success',
        text1: 'Đã cập nhật bản ghi!',
      });

      handleClose();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err?.message || 'Không thể cập nhật',
      });
    }
  };

  const isLoading = updateMutation.status === 'pending';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <View
          className="w-full max-w-md flex-1 rounded-3xl bg-white shadow-2xl"
          style={{ maxHeight: '75%' }}
        >
          {/* Header */}
          <View className="items-center border-b border-gray-100 px-6 py-5">
            <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Edit3 size={24} color="#3b82f6" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              Chỉnh sửa bản ghi
            </Text>
            <Text className="mt-1 text-center text-base text-gray-600">
              Cập nhật thông tin tuyển chọn
            </Text>
            <TouchableOpacity
              onPress={handleClose}
              className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <X size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <KeyboardAwareScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
            bottomOffset={20}
            keyboardShouldPersistTaps="handled"
          >
            {record && (
              <>
                {/* Current Record Info */}
                <View className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-blue-50">
                  <View className="flex-row items-center border-b border-blue-100 bg-blue-100 px-4 py-2">
                    <FishSvg size={20} color="#3b82f6" />
                    <Text className="ml-2 text-base font-bold uppercase tracking-wide text-blue-700">
                      Thông tin hiện tại
                    </Text>
                  </View>
                  <View className="p-4">
                    <View className="mb-2 flex-row items-center justify-between">
                      <Text className="text-base text-blue-700">
                        Lần tuyển chọn
                      </Text>
                      <View className="rounded-full bg-blue-600 px-3 py-1">
                        <Text className="text-sm font-bold text-white">
                          Lần {stageInfo.stage} - {stageInfo.label}
                        </Text>
                      </View>
                    </View>
                    <View className="mt-2 rounded-2xl bg-white p-3">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-gray-600">Cull</Text>
                        <Text className="text-base font-semibold text-gray-900">
                          {record.cullQualifiedCount ?? 0} con
                        </Text>
                      </View>
                      <View className="mt-1 flex-row items-center justify-between">
                        <Text className="text-base text-gray-600">High</Text>
                        <Text className="text-base font-semibold text-gray-900">
                          {record.highQualifiedCount ?? 0} con
                        </Text>
                      </View>
                      <View className="mt-1 flex-row items-center justify-between">
                        <Text className="text-base text-gray-600">Show</Text>
                        <Text className="text-base font-semibold text-gray-900">
                          {record.showQualifiedCount ?? 0} con
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Edit Section Header */}
                <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                  Cập nhật thông tin
                </Text>

                {/* Count Input */}
                <View className="mb-4 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white">
                  <View
                    className="flex-row items-center px-4 py-3"
                    style={{ backgroundColor: stageInfo.bgColor }}
                  >
                    <Text className="mr-2 text-2xl">{stageInfo.icon}</Text>
                    <View className="flex-1">
                      <Text
                        className="text-lg font-semibold"
                        style={{ color: stageInfo.color }}
                      >
                        Số cá {stageInfo.label}
                      </Text>
                      <Text className="text-base text-gray-500">
                        Bắt buộc nhập
                      </Text>
                    </View>
                  </View>
                  <View className="p-4">
                    <TextInput
                      className="rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base font-semibold text-gray-900"
                      value={count}
                      onChangeText={(t) => {
                        const v = t.replace(/[^0-9]/g, '');
                        setCount(v);
                        if (errors.count)
                          setErrors((p) => ({ ...p, count: undefined }));
                      }}
                      placeholder="VD: 100"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      style={errors.count ? { borderColor: '#ef4444' } : {}}
                    />
                    {errors.count && (
                      <View className="mt-2 flex-row items-center">
                        <AlertCircle size={14} color="#ef4444" />
                        <Text className="ml-1 text-sm text-red-500">
                          {errors.count}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Notes Section */}
                <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                  <View className="flex-row items-center border-b border-gray-100 px-4 py-2">
                    <FileText size={20} color="#64748b" />
                    <Text className="ml-2 text-base font-semibold uppercase tracking-wide text-gray-600">
                      Ghi chú
                    </Text>
                  </View>
                  <View className="p-4">
                    <TextInput
                      className="rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                      value={notes}
                      onChangeText={setNotes}
                      placeholder="Thêm ghi chú (không bắt buộc)"
                      placeholderTextColor="#9ca3af"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      style={{ minHeight: 80 }}
                    />
                  </View>
                </View>
              </>
            )}
          </KeyboardAwareScrollView>

          {/* Footer Actions */}
          <View className="flex-row gap-3 border-t border-gray-100 p-4">
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-2xl border-2 border-gray-300 bg-white py-3"
              onPress={handleClose}
              disabled={isLoading}
            >
              <Text className="text-base font-semibold text-gray-700">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 items-center justify-center rounded-2xl py-3 ${
                isLoading ? 'bg-gray-400' : 'bg-primary'
              }`}
              disabled={isLoading}
              onPress={handleSave}
            >
              {isLoading ? (
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" />
                  <Text className="ml-2 text-base font-semibold text-white">
                    Đang lưu...
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center">
                  <CheckCircle2 size={18} color="white" />
                  <Text className="ml-2 text-base font-semibold text-white">
                    Cập nhật
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
