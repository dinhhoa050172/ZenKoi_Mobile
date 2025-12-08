import { CustomAlert } from '@/components/CustomAlert';
import InputField from '@/components/InputField';
import { useGetPondById } from '@/hooks/usePond';
import { useCreateWaterParameterRecord } from '@/hooks/useWaterParameterRecord';
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
  Plus,
  Ruler,
  TestTube,
  Thermometer,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
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

export default function CreateWaterParameterRecordScreen() {
  const { pondId, redirect, redirectId } = useLocalSearchParams();
  const parsedPondId = Number(pondId ?? 0);
  const parsedRedirectId = Number(redirectId ?? 0);
  const insets = useSafeAreaInsets();

  const [phLevel, setPhLevel] = useState<string | null>(null);
  const [temperatureCelsius, setTemperatureCelsius] = useState<string | null>(
    null
  );
  const [oxygenLevel, setOxygenLevel] = useState<string | null>(null);
  const [ammoniaLevel, setAmmoniaLevel] = useState<string | null>(null);
  const [nitriteLevel, setNitriteLevel] = useState<string | null>(null);
  const [nitrateLevel, setNitrateLevel] = useState<string | null>(null);
  const [carbonHardness, setCarbonHardness] = useState<string | null>(null);
  const [waterLevelMeters, setWaterLevelMeters] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const pondQuery = useGetPondById(parsedPondId, !!parsedPondId);
  const latestRecord = pondQuery.data?.record ?? null;

  const createMutation = useCreateWaterParameterRecord();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  const submit = async () => {
    if (!parsedPondId) {
      setAlertTitle('Lỗi');
      setAlertMessage('Không tìm thấy hồ để ghi thông số nước');
      setAlertVisible(true);
      return;
    }

    // Validate required fields
    const missing: string[] = [];
    if (!phLevel || phLevel.trim() === '') missing.push('Độ pH');
    if (!temperatureCelsius || temperatureCelsius.trim() === '')
      missing.push('Nhiệt độ');
    if (!oxygenLevel || oxygenLevel.trim() === '') missing.push('Độ oxy');
    if (!ammoniaLevel || ammoniaLevel.trim() === '') missing.push('Amoniac');
    if (!nitriteLevel || nitriteLevel.trim() === '') missing.push('Nitrit');
    if (!nitrateLevel || nitrateLevel.trim() === '') missing.push('Nitrate');
    if (!carbonHardness || carbonHardness.trim() === '')
      missing.push('Độ cứng');
    if (!waterLevelMeters || waterLevelMeters.trim() === '')
      missing.push('Mực nước');

    if (missing.length > 0) {
      setAlertTitle('Thiếu thông tin');
      setAlertMessage(`Vui lòng nhập trường: ${missing.join(', ')}`);
      setAlertVisible(true);
      return;
    }

    const payload: WaterParameterRecordRequest = {
      pondId: parsedPondId,
      phLevel: parseFloat(phLevel ?? '0') || 0,
      temperatureCelsius: parseFloat(temperatureCelsius ?? '0') || 0,
      oxygenLevel: parseFloat(oxygenLevel ?? '0') || 0,
      ammoniaLevel: parseFloat(ammoniaLevel ?? '0') || 0,
      nitriteLevel: parseFloat(nitriteLevel ?? '0') || 0,
      nitrateLevel: parseFloat(nitrateLevel ?? '0') || 0,
      carbonHardness: parseFloat(carbonHardness ?? '0') || 0,
      waterLevelMeters: parseFloat(waterLevelMeters ?? '0') || 0,
      notes: notes || '',
    };

    try {
      await createMutation.mutateAsync(payload);
      if (redirect === 'pondDetail' && parsedRedirectId) {
        router.push(`/water/${parsedRedirectId}`);
      } else if (redirect === 'pondList') {
        router.push('/water');
      } else {
        router.push(`/water/${parsedPondId}`);
      }
    } catch (err) {
      console.error('Create record failed', err);
    }
  };

  const scrollRef = useRef<any>(null);

  // Reset form every time screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      setPhLevel(null);
      setTemperatureCelsius(null);
      setOxygenLevel(null);
      setAmmoniaLevel(null);
      setNitriteLevel(null);
      setNitrateLevel(null);
      setCarbonHardness(null);
      setWaterLevelMeters(null);
      setNotes('');
      // scroll to top when screen focused
      try {
        scrollRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      } catch {}
      return undefined;
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="rounded-t-3xl bg-primary pb-6 pt-4">
        <View className="flex-row items-center px-4 pt-2">
          <TouchableOpacity
            onPress={() => {
              if (redirect === 'pondDetail' && parsedRedirectId) {
                router.push(`/water/${parsedRedirectId}`);
              } else if (redirect === 'pondList') {
                router.push('/water');
              } else {
                router.push(`/water/${parsedPondId}`);
              }
            }}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/20"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
              Thêm mới bản ghi
            </Text>
            <Text className="text-xl font-bold text-white">
              Ghi thông số nước
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
        {/* Current/latest parameters for this pond */}
        <View className="mb-4">
          <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
            Thông số hiện tại của hồ
          </Text>

          <View className="rounded-2xl border border-gray-200 bg-white p-4">
            {pondQuery.isLoading ? (
              <Text className="text-center text-sm text-gray-500">
                Đang tải...
              </Text>
            ) : latestRecord ? (
              <View className="-mx-2 flex-row flex-wrap">
                <View className="mb-3 w-1/2 px-2">
                  <View className="relative rounded-2xl bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">Độ pH</Text>
                    <Text className="text-lg font-bold">
                      {latestRecord.phLevel}
                    </Text>
                  </View>
                </View>

                <View className="mb-3 w-1/2 px-2">
                  <View className="relative rounded-2xl bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">Nhiệt độ</Text>
                    <Text className="text-lg font-bold">
                      {latestRecord.temperatureCelsius} °C
                    </Text>
                  </View>
                </View>

                <View className="mb-3 w-1/2 px-2">
                  <View className="relative rounded-2xl bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">Oxy hòa tan</Text>
                    <Text className="text-lg font-bold">
                      {latestRecord.oxygenLevel} mg/L
                    </Text>
                  </View>
                </View>

                <View className="mb-3 w-1/2 px-2">
                  <View className="relative rounded-2xl bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">Amoniac - NH₃</Text>
                    <Text className="text-lg font-bold">
                      {latestRecord.ammoniaLevel} mg/L
                    </Text>
                  </View>
                </View>

                <View className="mb-3 w-1/2 px-2">
                  <View className="relative rounded-2xl bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">Nitrit - NO₂</Text>
                    <Text className="text-lg font-bold">
                      {latestRecord.nitriteLevel} mg/L
                    </Text>
                  </View>
                </View>

                <View className="mb-3 w-1/2 px-2">
                  <View className="relative rounded-2xl bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">Nitrate - NO₃</Text>
                    <Text className="text-lg font-bold">
                      {latestRecord.nitrateLevel} mg/L
                    </Text>
                  </View>
                </View>

                <View className="mb-3 w-1/2 px-2">
                  <View className="relative rounded-2xl bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">Độ cứng - KH</Text>
                    <Text className="text-lg font-bold">
                      {latestRecord.carbonHardness} °dH
                    </Text>
                  </View>
                </View>

                <View className="mb-3 w-1/2 px-2">
                  <View className="relative rounded-2xl bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">Mực nước (m)</Text>
                    <Text className="text-lg font-bold">
                      {latestRecord.waterLevelMeters} m
                    </Text>
                  </View>
                </View>

                {latestRecord.notes ? (
                  <View className="w-full px-2">
                    <View className="rounded-2xl bg-gray-50 p-3">
                      <Text className="text-sm text-gray-600">Ghi chú</Text>
                      <Text className="mt-1 text-base text-gray-700">
                        {latestRecord.notes}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            ) : (
              <Text className="text-center text-sm text-gray-500">
                Chưa có bản ghi trước đó
              </Text>
            )}
          </View>
        </View>
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
              value={phLevel ?? ''}
              onChangeText={setPhLevel}
              keyboardType="numeric"
              iconBg="bg-blue-100"
            />

            <View style={{ height: 12 }} />

            <InputField
              icon={<Thermometer size={18} color="#ef4444" />}
              label="Nhiệt độ (°C)"
              placeholder="VD: 25°C"
              value={temperatureCelsius ?? ''}
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
              value={oxygenLevel ?? ''}
              onChangeText={setOxygenLevel}
              keyboardType="numeric"
              iconBg="bg-cyan-100"
            />

            <View style={{ height: 12 }} />

            <InputField
              icon={<AlertTriangle size={18} color="#eab308" />}
              label="Amoniac - NH₃ (mg/L)"
              placeholder="VD: 0.02mg/L"
              value={ammoniaLevel ?? ''}
              onChangeText={setAmmoniaLevel}
              keyboardType="numeric"
              iconBg="bg-yellow-100"
            />

            <View style={{ height: 12 }} />

            <InputField
              icon={<Microscope size={18} color="#a855f7" />}
              label="Nitrit - NO₂ (mg/L)"
              placeholder="VD: 0.01mg/L"
              value={nitriteLevel ?? ''}
              onChangeText={setNitriteLevel}
              keyboardType="numeric"
              iconBg="bg-purple-100"
            />

            <View style={{ height: 12 }} />

            <InputField
              icon={<TestTube size={18} color="#6366f1" />}
              label="Nitrate - NO₃ (mg/L)"
              placeholder="VD: 15mg/L"
              value={nitrateLevel ?? ''}
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
              value={carbonHardness ?? ''}
              onChangeText={setCarbonHardness}
              keyboardType="numeric"
              iconBg="bg-gray-100"
            />

            <View style={{ height: 12 }} />

            <InputField
              icon={<Ruler size={18} color="#3b82f6" />}
              label="Mực nước (mét)"
              placeholder="VD: 1.5m"
              value={waterLevelMeters ?? ''}
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
            disabled={createMutation.status === 'pending'}
            className={`w-full flex-row items-center justify-center rounded-2xl px-4 py-4 ${
              createMutation.status === 'pending' ? 'bg-gray-300' : 'bg-primary'
            }`}
          >
            {createMutation.status === 'pending' ? (
              <>
                <ActivityIndicator color="#fff" size="small" />
                <Text className="ml-2 font-semibold text-white">
                  Đang tạo...
                </Text>
              </>
            ) : (
              <>
                <Plus size={20} color="white" />
                <Text className="ml-2 text-base font-semibold text-white">
                  Tạo bản ghi
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
        type="danger"
      />
    </SafeAreaView>
  );
}
