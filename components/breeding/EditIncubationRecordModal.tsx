import {
  useUpdateIncubationDailyRecord,
  useUpdateIncubationDailyRecordV2,
} from '@/hooks/useIncubationDailyRecord';
import { IncubationDailyReordBreeding } from '@/lib/api/services/fetchBreedingProcess';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Edit3,
  Egg,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface EditIncubationRecordModalProps {
  visible: boolean;
  onClose: () => void;
  record: IncubationDailyReordBreeding | null;
  isFirstRecord: boolean;
}

export function EditIncubationRecordModal({
  visible,
  onClose,
  record,
  isFirstRecord,
}: EditIncubationRecordModalProps) {
  const [healthyEggs, setHealthyEggs] = useState('');
  const [hatchedEggs, setHatchedEggs] = useState('');
  const [errors, setErrors] = useState<{
    healthyEggs?: string;
    hatchedEggs?: string;
  }>({});

  const updateMutation = useUpdateIncubationDailyRecord();
  const updateMutationV2 = useUpdateIncubationDailyRecordV2();

  useEffect(() => {
    if (visible && record) {
      setHealthyEggs(record.healthyEggs?.toString() || '');
      setHatchedEggs(record.hatchedEggs?.toString() || '');
    }
  }, [visible, record]);

  const clearInputs = () => {
    setHealthyEggs('');
    setHatchedEggs('');
    setErrors({});
  };

  const handleClose = () => {
    clearInputs();
    onClose();
  };

  const handleSave = async () => {
    if (!record) return;

    if (
      updateMutation.status === 'pending' ||
      updateMutationV2.status === 'pending'
    )
      return;

    setErrors({});

    const validationErrors: any = {};

    // For first record, healthyEggs is required
    if (isFirstRecord) {
      const healthy =
        healthyEggs.trim() === '' ? NaN : parseInt(healthyEggs, 10);
      if (!Number.isFinite(healthy) || healthy < 0) {
        validationErrors.healthyEggs =
          'Vui lòng nhập số lượng trứng khỏe hợp lệ';
      }
    }

    const hatched = hatchedEggs.trim() === '' ? NaN : parseInt(hatchedEggs, 10);
    if (!Number.isFinite(hatched) || hatched < 0) {
      validationErrors.hatchedEggs = 'Vui lòng nhập số lượng trứng nở hợp lệ';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      if (isFirstRecord) {
        await updateMutation.mutateAsync({
          id: record.id,
          data: {
            healthyEggs: parseInt(healthyEggs, 10),
            hatchedEggs: parseInt(hatchedEggs, 10),
            success: false,
          },
        });
      } else {
        await updateMutationV2.mutateAsync({
          id: record.id,
          data: {
            hatchedEggs: parseInt(hatchedEggs, 10),
            success: false,
          },
        });
      }

      Toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Đã cập nhật bản ghi ấp trứng!',
      });

      handleClose();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: err?.message || 'Không thể cập nhật bản ghi',
      });
    }
  };

  const isLoading =
    updateMutation.status === 'pending' ||
    updateMutationV2.status === 'pending';

  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <View className="w-full max-w-md rounded-3xl bg-white shadow-2xl">
          {/* Header */}
          <View className="items-center border-b border-gray-100 px-6 py-4">
            <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Edit3 size={24} color="#f97316" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              Chỉnh sửa bản ghi
            </Text>
            {record && (
              <Text className="mt-1 text-sm text-gray-500">
                Ngày: {formatDate(record.dayNumber)}
              </Text>
            )}
            <TouchableOpacity
              onPress={handleClose}
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-2"
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Info Card */}
            <View className="mb-4 overflow-hidden rounded-2xl border border-orange-200 bg-orange-50">
              <View className="flex-row items-center border-b border-orange-100 bg-orange-100 px-4 py-2">
                <Egg size={18} color="#f97316" />
                <Text className="ml-2 text-base font-semibold uppercase tracking-wide text-orange-700">
                  Thông tin hiện tại
                </Text>
              </View>
              <View className="p-4">
                {record && (
                  <View className="space-y-2">
                    {isFirstRecord && (
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-gray-600">
                          Trứng khỏe
                        </Text>
                        <Text className="text-base font-semibold text-gray-900">
                          {record.healthyEggs?.toLocaleString() || 0} quả
                        </Text>
                      </View>
                    )}
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base text-gray-600">
                        Trứng hỏng
                      </Text>
                      <Text className="text-base font-semibold text-red-600">
                        {record.rottenEggs?.toLocaleString() || 0} quả
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base text-gray-600">Đã nở</Text>
                      <Text className="text-base font-semibold text-green-600">
                        {record.hatchedEggs?.toLocaleString() || 0} quả
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Healthy Eggs Input (First Record Only) */}
            {isFirstRecord && (
              <View className="mb-4 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white">
                <View className="flex-row items-center bg-green-50 px-4 py-3">
                  <Check size={22} color="#16a34a" />
                  <View className="ml-2 flex-1">
                    <Text className="text-base font-semibold text-green-700">
                      Số trứng khỏe
                    </Text>
                    <Text className="text-base text-gray-500">
                      Bắt buộc nhập
                    </Text>
                  </View>
                </View>
                <View className="p-4">
                  <TextInput
                    className="rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base font-semibold text-gray-900"
                    value={healthyEggs}
                    onChangeText={(t) => {
                      setHealthyEggs(t.replace(/[^0-9]/g, ''));
                      if (errors.healthyEggs)
                        setErrors((prev) => ({
                          ...prev,
                          healthyEggs: undefined,
                        }));
                    }}
                    placeholder="Nhập số trứng khỏe (VD: 120)"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    style={errors.healthyEggs ? { borderColor: '#ef4444' } : {}}
                  />
                  {errors.healthyEggs ? (
                    <View className="mt-2 flex-row items-center">
                      <AlertCircle size={14} color="#ef4444" />
                      <Text className="ml-1 text-sm text-red-500">
                        {errors.healthyEggs}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            )}

            {/* Hatched Eggs Input */}
            <View className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white">
              <View className="flex-row items-center bg-blue-50 px-4 py-3">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Text className="text-lg">🐣</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-blue-700">
                    Số trứng đã nở
                  </Text>
                  <Text className="text-base text-gray-500">Bắt buộc nhập</Text>
                </View>
              </View>
              <View className="p-4">
                <TextInput
                  className="rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base font-semibold text-gray-900"
                  value={hatchedEggs}
                  onChangeText={(t) => {
                    setHatchedEggs(t.replace(/[^0-9]/g, ''));
                    if (errors.hatchedEggs)
                      setErrors((prev) => ({
                        ...prev,
                        hatchedEggs: undefined,
                      }));
                  }}
                  placeholder="Nhập số trứng đã nở (VD: 100)"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  style={errors.hatchedEggs ? { borderColor: '#ef4444' } : {}}
                />
                {errors.hatchedEggs ? (
                  <View className="mt-2 flex-row items-center">
                    <AlertCircle size={14} color="#ef4444" />
                    <Text className="ml-1 text-sm text-red-500">
                      {errors.hatchedEggs}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Help Text */}
            <View className="mt-4 rounded-2xl bg-gray-50 p-3">
              <Text className="text-base leading-5 text-gray-600">
                💡 <Text className="font-semibold">Lưu ý:</Text> Chỉ có thể
                chỉnh sửa bản ghi mới nhất. Hãy kiểm tra kỹ số liệu trước khi
                lưu.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View className="flex-row gap-3 border-t border-gray-100 p-4">
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-2xl border-2 border-gray-300 bg-white py-3"
              onPress={handleClose}
            >
              <Text className="font-semibold text-gray-700">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 items-center justify-center rounded-2xl py-3 ${isLoading ? 'bg-orange-400' : 'bg-orange-500'}`}
              disabled={isLoading}
              onPress={handleSave}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="flex-row items-center">
                  <CheckCircle2 size={18} color="white" />
                  <Text className="ml-2 font-semibold text-white">
                    Lưu thay đổi
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
