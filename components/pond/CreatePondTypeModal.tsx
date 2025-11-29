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
  WaterParameterType,
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
      case TypeOfPond.QUARANTINE:
        return 'Ao cách ly';
      default:
        return type;
    }
  }

  const parameterKeys = [
    WaterParameterType.PH_LEVEL,
    WaterParameterType.TEMPERATURE_CELSIUS,
    WaterParameterType.OXYGEN_LEVEL,
    WaterParameterType.AMMONIA_LEVEL,
    WaterParameterType.NITRITE_LEVEL,
    WaterParameterType.NITRATE_LEVEL,
    WaterParameterType.CARBON_HARDNESS,
    WaterParameterType.WATER_LEVEL_METERS,
  ] as const;

  type ParamKey = (typeof parameterKeys)[number];

  const getDefaultThresholds = () => {
    const obj: Record<string, { min: string; max: string }> = {};
    parameterKeys.forEach((k) => {
      obj[k] = { min: '', max: '' };
    });
    return obj as Record<ParamKey, { min: string; max: string }>;
  };

  const [thresholds, setThresholds] = useState<
    Record<ParamKey, { min: string; max: string }>
  >(getDefaultThresholds());

  const paramLabels: Record<ParamKey, string> = {
    [WaterParameterType.PH_LEVEL]: 'pH',
    [WaterParameterType.TEMPERATURE_CELSIUS]: 'Nhiệt độ',
    [WaterParameterType.OXYGEN_LEVEL]: 'Oxy hòa tan',
    [WaterParameterType.AMMONIA_LEVEL]: 'Amoniac (NH₃)',
    [WaterParameterType.NITRITE_LEVEL]: 'Nitrit (NO₂)',
    [WaterParameterType.NITRATE_LEVEL]: 'Nitrate (NO₃)',
    [WaterParameterType.CARBON_HARDNESS]: 'Độ cứng (KH)',
    [WaterParameterType.WATER_LEVEL_METERS]: 'Mực nước',
  };

  const paramUnits: Record<ParamKey, string> = {
    [WaterParameterType.PH_LEVEL]: '',
    [WaterParameterType.TEMPERATURE_CELSIUS]: '°C',
    [WaterParameterType.OXYGEN_LEVEL]: 'mg/L',
    [WaterParameterType.AMMONIA_LEVEL]: 'mg/L',
    [WaterParameterType.NITRITE_LEVEL]: 'mg/L',
    [WaterParameterType.NITRATE_LEVEL]: 'mg/L',
    [WaterParameterType.CARBON_HARDNESS]: '°dH',
    [WaterParameterType.WATER_LEVEL_METERS]: 'm',
  };

  const paramIcons: Record<ParamKey, React.ReactElement> = {
    [WaterParameterType.PH_LEVEL]: <FlaskConical size={16} color="#3b82f6" />,
    [WaterParameterType.TEMPERATURE_CELSIUS]: (
      <Thermometer size={16} color="#ef4444" />
    ),
    [WaterParameterType.OXYGEN_LEVEL]: <Gauge size={16} color="#06b6d4" />,
    [WaterParameterType.AMMONIA_LEVEL]: (
      <AlertTriangle size={16} color="#eab308" />
    ),
    [WaterParameterType.NITRITE_LEVEL]: (
      <Microscope size={16} color="#a855f7" />
    ),
    [WaterParameterType.NITRATE_LEVEL]: <TestTube size={16} color="#6366f1" />,
    [WaterParameterType.CARBON_HARDNESS]: <Ruler size={16} color="#6b7280" />,
    [WaterParameterType.WATER_LEVEL_METERS]: (
      <Ruler size={16} color="#3b82f6" />
    ),
  };

  const paramIconBgs: Record<ParamKey, string> = {
    [WaterParameterType.PH_LEVEL]: 'bg-blue-100',
    [WaterParameterType.TEMPERATURE_CELSIUS]: 'bg-red-100',
    [WaterParameterType.OXYGEN_LEVEL]: 'bg-cyan-100',
    [WaterParameterType.AMMONIA_LEVEL]: 'bg-yellow-100',
    [WaterParameterType.NITRITE_LEVEL]: 'bg-purple-100',
    [WaterParameterType.NITRATE_LEVEL]: 'bg-indigo-100',
    [WaterParameterType.CARBON_HARDNESS]: 'bg-gray-100',
    [WaterParameterType.WATER_LEVEL_METERS]: 'bg-blue-100',
  };

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sanitize decimal input string: allow digits and at most one decimal separator (dot or comma).
  const sanitizeDecimalString = (text: string) => {
    if (!text) return '';
    let s = text.replace(',', '.');
    s = s.replace(/[^0-9.]/g, '');
    const firstDot = s.indexOf('.');
    if (firstDot !== -1) {
      s = s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, '');
    }
    return s;
  };

  const parseDecimalValue = (text: string) => {
    const s = sanitizeDecimalString(text);
    if (!s || s === '.') return 0;
    return parseFloat(s) || 0;
  };

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
      showAlert('Lỗi', 'Vui lòng nhập số lượng khuyến nghị tối đa lớn hơn 0');
      return false;
    }
    // Require all parameter threshold pairs to be filled and valid
    for (const key of Object.keys(thresholds) as ParamKey[]) {
      const minStr = (thresholds[key].min ?? '').toString().trim();
      const maxStr = (thresholds[key].max ?? '').toString().trim();

      if (!minStr || !maxStr) {
        showAlert('Lỗi', `Vui lòng nhập Min và Max cho ${paramLabels[key]}`);
        return false;
      }

      const minVal = parseDecimalValue(minStr);
      const maxVal = parseDecimalValue(maxStr);
      if (!(minVal < maxVal)) {
        showAlert(
          'Lỗi',
          `Ngưỡng không hợp lệ: giá trị nhỏ nhất của ${paramLabels[key]} phải nhỏ hơn giá trị lớn nhất`
        );
        return false;
      }
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
            const minStr = (t.min ?? '').toString().trim();
            const maxStr = (t.max ?? '').toString().trim();

            if (!minStr && !maxStr) continue;

            const req: WaterParameterThresholdRequest = {
              parameterName: key,
              unit: paramUnits[key],
              minValue: parseDecimalValue(t.min),
              maxValue: parseDecimalValue(t.max),
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
                              placeholder="VD: 0"
                              value={String(thresholds[key].min ?? '')}
                              onChangeText={(text) =>
                                setThresholds(
                                  (
                                    prev: Record<
                                      ParamKey,
                                      { min: string; max: string }
                                    >
                                  ) => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[key],
                                      min: sanitizeDecimalString(text),
                                    },
                                  })
                                )
                              }
                              placeholderTextColor="#9ca3af"
                              className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-base font-medium text-gray-900"
                              keyboardType="decimal-pad"
                            />
                          </View>
                          <View className="ml-2 flex-1">
                            <Text className="mb-1 text-sm">Max</Text>
                            <TextInput
                              placeholder="VD: 0"
                              value={String(thresholds[key].max ?? '')}
                              onChangeText={(text) =>
                                setThresholds(
                                  (
                                    prev: Record<
                                      ParamKey,
                                      { min: string; max: string }
                                    >
                                  ) => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[key],
                                      max: sanitizeDecimalString(text),
                                    },
                                  })
                                )
                              }
                              placeholderTextColor="#9ca3af"
                              className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-base font-medium text-gray-900"
                              keyboardType="decimal-pad"
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
