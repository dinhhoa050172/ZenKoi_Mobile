import { useUpdateFrySurvivalRecord } from '@/hooks/useFrySurvivalRecord';
import { FrySurvivalRecordsBreeding } from '@/lib/api/services/fetchBreedingProcess';
import {
  Calendar,
  Edit3,
  FileText,
  Fish,
  TrendingUp,
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

interface EditFrySurvivalRecordModalProps {
  visible: boolean;
  onClose: () => void;
  record: FrySurvivalRecordsBreeding | null;
  fryFishId: number;
}

export function EditFrySurvivalRecordModal({
  visible,
  onClose,
  record,
  fryFishId,
}: EditFrySurvivalRecordModalProps) {
  const [countAlive, setCountAlive] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{
    countAlive?: string;
  }>({});

  const updateMutation = useUpdateFrySurvivalRecord();

  useEffect(() => {
    if (visible && record) {
      setCountAlive(String(record.countAlive ?? ''));
      setNote(record.note ?? '');
    } else {
      setCountAlive('');
      setNote('');
      setErrors({});
    }
  }, [visible, record]);

  const handleClose = () => {
    setCountAlive('');
    setNote('');
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
    const alive = countAlive.trim() === '' ? NaN : parseInt(countAlive, 10);

    if (!Number.isFinite(alive) || alive < 0) {
      errors.countAlive = 'Vui lòng nhập số lượng hợp lệ';
    }

    setErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await updateMutation.mutateAsync({
        id: record.id,
        data: {
          fryFishId: fryFishId,
          countAlive: alive,
          note: note.trim(),
          success: false,
        },
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

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 p-4">
        <View
          className="w-full max-w-md flex-1 rounded-3xl bg-white"
          style={{ maxHeight: '75%' }}
        >
          {/* Header */}
          <View className="relative border-b border-gray-100 px-6 py-5">
            <View className="items-center">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Edit3 size={24} color="#3b82f6" />
              </View>
              <Text className="text-xl font-bold text-gray-900">
                Chỉnh sửa bản ghi
              </Text>
              <Text className="mt-1 text-center text-base text-gray-600">
                Cập nhật thông tin cá bột sống sót
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <X size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <KeyboardAwareScrollView
            className="flex-1"
            contentContainerStyle={{ padding: 24 }}
            bottomOffset={20}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Current Record Info */}
            {record && (
              <View className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <View className="mb-3 flex-row items-center">
                  <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                    <FishSvg size={20} color="#3b82f6" />
                  </View>
                  <Text className="text-base font-bold text-blue-900">
                    Thông tin hiện tại
                  </Text>
                </View>

                <View className="mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Calendar size={18} color="#3b82f6" />
                    <Text className="ml-2 text-base text-blue-700">
                      Ngày ghi nhận
                    </Text>
                  </View>
                  <Text className="text-base font-bold text-blue-900">
                    {new Date(record.dayNumber).toLocaleDateString('vi-VN')}
                  </Text>
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <TrendingUp size={18} color="#3b82f6" />
                    <Text className="ml-2 text-base text-blue-700">
                      Tỷ lệ sống
                    </Text>
                  </View>
                  <Text className="text-base font-bold text-blue-900">
                    {(record.survivalRate ?? 0).toFixed(1)}%
                  </Text>
                </View>
              </View>
            )}

            {/* Edit Form */}
            <View className="mb-6">
              <Text className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Cập nhật thông tin
              </Text>

              {/* Count Alive Input */}
              <View className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
                <View className="mb-3 flex-row items-center">
                  <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-green-100">
                    <Fish size={18} color="#22c55e" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900">
                      Số cá sống <Text className="text-red-500">*</Text>
                    </Text>
                  </View>
                </View>
                <TextInput
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base font-medium text-gray-900"
                  value={countAlive}
                  onChangeText={(t) => {
                    const v = t.replace(/[^0-9]/g, '');
                    setCountAlive(v);
                    if (errors.countAlive)
                      setErrors((p) => ({ ...p, countAlive: undefined }));
                  }}
                  placeholder="VD: 4400"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                />
                {errors.countAlive && (
                  <Text className="mt-2 text-sm text-red-500">
                    {errors.countAlive}
                  </Text>
                )}
              </View>

              {/* Note Input */}
              <View className="rounded-2xl border border-gray-200 bg-white p-4">
                <View className="mb-3 flex-row items-center">
                  <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                    <FileText size={18} color="#64748b" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-medium text-gray-900">
                      Ghi chú
                    </Text>
                    <Text className="text-sm text-gray-500">Tùy chọn</Text>
                  </View>
                </View>
                <TextInput
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
                  value={note}
                  onChangeText={(t) => setNote(t)}
                  placeholder="Nhập ghi chú nếu cần..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{ minHeight: 100 }}
                />
              </View>
            </View>
          </KeyboardAwareScrollView>

          {/* Footer Buttons */}
          <View className="border-t border-gray-100 p-4">
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white py-3"
                onPress={handleClose}
                disabled={updateMutation.status === 'pending'}
              >
                <Text className="text-base font-semibold text-gray-700">
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center justify-center rounded-2xl py-3 ${
                  updateMutation.status === 'pending'
                    ? 'bg-gray-300'
                    : 'bg-primary'
                }`}
                disabled={updateMutation.status === 'pending'}
                onPress={handleSave}
              >
                {updateMutation.status === 'pending' ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="ml-2 text-base font-semibold text-white">
                      Đang lưu...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-base font-semibold text-white">
                    Cập nhật
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
