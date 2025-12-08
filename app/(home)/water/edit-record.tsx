import { CustomAlert } from '@/components/CustomAlert';
import InputField from '@/components/InputField';
import {
  useGetWaterParameterRecordById,
  useUpdateWaterParameterRecord,
} from '@/hooks/useWaterParameterRecord';
import { WaterParameterRecordRequest } from '@/lib/api/services/fetchWaterParameterRecord';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Droplet,
  FileText,
  FlaskConical,
  Microscope,
  Ruler,
  Save,
  TestTube,
  Thermometer,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function EditWaterParameterRecordScreen() {
  const { id, redirect, redirectId } = useLocalSearchParams();
  const parsedId = Number(id ?? 0);
  const parsedRedirectId = Number(redirectId ?? 0);

  const {
    data: record,
    isLoading,
    isError,
    refetch,
  } = useGetWaterParameterRecordById(parsedId, !!parsedId);

  const updateMutation = useUpdateWaterParameterRecord();
  const insets = useSafeAreaInsets();

  const scrollRef = useRef<any>(null);

  useFocusEffect(
    React.useCallback(() => {
      try {
        scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      } catch {}
      return undefined;
    }, [])
  );

  // form states
  const [phLevel, setPhLevel] = useState('7');
  const [temperatureCelsius, setTemperatureCelsius] = useState('25');
  const [oxygenLevel, setOxygenLevel] = useState('0');
  const [ammoniaLevel, setAmmoniaLevel] = useState('0');
  const [nitriteLevel, setNitriteLevel] = useState('0');
  const [nitrateLevel, setNitrateLevel] = useState('0');
  const [carbonHardness, setCarbonHardness] = useState('0');
  const [waterLevelMeters, setWaterLevelMeters] = useState('0');
  const [notes, setNotes] = useState('');

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  // populate form when record loads
  useEffect(() => {
    if (record) {
      setPhLevel(String(record.phLevel ?? ''));
      setTemperatureCelsius(String(record.temperatureCelsius ?? ''));
      setOxygenLevel(String(record.oxygenLevel ?? ''));
      setAmmoniaLevel(String(record.ammoniaLevel ?? ''));
      setNitriteLevel(String(record.nitriteLevel ?? ''));
      setNitrateLevel(String(record.nitrateLevel ?? ''));
      setCarbonHardness(String(record.carbonHardness ?? ''));
      setWaterLevelMeters(String(record.waterLevelMeters ?? ''));
      setNotes(record.notes ?? '');
    }
  }, [record]);

  const submit = async () => {
    if (!parsedId) {
      setAlertTitle('Lỗi');
      setAlertMessage('Không có id bản ghi hợp lệ');
      setAlertVisible(true);
      return;
    }

    const payload: WaterParameterRecordRequest = {
      pondId: record?.pondId ?? 0,
      phLevel: parseFloat(phLevel) || 0,
      temperatureCelsius: parseFloat(temperatureCelsius) || 0,
      oxygenLevel: parseFloat(oxygenLevel) || 0,
      ammoniaLevel: parseFloat(ammoniaLevel) || 0,
      nitriteLevel: parseFloat(nitriteLevel) || 0,
      nitrateLevel: parseFloat(nitrateLevel) || 0,
      carbonHardness: parseFloat(carbonHardness) || 0,
      waterLevelMeters: parseFloat(waterLevelMeters) || 0,
      notes: notes || '',
    };

    try {
      await updateMutation.mutateAsync({ id: parsedId, data: payload });
      if (redirect === 'pondDetail' && parsedRedirectId) {
        router.push(`/water/${parsedRedirectId}`);
      } else if (redirect === 'pondList') {
        router.push('/water');
      } else if (record?.pondId) {
        router.push(`/water/${record.pondId}`);
      } else {
        router.push('/water');
      }
    } catch (err) {
      console.error('Update failed', err);
    }
  };

  const handleBack = () => {
    if (redirect === 'pondDetail' && parsedRedirectId) {
      router.push(`/water/${parsedRedirectId}`);
    } else if (redirect === 'pondList') {
      router.push('/water');
    } else if (record?.pondId) {
      router.push(`/water/${record.pondId}`);
    } else {
      router.back();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-3 text-sm text-gray-600">Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !record) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle size={32} color="#dc2626" />
          </View>
          <Text className="mb-2 text-lg font-semibold text-gray-900">
            Không thể tải bản ghi
          </Text>
          <Text className="mb-6 text-center text-sm text-gray-600">
            Vui lòng thử lại sau
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="rounded-2xl bg-blue-500 px-6 py-3"
          >
            <Text className="font-semibold text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="rounded-t-3xl bg-primary pb-6 pt-4">
        <View className="flex-row items-center px-4 pt-2">
          <TouchableOpacity
            onPress={handleBack}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/20"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
              Chỉnh sửa
            </Text>
            <Text className="text-xl font-bold text-white">
              Cập nhật thông số nước
            </Text>
          </View>
        </View>
      </View>

      <KeyboardAwareScrollView
        ref={scrollRef}
        className="flex-1 px-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={60}
        contentContainerStyle={{
          paddingBottom: insets.bottom,
          paddingTop: 16,
        }}
      >
        {/* Critical Parameters Section */}
        <View className="mb-4">
          <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
            Thông số quan trọng
          </Text>

          <View className="rounded-2xl border border-gray-200 bg-white p-4">
            <InputField
              icon={<FlaskConical size={18} color="#3b82f6" />}
              label="Độ pH"
              placeholder="VD: 7.0"
              value={phLevel}
              onChangeText={setPhLevel}
              keyboardType="numeric"
              iconBg="bg-blue-100"
            />

            <View style={{ height: 12 }} />

            <InputField
              icon={<Thermometer size={18} color="#ef4444" />}
              label="Nhiệt độ (°C)"
              placeholder="VD: 25°C"
              value={temperatureCelsius}
              onChangeText={setTemperatureCelsius}
              keyboardType="numeric"
              iconBg="bg-red-100"
            />
          </View>
        </View>

        {/* Water Quality Section */}
        <View className="mb-4">
          <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
            Chất lượng nước
          </Text>

          <View className="rounded-2xl border border-gray-200 bg-white p-4">
            <InputField
              icon={<Droplet size={18} color="#06b6d4" />}
              label="Oxy hòa tan (mg/L)"
              placeholder="VD: 8.0mg/L"
              value={oxygenLevel}
              onChangeText={setOxygenLevel}
              keyboardType="numeric"
              iconBg="bg-cyan-100"
            />

            <View style={{ height: 12 }} />

            <InputField
              icon={<AlertTriangle size={18} color="#eab308" />}
              label="Amoniac - NH₃ (mg/L)"
              placeholder="VD: 0.02mg/L"
              value={ammoniaLevel}
              onChangeText={setAmmoniaLevel}
              keyboardType="numeric"
              iconBg="bg-yellow-100"
            />

            <View style={{ height: 12 }} />

            <InputField
              icon={<Microscope size={18} color="#a855f7" />}
              label="Nitrit - NO₂ (mg/L)"
              placeholder="VD: 0.01mg/L"
              value={nitriteLevel}
              onChangeText={setNitriteLevel}
              keyboardType="numeric"
              iconBg="bg-purple-100"
            />

            <View style={{ height: 12 }} />

            <InputField
              icon={<TestTube size={18} color="#6366f1" />}
              label="Nitrate - NO₃ (mg/L)"
              placeholder="VD: 15mg/L"
              value={nitrateLevel}
              onChangeText={setNitrateLevel}
              keyboardType="numeric"
              iconBg="bg-indigo-100"
            />
          </View>
        </View>

        {/* Other Parameters Section */}
        <View className="mb-4">
          <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
            Thông số khác
          </Text>

          <View className="rounded-2xl border border-gray-200 bg-white p-4">
            <InputField
              icon={<Ruler size={18} color="#6b7280" />}
              label="Độ cứng - KH (°dH)"
              placeholder="VD: 120°dH"
              value={carbonHardness}
              onChangeText={setCarbonHardness}
              keyboardType="numeric"
              iconBg="bg-gray-100"
            />

            <View style={{ height: 12 }} />

            <InputField
              icon={<Ruler size={18} color="#3b82f6" />}
              label="Mực nước (mét)"
              placeholder="VD: 1.5m"
              value={waterLevelMeters}
              onChangeText={setWaterLevelMeters}
              keyboardType="numeric"
              iconBg="bg-blue-100"
            />
          </View>
        </View>

        {/* Notes Section */}
        <View className="mb-4">
          <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
            Ghi chú
          </Text>

          <View className="rounded-2xl border border-gray-200 bg-white p-4">
            <View className="flex-row items-start">
              <View className="mr-3 mt-4 h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                <FileText size={18} color="#f59e0b" />
              </View>
              <View className="flex-1">
                <Text className="mb-2 text-base font-medium text-gray-600">
                  Thêm ghi chú (tùy chọn)
                </Text>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  numberOfLines={4}
                  placeholder="Nhập ghi chú về tình trạng nước, cá, hoặc các quan sát khác..."
                  placeholderTextColor="#9ca3af"
                  className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-base text-gray-900"
                  style={{ textAlignVertical: 'top' }}
                />
              </View>
            </View>
          </View>
        </View>

        <View style={{ paddingTop: 8, backgroundColor: 'transparent' }}>
          <TouchableOpacity
            onPress={submit}
            disabled={updateMutation.status === 'pending'}
            className={`w-full flex-row items-center justify-center rounded-2xl px-4 py-4 ${
              updateMutation.status === 'pending' ? 'bg-gray-300' : 'bg-primary'
            }`}
          >
            {updateMutation.status === 'pending' ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text className="ml-2 font-semibold text-white">
                  Đang cập nhật...
                </Text>
              </>
            ) : (
              <>
                <Save size={20} color="white" />
                <Text className="ml-2 text-base font-semibold text-white">
                  Lưu thay đổi
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onCancel={() => setAlertVisible(false)}
        onConfirm={() => setAlertVisible(false)}
        cancelText="Đóng"
        confirmText="OK"
        type="warning"
      />
    </SafeAreaView>
  );
}
