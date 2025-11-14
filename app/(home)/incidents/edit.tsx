import Loading from '@/components/Loading';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetIncidentById, useUpdateIncident } from '@/hooks/useIncident';
import { useGetIncidentTypes } from '@/hooks/useIncidentType';
import { useGetKoiFish } from '@/hooks/useKoiFish';
import { useGetPonds } from '@/hooks/usePond';
import {
  IncidentSeverity,
  KoiAffectedStatus,
  KoiIncident,
  PondIncident,
  RequestIncident,
} from '@/lib/api/services/fetchIncident';
import { Gender, KoiFish } from '@/lib/api/services/fetchKoiFish';
import { Pond } from '@/lib/api/services/fetchPond';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, Check, ChevronLeft, Search, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Extended types
type SelectedPond = Pond & {
  environmentalChanges?: string;
  requiresWaterChange?: boolean;
  fishDiedCount?: number;
  correctiveActions?: string;
  notes?: string;
};

type SelectedKoi = KoiFish & {
  affectedStatus?: KoiAffectedStatus;
  specificSymptoms?: string;
  requiresTreatment?: boolean;
  isIsolated?: boolean;
  treatmentNotes?: string;
  affectedFrom?: string;
};

export default function EditIncidentScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [fadeAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // API Hooks
  const incidentId = parseInt(id, 10);
  const { data: incident, isLoading: incidentLoading } =
    useGetIncidentById(incidentId);
  const updateIncidentMutation = useUpdateIncident();
  const { data: incidentTypes, isLoading: incidentTypesLoading } =
    useGetIncidentTypes();
  const { data: ponds, isLoading: pondsLoading } = useGetPonds();
  const { data: koiFishes, isLoading: koisLoading } = useGetKoiFish();

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSection, setActiveSection] = useState<'basic' | 'assets'>(
    'basic'
  );
  const [formData, setFormData] = useState({
    incidentTypeId: undefined as number | undefined,
    incidentTitle: '',
    description: '',
    severity: undefined as IncidentSeverity | undefined,
    occurredAt: undefined as string | undefined,
  });

  // Selected assets
  const [selectedPonds, setSelectedPonds] = useState<SelectedPond[]>([]);
  const [selectedKois, setSelectedKois] = useState<SelectedKoi[]>([]);

  // Modal States
  const [showIncidentTypeModal, setShowIncidentTypeModal] = useState(false);
  const [showSeverityModal, setShowSeverityModal] = useState(false);
  const [showPondModal, setShowPondModal] = useState(false);
  const [showKoiModal, setShowKoiModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Search states
  const [pondSearchQuery, setPondSearchQuery] = useState('');
  const [koiSearchQuery, setKoiSearchQuery] = useState('');

  // Debounced search queries
  const debouncedPondSearch = useDebounce(pondSearchQuery, 300);
  const debouncedKoiSearch = useDebounce(koiSearchQuery, 300);

  // Pre-populate form with incident data
  useEffect(() => {
    if (incident) {
      setFormData({
        incidentTypeId: incident.incidentTypeId,
        incidentTitle: incident.incidentTitle,
        description: incident.description,
        severity: incident.severity,
        occurredAt: incident.occurredAt,
      });

      // Pre-populate selected ponds
      if (incident.pondIncidents && ponds?.data) {
        const selectedPondsList: SelectedPond[] = incident.pondIncidents
          .map((pondIncident) => {
            const pond = ponds.data.find((p) => p.id === pondIncident.pondId);
            return {
              ...pond,
              environmentalChanges: pondIncident.environmentalChanges,
              requiresWaterChange: pondIncident.requiresWaterChange,
              fishDiedCount: pondIncident.fishDiedCount,
              correctiveActions: pondIncident.correctiveActions,
              notes: pondIncident.notes,
            } as SelectedPond;
          })
          .filter(Boolean);
        setSelectedPonds(selectedPondsList);
      }

      // Pre-populate selected kois
      if (incident.koiIncidents && koiFishes?.data) {
        const selectedKoisList: SelectedKoi[] = incident.koiIncidents
          .map((koiIncident) => {
            const koi = koiFishes.data.find(
              (k: any) => k.id === koiIncident.koiFishId
            );
            return {
              ...koi,
              affectedStatus: koiIncident.affectedStatus,
              specificSymptoms: koiIncident.specificSymptoms,
              requiresTreatment: koiIncident.requiresTreatment,
              isIsolated: koiIncident.isIsolated,
              treatmentNotes: koiIncident.treatmentNotes,
              affectedFrom: koiIncident.affectedFrom,
            } as SelectedKoi;
          })
          .filter(Boolean);
        setSelectedKois(selectedKoisList);
      }
    }
  }, [incident, ponds?.data, koiFishes?.data]);

  // Form validation
  const isFormValid = () => {
    const basicFormValid =
      formData.incidentTypeId &&
      formData.incidentTitle.trim() &&
      formData.description.trim() &&
      formData.severity &&
      formData.occurredAt;

    const pondsValid = selectedPonds.every((pond) => {
      return (
        pond.environmentalChanges?.trim() ||
        pond.correctiveActions?.trim() ||
        pond.notes?.trim()
      );
    });

    const koisValid = selectedKois.every((koi) => {
      return (
        koi.specificSymptoms?.trim() ||
        koi.treatmentNotes?.trim() ||
        koi.affectedStatus
      );
    });

    return basicFormValid && pondsValid && koisValid;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isFormValid()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin cơ bản của sự cố.');
      return;
    }

    setIsSubmitting(true);

    try {
      const affectedPonds: PondIncident[] = selectedPonds.map((pond) => ({
        pondId: pond.id,
        pondName: pond.pondName,
        environmentalChanges: pond.environmentalChanges || '',
        requiresWaterChange: pond.requiresWaterChange || false,
        fishDiedCount: pond.fishDiedCount || 0,
        correctiveActions: pond.correctiveActions || '',
        notes: pond.notes || '',
      }));

      const affectedKoiFish: KoiIncident[] = selectedKois.map((koi) => ({
        koiFishId: koi.id,
        koiFishRFID: koi.rfid,
        affectedStatus: koi.affectedStatus || KoiAffectedStatus.HEALTHY,
        specificSymptoms: koi.specificSymptoms || '',
        requiresTreatment: koi.requiresTreatment || false,
        isIsolated: koi.isIsolated || false,
        treatmentNotes: koi.treatmentNotes || '',
        affectedFrom: koi.affectedFrom || new Date().toISOString(),
      }));

      const incidentPayload: RequestIncident = {
        incidentTypeId: formData.incidentTypeId!,
        incidentTitle: formData.incidentTitle!,
        description: formData.description!,
        severity: formData.severity!,
        occurredAt: formData.occurredAt!,
        affectedPonds: affectedPonds.length > 0 ? affectedPonds : undefined,
        affectedKoiFish:
          affectedKoiFish.length > 0 ? affectedKoiFish : undefined,
      };

      await updateIncidentMutation.mutateAsync({
        id: incidentId,
        data: incidentPayload,
      });

      Alert.alert('Thành công', 'Đã cập nhật sự cố thành công!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('Error updating incident:', error);
      Alert.alert(
        'Lỗi',
        error?.message || 'Không thể cập nhật sự cố. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle selections
  const togglePondSelection = (pond: Pond) => {
    const isSelected = selectedPonds.some((sp) => sp.id === pond.id);
    if (isSelected) {
      setSelectedPonds(selectedPonds.filter((sp) => sp.id !== pond.id));
    } else {
      const newPond: SelectedPond = {
        ...pond,
        environmentalChanges: '',
        requiresWaterChange: false,
        fishDiedCount: 0,
        correctiveActions: '',
        notes: '',
      };
      setSelectedPonds([...selectedPonds, newPond]);
    }
  };

  const toggleKoiSelection = (koi: KoiFish) => {
    const isSelected = selectedKois.some((sk) => sk.id === koi.id);
    if (isSelected) {
      setSelectedKois(selectedKois.filter((sk) => sk.id !== koi.id));
    } else {
      const newKoi: SelectedKoi = {
        ...koi,
        affectedStatus: KoiAffectedStatus.HEALTHY,
        specificSymptoms: '',
        requiresTreatment: false,
        isIsolated: false,
        treatmentNotes: '',
        affectedFrom: new Date().toISOString(),
      };
      setSelectedKois([...selectedKois, newKoi]);
    }
  };

  // Helper functions
  const updatePondField = (pondId: number, field: string, value: any) => {
    const updatedPonds = selectedPonds.map((p) =>
      p.id === pondId ? { ...p, [field]: value } : p
    );
    setSelectedPonds(updatedPonds);
  };

  const updateKoiField = (koiId: number, field: string, value: any) => {
    const updatedKois = selectedKois.map((k) =>
      k.id === koiId ? { ...k, [field]: value } : k
    );
    setSelectedKois(updatedKois);
  };

  const getSeverityText = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.Low:
        return 'Thấp';
      case IncidentSeverity.Medium:
        return 'Trung bình';
      case IncidentSeverity.High:
        return 'Cao';
      case IncidentSeverity.Urgent:
        return 'Nghiêm trọng';
      default:
        return '';
    }
  };

  const getSeverityColor = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.Low:
        return 'bg-green-100 text-green-800 border-green-200';
      case IncidentSeverity.Medium:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case IncidentSeverity.High:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case IncidentSeverity.Urgent:
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradientColors = (colorString: string): [string, string] => {
    if (colorString.includes('green')) {
      return ['#10b981', '#059669'];
    } else if (colorString.includes('yellow')) {
      return ['#f59e0b', '#d97706'];
    } else if (colorString.includes('orange') || colorString.includes('red')) {
      return ['#f97316', '#dc2626'];
    } else {
      return ['#ef4444', '#dc2626'];
    }
  };

  // Loading screen
  if (incidentLoading || isSubmitting) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center">
          <Loading />
          <Text className="mt-4 text-gray-500">
            {incidentLoading
              ? 'Đang tải thông tin sự cố...'
              : 'Đang cập nhật...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <View className="flex-1 items-center justify-center">
          <Text className="text-red-500">Không tìm thấy sự cố</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2"
          >
            <Text className="text-white">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <LinearGradient colors={['#3b82f6', '#1d4ed8']} className="px-6 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mr-3 rounded-full bg-white/20 p-2"
            >
              <ChevronLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-white">
              Chỉnh sửa sự cố
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className={`rounded-lg px-4 py-2 ${
              isFormValid() && !isSubmitting ? 'bg-white' : 'bg-white/30'
            }`}
          >
            <Text
              className={`font-semibold ${
                isFormValid() && !isSubmitting
                  ? 'text-blue-600'
                  : 'text-white/70'
              }`}
            >
              Cập nhật
            </Text>
          </TouchableOpacity>
        </View>

        {/* Section Navigation */}
        <View className="mt-4 flex-row rounded-xl bg-white/20 p-1">
          <TouchableOpacity
            onPress={() => setActiveSection('basic')}
            className={`flex-1 rounded-lg py-2 ${
              activeSection === 'basic' ? 'bg-white' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                activeSection === 'basic' ? 'text-blue-600' : 'text-white'
              }`}
            >
              Thông tin cơ bản
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveSection('assets')}
            className={`flex-1 rounded-lg py-2 ${
              activeSection === 'assets' ? 'bg-white' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-center text-sm font-medium ${
                activeSection === 'assets' ? 'text-blue-600' : 'text-white'
              }`}
            >
              Tài sản bị ảnh hưởng
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Content */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {activeSection === 'basic' ? (
          <ScrollView
            className="flex-1 px-6 py-4"
            showsVerticalScrollIndicator={false}
          >
            {/* Incident Type */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                Loại sự cố <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowIncidentTypeModal(true)}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    {formData.incidentTypeId ? (
                      <Text className="text-gray-900">
                        {incidentTypes?.data?.find(
                          (type: any) => type.id === formData.incidentTypeId
                        )?.name || 'Đã chọn'}
                      </Text>
                    ) : (
                      <Text className="text-gray-500">Chọn loại sự cố</Text>
                    )}
                  </View>
                  <ChevronLeft
                    size={20}
                    color="#6b7280"
                    style={{ transform: [{ rotate: '180deg' }] }}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Incident Title */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                Tiêu đề sự cố <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.incidentTitle}
                onChangeText={(text) =>
                  setFormData({ ...formData, incidentTitle: text })
                }
                placeholder="Nhập tiêu đề sự cố..."
                className="rounded-xl border border-gray-200 bg-white p-4 text-gray-900"
                placeholderTextColor="#9ca3af"
                multiline={false}
              />
            </View>

            {/* Description */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                Mô tả chi tiết <Text className="text-red-500">*</Text>
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={(text) =>
                  setFormData({ ...formData, description: text })
                }
                placeholder="Mô tả chi tiết về sự cố..."
                className="rounded-xl border border-gray-200 bg-white p-4 text-gray-900"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Severity */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                Mức độ nghiêm trọng <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowSeverityModal(true)}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    {formData.severity ? (
                      <View className="flex-row items-center">
                        <View
                          className={`mr-2 rounded-full px-3 py-1 ${getSeverityColor(
                            formData.severity
                          )}`}
                        >
                          <Text className="text-xs font-medium">
                            {getSeverityText(formData.severity)}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <Text className="text-gray-500">
                        Chọn mức độ nghiêm trọng
                      </Text>
                    )}
                  </View>
                  <ChevronLeft
                    size={20}
                    color="#6b7280"
                    style={{ transform: [{ rotate: '180deg' }] }}
                  />
                </View>
              </TouchableOpacity>
            </View>

            {/* Occurred At */}
            <View className="mb-6">
              <Text className="mb-3 text-base font-semibold text-gray-900">
                Thời gian xảy ra <Text className="text-red-500">*</Text>
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="rounded-xl border border-gray-200 bg-white p-4"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Calendar size={20} color="#6b7280" />
                    <Text className="ml-2 text-gray-900">
                      {formData.occurredAt
                        ? new Date(formData.occurredAt).toLocaleString('vi-VN')
                        : 'Chọn thời gian'}
                    </Text>
                  </View>
                  <ChevronLeft
                    size={20}
                    color="#6b7280"
                    style={{ transform: [{ rotate: '180deg' }] }}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          <ScrollView
            className="flex-1 px-6 py-4"
            showsVerticalScrollIndicator={false}
          >
            {/* Selected Ponds */}
            <View className="mb-6">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-base font-semibold text-gray-900">
                  Ao bị ảnh hưởng ({selectedPonds.length})
                </Text>
                <TouchableOpacity
                  onPress={() => setShowPondModal(true)}
                  className="rounded-lg bg-blue-500 px-3 py-1"
                >
                  <Text className="text-sm font-medium text-white">
                    Chọn ao
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedPonds.map((pond) => (
                <View
                  key={pond.id}
                  className="mb-4 rounded-xl border border-gray-200 bg-white p-4"
                >
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="font-semibold text-gray-900">
                      {pond.pondName}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedPonds(
                          selectedPonds.filter((p) => p.id !== pond.id)
                        )
                      }
                      className="rounded-full bg-red-100 p-1"
                    >
                      <X size={16} color="#dc2626" />
                    </TouchableOpacity>
                  </View>

                  <View className="space-y-3">
                    <View>
                      <Text className="mb-2 text-sm font-medium text-gray-700">
                        Thay đổi môi trường
                      </Text>
                      <TextInput
                        value={pond.environmentalChanges}
                        onChangeText={(text) =>
                          updatePondField(pond.id, 'environmentalChanges', text)
                        }
                        placeholder="Mô tả các thay đổi môi trường..."
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900"
                        placeholderTextColor="#9ca3af"
                        multiline
                      />
                    </View>

                    <View>
                      <Text className="mb-2 text-sm font-medium text-gray-700">
                        Biện pháp khắc phục
                      </Text>
                      <TextInput
                        value={pond.correctiveActions}
                        onChangeText={(text) =>
                          updatePondField(pond.id, 'correctiveActions', text)
                        }
                        placeholder="Các biện pháp đã thực hiện..."
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900"
                        placeholderTextColor="#9ca3af"
                        multiline
                      />
                    </View>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-medium text-gray-700">
                        Cần thay nước
                      </Text>
                      <Switch
                        value={pond.requiresWaterChange}
                        onValueChange={(value) =>
                          updatePondField(pond.id, 'requiresWaterChange', value)
                        }
                        trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                        thumbColor={
                          pond.requiresWaterChange ? '#ffffff' : '#ffffff'
                        }
                      />
                    </View>

                    <View>
                      <Text className="mb-2 text-sm font-medium text-gray-700">
                        Số cá chết
                      </Text>
                      <TextInput
                        value={pond.fishDiedCount?.toString() || '0'}
                        onChangeText={(text) =>
                          updatePondField(
                            pond.id,
                            'fishDiedCount',
                            parseInt(text) || 0
                          )
                        }
                        placeholder="0"
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900"
                        placeholderTextColor="#9ca3af"
                        keyboardType="numeric"
                      />
                    </View>

                    <View>
                      <Text className="mb-2 text-sm font-medium text-gray-700">
                        Ghi chú
                      </Text>
                      <TextInput
                        value={pond.notes}
                        onChangeText={(text) =>
                          updatePondField(pond.id, 'notes', text)
                        }
                        placeholder="Ghi chú thêm..."
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900"
                        placeholderTextColor="#9ca3af"
                        multiline
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Selected Kois */}
            <View className="mb-6">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-base font-semibold text-gray-900">
                  Cá Koi bị ảnh hưởng ({selectedKois.length})
                </Text>
                <TouchableOpacity
                  onPress={() => setShowKoiModal(true)}
                  className="rounded-lg bg-blue-500 px-3 py-1"
                >
                  <Text className="text-sm font-medium text-white">
                    Chọn cá
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedKois.map((koi) => (
                <View
                  key={koi.id}
                  className="mb-4 rounded-xl border border-gray-200 bg-white p-4"
                >
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="font-semibold text-gray-900">
                      {(koi as any).koiName || 'Cá Koi'}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setSelectedKois(
                          selectedKois.filter((k) => k.id !== koi.id)
                        )
                      }
                      className="rounded-full bg-red-100 p-1"
                    >
                      <X size={16} color="#dc2626" />
                    </TouchableOpacity>
                  </View>

                  <View className="space-y-3">
                    <View>
                      <Text className="mb-2 text-sm font-medium text-gray-700">
                        Triệu chứng cụ thể
                      </Text>
                      <TextInput
                        value={koi.specificSymptoms}
                        onChangeText={(text) =>
                          updateKoiField(koi.id, 'specificSymptoms', text)
                        }
                        placeholder="Mô tả triệu chứng..."
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900"
                        placeholderTextColor="#9ca3af"
                        multiline
                      />
                    </View>

                    <View>
                      <Text className="mb-2 text-sm font-medium text-gray-700">
                        Ghi chú điều trị
                      </Text>
                      <TextInput
                        value={koi.treatmentNotes}
                        onChangeText={(text) =>
                          updateKoiField(koi.id, 'treatmentNotes', text)
                        }
                        placeholder="Ghi chú về điều trị..."
                        className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-gray-900"
                        placeholderTextColor="#9ca3af"
                        multiline
                      />
                    </View>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-medium text-gray-700">
                        Cần điều trị
                      </Text>
                      <Switch
                        value={koi.requiresTreatment}
                        onValueChange={(value) =>
                          updateKoiField(koi.id, 'requiresTreatment', value)
                        }
                        trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                        thumbColor={
                          koi.requiresTreatment ? '#ffffff' : '#ffffff'
                        }
                      />
                    </View>

                    <View className="flex-row items-center justify-between">
                      <Text className="text-sm font-medium text-gray-700">
                        Đã cách ly
                      </Text>
                      <Switch
                        value={koi.isIsolated}
                        onValueChange={(value) =>
                          updateKoiField(koi.id, 'isIsolated', value)
                        }
                        trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
                        thumbColor={koi.isIsolated ? '#ffffff' : '#ffffff'}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>

      {/* DateTimePicker */}
      {showDatePicker && (
        <DateTimePicker
          value={
            formData.occurredAt ? new Date(formData.occurredAt) : new Date()
          }
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setFormData({
                ...formData,
                occurredAt: selectedDate.toISOString(),
              });
            }
          }}
        />
      )}

      {/* Modals - giữ nguyên các modal từ code trước */}
      {renderIncidentTypeModal()}
      {renderSeverityModal()}
      {renderPondSelectionModal()}
      {renderKoiSelectionModal()}
    </SafeAreaView>
  );

  // Modal render functions - Đặt trong component chính
  function renderIncidentTypeModal() {
    const filteredIncidentTypes = incidentTypes?.data?.filter(
      (type: any) =>
        type.name?.toLowerCase().includes(debouncedKoiSearch.toLowerCase()) ||
        type.description
          ?.toLowerCase()
          .includes(debouncedKoiSearch.toLowerCase())
    );

    return (
      <Modal
        visible={showIncidentTypeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        statusBarTranslucent
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="border-b border-gray-200 px-6 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">
                Chọn loại sự cố
              </Text>
              <TouchableOpacity
                onPress={() => setShowIncidentTypeModal(false)}
                className="rounded-full bg-gray-100 p-2"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            {incidentTypesLoading ? (
              <View className="flex-1 items-center justify-center">
                <Loading />
              </View>
            ) : (
              filteredIncidentTypes?.map((type: any) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => {
                    setFormData({ ...formData, incidentTypeId: type.id });
                    setShowIncidentTypeModal(false);
                  }}
                  className={`mb-3 rounded-xl border p-4 ${
                    formData.incidentTypeId === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="font-semibold text-gray-900">
                        {type.name}
                      </Text>
                      {type.description && (
                        <Text className="mt-1 text-sm text-gray-500">
                          {type.description}
                        </Text>
                      )}
                    </View>
                    {formData.incidentTypeId === type.id && (
                      <Check size={20} color="#3b82f6" />
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  function renderSeverityModal() {
    const severityOptions = [
      {
        value: IncidentSeverity.Low,
        label: 'Thấp',
        description: 'Sự cố nhỏ, không ảnh hưởng nhiều',
        color: 'from-green-500 to-emerald-600',
        icon: '🟢',
      },
      {
        value: IncidentSeverity.Medium,
        label: 'Trung bình',
        description: 'Ảnh hưởng ở mức độ vừa',
        color: 'from-yellow-500 to-amber-600',
        icon: '🟡',
      },
      {
        value: IncidentSeverity.High,
        label: 'Cao',
        description: 'Sự cố nghiêm trọng, cần xử lý ngay',
        color: 'from-orange-500 to-red-500',
        icon: '🟠',
      },
      {
        value: IncidentSeverity.Urgent,
        label: 'Nghiêm trọng',
        description: 'Khẩn cấp, cần xử lý tức thì',
        color: 'from-red-600 to-rose-700',
        icon: '🔴',
      },
    ];

    return (
      <Modal
        visible={showSeverityModal}
        animationType="slide"
        presentationStyle="pageSheet"
        statusBarTranslucent
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="border-b border-gray-200 px-6 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">
                Chọn mức độ nghiêm trọng
              </Text>
              <TouchableOpacity
                onPress={() => setShowSeverityModal(false)}
                className="rounded-full bg-gray-100 p-2"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            {severityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setFormData({ ...formData, severity: option.value });
                  setShowSeverityModal(false);
                }}
                className={`mb-4 overflow-hidden rounded-2xl border ${
                  formData.severity === option.value
                    ? 'border-blue-500'
                    : 'border-gray-200'
                }`}
              >
                <LinearGradient
                  colors={getGradientColors(option.color)}
                  className="p-4"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <View className="flex-row items-center">
                    <Text className="mr-3 text-2xl">{option.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-white">
                        {option.label}
                      </Text>
                      <Text className="text-sm text-white/90">
                        {option.description}
                      </Text>
                    </View>
                    {formData.severity === option.value && (
                      <Check size={24} color="white" />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  function renderPondSelectionModal() {
    const filteredPonds = ponds?.data?.filter((pond: any) =>
      pond.pondName.toLowerCase().includes(debouncedPondSearch.toLowerCase())
    );

    return (
      <Modal
        visible={showPondModal}
        animationType="slide"
        presentationStyle="pageSheet"
        statusBarTranslucent
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="border-b border-gray-200 px-6 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">
                Chọn ao bị ảnh hưởng
              </Text>
              <TouchableOpacity
                onPress={() => setShowPondModal(false)}
                className="rounded-full bg-gray-100 p-2"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="mt-4 flex-row items-center rounded-xl bg-gray-50 px-4 py-3">
              <Search size={20} color="#6b7280" />
              <TextInput
                value={pondSearchQuery}
                onChangeText={setPondSearchQuery}
                placeholder="Tìm kiếm ao..."
                className="ml-3 flex-1 text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            {pondsLoading ? (
              <View className="flex-1 items-center justify-center">
                <Loading />
              </View>
            ) : (
              filteredPonds?.map((pond: any) => {
                const isSelected = selectedPonds.some(
                  (sp) => sp.id === pond.id
                );
                return (
                  <TouchableOpacity
                    key={pond.id}
                    onPress={() => togglePondSelection(pond)}
                    className={`mb-3 rounded-xl border p-4 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900">
                          {pond.pondName}
                        </Text>
                        <Text className="mt-1 text-sm text-gray-500">
                          Diện tích: {pond.area}m² • Độ sâu: {pond.depth}m
                        </Text>
                      </View>
                      {isSelected && <Check size={20} color="#3b82f6" />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  function renderKoiSelectionModal() {
    const filteredKois = koiFishes?.data?.filter(
      (koi: any) =>
        koi.koiName?.toLowerCase().includes(debouncedKoiSearch.toLowerCase()) ||
        koi.rfid?.toLowerCase().includes(debouncedKoiSearch.toLowerCase())
    );

    return (
      <Modal
        visible={showKoiModal}
        animationType="slide"
        presentationStyle="pageSheet"
        statusBarTranslucent
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="border-b border-gray-200 px-6 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-gray-900">
                Chọn cá Koi bị ảnh hưởng
              </Text>
              <TouchableOpacity
                onPress={() => setShowKoiModal(false)}
                className="rounded-full bg-gray-100 p-2"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="mt-4 flex-row items-center rounded-xl bg-gray-50 px-4 py-3">
              <Search size={20} color="#6b7280" />
              <TextInput
                value={koiSearchQuery}
                onChangeText={setKoiSearchQuery}
                placeholder="Tìm kiếm cá Koi..."
                className="ml-3 flex-1 text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            {koisLoading ? (
              <View className="flex-1 items-center justify-center">
                <Loading />
              </View>
            ) : (
              filteredKois?.map((koi: any) => {
                const isSelected = selectedKois.some((sk) => sk.id === koi.id);
                return (
                  <TouchableOpacity
                    key={koi.id}
                    onPress={() => toggleKoiSelection(koi)}
                    className={`mb-3 rounded-xl border p-4 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1">
                        <Text className="font-semibold text-gray-900">
                          {koi.koiName}
                        </Text>
                        <Text className="mt-1 text-sm text-gray-500">
                          RFID: {koi.rfid} •{' '}
                          {koi.gender === Gender.MALE ? 'Đực' : 'Cái'}
                        </Text>
                      </View>
                      {isSelected && <Check size={20} color="#3b82f6" />}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }
}
