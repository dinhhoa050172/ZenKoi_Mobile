import { Pond } from '@/lib/api/services/fetchPond';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import ContextMenuField from '../ContextMenuField';

interface ChangePondModalProps {
  visible: boolean;
  onClose: () => void;
  currentPondId: number;
  currentPondName: string;
  allPonds: Pond[];
  onRefetchPonds: () => void;
  onSave: (newPondId: number) => Promise<void>;
  title?: string;
  description?: string;
}

export function ChangePondModal({
  visible,
  onClose,
  currentPondId,
  currentPondName,
  allPonds,
  onRefetchPonds,
  onSave,
  title = 'Chọn hồ',
  description,
}: ChangePondModalProps) {
  const [selectedPondId, setSelectedPondId] = useState<number | null>(null);
  const [selectedPondLabel, setSelectedPondLabel] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && currentPondId) {
      setSelectedPondId(currentPondId);
      setSelectedPondLabel(`${currentPondId}: ${currentPondName}`);
    }
  }, [visible, currentPondId, currentPondName]);

  const handleClose = () => {
    setSelectedPondId(currentPondId);
    setSelectedPondLabel(`${currentPondId}: ${currentPondName}`);
    onClose();
  };

  const handleSave = async () => {
    if (isSaving) return;

    if (!selectedPondId) {
      Toast.show({
        type: 'error',
        text1: 'Vui lòng chọn hồ',
      });
      return;
    }

    if (selectedPondId === currentPondId) {
      Toast.show({
        type: 'info',
        text1: 'Hồ không thay đổi',
      });
      return;
    }

    try {
      setIsSaving(true);
      await onSave(selectedPondId);

      Toast.show({
        type: 'success',
        text1: 'Đã chuyển hồ thành công!',
      });

      onClose();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err?.message || 'Không thể chuyển hồ',
      });
    } finally {
      setIsSaving(false);
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
        <View
          className="w-11/12 rounded-2xl bg-white"
          style={{ maxHeight: '50%' }}
        >
          <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
            <Text className="text-lg font-semibold">{title}</Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {description && (
              <Text className="mb-2 text-sm text-gray-600">{description}</Text>
            )}
            <Text className="mb-2 text-sm text-gray-600">
              Hồ hiện tại:{' '}
              <Text className="font-semibold">{currentPondName}</Text>
            </Text>

            <ContextMenuField
              label="Chọn hồ mới"
              value={selectedPondLabel}
              options={(allPonds ?? []).map((p) => ({
                label: `${p.id}: ${p.pondName ?? p.id}`,
                value: `${p.id}: ${p.pondName ?? p.id}`,
                meta: `Sức chứa tối đa: ${p.maxFishCount ?? '—'}`,
              }))}
              onSelect={(v: string) => {
                const id = String(v).split(':')[0]?.trim();
                setSelectedPondId(id ? Number(id) : null);
                setSelectedPondLabel(String(v));
              }}
              onPress={onRefetchPonds}
              placeholder="Chọn hồ"
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
              className={`rounded-lg bg-primary px-4 py-2 ${isSaving ? 'opacity-60' : ''}`}
              disabled={isSaving}
              onPress={handleSave}
            >
              {isSaving ? (
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
