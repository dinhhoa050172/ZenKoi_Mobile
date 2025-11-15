import Loading from '@/components/Loading';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateIncident } from '@/hooks/useIncident';
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

import FishSvg from '@/components/icons/FishSvg';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  ChevronLeft,
  Clock,
  Droplets,
  Edit3,
  MapPin,
  Plus,
  Search,
  Stethoscope,
  Thermometer,
  Waves,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
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

export default function CreateIncidentScreen() {
  const router = useRouter();
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
  const createIncidentMutation = useCreateIncident();
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

      await createIncidentMutation.mutateAsync(incidentPayload);

      Alert.alert(
        'Thành công',
        'Đã tạo sự cố và liên kết với tài sản thành công!',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating incident:', error);
      Alert.alert(
        'Lỗi',
        error?.message || 'Không thể tạo sự cố. Vui lòng thử lại.'
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

  // Loading screen
  if (isSubmitting) {
    return (
      <SafeAreaView className="flex-1 bg-slate-50">
        <LinearGradient
          colors={['#0F172A', '#1E293B']}
          className="flex-1 items-center justify-center"
        >
          <View className="items-center">
            <View className="mb-6 rounded-full bg-white/10 p-6">
              <FishSvg size={20} />
            </View>
            <Text className="mb-2 text-2xl font-bold text-white">
              Đang tạo sự cố
            </Text>
            <Text className="text-blue-200">Vui lòng đợi trong giây lát</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* Header */}
      <LinearGradient colors={['#3b82f6', '#1d4ed8']} className="px-6 py-4">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="rounded-full bg-white/50 p-3 "
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </TouchableOpacity>

          <Text className="text-xl font-bold text-white">Tạo sự cố mới</Text>

          <View className="w-10" />
        </View>

        {/* Navigation Tabs */}
        <View className="mt-6 flex-row rounded-2xl bg-white/20 p-1">
          <TouchableOpacity
            onPress={() => setActiveSection('basic')}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg py-3 ${activeSection === 'basic' ? 'bg-orange-500' : ''}`}
          >
            <Edit3
              className={`mr-2 h-4 w-4 ${activeSection === 'basic' ? 'text-white' : 'text-slate-300'}`}
            />
            <Text
              className={`font-semibold ${activeSection === 'basic' ? 'text-white' : 'text-slate-300'}`}
            >
              Thông tin cơ bản
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveSection('assets')}
            className={`flex-1 flex-row items-center justify-center gap-2 rounded-lg py-3 ${activeSection === 'assets' ? 'bg-orange-500' : ''}`}
          >
            <MapPin
              className={`mr-2 h-4 w-4 ${activeSection === 'assets' ? 'text-white' : 'text-slate-300'}`}
            />
            <Text
              className={`font-semibold ${activeSection === 'assets' ? 'text-white' : 'text-slate-300'}`}
            >
              Cá và Hồ ({selectedPonds.length + selectedKois.length})
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
                              // Validate that date is not in the future
                              const today = new Date();
                              today.setHours(23, 59, 59, 999);

                              if (selectedDate > today) {
                                Alert.alert(
                                  'Lỗi',
                                  'Không được chọn ngày trong tương lai'
                                );
                                return;
                              }

                              // Set time to start of selected day
                              const dateOnly = new Date(selectedDate);
                              dateOnly.setHours(0, 0, 0, 0);

                              setFormData({
                                ...formData,
                                occurredAt: dateOnly.toISOString(),
                              });

                              // Auto-close on iOS after selection
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
                          textColor="#1E293B" // Dark slate color for better visibility
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
                      <Waves className="mr-2 h-5 w-5 text-cyan-600" />
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
                                <Waves className="mr-2 h-5 w-5 text-cyan-500" />
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
                      <Waves className="mx-auto mb-3 h-12 w-12 text-slate-400" />
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
                          <View className="flex-col gap-2">
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
                  {isSubmitting ? 'Đang tạo...' : 'Tạo sự cố'}
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
      (type: IncidentType) =>
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
        <SafeAreaView className="flex-1 bg-slate-50">
          {/* Header */}
          <LinearGradient colors={['#3b82f6', '#1d4ed8']} className="px-6 pb-4">
            <View className="flex-row items-center justify-between pt-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white">
                  Loại sự cố
                </Text>
                <Text className="mt-1 text-blue-200">
                  Chọn loại sự cố phù hợp
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowIncidentTypeModal(false)}
                className="overflow-hidden rounded-full bg-white/10 p-2"
              >
                <X className="h-6 w-6 text-white" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="mt-4 flex-row items-center overflow-hidden rounded-2xl bg-white/10 p-2">
              <Search className="mr-3 h-5 w-5 text-blue-200" />
              <TextInput
                className="flex-1 text-base text-white"
                placeholder="Tìm kiếm loại sự cố..."
                placeholderTextColor="#94A3B8"
                value={koiSearchQuery}
                onChangeText={setKoiSearchQuery}
              />
            </View>
          </LinearGradient>

          {/* Content */}
          <ScrollView
            className="flex-1 p-6"
            showsVerticalScrollIndicator={false}
          >
            {incidentTypesLoading ? (
              <View className="items-center py-8">
                <Loading />
                <Text className="mt-4 text-slate-600">
                  Đang tải loại sự cố...
                </Text>
              </View>
            ) : (
              <View className="mb-4">
                {filteredIncidentTypes?.map((type: IncidentType) => {
                  const isSelected = formData.incidentTypeId === type.id;
                  return (
                    <TouchableOpacity
                      key={type.id}
                      onPress={() => {
                        setFormData({ ...formData, incidentTypeId: type.id });
                        setShowIncidentTypeModal(false);
                      }}
                      className={`rounded-2xl p-5 mb-4${
                        isSelected
                          ? ' bg-orange-500 shadow-2xl'
                          : ' border border-slate-200 bg-white shadow-lg'
                      }`}
                    >
                      <View className="mb-4 flex-row items-start justify-between">
                        <View className="flex-1">
                          <View className="flex-row items-center">
                            <AlertTriangle
                              className={`mr-3 h-5 w-5 ${
                                isSelected ? 'text-white' : 'text-slate-400'
                              }`}
                            />
                            <Text
                              className={`text-lg font-semibold ${
                                isSelected ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {type.name}
                            </Text>
                          </View>
                          <Text
                            className={`mt-2 text-sm ${
                              isSelected ? 'text-blue-100' : 'text-slate-600'
                            }`}
                          >
                            {type.description || 'Không có mô tả'}
                          </Text>
                        </View>
                        {isSelected && (
                          <View className="rounded-full bg-white/20 p-1">
                            <Check className="h-4 w-4 text-white" />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {filteredIncidentTypes?.length === 0 && (
                  <View className="items-center py-8">
                    <AlertTriangle className="h-16 w-16 text-slate-300" />
                    <Text className="mt-4 text-lg font-medium text-slate-500">
                      Không tìm thấy loại sự cố
                    </Text>
                    <Text className="mt-2 text-center text-slate-400">
                      Thử tìm kiếm với từ khóa khác
                    </Text>
                  </View>
                )}
              </View>
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
        <SafeAreaView className="flex-1 bg-slate-50">
          {/* Header */}
          <LinearGradient colors={['#3b82f6', '#1d4ed8']} className="px-6 pb-6">
            <View className="flex-row items-center justify-between pt-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white">
                  Mức độ nghiêm trọng
                </Text>
                <Text className="mt-1 text-blue-200">
                  Đánh giá mức độ ảnh hưởng của sự cố
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSeverityModal(false)}
                className="overflow-hidden rounded-full bg-white/10 p-2"
              >
                <X className="h-6 w-6 text-white" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Content */}
          <ScrollView
            className="flex-1 p-6"
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-4">
              {severityOptions.map((option) => {
                const isSelected = formData.severity === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setFormData({ ...formData, severity: option.value });
                      setShowSeverityModal(false);
                    }}
                    className={`mb-4 overflow-hidden rounded-2xl ${
                      isSelected ? 'shadow-2xl' : 'shadow-xl'
                    }`}
                  >
                    <LinearGradient
                      colors={
                        isSelected
                          ? ['#F97316', '#E11D48']
                          : ['#FFFFFF', '#F8FAFC']
                      }
                      className="p-5"
                    >
                      <View className="flex-row items-center justify-between">
                        <View className="flex-1 flex-row items-center">
                          <Text className="mr-4 text-2xl">{option.icon}</Text>
                          <View className="flex-1">
                            <Text
                              className={`text-lg font-semibold ${
                                isSelected ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              {option.label}
                            </Text>
                            <Text
                              className={`mt-1 text-sm ${
                                isSelected ? 'text-blue-100' : 'text-slate-600'
                              }`}
                            >
                              {option.description}
                            </Text>
                          </View>
                        </View>

                        {isSelected ? (
                          <View className="rounded-full bg-white/20 p-2">
                            <Check className="h-4 w-4 text-white" />
                          </View>
                        ) : (
                          <View
                            className={`rounded-full bg-gradient-to-r p-2 ${option.color}`}
                          >
                            <View className="h-2 w-2 rounded-full bg-white" />
                          </View>
                        )}
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Severity Guide */}
            <View className="mt-8 rounded-2xl bg-slate-100 p-5">
              <Text className="mb-3 text-lg font-semibold text-slate-900">
                Hướng dẫn đánh giá
              </Text>
              <View className="space-y-2">
                <Text className="text-sm text-slate-700">
                  • <Text className="font-medium">Thấp:</Text> Sự cố nhỏ, không
                  ảnh hưởng đến hoạt động
                </Text>
                <Text className="text-sm text-slate-700">
                  • <Text className="font-medium">Trung bình:</Text> Ảnh hưởng
                  một phần, cần theo dõi
                </Text>
                <Text className="text-sm text-slate-700">
                  • <Text className="font-medium">Cao:</Text> Ảnh hưởng lớn, cần
                  xử lý ngay
                </Text>
                <Text className="text-sm text-slate-700">
                  • <Text className="font-medium">Nghiêm trọng:</Text> Khẩn cấp,
                  có thể gây thiệt hại lớn
                </Text>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  }

  function renderPondSelectionModal() {
    const filteredPonds = ponds?.data?.filter((pond: Pond) =>
      pond.pondName.toLowerCase().includes(debouncedPondSearch.toLowerCase())
    );

    return (
      <Modal
        visible={showPondModal}
        animationType="slide"
        presentationStyle="pageSheet"
        statusBarTranslucent
      >
        <SafeAreaView className="flex-1 bg-slate-50">
          {/* Header */}
          <LinearGradient colors={['#3b82f6', '#1d4ed8']} className="px-6 pb-4">
            <View className="flex-row items-center justify-between pt-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white">
                  Chọn ao nuôi
                </Text>
                <Text className="mt-1 text-blue-200">
                  {selectedPonds.length} ao đã được chọn
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowPondModal(false);
                  setPondSearchQuery('');
                }}
                className="rounded-full bg-white/10 p-2"
              >
                <X className="h-6 w-6 text-white" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="mt-4 flex-row items-center rounded-2xl bg-white/10 p-2">
              <Search className="mr-3 h-5 w-5 text-blue-200" />
              <TextInput
                className="flex-1 text-base text-white"
                placeholder="Tìm kiếm ao..."
                placeholderTextColor="#94A3B8"
                value={pondSearchQuery}
                onChangeText={setPondSearchQuery}
              />
            </View>
          </LinearGradient>

          {/* Selected Ponds Quick View */}
          {selectedPonds.length > 0 && (
            <View className="border-b border-slate-200 bg-cyan-50 px-6 py-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  {selectedPonds.map((pond) => (
                    <View
                      key={pond.id}
                      className="rounded-full bg-cyan-500 px-3 py-1"
                    >
                      <Text className="text-xs font-medium text-white">
                        {pond.pondName}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Content */}
          <ScrollView
            className="flex-1 p-6"
            showsVerticalScrollIndicator={false}
          >
            {pondsLoading ? (
              <View className="items-center py-8">
                <Loading />
                <Text className="mt-4 text-slate-600">
                  Đang tải danh sách ao...
                </Text>
              </View>
            ) : (
              <View className="mb-4">
                {filteredPonds?.map((pond: Pond) => {
                  const isSelected = selectedPonds.some(
                    (sp) => sp.id === pond.id
                  );
                  return (
                    <TouchableOpacity
                      key={pond.id}
                      onPress={() => togglePondSelection(pond)}
                      className={`mb-4 rounded-2xl p-5 ${
                        isSelected
                          ? 'bg-blue-600'
                          : 'border border-slate-200 bg-white'
                      } shadow-sm`}
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <View className="flex-row items-center gap-2">
                            <Waves
                              className={`mr-3 h-5 w-5 ${
                                isSelected ? 'text-white' : 'text-cyan-500'
                              }`}
                            />
                            <View className="flex-1">
                              <Text
                                className={`text-lg font-semibold ${
                                  isSelected ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {pond.pondName}
                              </Text>
                              <View className="mt-2 flex-row flex-wrap gap-2">
                                <View
                                  className={`rounded-full px-2 py-1 ${
                                    isSelected ? 'bg-white/20' : 'bg-cyan-100'
                                  }`}
                                >
                                  <Text
                                    className={`text-xs font-medium ${
                                      isSelected
                                        ? 'text-white'
                                        : 'text-cyan-800'
                                    }`}
                                  >
                                    📏{' '}
                                    {(
                                      pond.lengthMeters * pond.widthMeters
                                    )?.toFixed(1)}
                                    m²
                                  </Text>
                                </View>
                                <View
                                  className={`rounded-full px-2 py-1 ${
                                    isSelected ? 'bg-white/20' : 'bg-slate-100'
                                  }`}
                                >
                                  <Text
                                    className={`text-xs font-medium ${
                                      isSelected
                                        ? 'text-white'
                                        : 'text-slate-700'
                                    }`}
                                  >
                                    💧 {pond.depthMeters}m
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>

                        {isSelected ? (
                          <View className="rounded-full bg-white/20 p-1">
                            <Check className="h-4 w-4 text-white" />
                          </View>
                        ) : (
                          <View className="rounded-full border border-slate-300 p-1">
                            <View className="h-4 w-4" />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {filteredPonds?.length === 0 && (
                  <View className="items-center py-8">
                    <Waves className="h-16 w-16 text-slate-300" />
                    <Text className="mt-4 text-lg font-medium text-slate-500">
                      Không tìm thấy ao nào
                    </Text>
                    <Text className="mt-2 text-center text-slate-400">
                      {pondSearchQuery
                        ? 'Thử tìm kiếm với từ khóa khác'
                        : 'Chưa có ao nào trong hệ thống'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          {selectedPonds.length > 0 && (
            <View className="border-t border-slate-200 bg-white p-6">
              <TouchableOpacity
                onPress={() => setShowPondModal(false)}
                className="rounded-2xl bg-cyan-500 py-4 shadow-lg"
              >
                <Text className="text-center text-lg font-semibold text-white">
                  Xác nhận ({selectedPonds.length} ao)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    );
  }

  function renderKoiSelectionModal() {
    const filteredKois = koiFishes?.data?.filter((koi: KoiFish) =>
      koi.rfid?.toLowerCase().includes(debouncedKoiSearch.toLowerCase())
    );

    return (
      <Modal
        visible={showKoiModal}
        animationType="slide"
        presentationStyle="pageSheet"
        statusBarTranslucent
      >
        <SafeAreaView className="flex-1 bg-slate-50">
          {/* Header */}
          <LinearGradient colors={['#3b82f6', '#1d4ed8']} className="px-6 pb-4">
            <View className="flex-row items-center justify-between pt-4">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white">
                  Chọn cá Koi
                </Text>
                <Text className="mt-1 text-blue-200">
                  {selectedKois.length} cá đã được chọn
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowKoiModal(false);
                  setKoiSearchQuery('');
                }}
                className="rounded-full bg-white/10 p-2"
              >
                <X className="h-6 w-6 text-white" />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="mt-4 flex-row items-center rounded-2xl bg-white/10 p-2">
              <Search className="mr-3 h-5 w-5 text-blue-200" />
              <TextInput
                className="flex-1 text-base text-white"
                placeholder="Tìm kiếm cá (tên hoặc RFID)..."
                placeholderTextColor="#94A3B8"
                value={koiSearchQuery}
                onChangeText={setKoiSearchQuery}
              />
            </View>
          </LinearGradient>

          {/* Selected Kois Quick View */}
          {selectedKois.length > 0 && (
            <View className="border-b border-slate-200 bg-orange-50 px-6 py-3">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 space-x-2">
                  {selectedKois.map((koi) => (
                    <View
                      key={koi.id}
                      className="rounded-full bg-orange-500 px-3 py-1"
                    >
                      <Text className="text-xs font-medium text-white">
                        {(koi as KoiFish).rfid || `#${koi.id}`}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Content */}
          <ScrollView
            className="flex-1 p-6"
            showsVerticalScrollIndicator={false}
          >
            {koisLoading ? (
              <View className="items-center py-8">
                <Loading />
                <Text className="mt-4 text-slate-600">
                  Đang tải danh sách cá...
                </Text>
              </View>
            ) : (
              <View className="">
                {filteredKois?.map((koi: KoiFish) => {
                  const isSelected = selectedKois.some(
                    (sk) => sk.id === koi.id
                  );
                  return (
                    <TouchableOpacity
                      key={koi.id}
                      onPress={() => toggleKoiSelection(koi)}
                      className={`mb-4 rounded-2xl p-5 ${
                        isSelected
                          ? 'bg-orange-500 '
                          : 'border border-slate-200 bg-white'
                      } shadow-sm`}
                    >
                      <View className="flex-row items-start justify-between">
                        <View className="flex-1">
                          <View className="flex-row items-start">
                            <FishSvg size={20} />
                            <View className="flex-1">
                              <Text
                                className={`text-lg font-semibold ${
                                  isSelected ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {koi.rfid || `Cá Koi #${koi.id}`}
                              </Text>
                              <Text
                                className={`mt-1 text-sm ${
                                  isSelected
                                    ? 'text-emerald-100'
                                    : 'text-slate-600'
                                }`}
                              >
                                RFID: {koi.rfid}
                              </Text>
                              <View className="mt-2 flex-row flex-wrap gap-2">
                                <View
                                  className={`rounded-full px-2 py-1 ${
                                    isSelected ? 'bg-white/20' : 'bg-orange-100'
                                  }`}
                                >
                                  <Text
                                    className={`text-xs font-medium ${
                                      isSelected
                                        ? 'text-white'
                                        : 'text-orange-800'
                                    }`}
                                  >
                                    🐟{' '}
                                    {(koi as KoiFish).variety.varietyName ||
                                      'Chưa xác định'}
                                  </Text>
                                </View>
                                <View
                                  className={`rounded-full px-2 py-1 ${
                                    isSelected ? 'bg-white/20' : 'bg-slate-100'
                                  }`}
                                >
                                  <Text
                                    className={`text-xs font-medium ${
                                      isSelected
                                        ? 'text-white'
                                        : 'text-slate-700'
                                    }`}
                                  >
                                    {koi.gender === Gender.MALE
                                      ? '♂ Đực'
                                      : '♀ Cái'}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>
                        </View>

                        {isSelected ? (
                          <View className="rounded-full bg-white/20 p-1">
                            <Check className="h-4 w-4 text-white" />
                          </View>
                        ) : (
                          <View className="rounded-full border border-slate-300 p-1">
                            <View className="h-4 w-4" />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}

                {filteredKois?.length === 0 && (
                  <View className="items-center py-8">
                    <FishSvg size={64} />
                    <Text className="mt-4 text-lg font-medium text-slate-500">
                      Không tìm thấy cá nào
                    </Text>
                    <Text className="mt-2 text-center text-slate-400">
                      {koiSearchQuery
                        ? 'Thử tìm kiếm với từ khóa khác'
                        : 'Chưa có cá nào trong hệ thống'}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer Actions */}
          {selectedKois.length > 0 && (
            <View className="border-t border-slate-200 bg-white p-6">
              <TouchableOpacity
                onPress={() => setShowKoiModal(false)}
                className="rounded-2xl bg-orange-300 py-4 shadow-lg"
              >
                <Text className="text-center text-lg font-semibold text-white">
                  Xác nhận ({selectedKois.length} cá)
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
      </Modal>
    );
  }
}
