import ContextMenuField from '@/components/ContextMenuField';
import { useGetAreas } from '@/hooks/useArea';
import { useCreatePond } from '@/hooks/usePond';
import { useGetPondTypes } from '@/hooks/usePondType';
import { PondRequest, PondStatus } from '@/lib/api/services/fetchPond';
import React, { useState } from 'react';
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

interface CreatePondModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreatePondModal({
  visible,
  onClose,
}: CreatePondModalProps) {
  // Form states
  const [formData, setFormData] = useState<PondRequest>({
    pondName: '',
    location: '',
    pondStatus: PondStatus.EMPTY,
    currentCapacity: 0,
    depthMeters: 0,
    lengthMeters: 0,
    widthMeters: 0,
    areaId: 0,
    pondTypeId: 0,
  });

  // API hooks
  const { data: pondTypesData } = useGetPondTypes(true, {
    pageIndex: 1,
    pageSize: 100,
  });

  const { data: areasData } = useGetAreas(true, {
    pageIndex: 1,
    pageSize: 100,
  });

  const createPondMutation = useCreatePond();

  const pondTypes = pondTypesData?.data || [];
  const areas = areasData?.data || [];

  const resetForm = () => {
    setFormData({
      pondName: '',
      location: '',
      pondStatus: PondStatus.EMPTY,
      currentCapacity: 0,
      depthMeters: 0,
      lengthMeters: 0,
      widthMeters: 0,
      areaId: 0,
      pondTypeId: 0,
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!formData.pondName?.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên hồ');
      return false;
    }
    if (!formData.pondTypeId) {
      Alert.alert('Lỗi', 'Vui lòng chọn loại hồ');
      return false;
    }
    if (!formData.areaId) {
      Alert.alert('Lỗi', 'Vui lòng chọn khu vực');
      return false;
    }
    if (!formData.location?.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập vị trí');
      return false;
    }
    if (!formData.currentCapacity || formData.currentCapacity <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập dung tích hợp lệ');
      return false;
    }
    if (!formData.depthMeters || formData.depthMeters <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập độ sâu hợp lệ');
      return false;
    }
    if (!formData.lengthMeters || formData.lengthMeters <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập chiều dài hợp lệ');
      return false;
    }
    if (!formData.widthMeters || formData.widthMeters <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập chiều rộng hợp lệ');
      return false;
    }

    // Validate capacity against dimensions
    const maxCapacityLiters =
      formData.depthMeters *
      formData.lengthMeters *
      formData.widthMeters *
      1000;
    if ((formData.currentCapacity ?? 0) > maxCapacityLiters) {
      Alert.alert(
        'Lỗi',
        `Dung tích hồ (${formData.currentCapacity}L) không thể lớn hơn thể tích tính toán (${maxCapacityLiters.toFixed(0)}L) từ kích thước hồ.`
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await createPondMutation.mutateAsync(formData);
      handleClose();
    } catch (error) {
      console.error('Error creating pond:', error);
    }
  };

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
          <Text className="text-lg font-semibold">Tạo hồ mới</Text>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={createPondMutation.isPending}
          >
            <Text
              className={`font-medium ${createPondMutation.isPending ? 'text-gray-400' : 'text-primary'}`}
            >
              {createPondMutation.isPending ? 'Đang lưu...' : 'Lưu'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 p-4">
          <Text className="mb-4 text-lg font-semibold">Thông tin cơ bản</Text>

          {/* Pond Name */}
          <View className="mb-2">
            <Text className="mb-2 font-medium text-gray-700">
              Tên hồ <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="VD: Hồ số 1, Hồ chính..."
              value={formData.pondName}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, pondName: text }))
              }
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3"
            />
          </View>

          {/* Pond Type */}
          <View className="mb-2">
            <ContextMenuField
              label="Loại hồ"
              value={formData.pondTypeId?.toString() || ''}
              placeholder="Chọn loại hồ"
              options={
                pondTypes?.map((type) => ({
                  label: type.typeName,
                  value: type.id.toString(),
                })) || []
              }
              onSelect={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  pondTypeId: parseInt(value),
                }))
              }
            />
          </View>

          {/* Area */}
          <View className="mb-2">
            <ContextMenuField
              label="Khu vực"
              value={formData.areaId?.toString() || ''}
              placeholder="Chọn khu vực"
              options={
                areas?.map((area) => ({
                  label: area.areaName,
                  value: area.id.toString(),
                })) || []
              }
              onSelect={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  areaId: parseInt(value),
                }))
              }
            />
          </View>

          {/* Location */}
          <View>
            <Text className="mb-2 font-medium text-gray-700">
              Vị trí <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="VD: Góc phía Đông, Gần cây to..."
              value={formData.location}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, location: text }))
              }
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3"
            />
          </View>

          {/* Dimensions Section */}
          <Text className="mb-2 mt-4 text-lg font-semibold">Kích thước hồ</Text>

          <View className="mb-4 flex-row">
            <View className="mr-2 flex-1">
              <Text className="mb-2 font-medium text-gray-700">
                Chiều dài (m) <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="VD: 10"
                value={formData.lengthMeters?.toString() || ''}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    lengthMeters: parseFloat(text) || 0,
                  }))
                }
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>
            <View className="ml-2 flex-1">
              <Text className="mb-2 font-medium text-gray-700">
                Chiều rộng (m) <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="VD: 5"
                value={formData.widthMeters?.toString() || ''}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    widthMeters: parseFloat(text) || 0,
                  }))
                }
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>
          </View>

          <View className="mb-4 flex-row">
            <View className="mr-2 flex-1">
              <Text className="mb-2 font-medium text-gray-700">
                Độ sâu (m) <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="VD: 1.5"
                value={formData.depthMeters?.toString() || ''}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    depthMeters: parseFloat(text) || 0,
                  }))
                }
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>
            <View className="ml-2 flex-1">
              <Text className="mb-2 font-medium text-gray-700">
                Thể tích hiện tại (L) <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                placeholder="VD: 5000"
                value={formData.currentCapacity?.toString() || ''}
                onChangeText={(text) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentCapacity: parseFloat(text) || 0,
                  }))
                }
                className="rounded-2xl border border-gray-300 bg-white px-4 py-3"
                keyboardType="decimal-pad"
                inputMode="decimal"
              />
            </View>
          </View>

          <TouchableOpacity
            className={`mb-8 rounded-2xl py-4 ${createPondMutation.isPending ? 'bg-gray-400' : 'bg-primary'}`}
            onPress={handleSubmit}
            disabled={createPondMutation.isPending}
          >
            <Text className="text-center text-lg font-semibold text-white">
              {createPondMutation.isPending ? 'Đang tạo hồ...' : 'Tạo hồ'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
