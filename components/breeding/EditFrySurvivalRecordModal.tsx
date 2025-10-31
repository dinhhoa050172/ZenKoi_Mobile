import { useUpdateFrySurvivalRecord } from '@/hooks/useFrySurvivalRecord';
import { FrySurvivalRecordsBreeding } from '@/lib/api/services/fetchBreedingProcess';
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
          success: false, // Edit không chuyển giai đoạn
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
      <View className="flex-1 items-center justify-center bg-black/40 px-4">
        <View
          className="w-11/12 rounded-2xl bg-white"
          style={{ maxHeight: '60%' }}
        >
          <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
            <Text className="text-lg font-semibold">
              Chỉnh sửa bản ghi cá bột
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {record && (
              <View className="mb-3 rounded bg-blue-50 p-3">
                <Text className="text-sm text-blue-700">
                  Bản ghi ngày:{' '}
                  <Text className="font-semibold">
                    {new Date(record.dayNumber).toLocaleDateString('vi-VN')}
                  </Text>
                </Text>
                <Text className="mt-1 text-sm text-blue-700">
                  Tỷ lệ sống hiện tại:{' '}
                  <Text className="font-semibold">
                    {(record.survivalRate ?? 0).toFixed(1)}%
                  </Text>
                </Text>
              </View>
            )}

            <Text className="text-xs text-gray-500">
              Số cá sống <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="mb-1 rounded border border-gray-200 p-2"
              value={countAlive}
              onChangeText={(t) => {
                const v = t.replace(/[^0-9]/g, '');
                setCountAlive(v);
                if (errors.countAlive)
                  setErrors((p) => ({ ...p, countAlive: undefined }));
              }}
              placeholder="VD: 4400"
              keyboardType="numeric"
            />
            {errors.countAlive ? (
              <Text className="mb-2 text-sm text-red-500">
                {errors.countAlive}
              </Text>
            ) : null}

            <Text className="text-xs text-gray-500">Ghi chú</Text>
            <TextInput
              className="mb-2 rounded border border-gray-200 p-2"
              value={note}
              onChangeText={(t) => setNote(t)}
              placeholder="Ghi chú (tuỳ chọn)"
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          <View className="flex-row justify-between border-t border-gray-100 p-4">
            <TouchableOpacity
              className="rounded-lg border border-gray-200 px-4 py-2"
              onPress={handleClose}
            >
              <Text>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`rounded-lg bg-primary px-4 py-2 ${updateMutation.status === 'pending' ? 'opacity-60' : ''}`}
              disabled={updateMutation.status === 'pending'}
              onPress={handleSave}
            >
              {updateMutation.status === 'pending' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white">Cập nhật</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
