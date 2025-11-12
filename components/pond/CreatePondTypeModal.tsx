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
import {
  AlertTriangle,
  FileText,
  FlaskConical,
  Gauge,
  Hash,
  Layers,
  Microscope,
  Plus,
  Ruler,
  TestTube,
  Thermometer,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
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
    temperatureCelsius: 'Nhiệt độ',
    oxygenLevel: 'Oxy hòa tan',
    ammoniaLevel: 'Amoniac (NH₃)',
    nitriteLevel: 'Nitrit (NO₂)',
    nitrateLevel: 'Nitrate (NO₃)',
    carbonHardness: 'Độ cứng (KH)',
    waterLevelMeters: 'Mực nước',
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

  const paramIcons: Record<ParamKey, React.ReactElement> = {
    phLevel: <FlaskConical size={16} color="#3b82f6" />,
    temperatureCelsius: <Thermometer size={16} color="#ef4444" />,
    oxygenLevel: <Gauge size={16} color="#06b6d4" />,
    ammoniaLevel: <AlertTriangle size={16} color="#eab308" />,
    nitriteLevel: <Microscope size={16} color="#a855f7" />,
    nitrateLevel: <TestTube size={16} color="#6366f1" />,
    carbonHardness: <Ruler size={16} color="#6b7280" />,
    waterLevelMeters: <Ruler size={16} color="#3b82f6" />,
  };

  const paramIconBgs: Record<ParamKey, string> = {
    phLevel: 'bg-blue-100',
    temperatureCelsius: 'bg-red-100',
    oxygenLevel: 'bg-cyan-100',
    ammoniaLevel: 'bg-yellow-100',
    nitriteLevel: 'bg-purple-100',
    nitrateLevel: 'bg-indigo-100',
    carbonHardness: 'bg-gray-100',
    waterLevelMeters: 'bg-blue-100',
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

  const resetForm = () => {
    setFormData({
      typeName: '',
      description: '',
      type: TypeOfPond.PARING,
      recommendedQuantity: 0,
    });
    setThresholds(getDefaultThresholds());
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

    for (const key of Object.keys(thresholds) as ParamKey[]) {
      const { min, max } = thresholds[key];
      if (min !== 0 || max !== 0) {
        if (!(min < max)) {
          showAlert(
            'Lỗi',
            `Ngưỡng không hợp lệ: giá trị nhỏ nhất của ${paramLabels[key]} phải nhỏ hơn giá trị lớn nhất`
          );
          return;
        }
      }
    }

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
        {/* Header */}
        <View className="relative rounded-t-3xl bg-primary pb-4">
          <View className="px-4 pt-4">
            <View className="items-center">
              <Text className="text-base font-medium uppercase tracking-wide text-white/80">
                Tạo mới
              </Text>
              <Text className="text-3xl font-bold text-white">Loại hồ</Text>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              disabled={isSubmitting}
              className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-white/20"
              accessibilityLabel="Đóng"
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 100,
          }}
          bottomOffset={20}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Info Section */}
          <View className="mb-4">
            <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
              Thông tin cơ bản
            </Text>

            <View className="rounded-2xl border border-gray-200 bg-white p-4">
              {/* Type Name */}
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                  <Layers size={18} color="#a855f7" />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-medium">
                    Tên loại hồ <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    placeholder="VD: Hồ nuôi cá Koi, Hồ cảnh quan..."
                    value={formData.typeName}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, typeName: text }))
                    }
                    placeholderTextColor="#9ca3af"
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-base font-medium text-gray-900"
                  />
                </View>
              </View>

              {/* Type */}
              <View className="mb-4 flex-row items-start">
                <View className="mr-3 mt-1 h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                  <Layers size={18} color="#6366f1" />
                </View>
                <View className="flex-1">
                  <ContextMenuField
                    label="Loại ao *"
                    value={formData.type}
                    placeholder="Chọn loại ao"
                    options={typeOptions}
                    onSelect={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: value as TypeOfPond,
                      }))
                    }
                  />
                </View>
              </View>

              {/* Description */}
              <View className="mb-4 flex-row items-start">
                <View className="mr-3 mt-1 h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                  <FileText size={18} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-medium">
                    Mô tả <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    placeholder="Mô tả chi tiết về loại hồ này..."
                    value={formData.description}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, description: text }))
                    }
                    placeholderTextColor="#9ca3af"
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-base text-gray-900"
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>
              </View>

              {/* Recommended Quantity */}
              <View className="flex-row items-center">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-green-100">
                  <Hash size={18} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-medium">
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
                    placeholderTextColor="#9ca3af"
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-base font-medium text-gray-900"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Water Parameters Section */}
          <View className="mb-4">
            <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
              Ngưỡng thông số nước
            </Text>

            <View className="rounded-2xl border border-gray-200 bg-white p-4">
              {Object.keys(thresholds).map((k, idx) => {
                const key = k as ParamKey;
                return (
                  <View key={k}>
                    <View className="flex-row items-start">
                      <View
                        className={`mr-3 mt-1 h-9 w-9 items-center justify-center rounded-full ${paramIconBgs[key]}`}
                      >
                        {paramIcons[key]}
                      </View>
                      <View className="flex-1">
                        <Text className="mb-2 text-base font-medium">
                          {paramLabels[key]}{' '}
                          {paramUnits[key] && (
                            <Text className="text-base text-gray-500">
                              ({paramUnits[key]})
                            </Text>
                          )}
                        </Text>
                        <View className="flex-row">
                          <View className="mr-2 flex-1">
                            <Text className="mb-1 text-sm">Min</Text>
                            <TextInput
                              placeholder="0"
                              value={String(thresholds[key].min ?? '')}
                              onChangeText={(text) =>
                                setThresholds(
                                  (
                                    prev: Record<
                                      ParamKey,
                                      { min: number; max: number }
                                    >
                                  ) => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[key],
                                      min: parseFloat(text) || 0,
                                    },
                                  })
                                )
                              }
                              placeholderTextColor="#9ca3af"
                              className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-base font-medium text-gray-900"
                              keyboardType="numeric"
                            />
                          </View>
                          <View className="ml-2 flex-1">
                            <Text className="mb-1 text-sm">Max</Text>
                            <TextInput
                              placeholder="0"
                              value={String(thresholds[key].max ?? '')}
                              onChangeText={(text) =>
                                setThresholds(
                                  (
                                    prev: Record<
                                      ParamKey,
                                      { min: number; max: number }
                                    >
                                  ) => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[key],
                                      max: parseFloat(text) || 0,
                                    },
                                  })
                                )
                              }
                              placeholderTextColor="#9ca3af"
                              className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-base font-medium text-gray-900"
                              keyboardType="numeric"
                            />
                          </View>
                        </View>
                      </View>
                    </View>
                    {idx < Object.keys(thresholds).length - 1 && (
                      <View style={{ height: 16 }} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </KeyboardAwareScrollView>

        {/* Fixed Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-4">
          <TouchableOpacity
            className={`flex-row items-center justify-center rounded-2xl px-4 py-4 ${
              isSubmitting ? 'bg-gray-300' : 'bg-primary'
            }`}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text className="ml-2 text-lg font-semibold text-white">
                  Đang tạo loại hồ...
                </Text>
              </>
            ) : (
              <>
                <Plus size={20} color="white" />
                <Text className="ml-2 text-lg font-semibold text-white">
                  Tạo loại hồ
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

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
