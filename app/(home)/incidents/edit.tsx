import FishSvg from '@/components/icons/FishSvg';
import PondSvg from '@/components/icons/PondSvg';
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
import { IncidentType } from '@/lib/api/services/fetchIncidentType';
import { Gender, KoiFish } from '@/lib/api/services/fetchKoiFish';
import { Pond } from '@/lib/api/services/fetchPond';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';

import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Droplets,
  Plus,
  Search,
  Stethoscope,
  Thermometer,
  X,
} from 'lucide-react-native';
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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAffectedStatusInfo } from './[id]';

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
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: fadeAnim }} className="p-6">
            {/* Basic Information Section */}
            {activeSection === 'basic' && (
              <View className="space-y-6">
                <View className="flex-row items-center justify-between">
                  <Text className="text-2xl font-light text-slate-900">
                    Thông tin sự cố
                  </Text>
                  <View
                    className={`rounded-full border px-3 py-1 ${formData.severity ? getSeverityColor(formData.severity) : 'border-gray-200 bg-gray-100'}`}
                  >
                    <Text className="text-sm font-medium">
                      {formData.severity
                        ? getSeverityText(formData.severity)
                        : 'Chưa đánh giá'}
                    </Text>
                  </View>
                </View>

                {/* Incident Type Field */}
                <View>
                  <Text className="mb-3 text-sm font-medium text-slate-600">
                    Loại sự cố <Text className="text-rose-500">*</Text>
                  </Text>
                  <TouchableOpacity
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    onPress={() => setShowIncidentTypeModal(true)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <AlertTriangle className="mr-3 h-5 w-5 text-slate-400" />
                        <Text
                          className={`text-lg ${formData.incidentTypeId ? 'text-slate-900' : 'text-slate-400'}`}
                        >
                          {incidentTypes?.data?.find(
                            (t: IncidentType) =>
                              t.id === formData.incidentTypeId
                          )?.name || 'Chọn loại sự cố'}
                        </Text>
                      </View>
                      <ChevronLeft className="h-5 w-5 rotate-180 text-slate-400" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Incident Title Field */}
                <View>
                  <Text className="mb-3 text-sm font-medium text-slate-600">
                    Tiêu đề sự cố <Text className="text-rose-500">*</Text>
                  </Text>
                  <TextInput
                    className="rounded-2xl border border-slate-200 bg-white p-5 text-lg text-slate-900 shadow-sm"
                    placeholder="Nhập tiêu đề sự cố"
                    placeholderTextColor="#94A3B8"
                    value={formData.incidentTitle}
                    onChangeText={(text) =>
                      setFormData({ ...formData, incidentTitle: text })
                    }
                    multiline
                  />
                </View>

                {/* Description Field */}
                <View>
                  <Text className="mb-3 text-sm font-medium text-slate-600">
                    Mô tả chi tiết <Text className="text-rose-500">*</Text>
                  </Text>
                  <TextInput
                    className="min-h-[120px] rounded-2xl border border-slate-200 bg-white p-5 text-lg text-slate-900 shadow-sm"
                    placeholder="Mô tả chi tiết về sự cố..."
                    placeholderTextColor="#94A3B8"
                    value={formData.description}
                    onChangeText={(text) =>
                      setFormData({ ...formData, description: text })
                    }
                    multiline
                    textAlignVertical="top"
                  />
                </View>

                {/* Severity Field */}
                <View>
                  <Text className="mb-3 text-sm font-medium text-slate-600">
                    Mức độ nghiêm trọng <Text className="text-rose-500">*</Text>
                  </Text>
                  <TouchableOpacity
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    onPress={() => setShowSeverityModal(true)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Thermometer className="mr-3 h-5 w-5 text-slate-400" />
                        <Text
                          className={`text-lg ${formData.severity ? 'text-slate-900' : 'text-slate-400'}`}
                        >
                          {formData.severity
                            ? getSeverityText(formData.severity)
                            : 'Chọn mức độ nghiêm trọng'}
                        </Text>
                      </View>
                      <ChevronLeft className="h-5 w-5 rotate-180 text-slate-400" />
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Occurred At Field */}
                <View>
                  <Text className="mb-3 text-sm font-medium text-slate-600">
                    Ngày xảy ra <Text className="text-rose-500">*</Text>
                  </Text>
                  <TouchableOpacity
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                    onPress={() => setShowDatePicker(true)}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center">
                        <Clock className="mr-3 h-5 w-5 text-slate-400" />
                        <Text
                          className={`text-lg ${formData.occurredAt ? 'text-slate-900' : 'text-slate-400'}`}
                        >
                          {formData.occurredAt
                            ? new Date(formData.occurredAt).toLocaleDateString(
                                'vi-VN'
                              )
                            : 'Chọn ngày xảy ra'}
                        </Text>
                      </View>
                      <Calendar className="h-5 w-5 text-slate-400" />
                    </View>
                  </TouchableOpacity>
                  {/* DateTimePicker */}
                  {showDatePicker && (
                    <View className="absolute inset-0 justify-end bg-black/50">
                      <View className="rounded-t-3xl bg-white p-6">
                        <View className="mb-4 flex-row items-center justify-between">
                          <Text className="text-xl font-bold text-slate-900">
                            Chọn ngày xảy ra
                          </Text>
                          <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            className="rounded-full bg-slate-100 p-2"
                          >
                            <X className="h-5 w-5 text-slate-600" />
                          </TouchableOpacity>
                        </View>

                        <DateTimePicker
                          value={
                            formData.occurredAt
                              ? new Date(formData.occurredAt)
                              : new Date()
                          }
                          mode="date"
                          display={
                            Platform.OS === 'ios' ? 'spinner' : 'calendar'
                          }
                          maximumDate={new Date()}
                          onChange={(event, selectedDate) => {
                            if (Platform.OS === 'android') {
                              setShowDatePicker(false);
                            }

                            if (selectedDate) {
                              const today = new Date();
                              today.setHours(23, 59, 59, 999);

                              if (selectedDate > today) {
                                Alert.alert(
                                  'Lỗi',
                                  'Không được chọn ngày trong tương lai'
                                );
                                return;
                              }

                              const dateOnly = new Date(selectedDate);
                              dateOnly.setHours(0, 0, 0, 0);

                              setFormData({
                                ...formData,
                                occurredAt: dateOnly.toISOString(),
                              });

                              if (Platform.OS === 'ios') {
                                setTimeout(() => setShowDatePicker(false), 300);
                              }
                            }
                          }}
                          style={
                            Platform.OS === 'ios'
                              ? { height: 200 }
                              : { alignSelf: 'center' }
                          }
                          textColor="#1E293B"
                        />

                        {Platform.OS === 'ios' && (
                          <TouchableOpacity
                            onPress={() => setShowDatePicker(false)}
                            className="mt-4 rounded-xl bg-blue-500 py-4"
                          >
                            <Text className="text-center text-lg font-semibold text-white">
                              Xác nhận
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Assets Section */}
            {activeSection === 'assets' && (
              <View className="space-y-6">
                <View className="flex-row items-center justify-between">
                  <Text className="text-2xl font-light text-slate-900">
                    Cá và hồ bị ảnh hưởng
                  </Text>
                  <View className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1">
                    <Text className="text-sm font-medium text-blue-800">
                      {selectedPonds.length + selectedKois.length} cá & hồ
                    </Text>
                  </View>
                </View>

                {/* Summary Cards */}
                <View className="flex-row space-x-4">
                  <View className="flex-1 rounded-2xl p-4">
                    <View className="flex-row items-center justify-center gap-2">
                      <PondSvg size={20} />
                      <Text className="font-semibold text-cyan-800">
                        Ao nuôi
                      </Text>
                    </View>
                    <Text className="mt-2 text-center text-2xl font-bold text-cyan-600">
                      {selectedPonds.length}
                    </Text>
                    <Text className="text-center text-sm text-cyan-700">
                      ao được chọn
                    </Text>
                  </View>

                  <View className="flex-1 rounded-2xl p-4 ">
                    <View className="flex-row items-center justify-center gap-2 ">
                      <FishSvg size={20} />
                      <Text className="font-semibold text-orange-800">
                        Cá Koi
                      </Text>
                    </View>
                    <Text className="mt-2 text-center text-2xl font-bold text-orange-600">
                      {selectedKois.length}
                    </Text>
                    <Text className="text-center text-sm text-orange-700">
                      cá được chọn
                    </Text>
                  </View>
                </View>

                {/* Pond Selection */}
                <View>
                  <View className="mb-4 flex-row items-center justify-between">
                    <Text className="text-xl font-semibold text-slate-900">
                      Ao nuôi
                    </Text>
                    <TouchableOpacity
                      className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 shadow-lg"
                      onPress={() => setShowPondModal(true)}
                    >
                      <View className="flex-row items-center">
                        <Plus className="mr-2 h-4 w-4 text-white" />
                      </View>
                    </TouchableOpacity>
                  </View>

                  {selectedPonds.length > 0 ? (
                    <View className="mb-4">
                      {selectedPonds.map((pond) => (
                        <View
                          key={pond.id}
                          className="mb-4 rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm"
                        >
                          {/* Pond Header */}
                          <View className="mb-4 flex-row items-center justify-between">
                            <View className="flex-1">
                              <View className="flex-row items-center">
                                <PondSvg size={20} />
                                <Text className="text-xl font-semibold text-cyan-800">
                                  {pond.pondName}
                                </Text>
                              </View>
                              <Text className="mt-1 text-sm text-cyan-600">
                                Diện tích:{' '}
                                {(
                                  pond.lengthMeters * pond.widthMeters
                                )?.toFixed(1)}
                                m²
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => togglePondSelection(pond)}
                              className="rounded-full bg-rose-500 p-2"
                            >
                              <X className="h-4 w-4 text-white" />
                            </TouchableOpacity>
                          </View>

                          {/* Pond Incident Details */}
                          <View className="space-y-4">
                            <View>
                              <Text className="mb-2 text-sm font-medium text-slate-700">
                                Thay đổi môi trường
                              </Text>
                              <TextInput
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900"
                                placeholder="Mô tả các thay đổi môi trường..."
                                value={pond.environmentalChanges || ''}
                                onChangeText={(text) =>
                                  updatePondField(
                                    pond.id,
                                    'environmentalChanges',
                                    text
                                  )
                                }
                                multiline
                              />
                            </View>

                            <View>
                              <Text className="mb-2 text-sm font-medium text-slate-700">
                                Biện pháp khắc phục
                              </Text>
                              <TextInput
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900"
                                placeholder="Các biện pháp đã thực hiện..."
                                value={pond.correctiveActions || ''}
                                onChangeText={(text) =>
                                  updatePondField(
                                    pond.id,
                                    'correctiveActions',
                                    text
                                  )
                                }
                                multiline
                              />
                            </View>

                            <View>
                              <Text className="mb-2 text-sm font-medium text-slate-700">
                                Số lượng cá chết
                              </Text>
                              <TextInput
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900"
                                placeholder="0"
                                value={pond.fishDiedCount?.toString() || '0'}
                                onChangeText={(text) =>
                                  updatePondField(
                                    pond.id,
                                    'fishDiedCount',
                                    parseInt(text) || 0
                                  )
                                }
                                keyboardType="numeric"
                              />
                            </View>

                            <View>
                              <Text className="mb-2 text-sm font-medium text-slate-700">
                                Ghi chú
                              </Text>
                              <TextInput
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900"
                                placeholder="Ghi chú thêm..."
                                value={pond.notes || ''}
                                onChangeText={(text) =>
                                  updatePondField(pond.id, 'notes', text)
                                }
                                multiline
                              />
                            </View>

                            <View className="mt-4 flex-row items-center justify-between">
                              <Text className="text-sm font-medium text-slate-700">
                                Cần thay nước
                              </Text>
                              <TouchableOpacity
                                onPress={() =>
                                  updatePondField(
                                    pond.id,
                                    'requiresWaterChange',
                                    !pond.requiresWaterChange
                                  )
                                }
                                className={`rounded-full p-1 ${pond.requiresWaterChange ? 'bg-blue-500' : 'bg-slate-300'}`}
                              >
                                <Check className="h-4 w-4 text-white" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View className="rounded-2xl border-2 border-dashed border-slate-300 p-8">
                      <PondSvg size={48} />
                      <Text className="text-center text-slate-500">
                        Chưa chọn ao nào
                      </Text>
                    </View>
                  )}
                </View>

                {/* Koi Selection */}
                <View>
                  <View className="mb-4 flex-row items-center justify-between">
                    <Text className="text-xl font-semibold text-slate-900">
                      Cá Koi
                    </Text>
                    <TouchableOpacity
                      className="rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-3 shadow-lg"
                      onPress={() => setShowKoiModal(true)}
                    >
                      <View className="flex-row items-center">
                        <Plus className="mr-2 h-4 w-4 text-white" />
                      </View>
                    </TouchableOpacity>
                  </View>

                  {selectedKois.length > 0 ? (
                    <View className="mb-4">
                      {selectedKois.map((koi) => (
                        <View
                          key={koi.id}
                          className="mb-4 rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"
                        >
                          {/* Koi Header */}
                          <View className="mb-4 flex-row items-center justify-between gap-2">
                            <View className="flex-1">
                              <View className="flex-row items-center">
                                <FishSvg size={20} />
                                <Text className="text-xl font-semibold text-orange-800">
                                  {(koi as KoiFish).rfid || `Cá Koi #${koi.id}`}
                                </Text>
                              </View>
                              <Text className="mt-1 text-sm text-orange-600">
                                RFID: {koi.rfid}
                              </Text>
                            </View>
                            <TouchableOpacity
                              onPress={() => toggleKoiSelection(koi)}
                              className="rounded-full bg-rose-500 p-2"
                            >
                              <X className="h-4 w-4 text-white" />
                            </TouchableOpacity>
                          </View>

                          {/* Koi Incident Details */}
                          <View className="flex-col gap-4">
                            <View>
                              <Text className="mb-2 text-sm font-medium text-slate-700">
                                Trạng thái
                              </Text>
                              <View className="flex-row flex-wrap gap-2">
                                {Object.values(KoiAffectedStatus).map(
                                  (status) => (
                                    <TouchableOpacity
                                      key={status}
                                      onPress={() =>
                                        updateKoiField(
                                          koi.id,
                                          'affectedStatus',
                                          status
                                        )
                                      }
                                      className={`rounded-lg px-3 py-2 ${koi.affectedStatus === status ? 'bg-orange-500' : 'bg-slate-100'}`}
                                    >
                                      <Text
                                        className={`text-xs font-medium ${koi.affectedStatus === status ? 'text-white' : 'text-slate-600'}`}
                                      >
                                        {getAffectedStatusInfo(status).label}
                                      </Text>
                                    </TouchableOpacity>
                                  )
                                )}
                              </View>
                            </View>

                            <View>
                              <Text className="mb-2 text-sm font-medium text-slate-700">
                                Triệu chứng
                              </Text>
                              <TextInput
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900"
                                placeholder="Mô tả triệu chứng cụ thể..."
                                value={koi.specificSymptoms || ''}
                                onChangeText={(text) =>
                                  updateKoiField(
                                    koi.id,
                                    'specificSymptoms',
                                    text
                                  )
                                }
                                multiline
                              />
                            </View>

                            <View>
                              <Text className="mb-2 text-sm font-medium text-slate-700">
                                Ghi chú điều trị
                              </Text>
                              <TextInput
                                className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900"
                                placeholder="Ghi chú về điều trị..."
                                value={koi.treatmentNotes || ''}
                                onChangeText={(text) =>
                                  updateKoiField(koi.id, 'treatmentNotes', text)
                                }
                                multiline
                              />
                            </View>

                            <View className="flex-row justify-between">
                              <View className="flex-row items-center">
                                <Stethoscope className="mr-2 h-4 w-4 text-slate-600" />
                                <Text className="text-sm font-medium text-slate-700">
                                  Cần điều trị
                                </Text>
                                <TouchableOpacity
                                  onPress={() =>
                                    updateKoiField(
                                      koi.id,
                                      'requiresTreatment',
                                      !koi.requiresTreatment
                                    )
                                  }
                                  className={`ml-2 rounded-full p-1 ${koi.requiresTreatment ? 'bg-orange-500' : 'bg-slate-300'}`}
                                >
                                  <Check className="h-3 w-3 text-white" />
                                </TouchableOpacity>
                              </View>

                              <View className="flex-row items-center">
                                <Droplets className="mr-2 h-4 w-4 text-slate-600" />
                                <Text className="text-sm font-medium text-slate-700">
                                  Cách ly
                                </Text>
                                <TouchableOpacity
                                  onPress={() =>
                                    updateKoiField(
                                      koi.id,
                                      'isIsolated',
                                      !koi.isIsolated
                                    )
                                  }
                                  className={`ml-2 rounded-full p-1 ${koi.isIsolated ? 'bg-orange-500' : 'bg-slate-300'}`}
                                >
                                  <Check className="h-3 w-3 text-white" />
                                </TouchableOpacity>
                              </View>
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View className="rounded-2xl border-2 border-dashed border-slate-300 p-8">
                      <FishSvg size={48} />
                      <Text className="text-center text-slate-500">
                        Chưa chọn cá nào
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </Animated.View>
          {/* Bottom Actions */}
          <View className="border-t border-slate-200 bg-white p-6">
            <TouchableOpacity
              onPress={handleSubmit}
              className="rounded-2xl shadow-xl"
              disabled={isSubmitting || !isFormValid()}
            >
              <LinearGradient
                colors={
                  isFormValid()
                    ? ['#F97316', '#E11D48']
                    : ['#94A3B8', '#64748B']
                }
                className="rounded-2xl py-4"
              >
                <Text className="text-center text-lg font-semibold text-white">
                  {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật sự cố'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {!isFormValid() && (
              <View className="mt-3 flex-row items-center justify-center">
                <AlertCircle className="mr-1 h-4 w-4 text-rose-500" />
                <Text className="text-sm text-rose-600">
                  Vui lòng điền đầy đủ thông tin bắt buộc
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

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
