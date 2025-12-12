import ContextMenuField from '@/components/ContextMenuField';
import { CustomAlert } from '@/components/CustomAlert';
import InputField from '@/components/InputField';
import { useGetAreas } from '@/hooks/useArea';
import { useCreatePond } from '@/hooks/usePond';
import { useGetPondTypes } from '@/hooks/usePondType';
import { useGetWaterParameterThresholds } from '@/hooks/useWaterParameterThreshold';
import { PondRequest, PondStatus } from '@/lib/api/services/fetchPond';
import { WaterParameterType } from '@/lib/api/services/fetchWaterParameterThreshold';
import {
  AlertTriangle,
  Droplet,
  FlaskConical,
  Gauge,
  Layers,
  MapPin,
  Maximize2,
  Microscope,
  Plus,
  Ruler,
  TestTube,
  Thermometer,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
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
    record: {
      phLevel: 0,
      temperatureCelsius: 0,
      oxygenLevel: 0,
      ammoniaLevel: 0,
      nitriteLevel: 0,
      nitrateLevel: 0,
      carbonHardness: 0,
      waterLevelMeters: 0,
      notes: '',
    },
  });

  // Local string states for numeric inputs to allow typing decimals (dot/comma)
  const [lengthMetersStr, setLengthMetersStr] = useState<string>('');
  const [widthMetersStr, setWidthMetersStr] = useState<string>('');
  const [depthMetersStr, setDepthMetersStr] = useState<string>('');
  // Water quality string states to allow decimal typing
  const [phLevelStr, setPhLevelStr] = useState<string>('');
  const [waterLevelMetersStr, setWaterLevelMetersStr] = useState<string>('');
  const [temperatureCelsiusStr, setTemperatureCelsiusStr] =
    useState<string>('');
  const [oxygenLevelStr, setOxygenLevelStr] = useState<string>('');
  const [ammoniaLevelStr, setAmmoniaLevelStr] = useState<string>('');
  const [nitriteLevelStr, setNitriteLevelStr] = useState<string>('');
  const [nitrateLevelStr, setNitrateLevelStr] = useState<string>('');
  const [carbonHardnessStr, setCarbonHardnessStr] = useState<string>('');

  // API hooks
  const { data: pondTypesData } = useGetPondTypes(true, {
    pageIndex: 1,
    pageSize: 100,
  });

  const thresholdsQuery = useGetWaterParameterThresholds(
    {
      pondTypeId: formData.pondTypeId ?? undefined,
      pageIndex: 1,
      pageSize: 100,
    },
    !!formData.pondTypeId
  );

  const thresholdMap = React.useMemo(() => {
    const map: Record<string, { min: number; max: number }> = {};
    const items = thresholdsQuery.data?.data ?? [];
    items.forEach((it) => {
      map[it.parameterName] = { min: it.minValue ?? 0, max: it.maxValue ?? 0 };
    });
    return map;
  }, [thresholdsQuery.data]);

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
      record: {
        phLevel: 0,
        temperatureCelsius: 0,
        oxygenLevel: 0,
        ammoniaLevel: 0,
        nitriteLevel: 0,
        nitrateLevel: 0,
        carbonHardness: 0,
        waterLevelMeters: 0,
        notes: '',
      },
    });
    setLengthMetersStr('');
    setWidthMetersStr('');
    setDepthMetersStr('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'danger' | 'warning' | 'info'>(
    'danger'
  );

  const showAlert = (
    title: string,
    message: string,
    type: 'danger' | 'warning' | 'info' = 'danger'
  ) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType(type);
    setAlertVisible(true);
  };

  const validateForm = () => {
    if (!formData.pondName?.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập tên hồ', 'danger');
      return false;
    }
    if (!formData.pondTypeId) {
      showAlert('Lỗi', 'Vui lòng chọn loại hồ', 'danger');
      return false;
    }
    if (!formData.areaId) {
      showAlert('Lỗi', 'Vui lòng chọn khu vực', 'danger');
      return false;
    }
    if (!formData.location?.trim()) {
      showAlert('Lỗi', 'Vui lòng nhập vị trí', 'danger');
      return false;
    }
    // validate numeric fields using parsed string values
    const pc = parsedCurrentCapacity;
    const pd = parsedDepth;
    const pl = parsedLength;
    const pw = parsedWidth;

    if (!pl || pl <= 0) {
      showAlert('Lỗi', 'Vui lòng nhập chiều dài hợp lệ và lớn hơn 0', 'danger');
      return false;
    }
    if (!pw || pw <= 0) {
      showAlert(
        'Lỗi',
        'Vui lòng nhập chiều rộng hợp lệ và lớn hơn 0',
        'danger'
      );
      return false;
    }
    if (!pd || pd <= 0) {
      showAlert('Lỗi', 'Vui lòng nhập độ sâu hợp lệ và lớn hơn 0', 'danger');
      return false;
    }
    if (parsedWaterLevel >= pd) {
      showAlert('Lỗi', 'Mực nước phải nhỏ hơn độ sâu của hồ', 'danger');
      return false;
    }
    if (!pc || pc <= 0) {
      showAlert(
        'Lỗi',
        'Vui lòng nhập thể tích hồ hiện tại hợp lệ và lớn hơn 0',
        'danger'
      );
      return false;
    }

    if ((pc ?? 0) > maxCapacityLiters) {
      showAlert(
        'Lỗi',
        `Thể tích hồ hiện tại (${pc}L) không thể lớn hơn thể tích lớn nhất của hồ (${maxCapacityLiters.toFixed(0)}L).`,
        'danger'
      );
      return false;
    }

    return true;
  };

  // compute parsed numeric values from string inputs (fallback to formData)
  const parsedLength =
    parseFloat(lengthMetersStr || String(formData.lengthMeters || 0)) || 0;
  const parsedWidth =
    parseFloat(widthMetersStr || String(formData.widthMeters || 0)) || 0;
  const parsedDepth =
    parseFloat(depthMetersStr || String(formData.depthMeters || 0)) || 0;
  const parsedWaterLevel = formData.record?.waterLevelMeters ?? 0;

  const parsedCurrentCapacity =
    parsedWaterLevel * parsedLength * parsedWidth * 1000;

  const maxCapacityLiters = parsedDepth * parsedLength * parsedWidth * 1000;

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      const payload: PondRequest = {
        ...formData,
        currentCapacity: parsedCurrentCapacity,
        depthMeters: parsedDepth,
        lengthMeters: parsedLength,
        widthMeters: parsedWidth,
        record: formData.record,
      };
      console.log('payload', payload);

      await createPondMutation.mutateAsync(payload);
      handleClose();
    } catch (error) {
      console.error('Error creating pond:', error);
      showAlert('Lỗi', 'Không thể tạo hồ. Vui lòng thử lại.', 'danger');
    }
  };

  useEffect(() => {
    if (visible) {
      setLengthMetersStr(
        Number(formData.lengthMeters) > 0 ? String(formData.lengthMeters) : ''
      );
      setWidthMetersStr(
        Number(formData.widthMeters) > 0 ? String(formData.widthMeters) : ''
      );
      setDepthMetersStr(
        Number(formData.depthMeters) > 0 ? String(formData.depthMeters) : ''
      );
      // initialize water quality string states only when opening the modal
      setPhLevelStr(
        (formData.record?.phLevel ?? 0) !== 0
          ? String(formData.record?.phLevel)
          : ''
      );
      setWaterLevelMetersStr(
        (formData.record?.waterLevelMeters ?? 0) !== 0
          ? String(formData.record?.waterLevelMeters)
          : ''
      );
      setTemperatureCelsiusStr(
        (formData.record?.temperatureCelsius ?? 0) !== 0
          ? String(formData.record?.temperatureCelsius)
          : ''
      );
      setOxygenLevelStr(
        (formData.record?.oxygenLevel ?? 0) !== 0
          ? String(formData.record?.oxygenLevel)
          : ''
      );
      setAmmoniaLevelStr(
        (formData.record?.ammoniaLevel ?? 0) !== 0
          ? String(formData.record?.ammoniaLevel)
          : ''
      );
      setNitriteLevelStr(
        (formData.record?.nitriteLevel ?? 0) !== 0
          ? String(formData.record?.nitriteLevel)
          : ''
      );
      setNitrateLevelStr(
        (formData.record?.nitrateLevel ?? 0) !== 0
          ? String(formData.record?.nitrateLevel)
          : ''
      );
      setCarbonHardnessStr(
        (formData.record?.carbonHardness ?? 0) !== 0
          ? String(formData.record?.carbonHardness)
          : ''
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="relative rounded-t-3xl bg-primary pb-6">
          <View className="px-4 pt-4">
            <View className="items-center">
              <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
                Tạo mới
              </Text>
              <Text className="text-2xl font-bold text-white">Thêm hồ</Text>
            </View>

            <TouchableOpacity
              onPress={handleClose}
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
            <Text className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Thông tin cơ bản
            </Text>

            <View className="rounded-2xl border border-gray-200 bg-white p-4">
              {/* Pond Name */}
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 mt-1 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <Droplet size={18} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-medium text-gray-900">
                    Tên hồ <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    placeholder="VD: Hồ số 1, Hồ chính..."
                    value={formData.pondName}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, pondName: text }))
                    }
                    placeholderTextColor="#9ca3af"
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-base font-medium text-gray-900"
                  />
                </View>
              </View>

              {/* Pond Type */}
              <View className="mb-4 flex-row items-start">
                <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                  <Layers size={18} color="#a855f7" />
                </View>
                <View className="flex-1">
                  <ContextMenuField
                    label="Loại hồ *"
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
              </View>

              {/* Area */}
              <View className="mb-4 flex-row items-start">
                <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-green-100">
                  <MapPin size={18} color="#22c55e" />
                </View>
                <View className="flex-1">
                  <ContextMenuField
                    label="Khu vực *"
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
              </View>

              {/* Location */}
              <View className="flex-row items-center">
                <View className="mr-3 mt-1 h-9 w-9 items-center justify-center rounded-full bg-orange-100">
                  <MapPin size={18} color="#f97316" />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-medium text-gray-900">
                    Vị trí <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    placeholder="VD: Góc phía Đông, Gần cây to..."
                    value={formData.location}
                    onChangeText={(text) =>
                      setFormData((prev) => ({ ...prev, location: text }))
                    }
                    placeholderTextColor="#9ca3af"
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-base font-medium text-gray-900"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Dimensions Section */}
          <View className="mb-4">
            <Text className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Kích thước hồ
            </Text>

            <View className="rounded-2xl border border-gray-200 bg-white p-4">
              {/* Length & Width */}
              <View className="mb-3 flex-row">
                <View className="mr-2 flex-1">
                  <InputField
                    icon={<Ruler size={18} color="#3b82f6" />}
                    label="Chiều dài (m) *"
                    placeholder="VD: 10m"
                    value={lengthMetersStr}
                    onChangeText={(text) => setLengthMetersStr(text)}
                    keyboardType="numeric"
                    iconBg="bg-blue-100"
                  />
                </View>
                <View className="ml-2 flex-1">
                  <InputField
                    icon={<Maximize2 size={18} color="#06b6d4" />}
                    label="Chiều rộng (m) *"
                    placeholder="VD: 5m"
                    value={widthMetersStr}
                    onChangeText={(text) => setWidthMetersStr(text)}
                    keyboardType="numeric"
                    iconBg="bg-cyan-100"
                  />
                </View>
              </View>

              <View style={{ height: 12 }} />

              {/* Depth & Capacity */}
              <View className="mb-3">
                <InputField
                  icon={<AlertTriangle size={18} color="#8b5cf6" />}
                  label="Độ sâu (m) *"
                  placeholder="VD: 1.5m"
                  value={depthMetersStr}
                  onChangeText={(text) => setDepthMetersStr(text)}
                  keyboardType="numeric"
                  iconBg="bg-violet-100"
                />
              </View>

              {/* Capacity Info */}
              {maxCapacityLiters > 0 && (
                <View className="mt-2 rounded-2xl border border-blue-100 bg-blue-50 p-3">
                  <View className="flex-row items-center">
                    <Droplet size={16} color="#3b82f6" />
                    <Text className="ml-2 text-sm font-medium text-blue-700">
                      Thể tích tối đa: {maxCapacityLiters.toFixed(0)} lít
                    </Text>
                  </View>
                  {parsedCurrentCapacity > 0 && (
                    <Text className="mt-1 text-sm text-blue-600">
                      Tỷ lệ:{' '}
                      {(
                        (parsedCurrentCapacity / maxCapacityLiters) *
                        100
                      ).toFixed(1)}
                      %
                    </Text>
                  )}
                </View>
              )}
              {/* Warning if capacity exceeds */}
              {parsedCurrentCapacity > maxCapacityLiters &&
                maxCapacityLiters > 0 && (
                  <View className="mt-2 rounded-2xl border border-red-200 bg-red-50 p-3">
                    <View className="flex-row items-start">
                      <AlertTriangle size={16} color="#dc2626" />
                      <Text className="ml-2 flex-1 text-sm font-medium text-red-700">
                        Dung tích vượt quá thể tích tối đa!
                      </Text>
                    </View>
                  </View>
                )}
            </View>
          </View>

          {/* Water Quality / Record Section */}
          <View className="mb-4">
            <Text className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Chất lượng nước
            </Text>

            <View className="rounded-2xl border border-gray-200 bg-white p-4">
              <View className="mb-3 flex-row">
                <View className="mr-2 flex-1">
                  <InputField
                    icon={<FlaskConical size={18} color="#3b82f6" />}
                    label="pH"
                    placeholder="VD: 7.2"
                    keyboardType="numeric"
                    value={phLevelStr}
                    onChangeText={(t) => {
                      setPhLevelStr(t);
                      setFormData((prev) => ({
                        ...prev,
                        record: {
                          ...(prev.record ?? {}),
                          phLevel:
                            t.trim() === ''
                              ? 0
                              : parseFloat(t.replace(',', '.')),
                        },
                      }));
                    }}
                    iconBg="bg-blue-100"
                    editable={!!formData.pondTypeId}
                    helper={
                      formData.pondTypeId
                        ? (() => {
                            const v = thresholdMap[WaterParameterType.PH_LEVEL];
                            return v ? `Ngưỡng: ${v.min} - ${v.max}` : '';
                          })()
                        : 'Vui lòng chọn loại hồ trước'
                    }
                  />
                </View>
                <View className="ml-2 flex-1">
                  <InputField
                    icon={<Droplet size={18} color="#06b6d4" />}
                    label="Mực nước (m)"
                    placeholder="VD: 0.8m"
                    keyboardType="numeric"
                    value={waterLevelMetersStr}
                    onChangeText={(t) => {
                      setWaterLevelMetersStr(t);
                      setFormData((prev) => ({
                        ...prev,
                        record: {
                          ...(prev.record ?? {}),
                          waterLevelMeters:
                            t.trim() === ''
                              ? 0
                              : parseFloat(t.replace(',', '.')),
                        },
                      }));
                    }}
                    iconBg="bg-sky-100"
                    editable={!!formData.pondTypeId}
                    helper={
                      formData.pondTypeId
                        ? (() => {
                            const v =
                              thresholdMap[
                                WaterParameterType.WATER_LEVEL_METERS
                              ];
                            return v ? `Ngưỡng: ${v.min} - ${v.max}` : '';
                          })()
                        : 'Vui lòng chọn loại hồ trước'
                    }
                  />
                </View>
              </View>

              <View className="mb-3 flex-row">
                <View className="mr-2 flex-1">
                  <InputField
                    icon={<Thermometer size={18} color="#f97316" />}
                    label="Nhiệt độ (°C)"
                    placeholder="VD: 25°C"
                    keyboardType="numeric"
                    value={temperatureCelsiusStr}
                    onChangeText={(t) => {
                      setTemperatureCelsiusStr(t);
                      setFormData((prev) => ({
                        ...prev,
                        record: {
                          ...(prev.record ?? {}),
                          temperatureCelsius:
                            t.trim() === ''
                              ? 0
                              : parseFloat(t.replace(',', '.')),
                        },
                      }));
                    }}
                    iconBg="bg-rose-100"
                    editable={!!formData.pondTypeId}
                    helper={
                      formData.pondTypeId
                        ? (() => {
                            const v =
                              thresholdMap[
                                WaterParameterType.TEMPERATURE_CELSIUS
                              ];
                            return v ? `Ngưỡng: ${v.min} - ${v.max}` : '';
                          })()
                        : 'Vui lòng chọn loại hồ trước'
                    }
                  />
                </View>
                <View className="ml-2 flex-1">
                  <InputField
                    icon={<Gauge size={18} color="#10b981" />}
                    label="Oxy (mg/L)"
                    placeholder="VD: 6.5mg/L"
                    keyboardType="numeric"
                    value={oxygenLevelStr}
                    onChangeText={(t) => {
                      setOxygenLevelStr(t);
                      setFormData((prev) => ({
                        ...prev,
                        record: {
                          ...(prev.record ?? {}),
                          oxygenLevel:
                            t.trim() === ''
                              ? 0
                              : parseFloat(t.replace(',', '.')),
                        },
                      }));
                    }}
                    iconBg="bg-emerald-100"
                    editable={!!formData.pondTypeId}
                    helper={
                      formData.pondTypeId
                        ? (() => {
                            const v =
                              thresholdMap[WaterParameterType.OXYGEN_LEVEL];
                            return v ? `Ngưỡng: ${v.min} - ${v.max}` : '';
                          })()
                        : 'Vui lòng chọn loại hồ trước'
                    }
                  />
                </View>
              </View>

              <View className="mb-3 flex-row">
                <View className="mr-2 flex-1">
                  <InputField
                    icon={<AlertTriangle size={18} color="#8b5cf6" />}
                    label="Ammonia (mg/L)"
                    placeholder="VD: 0.02mg/L"
                    keyboardType="numeric"
                    value={ammoniaLevelStr}
                    onChangeText={(t) => {
                      setAmmoniaLevelStr(t);
                      setFormData((prev) => ({
                        ...prev,
                        record: {
                          ...(prev.record ?? {}),
                          ammoniaLevel:
                            t.trim() === ''
                              ? 0
                              : parseFloat(t.replace(',', '.')),
                        },
                      }));
                    }}
                    iconBg="bg-yellow-100"
                    editable={!!formData.pondTypeId}
                    helper={
                      formData.pondTypeId
                        ? (() => {
                            const v =
                              thresholdMap[WaterParameterType.AMMONIA_LEVEL];
                            return v ? `Ngưỡng: ${v.min} - ${v.max}` : '';
                          })()
                        : 'Vui lòng chọn loại hồ trước'
                    }
                  />
                </View>
                <View className="ml-2 flex-1">
                  <InputField
                    icon={<Microscope size={18} color="#8b5cf6" />}
                    label="Nitrite (mg/L)"
                    placeholder="VD: 0.01mg/L"
                    keyboardType="numeric"
                    value={nitriteLevelStr}
                    onChangeText={(t) => {
                      setNitriteLevelStr(t);
                      setFormData((prev) => ({
                        ...prev,
                        record: {
                          ...(prev.record ?? {}),
                          nitriteLevel:
                            t.trim() === ''
                              ? 0
                              : parseFloat(t.replace(',', '.')),
                        },
                      }));
                    }}
                    iconBg="bg-violet-100"
                    editable={!!formData.pondTypeId}
                    helper={
                      formData.pondTypeId
                        ? (() => {
                            const v =
                              thresholdMap[WaterParameterType.NITRITE_LEVEL];
                            return v ? `Ngưỡng: ${v.min} - ${v.max}` : '';
                          })()
                        : 'Vui lòng chọn loại hồ trước'
                    }
                  />
                </View>
              </View>

              <View className="mb-3 flex-row">
                <View className="mr-2 flex-1">
                  <InputField
                    icon={<TestTube size={18} color="#06b6d4" />}
                    label="Nitrate (mg/L)"
                    placeholder="VD: 10mg/L"
                    keyboardType="numeric"
                    value={nitrateLevelStr}
                    onChangeText={(t) => {
                      setNitrateLevelStr(t);
                      setFormData((prev) => ({
                        ...prev,
                        record: {
                          ...(prev.record ?? {}),
                          nitrateLevel:
                            t.trim() === ''
                              ? 0
                              : parseFloat(t.replace(',', '.')),
                        },
                      }));
                    }}
                    iconBg="bg-cyan-100"
                    editable={!!formData.pondTypeId}
                    helper={
                      formData.pondTypeId
                        ? (() => {
                            const v =
                              thresholdMap[WaterParameterType.NITRATE_LEVEL];
                            return v ? `Ngưỡng: ${v.min} - ${v.max}` : '';
                          })()
                        : 'Vui lòng chọn loại hồ trước'
                    }
                  />
                </View>
                <View className="ml-2 flex-1">
                  <InputField
                    icon={<Ruler size={18} color="#8b5cf6" />}
                    label="Độ cứng (°dH)"
                    placeholder="VD: 8°dH"
                    keyboardType="numeric"
                    value={carbonHardnessStr}
                    onChangeText={(t) => {
                      setCarbonHardnessStr(t);
                      setFormData((prev) => ({
                        ...prev,
                        record: {
                          ...(prev.record ?? {}),
                          carbonHardness:
                            t.trim() === ''
                              ? 0
                              : parseFloat(t.replace(',', '.')),
                        },
                      }));
                    }}
                    iconBg="bg-amber-100"
                    editable={!!formData.pondTypeId}
                    helper={
                      formData.pondTypeId
                        ? (() => {
                            const v =
                              thresholdMap[WaterParameterType.CARBON_HARDNESS];
                            return v ? `Ngưỡng: ${v.min} - ${v.max}` : '';
                          })()
                        : 'Vui lòng chọn loại hồ trước'
                    }
                  />
                </View>
              </View>

              {/* Merged into the row with pH above */}

              <View>
                <Text className="mb-2 text-base font-medium text-gray-900">
                  Ghi chú
                </Text>
                <TextInput
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  style={{ minHeight: 64 }}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                  placeholder="Ghi chú về chất lượng nước..."
                  value={formData.record?.notes}
                  onChangeText={(t) =>
                    setFormData((prev) => ({
                      ...prev,
                      record: {
                        ...(prev.record ?? {}),
                        notes: t,
                      },
                    }))
                  }
                />
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>

        {/* Fixed Bottom Button */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-4">
          <TouchableOpacity
            className={`flex-row items-center justify-center rounded-2xl px-4 py-4 ${
              createPondMutation.isPending ? 'bg-gray-300' : 'bg-primary'
            }`}
            onPress={handleSubmit}
            disabled={createPondMutation.isPending}
          >
            {createPondMutation.isPending ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text className="ml-2 text-lg font-semibold text-white">
                  Đang tạo hồ...
                </Text>
              </>
            ) : (
              <>
                <Plus size={20} color="white" />
                <Text className="ml-2 text-lg font-semibold text-white">
                  Tạo hồ
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Custom Alert Modal */}
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          type={alertType}
          onCancel={() => setAlertVisible(false)}
          onConfirm={() => setAlertVisible(false)}
        />
      </SafeAreaView>
    </Modal>
  );
}
