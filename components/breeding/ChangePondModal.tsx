import { Pond } from '@/lib/api/services/fetchPond';
import { AlertCircle, Droplet, X } from 'lucide-react-native';
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

  const selectedPondName = selectedPondLabel
    .split(':')
    .slice(1)
    .join(':')
    .trim();
  const isChanged = selectedPondId !== currentPondId;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 p-4">
        <View
          className="w-full max-w-md rounded-3xl bg-white"
          style={{ maxHeight: '70%' }}
        >
          {/* Header */}
          <View className="relative border-b border-gray-100 px-6 py-5">
            <View className="items-center">
              <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Droplet size={24} color="#3b82f6" />
              </View>
              <Text className="text-xl font-bold text-gray-900">{title}</Text>
              {description && (
                <Text className="mt-1 text-center text-sm text-gray-600">
                  {description}
                </Text>
              )}
            </View>
            <TouchableOpacity
              onPress={handleClose}
              className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <X size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Current Pond Info */}
            <View className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <View className="mb-2 flex-row items-center">
                <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Droplet size={16} color="#3b82f6" />
                </View>
                <Text className="text-sm font-semibold text-blue-900">
                  Hồ hiện tại
                </Text>
              </View>
              <Text className="text-base font-bold text-blue-900">
                {currentPondName}
              </Text>
            </View>

            {/* New Pond Selection */}
            <View className="mb-4">
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
                placeholder="Chọn hồ mới..."
              />
            </View>

            {/* New Pond Preview (only show when changed) */}
            {isChanged && selectedPondName && (
              <View className="rounded-2xl border border-green-100 bg-green-50 p-4">
                <View className="mb-2 flex-row items-center">
                  <View className="mr-2 h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Droplet size={16} color="#22c55e" />
                  </View>
                  <Text className="text-sm font-semibold text-green-900">
                    Hồ mới
                  </Text>
                </View>
                <Text className="text-base font-bold text-green-900">
                  {selectedPondName}
                </Text>
              </View>
            )}

            {/* Warning when no change */}
            {!isChanged && selectedPondId && (
              <View className="mt-2 flex-row items-start rounded-2xl border border-amber-200 bg-amber-50 p-3">
                <AlertCircle size={18} color="#f59e0b" />
                <Text className="ml-2 flex-1 text-sm text-amber-800">
                  Bạn đang chọn hồ giống với hồ hiện tại
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          <View className="border-t border-gray-100 p-4">
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center justify-center rounded-2xl border border-gray-200 bg-white py-3"
                onPress={handleClose}
                disabled={isSaving}
              >
                <Text className="text-base font-semibold text-gray-700">
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 items-center justify-center rounded-2xl py-3 ${
                  isSaving || !isChanged ? 'bg-gray-300' : 'bg-primary'
                }`}
                disabled={isSaving || !isChanged}
                onPress={handleSave}
              >
                {isSaving ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="ml-2 text-base font-semibold text-white">
                      Đang lưu...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-base font-semibold text-white">
                    Chuyển hồ
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
