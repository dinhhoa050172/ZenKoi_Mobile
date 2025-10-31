import {
  useUpdateIncubationDailyRecord,
  useUpdateIncubationDailyRecordV2,
} from '@/hooks/useIncubationDailyRecord';
import { IncubationDailyReordBreeding } from '@/lib/api/services/fetchBreedingProcess';
import { X } from 'lucide-react-native';
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
            success: false, // Edit doesn't change stage
          },
        });
      } else {
        await updateMutationV2.mutateAsync({
          id: record.id,
          data: {
            hatchedEggs: parseInt(hatchedEggs, 10),
            success: false, // Edit doesn't change stage
          },
        });
      }

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
      <View className="flex-1 items-center justify-center bg-black/40 p-4">
        <View className="w-11/12 rounded-2xl bg-white">
          <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
            <Text className="text-lg font-semibold">Chỉnh sửa bản ghi</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {isFirstRecord && (
              <>
                <Text className="text-xs text-gray-500">
                  Số trứng khỏe <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  className="mb-1 rounded border border-gray-200 p-2"
                  value={healthyEggs}
                  onChangeText={(t) => {
                    setHealthyEggs(t.replace(/[^0-9]/g, ''));
                    if (errors.healthyEggs)
                      setErrors((prev) => ({
                        ...prev,
                        healthyEggs: undefined,
                      }));
                  }}
                  placeholder="VD: 120"
                  keyboardType="numeric"
                />
                {errors.healthyEggs ? (
                  <Text className="mb-2 text-sm text-red-500">
                    {errors.healthyEggs}
                  </Text>
                ) : null}
              </>
            )}

            <Text className="mt-3 text-xs text-gray-500">
              Số trứng đã nở <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="mb-1 rounded border border-gray-200 p-2"
              value={hatchedEggs}
              onChangeText={(t) => {
                setHatchedEggs(t.replace(/[^0-9]/g, ''));
                if (errors.hatchedEggs)
                  setErrors((prev) => ({ ...prev, hatchedEggs: undefined }));
              }}
              placeholder="VD: 100"
              keyboardType="numeric"
            />
            {errors.hatchedEggs ? (
              <Text className="text-sm text-red-500">{errors.hatchedEggs}</Text>
            ) : null}
          </ScrollView>

          <View className="flex-row justify-between border-t border-gray-100 p-4">
            <TouchableOpacity
              className="rounded-lg border border-gray-200 px-4 py-2"
              onPress={handleClose}
            >
              <Text>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`rounded-lg bg-primary px-4 py-2 ${updateMutation.status === 'pending' || updateMutationV2.status === 'pending' ? 'opacity-60' : ''}`}
              disabled={
                updateMutation.status === 'pending' ||
                updateMutationV2.status === 'pending'
              }
              onPress={handleSave}
            >
              {updateMutation.status === 'pending' ||
              updateMutationV2.status === 'pending' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white">Lưu</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
