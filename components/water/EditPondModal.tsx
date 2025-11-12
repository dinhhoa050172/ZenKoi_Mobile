import ContextMenuField from '@/components/ContextMenuField';
import { CustomAlert } from '@/components/CustomAlert';
import InputField from '@/components/InputField';
import { useGetAreas } from '@/hooks/useArea';
import { useGetPondById, useUpdatePond } from '@/hooks/usePond';
import { useGetPondTypes } from '@/hooks/usePondType';
import { PondRequest, PondStatus } from '@/lib/api/services/fetchPond';
import {
  AlertTriangle,
  Droplet,
  FlaskConical,
  Gauge,
  Layers,
  MapPin,
  Maximize2,
  Microscope,
  Ruler,
  Save,
  TestTube,
  Thermometer,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import Loading from '../Loading';

interface EditPondModalProps {
  visible: boolean;
  pondId: number | null;
  onClose: () => void;
}

export default function EditPondModal({
  visible,
  pondId,
  onClose,
}: EditPondModalProps) {
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

  // Local string states for numeric inputs
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

  // CustomAlert state
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

  // API hooks
  const { data: pondData, isLoading: isPondLoading } = useGetPondById(
    pondId || 0,
    !!pondId && visible
  );

  const { data: pondTypesData } = useGetPondTypes(true, {
    pageIndex: 1,
    pageSize: 100,
  });

  const { data: areasData } = useGetAreas(true, {
    pageIndex: 1,
    pageSize: 100,
  });

  const updatePondMutation = useUpdatePond();

  const pondTypes = pondTypesData?.data || [];
  const areas = areasData?.data || [];
  const statusOptions = Object.values(PondStatus);
  const statusToLabel = (status: PondStatus) => {
    switch (status) {
      case PondStatus.ACTIVE:
        return 'Hoạt động';
      case PondStatus.MAINTENANCE:
        return 'Bảo trì';
      case PondStatus.EMPTY:
        return 'Trống';
      default:
        return String(status);
    }
  };

  // Load pond data when modal opens
  useEffect(() => {
    if (pondData && visible) {
      setFormData({
        pondName: pondData.pondName,
        location: pondData.location,
        pondStatus: pondData.pondStatus,
        currentCapacity:
          pondData.currentCapacity ?? pondData.capacityLiters ?? 0,
        depthMeters: pondData.depthMeters,
        lengthMeters: pondData.lengthMeters,
        widthMeters: pondData.widthMeters,
        areaId: pondData.areaId,
        pondTypeId: pondData.pondTypeId,
        record: pondData.record ?? {
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
      // initialize the string inputs to allow decimal typing, show placeholder when value is 0
      setLengthMetersStr(
        Number(pondData.lengthMeters) > 0 ? String(pondData.lengthMeters) : ''
      );
      setWidthMetersStr(
        Number(pondData.widthMeters) > 0 ? String(pondData.widthMeters) : ''
      );
      setDepthMetersStr(
        Number(pondData.depthMeters) > 0 ? String(pondData.depthMeters) : ''
      );
      // initialize water quality strings
      const r = pondData.record ?? ({} as any);
      setPhLevelStr((r.phLevel ?? 0) !== 0 ? String(r.phLevel) : '');
      setWaterLevelMetersStr(
        (r.waterLevelMeters ?? 0) !== 0 ? String(r.waterLevelMeters) : ''
      );
      setTemperatureCelsiusStr(
        (r.temperatureCelsius ?? 0) !== 0 ? String(r.temperatureCelsius) : ''
      );
      setOxygenLevelStr(
        (r.oxygenLevel ?? 0) !== 0 ? String(r.oxygenLevel) : ''
      );
      setAmmoniaLevelStr(
        (r.ammoniaLevel ?? 0) !== 0 ? String(r.ammoniaLevel) : ''
      );
      setNitriteLevelStr(
        (r.nitriteLevel ?? 0) !== 0 ? String(r.nitriteLevel) : ''
      );
      setNitrateLevelStr(
        (r.nitrateLevel ?? 0) !== 0 ? String(r.nitrateLevel) : ''
      );
      setCarbonHardnessStr(
        (r.carbonHardness ?? 0) !== 0 ? String(r.carbonHardness) : ''
      );
    }
  }, [pondData, visible]);

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
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // helper to compute parsed numeric values from string inputs (fallback to formData)
  const computeParsed = () => {
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
    return {
      parsedLength,
      parsedWidth,
      parsedDepth,
      parsedCurrentCapacity,
      parsedWaterLevel,
      maxCapacityLiters,
    };
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
    const {
      parsedLength: pl,
      parsedWidth: pw,
      parsedDepth: pd,
      parsedCurrentCapacity: pc,
      parsedWaterLevel: pWater,
    } = computeParsed();

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
    if (pWater >= pd) {
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

    // Validate capacity against dimensions
    const { parsedCurrentCapacity, maxCapacityLiters } = computeParsed();
    if ((parsedCurrentCapacity ?? 0) > maxCapacityLiters) {
      showAlert(
        'Lỗi',
        `Thể tích hồ hiện tại (${parsedCurrentCapacity}L) không thể lớn hơn thể tích lớn nhất của hồ (${maxCapacityLiters.toFixed(0)}L).`,
        'danger'
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !pondId) return;

    try {
      // compute final numeric values
      const depth =
        parseFloat(depthMetersStr || String(formData.depthMeters || 0)) || 0;
      const length =
        parseFloat(lengthMetersStr || String(formData.lengthMeters || 0)) || 0;
      const width =
        parseFloat(widthMetersStr || String(formData.widthMeters || 0)) || 0;
      const waterLevel = formData.record?.waterLevelMeters ?? 0;
      const computedCapacity = waterLevel * length * width * 1000;

      const payload: PondRequest = {
        ...formData,
        currentCapacity: computedCapacity,
        depthMeters: depth,
        lengthMeters: length,
        widthMeters: width,
        record: formData.record,
      } as PondRequest;

      console.log('payload', payload);

      await updatePondMutation.mutateAsync({ id: pondId, data: payload });
      handleClose();
    } catch (error) {
      console.error('Error updating pond:', error);
    }
  };

  if (isPondLoading) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-1 items-center justify-center">
            <Loading />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  // parsed values for rendering
  const { parsedCurrentCapacity, maxCapacityLiters } = computeParsed();

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
                Chỉnh sửa
              </Text>
              <Text className="text-2xl font-bold text-white">
                Chỉnh sửa hồ
              </Text>
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

              {/* Pond Status */}
              <View className="mb-4 flex-row items-start">
                <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-yellow-100">
                  <AlertTriangle size={18} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <ContextMenuField
                    label="Trạng thái hồ *"
                    value={formData.pondStatus?.toString() || ''}
                    placeholder="Chọn trạng thái"
                    options={statusOptions.map((s) => ({
                      label: statusToLabel(s),
                      value: s,
                    }))}
                    onSelect={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        pondStatus: value as PondStatus,
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
                      Chiếm tỷ lệ:{' '}
                      {(
                        (parsedCurrentCapacity / maxCapacityLiters) *
                        100
                      ).toFixed(1)}
                      %/100.0%
                    </Text>
                  )}
                </View>
              )}

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
            <View className="rounded-2xl border border-gray-200 bg-white p-4">
              <Text className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
                Chất lượng nước
              </Text>

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
            className={`flex-row items-center justify-center rounded-2xl px-4 py-4 ${updatePondMutation.isPending ? 'bg-gray-300' : 'bg-primary'}`}
            onPress={handleSubmit}
            disabled={updatePondMutation.isPending}
          >
            <Save size={20} color="white" />
            <Text className="ml-2 text-lg font-semibold text-white">
              {updatePondMutation.isPending
                ? 'Đang cập nhật...'
                : 'Cập nhật hồ'}
            </Text>
          </TouchableOpacity>
        </View>
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
