import FishSvg from '@/components/icons/FishSvg';
import PondSvg from '@/components/icons/PondSvg';
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

import { useRouter } from 'expo-router';
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Droplets,
  FileText,
  Plus,
  Search,
  Stethoscope,
  Thermometer,
  Waves,
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

export default function CreateIncidentScreen() {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Search states
  const [pondSearchQuery, setPondSearchQuery] = useState('');
  const [koiSearchQuery, setKoiSearchQuery] = useState('');

  // Debounced search queries
  const debouncedPondSearch = useDebounce(pondSearchQuery, 300);
  const debouncedKoiSearch = useDebounce(koiSearchQuery, 300);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // API Hooks
  const createIncidentMutation = useCreateIncident();
  const { data: incidentTypes, isLoading: incidentTypesLoading } =
    useGetIncidentTypes();
  const { data: ponds, isLoading: pondsLoading } = useGetPonds({
    search: debouncedPondSearch,
  });
  const { data: koiFishes, isLoading: koisLoading } = useGetKoiFish({
    search: debouncedKoiSearch,
  });

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

      Alert.alert('Thành công', 'Đã tạo sự cố thành công!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
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

  const getSeverityInfo = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.Low:
        return {
          text: 'Thấp',
          gradient: ['#10b981', '#059669'],
          icon: '🟢',
          bg: 'bg-green-50',
          border: 'border-green-200',
          textColor: 'text-green-700',
        };
      case IncidentSeverity.Medium:
        return {
          text: 'Trung bình',
          gradient: ['#f59e0b', '#d97706'],
          icon: '🟡',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          textColor: 'text-yellow-700',
        };
      case IncidentSeverity.High:
        return {
          text: 'Cao',
          gradient: ['#f97316', '#ea580c'],
          icon: '🟠',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          textColor: 'text-orange-700',
        };
      case IncidentSeverity.Urgent:
        return {
          text: 'Nghiêm trọng',
          gradient: ['#ef4444', '#dc2626'],
          icon: '🔴',
          bg: 'bg-red-50',
          border: 'border-red-200',
          textColor: 'text-red-700',
        };
      default:
        return {
          text: 'Chưa đánh giá',
          gradient: ['#6b7280', '#4b5563'],
          icon: '⚪',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          textColor: 'text-gray-700',
        };
    }
  };

  const severityInfo = formData.severity
    ? getSeverityInfo(formData.severity)
    : null;

  return (
    <SafeAreaView className="flex-1 gap-4 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#1e40af" />

      {/* Header */}
      <View className="overflow-hidden shadow-lg" style={{ elevation: 8 }}>
        <LinearGradient
          colors={['#2563eb', '#1e40af']}
          className="px-6 pb-6 pt-4"
        >
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <TouchableOpacity
                onPress={() => router.back()}
                className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white/20"
                activeOpacity={0.7}
              >
                <ChevronLeft size={24} color="white" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-2xl font-black text-white">
                  Tạo sự cố
                </Text>
                <Text className="mt-0.5 text-sm text-white/80">
                  Thêm sự cố mới
                </Text>
              </View>
            </View>
          </View>

          {/* Section Tabs */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setActiveSection('basic')}
              className="flex-1 overflow-hidden rounded-2xl"
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  activeSection === 'basic'
                    ? ['#ffffff', '#f8fafc']
                    : ['#3b82f6', '#2563eb']
                }
                className="items-center py-3"
              >
                <FileText
                  size={20}
                  color={activeSection === 'basic' ? '#2563eb' : '#ffffff'}
                />
                <Text
                  className={`mt-1 text-sm font-bold ${activeSection === 'basic' ? 'text-blue-600' : 'text-white'}`}
                >
                  Thông tin cơ bản
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setActiveSection('assets')}
              className="flex-1 overflow-hidden rounded-2xl"
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  activeSection === 'assets'
                    ? ['#ffffff', '#f8fafc']
                    : ['#3b82f6', '#2563eb']
                }
                className="items-center py-3"
              >
                <Waves
                  size={20}
                  color={activeSection === 'assets' ? '#2563eb' : '#ffffff'}
                />
                <Text
                  className={`mt-1 text-sm font-bold ${activeSection === 'assets' ? 'text-blue-600' : 'text-white'}`}
                >
                  Tài sản
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        className="flex-1 "
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView className="flex-1 " showsVerticalScrollIndicator={false}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="p-6"
          >
            {/* Basic Information Section */}
            {activeSection === 'basic' && (
              <View className="flex-1 gap-4">
                {/* Severity Badge */}
                {severityInfo && (
                  <View
                    className="overflow-hidden rounded-2xl shadow-md"
                    style={{ elevation: 3 }}
                  >
                    <LinearGradient
                      colors={severityInfo.gradient as [string, string]}
                      className="flex-row items-center justify-between px-5 py-4"
                    >
                      <View className="flex-row items-center">
                        <Text className="mr-3 text-2xl">
                          {severityInfo.icon}
                        </Text>
                        <View>
                          <Text className="text-xs font-semibold uppercase tracking-wide text-white/80">
                            Mức độ nghiêm trọng
                          </Text>
                          <Text className="text-lg font-black text-white">
                            {severityInfo.text}
                          </Text>
                        </View>
                      </View>
                      <AlertTriangle size={24} color="white" />
                    </LinearGradient>
                  </View>
                )}

                {/* Form Fields */}
                <FormField
                  label="Loại sự cố"
                  required
                  icon={<AlertTriangle size={20} color="#6b7280" />}
                  value={
                    incidentTypes?.data?.find(
                      (t: IncidentType) => t.id === formData.incidentTypeId
                    )?.name || 'Chọn loại sự cố'
                  }
                  onPress={() => setShowIncidentTypeModal(true)}
                  placeholder="Chọn loại sự cố"
                />

                <FormField
                  label="Tiêu đề sự cố"
                  required
                  icon={<FileText size={20} color="#6b7280" />}
                  value={formData.incidentTitle}
                  onChangeText={(text: string) =>
                    setFormData({ ...formData, incidentTitle: text })
                  }
                  placeholder="Nhập tiêu đề sự cố"
                  multiline
                  isInput
                />

                <FormField
                  label="Mô tả chi tiết"
                  required
                  icon={<FileText size={20} color="#6b7280" />}
                  value={formData.description}
                  onChangeText={(text: string) =>
                    setFormData({ ...formData, description: text })
                  }
                  placeholder="Mô tả chi tiết về sự cố..."
                  multiline
                  isInput
                  minHeight={120}
                />

                <FormField
                  label="Mức độ nghiêm trọng"
                  required
                  icon={<Thermometer size={20} color="#6b7280" />}
                  value={
                    formData.severity
                      ? getSeverityInfo(formData.severity).text
                      : 'Chọn mức độ'
                  }
                  onPress={() => setShowSeverityModal(true)}
                  placeholder="Chọn mức độ nghiêm trọng"
                />

                <FormField
                  label="Ngày xảy ra"
                  required
                  icon={<Calendar size={20} color="#6b7280" />}
                  value={
                    formData.occurredAt
                      ? new Date(formData.occurredAt).toLocaleDateString(
                          'vi-VN'
                        )
                      : 'Chọn ngày'
                  }
                  onPress={() => setShowDatePicker(true)}
                  placeholder="Chọn ngày xảy ra"
                  rightIcon={<Clock size={20} color="#6b7280" />}
                />
              </View>
            )}

            {/* Assets Section */}
            {activeSection === 'assets' && (
              <View className="flex-1 gap-6">
                {/* Summary Stats */}
                <View className="flex-row gap-3">
                  <View
                    className="flex-1 overflow-hidden rounded-2xl shadow-md"
                    style={{ elevation: 3 }}
                  >
                    <LinearGradient
                      colors={['#06b6d4', '#0891b2']}
                      className="items-center p-5"
                    >
                      <PondSvg size={32} color="white" />
                      <Text className="mt-3 text-3xl font-black text-white">
                        {selectedPonds.length}
                      </Text>
                      <Text className="mt-1 text-sm font-semibold text-white/90">
                        Ao nuôi
                      </Text>
                    </LinearGradient>
                  </View>

                  <View
                    className="flex-1 overflow-hidden rounded-2xl shadow-md"
                    style={{ elevation: 3 }}
                  >
                    <LinearGradient
                      colors={['#f97316', '#ea580c']}
                      className="items-center p-5"
                    >
                      <FishSvg size={32} color="white" />
                      <Text className="mt-3 text-3xl font-black text-white">
                        {selectedKois.length}
                      </Text>
                      <Text className="mt-1 text-sm font-semibold text-white/90">
                        Cá Koi
                      </Text>
                    </LinearGradient>
                  </View>
                </View>

                {/* Ponds Section */}
                <View>
                  <View className="mb-4 flex-row items-center justify-between">
                    <View>
                      <Text className="text-xl font-black text-gray-900">
                        Ao nuôi
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Ao bị ảnh hưởng bởi sự cố
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowPondModal(true)}
                      className="overflow-hidden rounded-2xl shadow-md"
                      style={{ elevation: 3 }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#06b6d4', '#0891b2']}
                        className="flex-row items-center px-4 py-3"
                      >
                        <Plus size={18} color="white" />
                        <Text className="ml-2 font-bold text-white">Thêm</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {selectedPonds.length > 0 ? (
                    selectedPonds.map((pond, index) => (
                      <PondCard
                        key={pond.id}
                        pond={pond}
                        index={index}
                        onRemove={() => togglePondSelection(pond)}
                        onUpdate={updatePondField}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={<PondSvg size={48} color="#94a3b8" />}
                      text="Chưa chọn ao nào"
                    />
                  )}
                </View>

                {/* Koi Section */}
                <View>
                  <View className="mb-4 flex-row items-center justify-between">
                    <View>
                      <Text className="text-xl font-black text-gray-900">
                        Cá Koi
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Cá bị ảnh hưởng bởi sự cố
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setShowKoiModal(true)}
                      className="overflow-hidden rounded-2xl shadow-md"
                      style={{ elevation: 3 }}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#f97316', '#ea580c']}
                        className="flex-row items-center px-4 py-3"
                      >
                        <Plus size={18} color="white" />
                        <Text className="ml-2 font-bold text-white">Thêm</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {selectedKois.length > 0 ? (
                    selectedKois.map((koi, index) => (
                      <KoiCard
                        key={koi.id}
                        koi={koi}
                        index={index}
                        onRemove={() => toggleKoiSelection(koi)}
                        onUpdate={updateKoiField}
                      />
                    ))
                  ) : (
                    <EmptyState
                      icon={<FishSvg size={48} color="#94a3b8" />}
                      text="Chưa chọn cá nào"
                    />
                  )}
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View
          className="border-t border-gray-200 bg-white px-6 py-4 shadow-lg"
          style={{ elevation: 8 }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className="overflow-hidden rounded-2xl shadow-md"
            style={{ elevation: 4 }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isFormValid() && !isSubmitting
                  ? ['#2563eb', '#1e40af']
                  : ['#cbd5e1', '#94a3b8']
              }
              className="flex-row items-center justify-center py-4"
            >
              <Check size={20} color="white" />
              <Text className="ml-2 text-lg font-black text-white">
                {isSubmitting ? 'Đang tạo...' : 'Tạo sự cố'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {!isFormValid() && (
            <View className="mt-3 flex-row items-center justify-center">
              <AlertCircle size={16} color="#ef4444" />
              <Text className="ml-2 text-sm font-medium text-red-600">
                Vui lòng điền đầy đủ thông tin bắt buộc
              </Text>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={
            formData.occurredAt ? new Date(formData.occurredAt) : new Date()
          }
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          maximumDate={new Date()}
          onChange={(event, selectedDate) => {
            if (Platform.OS === 'android') {
              setShowDatePicker(false);
            }

            if (selectedDate) {
              const today = new Date();
              today.setHours(23, 59, 59, 999);

              if (selectedDate > today) {
                Alert.alert('Lỗi', 'Không được chọn ngày trong tương lai');
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
            Platform.OS === 'ios' ? { height: 200 } : { alignSelf: 'center' }
          }
          textColor="#1E293B"
        />
      )}

      {/* Modals */}
      {renderIncidentTypeModal()}
      {renderSeverityModal()}
      {renderPondSelectionModal()}
      {renderKoiSelectionModal()}
    </SafeAreaView>
  );

  // Helper Components (copied from edit screen to keep parity)
  function FormField({
    label,
    required,
    icon,
    value,
    onPress,
    onChangeText,
    placeholder,
    multiline,
    isInput,
    minHeight,
    rightIcon,
  }: any) {
    return (
      <View>
        <View className="mb-2 flex-row items-center">
          <Text className="text-sm font-bold uppercase  text-gray-600">
            {label}
          </Text>
          {required && (
            <View className="ml-2 rounded-full bg-red-100 px-2 py-0.5">
              <Text className="text-xs font-bold text-red-600">Bắt buộc</Text>
            </View>
          )}
        </View>

        {isInput ? (
          <View
            className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-sm"
            style={{ elevation: 2 }}
          >
            <View className="flex-row items-start border-b border-gray-100 px-4 py-3">
              {icon}
              <View className="ml-3 flex-1">
                <TextInput
                  value={value}
                  onChangeText={onChangeText}
                  placeholder={placeholder}
                  placeholderTextColor="#9ca3af"
                  multiline={multiline}
                  className="text-base text-gray-900"
                  style={
                    minHeight ? { minHeight, textAlignVertical: 'top' } : {}
                  }
                />
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onPress}
            className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-sm"
            style={{ elevation: 2 }}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between px-4 py-4">
              <View className="flex-1 flex-row items-center">
                {icon}
                <Text
                  className={`ml-3 text-base ${value.startsWith('Chọn') ? 'text-gray-400' : 'font-semibold text-gray-900'}`}
                >
                  {value}
                </Text>
              </View>
              {rightIcon || <ChevronRight size={20} color="#9ca3af" />}
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  function EmptyState({ icon, text }: any) {
    return (
      <View className="items-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 py-12">
        {icon}
        <Text className="mt-3 text-base font-medium text-gray-500">{text}</Text>
      </View>
    );
  }

  function PondCard({ pond, index, onRemove, onUpdate }: any) {
    return (
      <View
        className="mb-4 overflow-hidden rounded-2xl border-2 border-cyan-200 bg-white shadow-md"
        style={{ elevation: 3 }}
      >
        {/* Header */}
        <LinearGradient colors={['#06b6d4', '#0891b2']} className="px-5 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <PondSvg size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-black text-white">
                  {pond.pondName}
                </Text>
                <Text className="text-sm text-white/80">
                  {(pond.lengthMeters * pond.widthMeters)?.toFixed(1)}m² • Độ
                  sâu: {pond.depth}m
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onRemove}
              className="h-10 w-10 items-center justify-center rounded-full bg-red-500 shadow-lg"
              style={{ elevation: 4 }}
              activeOpacity={0.7}
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <View className="flex-1 gap-4 p-5">
          <InputField
            label="Thay đổi môi trường"
            value={pond.environmentalChanges}
            onChangeText={(text: string) =>
              onUpdate(pond.id, 'environmentalChanges', text)
            }
            placeholder="Mô tả các thay đổi môi trường..."
            multiline
          />

          <InputField
            label="Biện pháp khắc phục"
            value={pond.correctiveActions}
            onChangeText={(text: string) =>
              onUpdate(pond.id, 'correctiveActions', text)
            }
            placeholder="Các biện pháp đã thực hiện..."
            multiline
          />

          <InputField
            label="Số cá chết"
            value={pond.fishDiedCount?.toString() || '0'}
            onChangeText={(text: string) =>
              onUpdate(pond.id, 'fishDiedCount', parseInt(text) || 0)
            }
            placeholder="0"
            keyboardType="numeric"
          />

          <InputField
            label="Ghi chú"
            value={pond.notes}
            onChangeText={(text: string) => onUpdate(pond.id, 'notes', text)}
            placeholder="Ghi chú thêm..."
            multiline
          />

          <View className="flex-row items-center justify-between rounded-2xl bg-cyan-50 px-4 py-3">
            <View className="flex-row items-center">
              <Droplets size={20} color="#0891b2" />
              <Text className="ml-2 font-bold text-cyan-900">
                Cần thay nước
              </Text>
            </View>
            <TouchableOpacity
              onPress={() =>
                onUpdate(
                  pond.id,
                  'requiresWaterChange',
                  !pond.requiresWaterChange
                )
              }
              className={`h-8 w-14 items-center justify-center rounded-full ${pond.requiresWaterChange ? 'bg-cyan-500' : 'bg-gray-300'}`}
              activeOpacity={0.8}
            >
              <View
                className={`h-6 w-6 rounded-full bg-white shadow-md ${pond.requiresWaterChange ? 'self-end' : 'self-start'}`}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  function KoiCard({ koi, index, onRemove, onUpdate }: any) {
    return (
      <View
        className="mb-4 overflow-hidden rounded-2xl border-2 border-orange-200 bg-white shadow-md"
        style={{ elevation: 3 }}
      >
        {/* Header */}
        <LinearGradient colors={['#f97316', '#ea580c']} className="px-5 py-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <View className="mr-3 h-12 w-12 items-center justify-center rounded-full bg-white/20">
                <FishSvg size={24} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-black text-white">
                  {koi.koiName || `Cá #${koi.id}`}
                </Text>
                <Text className="text-sm text-white/80">RFID: {koi.rfid}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onRemove}
              className="h-10 w-10 items-center justify-center rounded-full bg-red-500 shadow-lg"
              style={{ elevation: 4 }}
              activeOpacity={0.7}
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Content */}
        <View className="flex-1 gap-4 p-5">
          {/* Status Selection */}
          <View>
            <Text className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-600">
              Trạng thái
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {Object.values(KoiAffectedStatus).map((status) => {
                const statusInfo = getAffectedStatusInfo(status);
                const isSelected = koi.affectedStatus === status;
                return (
                  <TouchableOpacity
                    key={`${koi.id}-${status}`}
                    onPress={() => onUpdate(koi.id, 'affectedStatus', status)}
                    className="overflow-hidden rounded-lg"
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={
                        isSelected
                          ? ['#f97316', '#ea580c']
                          : ['#f3f4f6', '#e5e7eb']
                      }
                      className="px-4 py-2"
                    >
                      <Text
                        className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-600'}`}
                      >
                        {statusInfo.label}
                      </Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <InputField
            label="Triệu chứng"
            value={koi.specificSymptoms}
            onChangeText={(text: string) =>
              onUpdate(koi.id, 'specificSymptoms', text)
            }
            placeholder="Mô tả triệu chứng cụ thể..."
            multiline
          />

          <InputField
            label="Ghi chú điều trị"
            value={koi.treatmentNotes}
            onChangeText={(text: string) =>
              onUpdate(koi.id, 'treatmentNotes', text)
            }
            placeholder="Ghi chú về điều trị..."
            multiline
          />

          {/* Toggles */}
          <View className="flex-row gap-3">
            <View className="flex-1 flex-row items-center justify-between rounded-2xl bg-orange-50 px-4 py-3">
              <View className="flex-row items-center">
                <Stethoscope size={16} color="#ea580c" />
                <Text className="ml-2 text-xs font-bold text-orange-900">
                  Điều trị
                </Text>
              </View>
              <TouchableOpacity
                onPress={() =>
                  onUpdate(koi.id, 'requiresTreatment', !koi.requiresTreatment)
                }
                className={`h-6 w-6 items-center justify-center rounded-full ${koi.requiresTreatment ? 'bg-orange-500' : 'bg-gray-300'}`}
                activeOpacity={0.8}
              >
                {koi.requiresTreatment && <Check size={14} color="white" />}
              </TouchableOpacity>
            </View>

            <View className="flex-1 flex-row items-center justify-between rounded-2xl bg-orange-50 px-4 py-3">
              <View className="flex-row items-center">
                <Droplets size={16} color="#ea580c" />
                <Text className="ml-2 text-xs font-bold text-orange-900">
                  Cách ly
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => onUpdate(koi.id, 'isIsolated', !koi.isIsolated)}
                className={`h-6 w-6 items-center justify-center rounded-full ${koi.isIsolated ? 'bg-orange-500' : 'bg-gray-300'}`}
                activeOpacity={0.8}
              >
                {koi.isIsolated && <Check size={14} color="white" />}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  }

  function InputField({
    label,
    value,
    onChangeText,
    placeholder,
    multiline,
    keyboardType,
  }: any) {
    return (
      <View>
        <Text className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-600">
          {label}
        </Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          multiline={multiline}
          keyboardType={keyboardType}
          className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-base text-gray-900"
          style={multiline ? { minHeight: 80, textAlignVertical: 'top' } : {}}
        />
      </View>
    );
  }

  // Modal render functions (kept parity with edit screen)
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
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="border-b border-gray-200 px-6 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-black text-gray-900">
                Chọn loại sự cố
              </Text>
              <TouchableOpacity
                onPress={() => setShowIncidentTypeModal(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="flex-1 p-6">
            {incidentTypesLoading ? (
              <View className="flex-1 items-center justify-center py-20">
                <Loading />
              </View>
            ) : (
              filteredIncidentTypes?.map((type: IncidentType) => (
                <TouchableOpacity
                  key={type.id}
                  onPress={() => {
                    setFormData({ ...formData, incidentTypeId: type.id });
                    setShowIncidentTypeModal(false);
                  }}
                  className={`mb-3 overflow-hidden rounded-2xl border-2 ${formData.incidentTypeId === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} shadow-sm`}
                  style={{ elevation: 2 }}
                >
                  <View className="flex-row items-center justify-between p-4">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-gray-900">
                        {type.name}
                      </Text>
                      {type.description && (
                        <Text className="mt-1 text-sm text-gray-500">
                          {type.description}
                        </Text>
                      )}
                    </View>
                    {formData.incidentTypeId === type.id && (
                      <View className="ml-3 h-8 w-8 items-center justify-center rounded-full bg-blue-500">
                        <Check size={18} color="white" />
                      </View>
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
        gradient: ['#10b981', '#059669'],
        icon: '🟢',
      },
      {
        value: IncidentSeverity.Medium,
        label: 'Trung bình',
        description: 'Ảnh hưởng ở mức độ vừa',
        gradient: ['#f59e0b', '#d97706'],
        icon: '🟡',
      },
      {
        value: IncidentSeverity.High,
        label: 'Cao',
        description: 'Sự cố nghiêm trọng, cần xử lý ngay',
        gradient: ['#f97316', '#ea580c'],
        icon: '🟠',
      },
      {
        value: IncidentSeverity.Urgent,
        label: 'Nghiêm trọng',
        description: 'Khẩn cấp, cần xử lý tức thì',
        gradient: ['#ef4444', '#dc2626'],
        icon: '🔴',
      },
    ];

    return (
      <Modal
        visible={showSeverityModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="border-b border-gray-200 px-6 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-black text-gray-900">
                Mức độ nghiêm trọng
              </Text>
              <TouchableOpacity
                onPress={() => setShowSeverityModal(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
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
                className={`mb-4 overflow-hidden rounded-2xl border-2 ${formData.severity === option.value ? 'border-blue-500' : 'border-gray-200'} shadow-md`}
                style={{ elevation: 3 }}
              >
                <LinearGradient
                  colors={option.gradient as [string, string]}
                  className="p-5"
                >
                  <View className="flex-row items-center">
                    <Text className="mr-4 text-3xl">{option.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-xl font-black text-white">
                        {option.label}
                      </Text>
                      <Text className="mt-1 text-sm text-white/90">
                        {option.description}
                      </Text>
                    </View>
                    {formData.severity === option.value && (
                      <View className="ml-3 h-10 w-10 items-center justify-center rounded-full bg-white/20">
                        <Check size={24} color="white" />
                      </View>
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
    const filteredPonds = ponds?.data?.filter((pond: Pond) =>
      pond.pondName.toLowerCase().includes(debouncedPondSearch.toLowerCase())
    );

    return (
      <Modal
        visible={showPondModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="border-b border-gray-200 px-6 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-black text-gray-900">Chọn ao</Text>
              <TouchableOpacity
                onPress={() => setShowPondModal(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="mt-4 flex-row items-center rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3">
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
              <View className="flex-1 items-center justify-center py-20">
                <Loading />
              </View>
            ) : (
              filteredPonds?.map((pond: Pond) => {
                const isSelected = selectedPonds.some(
                  (sp) => sp.id === pond.id
                );
                return (
                  <TouchableOpacity
                    key={pond.id}
                    onPress={() => togglePondSelection(pond)}
                    className={`mb-3 overflow-hidden rounded-2xl border-2 ${isSelected ? 'border-cyan-500 bg-cyan-50' : 'border-gray-200 bg-white'} shadow-sm`}
                    style={{ elevation: 2 }}
                  >
                    <View className="flex-row items-center justify-between p-4">
                      <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900">
                          {pond.pondName}
                        </Text>
                        <Text className="mt-1 text-sm text-gray-500">
                          {(pond.lengthMeters * pond.widthMeters).toFixed(1)}m²
                          • Độ sâu: {pond.depthMeters}m
                        </Text>
                      </View>
                      {isSelected && (
                        <View className="ml-3 h-8 w-8 items-center justify-center rounded-full bg-cyan-500">
                          <Check size={18} color="white" />
                        </View>
                      )}
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
    const filteredKois = koiFishes?.data?.filter((koi: KoiFish) =>
      koi.rfid?.toLowerCase().includes(debouncedKoiSearch.toLowerCase())
    );

    return (
      <Modal
        visible={showKoiModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="border-b border-gray-200 px-6 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-xl font-black text-gray-900">
                Chọn cá Koi
              </Text>
              <TouchableOpacity
                onPress={() => setShowKoiModal(false)}
                className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View className="mt-4 flex-row items-center rounded-2xl border border-gray-200 bg-gray-100 px-4 py-3">
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
              <View className="flex-1 items-center justify-center py-20">
                <Loading />
              </View>
            ) : (
              filteredKois?.map((koi: KoiFish) => {
                const isSelected = selectedKois.some((sk) => sk.id === koi.id);
                return (
                  <TouchableOpacity
                    key={koi.id}
                    onPress={() => toggleKoiSelection(koi)}
                    className={`mb-3 overflow-hidden rounded-2xl border-2 ${isSelected ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'} shadow-sm`}
                    style={{ elevation: 2 }}
                  >
                    <View className="flex-row items-center justify-between p-4">
                      <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900">
                          {koi.rfid}
                        </Text>
                        <Text className="mt-1 text-sm text-gray-500">
                          Size: {koi.size} •{' '}
                          {koi.gender === Gender.MALE ? 'Đực' : 'Cái'}
                        </Text>
                      </View>
                      {isSelected && (
                        <View className="ml-3 h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                          <Check size={18} color="white" />
                        </View>
                      )}
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
