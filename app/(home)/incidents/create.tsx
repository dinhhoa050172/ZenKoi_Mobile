import ContextMenuMultiSelect from '@/components/ContextMenuMultiSelect';
import { CustomAlert } from '@/components/CustomAlert';
import FishSvg from '@/components/icons/FishSvg';
import PondSvg from '@/components/icons/PondSvg';
import InputField from '@/components/InputField';
// Loading component not needed here (used in other screens)
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
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Waves,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import KoiCard from '@/components/incidents/KoiCard';
import PondCard from '@/components/incidents/PondCard';

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // API Hooks
  const createIncidentMutation = useCreateIncident();
  const incidentTypesQuery = useGetIncidentTypes();
  const incidentTypes = incidentTypesQuery.data;
  const { data: ponds, isLoading: pondsLoading } = useGetPonds({
    pageIndex: 1,
    pageSize: 100,
  });
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
  const [showSeverityModal, setShowSeverityModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // CustomAlert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

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
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Vui lòng điền đầy đủ thông tin cơ bản của sự cố.',
        type: 'danger',
      });
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

      setAlertConfig({
        visible: true,
        title: 'Thành công',
        message: 'Đã tạo sự cố thành công!',
        type: 'info',
        onConfirm: () => router.back(),
      });
    } catch (error: any) {
      console.error('Error creating incident:', error);
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: error?.message || 'Không thể tạo sự cố. Vui lòng thử lại.',
        type: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Selection handlers for ContextMenuMultiSelect
  const handlePondSelectionChange = (pondIds: string[]) => {
    const allPonds = ponds?.data || [];

    // Keep existing selected ponds that are still in the new selection
    const updatedPonds = selectedPonds.filter((sp) =>
      pondIds.includes(sp.id.toString())
    );

    // Add new ponds that weren't previously selected
    const newPondIds = pondIds.filter(
      (id) => !selectedPonds.some((sp) => sp.id.toString() === id)
    );

    newPondIds.forEach((id) => {
      const pond = allPonds.find((p: Pond) => p.id.toString() === id);
      if (pond) {
        const newPond: SelectedPond = {
          ...pond,
          environmentalChanges: '',
          requiresWaterChange: false,
          fishDiedCount: 0,
          correctiveActions: '',
          notes: '',
        };
        updatedPonds.push(newPond);
      }
    });

    setSelectedPonds(updatedPonds);
  };

  const handleKoiSelectionChange = (koiIds: string[]) => {
    const allKois = koiFishes?.data || [];

    // Keep existing selected kois that are still in the new selection
    const updatedKois = selectedKois.filter((sk) =>
      koiIds.includes(sk.id.toString())
    );

    // Add new kois that weren't previously selected
    const newKoiIds = koiIds.filter(
      (id) => !selectedKois.some((sk) => sk.id.toString() === id)
    );

    newKoiIds.forEach((id) => {
      const koi = allKois.find((k: KoiFish) => k.id.toString() === id);
      if (koi) {
        const newKoi: SelectedKoi = {
          ...koi,
          affectedStatus: KoiAffectedStatus.HEALTHY,
          specificSymptoms: '',
          requiresTreatment: false,
          isIsolated: false,
          treatmentNotes: '',
          affectedFrom: new Date().toISOString(),
        };
        updatedKois.push(newKoi);
      }
    });

    setSelectedKois(updatedKois);
  };

  const removePond = (pondId: number) => {
    setSelectedPonds(selectedPonds.filter((sp) => sp.id !== pondId));
  };

  const removeKoi = (koiId: number) => {
    setSelectedKois(selectedKois.filter((sk) => sk.id !== koiId));
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
        <ScrollView
          className="flex-1 "
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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

                <View>
                  <InputField
                    // icon={<FileText size={20} color="#6b7280" />}
                    label="Tiêu đề sự cố *"
                    placeholder="Nhập tiêu đề sự cố"
                    value={formData.incidentTitle}
                    onChangeText={(text: string) =>
                      setFormData({ ...formData, incidentTitle: text })
                    }
                    // iconBg="bg-blue-100"
                    multiline
                  />
                </View>

                <View>
                  <InputField
                    // icon={<FileText size={20} color="#6b7280" />}
                    label="Mô tả chi tiết *"
                    placeholder="Mô tả chi tiết về sự cố..."
                    value={formData.description}
                    onChangeText={(text: string) =>
                      setFormData({ ...formData, description: text })
                    }
                    // iconBg="bg-blue-100"
                    multiline
                  />
                </View>

                {/* Form Fields */}
                <View>
                  <ContextMenuMultiSelect
                    label="Loại sự cố"
                    options={
                      incidentTypes?.data?.map((t: IncidentType) => ({
                        label: t.name,
                        value: String(t.id),
                        meta: t.description || undefined,
                      })) || []
                    }
                    values={
                      formData.incidentTypeId
                        ? [String(formData.incidentTypeId)]
                        : []
                    }
                    onPress={() => incidentTypesQuery.refetch()}
                    onChange={(vals) => {
                      const v = vals[0];
                      setFormData({
                        ...formData,
                        incidentTypeId: v ? Number(v) : undefined,
                      });
                    }}
                    placeholder="Chọn loại sự cố"
                  />
                </View>

                <View>
                  <TouchableOpacity
                    onPress={() => setShowSeverityModal(true)}
                    className="flex-row items-center rounded-2xl border border-gray-200 bg-gray-50 p-3"
                  >
                    <Text
                      className={`flex-1 text-base ${
                        formData.severity
                          ? 'font-medium text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {formData.severity
                        ? getSeverityInfo(formData.severity).text
                        : 'Chọn mức độ'}
                    </Text>
                    <ChevronRight size={20} color="#9ca3af" />
                  </TouchableOpacity>
                </View>

                <View>
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="flex-row items-center rounded-2xl border border-gray-200 bg-gray-50 p-3"
                  >
                    <Text
                      className={`flex-1 text-base ${
                        formData.occurredAt
                          ? 'font-medium text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {formData.occurredAt
                        ? new Date(formData.occurredAt).toLocaleDateString(
                            'vi-VN'
                          )
                        : 'Chọn ngày'}
                    </Text>
                    <Clock size={20} color="#6b7280" />
                  </TouchableOpacity>
                </View>
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
                  <View className="mb-4">
                    <Text className="mb-2 text-xl font-black text-gray-900">
                      Ao nuôi
                    </Text>
                    <Text className="mb-3 text-sm text-gray-500">
                      Ao bị ảnh hưởng bởi sự cố
                    </Text>

                    <ContextMenuMultiSelect
                      label="Chọn ao nuôi"
                      placeholder="Chọn các ao bị ảnh hưởng"
                      options={
                        pondsLoading
                          ? [{ label: 'Đang tải...', value: '', meta: '' }]
                          : (ponds?.data || []).map((pond: Pond) => ({
                              label: pond.pondName,
                              value: pond.id.toString(),
                              meta: `${pond.pondTypeName || 'N/A'} - ${pond.capacityLiters}L`,
                            }))
                      }
                      values={selectedPonds.map((p) => p.id.toString())}
                      onChange={handlePondSelectionChange}
                      disabled={pondsLoading}
                    />
                  </View>

                  {selectedPonds.length > 0 ? (
                    selectedPonds.map((pond, index) => (
                      <PondCard
                        key={pond.id}
                        pond={pond}
                        index={index}
                        onRemove={() => removePond(pond.id)}
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
                  <View className="mb-4">
                    <Text className="mb-2 text-xl font-black text-gray-900">
                      Cá Koi
                    </Text>
                    <Text className="mb-3 text-sm text-gray-500">
                      Cá bị ảnh hưởng bởi sự cố
                    </Text>

                    <ContextMenuMultiSelect
                      label="Chọn cá Koi"
                      placeholder="Chọn các cá bị ảnh hưởng"
                      options={
                        koisLoading
                          ? [{ label: 'Đang tải...', value: '', meta: '' }]
                          : (koiFishes?.data || []).map((koi: KoiFish) => ({
                              label: koi.rfid || `Cá #${koi.id}`,
                              value: koi.id.toString(),
                              meta: `${koi.variety?.varietyName || 'Không xác định'} - ${koi.gender === Gender.MALE ? 'Đực' : 'Cái'}`,
                            }))
                      }
                      values={selectedKois.map((k) => k.id.toString())}
                      onChange={handleKoiSelectionChange}
                      disabled={koisLoading}
                    />
                  </View>

                  {selectedKois.length > 0 ? (
                    selectedKois.map((koi, index) => (
                      <KoiCard
                        key={koi.id}
                        koi={koi}
                        index={index}
                        onRemove={() => removeKoi(koi.id)}
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
      {showDatePicker &&
        (Platform.OS === 'ios' ? (
          <Modal
            visible
            transparent
            animationType="slide"
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View className="flex-1 justify-end bg-black/40">
              <View className="w-full rounded-t-2xl bg-white p-4">
                <DateTimePicker
                  value={
                    formData.occurredAt
                      ? new Date(formData.occurredAt)
                      : new Date()
                  }
                  mode="date"
                  display="spinner"
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    if (!selectedDate) return;
                    const today = new Date();
                    today.setHours(23, 59, 59, 999);

                    if (selectedDate > today) {
                      setAlertConfig({
                        visible: true,
                        title: 'Lỗi',
                        message: 'Không được chọn ngày trong tương lai',
                        type: 'warning',
                      });
                      return;
                    }

                    const dateOnly = new Date(selectedDate);
                    dateOnly.setHours(0, 0, 0, 0);

                    setFormData({
                      ...formData,
                      occurredAt: dateOnly.toISOString(),
                    });
                  }}
                  style={{ height: 200 }}
                  textColor="#1E293B"
                />
                <View className="mt-2 flex-row justify-end">
                  <TouchableOpacity
                    onPress={() => setShowDatePicker(false)}
                    className="rounded-2xl px-4 py-2"
                    accessibilityLabel="Done"
                  >
                    <Text className="font-medium text-primary">Xong</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={
              formData.occurredAt ? new Date(formData.occurredAt) : new Date()
            }
            mode="date"
            display="calendar"
            maximumDate={new Date()}
            onChange={(event, selectedDate) => {
              if (Platform.OS === 'android') {
                setShowDatePicker(false);
              }

              if (selectedDate) {
                const today = new Date();
                today.setHours(23, 59, 59, 999);

                if (selectedDate > today) {
                  setAlertConfig({
                    visible: true,
                    title: 'Lỗi',
                    message: 'Không được chọn ngày trong tương lai',
                    type: 'warning',
                  });
                  return;
                }

                const dateOnly = new Date(selectedDate);
                dateOnly.setHours(0, 0, 0, 0);

                setFormData({
                  ...formData,
                  occurredAt: dateOnly.toISOString(),
                });
              }
            }}
            style={{ alignSelf: 'center' }}
          />
        ))}

      {/* Modals */}
      {renderSeverityModal()}

      {/* CustomAlert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onCancel={() =>
          setAlertConfig({ visible: false, title: '', message: '' })
        }
        onConfirm={() => {
          alertConfig.onConfirm?.();
          setAlertConfig({ visible: false, title: '', message: '' });
        }}
        cancelText="Đóng"
        confirmText="OK"
      />
    </SafeAreaView>
  );

  function EmptyState({ icon, text }: any) {
    return (
      <View className="items-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 py-12">
        {icon}
        <Text className="mt-3 text-base font-medium text-gray-500">{text}</Text>
      </View>
    );
  }

  // Modal render functions (kept parity with edit screen)

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
}
