import { useGetPondTypeById, useUpdatePondType } from '@/hooks/usePondType';
import { PondTypeRequest } from '@/lib/api/services/fetchPondType';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface EditPondTypeModalProps {
  visible: boolean;
  pondTypeId: number | null;
  onClose: () => void;
}

export default function EditPondTypeModal({
  visible,
  pondTypeId,
  onClose,
}: EditPondTypeModalProps) {
  // Form states
  const [formData, setFormData] = useState<PondTypeRequest>({
    typeName: '',
    description: '',
    recommendedCapacity: 0,
  });

  // API hooks
  const { data: pondTypeData, isLoading: isPondTypeLoading } =
    useGetPondTypeById(pondTypeId || 0, !!pondTypeId && visible);

  const updatePondTypeMutation = useUpdatePondType();

  // Load pond type data when modal opens
  useEffect(() => {
    if (pondTypeData && visible) {
      setFormData({
        typeName: pondTypeData.typeName,
        description: pondTypeData.description,
        recommendedCapacity: pondTypeData.recommendedCapacity,
      });
    }
  }, [pondTypeData, visible]);

  const resetForm = () => {
    setFormData({
      typeName: '',
      description: '',
      recommendedCapacity: 0,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!formData.typeName?.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên loại hồ');
      return false;
    }
    if (!formData.description?.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả');
      return false;
    }
    if (!formData.recommendedCapacity || formData.recommendedCapacity <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập dung tích khuyến nghị hợp lệ');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !pondTypeId) return;

    try {
      await updatePondTypeMutation.mutateAsync({
        id: pondTypeId,
        data: formData,
      });
      handleClose();
    } catch (error) {
      console.error('Error updating pond type:', error);
    }
  };

  if (isPondTypeLoading) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg text-gray-600">Đang tải...</Text>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between border-b border-gray-200 bg-white p-4">
          <TouchableOpacity onPress={handleClose}>
            <Text className="font-medium text-primary">Hủy</Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Chỉnh sửa loại hồ</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={updatePondTypeMutation.isPending}
          >
            <Text
              className={`font-medium ${updatePondTypeMutation.isPending ? 'text-gray-400' : 'text-primary'}`}
            >
              {updatePondTypeMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <Text className="mb-4 text-lg font-semibold">Thông tin cơ bản</Text>

          {/* Type Name */}
          <View className="mb-4">
            <Text className="mb-2 font-medium text-gray-700">
              Tên loại hồ <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="VD: Hồ nuôi cá Koi, Hồ cảnh quan..."
              value={formData.typeName}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, typeName: text }))
              }
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3"
            />
          </View>

          {/* Description */}
          <View className="mb-4">
            <Text className="mb-2 font-medium text-gray-700">
              Mô tả <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="Mô tả chi tiết về loại hồ này..."
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Recommended Capacity */}
          <View className="mb-4">
            <Text className="mb-2 font-medium text-gray-700">
              Dung tích khuyến nghị (L) <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="VD: 5000"
              value={formData.recommendedCapacity?.toString() || ''}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  recommendedCapacity: parseFloat(text) || 0,
                }))
              }
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3"
              keyboardType="numeric"
              inputMode="numeric"
            />
            <Text className="mt-1 text-sm text-gray-500">
              Dung tích khuyến nghị cho loại hồ này (tính bằng lít)
            </Text>
          </View>

          <TouchableOpacity
            className={`mb-8 rounded-2xl py-4 ${updatePondTypeMutation.isPending ? 'bg-gray-400' : 'bg-primary'}`}
            onPress={handleSubmit}
            disabled={updatePondTypeMutation.isPending}
          >
            <Text className="text-center text-lg font-semibold text-white">
              {updatePondTypeMutation.isPending
                ? 'Đang cập nhật...'
                : 'Cập nhật loại hồ'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
