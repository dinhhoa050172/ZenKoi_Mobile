import { useUpdateClassificationRecord } from '@/hooks/useClassificationRecord';
import { ClassificationRecordBreeding } from '@/lib/api/services/fetchBreedingProcess';
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
          label: 'không đạt chuẩn',
          field: 'cullQualifiedCount' as const,
        };
      case 2:
        return {
          stage: 3,
          label: 'High',
          field: 'highQualifiedCount' as const,
        };
      case 3:
        return {
          stage: 4,
          label: 'Show',
          field: 'showQualifiedCount' as const,
        };
      default:
        return {
          stage: 1,
          label: 'không đạt chuẩn',
          field: 'cullQualifiedCount' as const,
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
              Chỉnh sửa bản ghi tuyển chọn
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {record && (
              <View className="mb-3 rounded bg-blue-50 p-3">
                <Text className="text-sm text-blue-700">
                  Lần tuyển chọn:{' '}
                  <Text className="font-semibold">
                    Lần {stageInfo.stage} - {stageInfo.label}
                  </Text>
                </Text>
                <Text className="mt-1 text-sm text-blue-700">
                  Cull: {record.cullQualifiedCount ?? 0} | High:{' '}
                  {record.highQualifiedCount ?? 0} | Show:{' '}
                  {record.showQualifiedCount ?? 0}
                </Text>
              </View>
            )}

            <Text className="text-xs text-gray-500">
              Số cá {stageInfo.label} <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="mb-1 rounded border border-gray-200 p-2"
              value={count}
              onChangeText={(t) => {
                const v = t.replace(/[^0-9]/g, '');
                setCount(v);
                if (errors.count)
                  setErrors((p) => ({ ...p, count: undefined }));
              }}
              placeholder="VD: 100"
              keyboardType="numeric"
            />
            {errors.count ? (
              <Text className="mb-2 text-sm text-red-500">{errors.count}</Text>
            ) : null}

            <Text className="text-xs text-gray-500">Ghi chú</Text>
            <TextInput
              className="mb-2 rounded border border-gray-200 p-2"
              value={notes}
              onChangeText={(t) => setNotes(t)}
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
