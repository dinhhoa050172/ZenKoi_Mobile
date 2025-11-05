import ContextMenuField from '@/components/ContextMenuField';
import { CustomAlert } from '@/components/CustomAlert';
import { useCreatePondType, useDeletePondType } from '@/hooks/usePondType';
import {
  useCreateWaterParameterThreshold,
  useDeleteWaterParameterThreshold,
} from '@/hooks/useWaterParameterThreshold';
import { PondTypeRequest, TypeOfPond } from '@/lib/api/services/fetchPondType';
import {
  WaterParameterThreshold,
  WaterParameterThresholdRequest,
} from '@/lib/api/services/fetchWaterParameterThreshold';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CreatePondTypeModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreatePondTypeModal({
  visible,
  onClose,
}: CreatePondTypeModalProps) {
  // Form states
  const [formData, setFormData] = useState<PondTypeRequest>({
    typeName: '',
    description: '',
    type: TypeOfPond.PARING,
    recommendedQuantity: 0,
  });

  // API hooks
  const createPondTypeMutation = useCreatePondType();
  const deletePondTypeMutation = useDeletePondType();
  const createWaterParameterThreshold = useCreateWaterParameterThreshold();
  const deleteWaterParameterThreshold = useDeleteWaterParameterThreshold();

  const typeOptions = Object.values(TypeOfPond).map((t) => ({
    label: getTypeLabelVN(t as TypeOfPond),
    value: t,
  }));

  function getTypeLabelVN(type: TypeOfPond) {
    switch (type) {
      case TypeOfPond.PARING:
        return 'Ao phối giống';
      case TypeOfPond.EGG_BATCH:
        return 'Ao nuôi trứng';
      case TypeOfPond.FRY_FISH:
        return 'Ao cá bột';
      case TypeOfPond.CLASSIFICATION:
        return 'Ao tuyển chọn';
      case TypeOfPond.MARKET_POND:
        return 'Ao cá bán';
      case TypeOfPond.BROOD_STOCK:
        return 'Ao cá giống';
      default:
        return type;
    }
  }

  const resetForm = () => {
    setFormData({
      typeName: '',
      description: '',
      type: TypeOfPond.PARING,
      recommendedQuantity: 0,
    });
    setThresholds(getDefaultThresholds());
  };

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showAlert = (title: string, message: string) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const closeAlert = () => setAlertVisible(false);

  // Water parameter thresholds state (min/max for each parameter)
  const parameterKeys = [
    'phLevel',
    'temperatureCelsius',
    'oxygenLevel',
    'ammoniaLevel',
    'nitriteLevel',
    'nitrateLevel',
    'carbonHardness',
    'waterLevelMeters',
  ] as const;

  type ParamKey = (typeof parameterKeys)[number];

  const getDefaultThresholds = () => {
    const obj: Record<string, { min: number; max: number }> = {};
    parameterKeys.forEach((k) => {
      obj[k] = { min: 0, max: 0 };
    });
    return obj as Record<ParamKey, { min: number; max: number }>;
  };

  const [thresholds, setThresholds] = useState<
    Record<ParamKey, { min: number; max: number }>
  >(getDefaultThresholds());

  const paramLabels: Record<ParamKey, string> = {
    phLevel: 'pH',
    temperatureCelsius: 'Nhiệt độ (°C)',
    oxygenLevel: 'Độ oxy (mg/L)',
    ammoniaLevel: 'Amoni (NH3, mg/L)',
    nitriteLevel: 'Nitrit (NO2-, mg/L)',
    nitrateLevel: 'Nitrat (NO3-, mg/L)',
    carbonHardness: 'Độ cứng cacbonat (°dH)',
    waterLevelMeters: 'Mực nước (m)',
  };

  const paramUnits: Record<ParamKey, string> = {
    phLevel: '',
    temperatureCelsius: '°C',
    oxygenLevel: 'mg/L',
    ammoniaLevel: 'mg/L',
    nitriteLevel: 'mg/L',
    nitrateLevel: 'mg/L',
    carbonHardness: '°dH',
    waterLevelMeters: 'm',
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = () => {
    if (!formData.typeName?.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập tên loại hồ');
      return false;
    }
    if (!formData.description?.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập mô tả');
      return false;
    }
    if (!formData.recommendedQuantity || formData.recommendedQuantity <= 0) {
      showAlert('Lỗi', 'Vui lòng nhập số lượng khuyến nghị tối đa hợp lệ');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    let handledError = false;

    try {
      const resp = await createPondTypeMutation.mutateAsync(formData);
      const pondTypeId = resp?.id;
      if (pondTypeId) {
        const createdIds: number[] = [];
        try {
          for (const key of Object.keys(thresholds) as ParamKey[]) {
            const t = thresholds[key];
            const req: WaterParameterThresholdRequest = {
              parameterName: key,
              unit: paramUnits[key],
              minValue: t.min,
              maxValue: t.max,
              pondTypeId,
            };
            const res = await createWaterParameterThreshold.mutateAsync(req);
            if (res && typeof (res as WaterParameterThreshold).id === 'number')
              createdIds.push((res as WaterParameterThreshold).id);
          }
        } catch (err) {
          handledError = true;
          const msg =
            (err as any)?.message ??
            String(err) ??
            'Lỗi khi tạo ngưỡng thông số nước';
          showAlert('Lỗi', msg);
          try {
            await Promise.all(
              createdIds.map((id) =>
                deleteWaterParameterThreshold.mutateAsync(id)
              )
            );
          } catch (e) {
            console.error('Rollback failed deleting thresholds:', e);
          }
          try {
            await deletePondTypeMutation.mutateAsync(pondTypeId);
          } catch (e) {
            console.error('Rollback failed deleting pond type:', e);
          }
          throw err;
        }
      }
      handleClose();
    } catch (error) {
      console.error('Error creating pond type:', error);
      if (!handledError) {
        const msg =
          (error as any)?.message ??
          String(error) ??
          'Đã xảy ra lỗi khi tạo loại hồ';
        showAlert('Lỗi', msg);
      }
    } finally {
      setIsSubmitting(false);
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
          <TouchableOpacity onPress={handleClose} disabled={isSubmitting}>
            <Text
              className={`font-medium ${isSubmitting ? 'text-gray-400' : 'text-primary'}`}
            >
              Hủy
            </Text>
          </TouchableOpacity>
          <Text className="text-lg font-semibold">Tạo loại hồ mới</Text>
          <TouchableOpacity onPress={handleSubmit} disabled={isSubmitting}>
            <Text
              className={`font-medium ${isSubmitting ? 'text-gray-400' : 'text-primary'}`}
            >
              {isSubmitting ? 'Đang lưu...' : 'Lưu'}
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

          {/* Type */}
          <View className="mb-4">
            <ContextMenuField
              label="Loại ao"
              value={formData.type}
              placeholder="Chọn loại ao"
              options={typeOptions}
              onSelect={(value) =>
                setFormData((prev) => ({ ...prev, type: value as TypeOfPond }))
              }
            />
          </View>

          {/* Water parameter thresholds */}
          <Text className="mb-4 text-lg font-semibold">
            Ngưỡng thông số nước
          </Text>
          {Object.keys(thresholds).map((k) => {
            const key = k as keyof typeof thresholds as ParamKey;
            return (
              <View key={k} className="mb-4">
                <Text className="mb-2 font-medium text-gray-700">
                  {paramLabels[key]}
                </Text>
                <View className="flex-row">
                  <View className="mr-2 flex-1">
                    <Text className="mb-1 text-xs text-gray-500">Min</Text>
                    <TextInput
                      placeholder="Min"
                      value={String(thresholds[key].min ?? '')}
                      onChangeText={(text) =>
                        setThresholds((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], min: parseFloat(text) || 0 },
                        }))
                      }
                      className="rounded-2xl border border-gray-300 bg-white px-4 py-3"
                      keyboardType="numeric"
                      inputMode="numeric"
                    />
                  </View>
                  <View className="ml-2 flex-1">
                    <Text className="mb-1 text-xs text-gray-500">Max</Text>
                    <TextInput
                      placeholder="Max"
                      value={String(thresholds[key].max ?? '')}
                      onChangeText={(text) =>
                        setThresholds((prev) => ({
                          ...prev,
                          [key]: { ...prev[key], max: parseFloat(text) || 0 },
                        }))
                      }
                      className="rounded-2xl border border-gray-300 bg-white px-4 py-3"
                      keyboardType="numeric"
                      inputMode="numeric"
                    />
                  </View>
                </View>
              </View>
            );
          })}

          {/* Recommended Capacity */}
          <View className="mb-4">
            <Text className="mb-2 font-medium text-gray-700">
              Số lượng khuyến nghị tối đa{' '}
              <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              placeholder="VD: 50"
              value={formData.recommendedQuantity?.toString() || ''}
              onChangeText={(text) =>
                setFormData((prev) => ({
                  ...prev,
                  recommendedQuantity: parseFloat(text) || 0,
                }))
              }
              className="rounded-2xl border border-gray-300 bg-white px-4 py-3"
              keyboardType="numeric"
              inputMode="numeric"
            />
            <Text className="mt-1 text-sm text-gray-500">
              Số lượng khuyến nghị tối đa cho loại hồ này (số lượng cá)
            </Text>
          </View>

          <TouchableOpacity
            className={`mb-8 rounded-2xl py-4 ${isSubmitting ? 'bg-gray-400' : 'bg-primary'}`}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text className="text-center text-lg font-semibold text-white">
              {isSubmitting ? 'Đang tạo loại hồ...' : 'Tạo loại hồ'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onCancel={closeAlert}
          onConfirm={closeAlert}
          cancelText="Đóng"
          confirmText="OK"
          type="warning"
        />
      </SafeAreaView>
    </Modal>
  );
}
