import ContextMenuField from '@/components/ContextMenuField';
import ContextMenuMultiSelect from '@/components/ContextMenuMultiSelect';
import { CustomAlert } from '@/components/CustomAlert';
import FishSvg from '@/components/icons/FishSvg';
import PondSvg from '@/components/icons/PondSvg';
import InputField from '@/components/InputField';
import Loading from '@/components/Loading';
import { useGetIncidentById, useUpdateIncident } from '@/hooks/useIncident';
import { useGetIncidentTypes } from '@/hooks/useIncidentType';
import { useGetKoiFish } from '@/hooks/useKoiFish';
import { useGetPonds } from '@/hooks/usePond';
import { useUploadImage } from '@/hooks/useUpload';
import {
  KoiAffectedStatus,
  KoiIncidentRequest,
  PondIncidentRequest,
  RequestIncident,
} from '@/lib/api/services/fetchIncident';
import { IncidentType } from '@/lib/api/services/fetchIncidentType';
import { Gender, KoiFish, SaleStatus } from '@/lib/api/services/fetchKoiFish';
import { Pond } from '@/lib/api/services/fetchPond';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import KoiCard from '@/components/incidents/KoiCard';
import PondCard from '@/components/incidents/PondCard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircle,
  Camera,
  Check,
  ChevronLeft,
  Clock,
  FileText,
  Image as ImageIcon,
  Trash2,
  Waves,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
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
  }, [fadeAnim, slideAnim]);

  // API Hooks
  const incidentId = parseInt(id, 10);
  const { data: incident, isLoading: incidentLoading } =
    useGetIncidentById(incidentId);
  const updateIncidentMutation = useUpdateIncident();
  const incidentTypesQuery = useGetIncidentTypes();
  const incidentTypes = incidentTypesQuery.data;
  const { data: ponds, isLoading: pondsLoading } = useGetPonds({
    pageIndex: 1,
    pageSize: 100,
  });
  const { data: koiFishes, isLoading: koisLoading } = useGetKoiFish({
    saleStatus: SaleStatus.NOT_FOR_SALE,
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
    occurredAt: undefined as string | undefined,
  });

  // Selected assets
  const [selectedPonds, setSelectedPonds] = useState<SelectedPond[]>([]);
  const [selectedKois, setSelectedKois] = useState<SelectedKoi[]>([]);

  // Image state
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const uploadImageMutation = useUploadImage();

  // Modal States
  const [showDatePicker, setShowDatePicker] = useState(false);

  // CustomAlert state
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm?: () => void;
  }>({ visible: false, title: '', message: '' });

  // Pre-populate form with incident data
  useEffect(() => {
    if (incident) {
      setFormData({
        incidentTypeId: incident.incidentType.id,
        incidentTitle: incident.incidentTitle,
        description: incident.description,
        occurredAt: incident.occurredAt,
      });

      // Pre-populate images
      if (incident.reportImages && incident.reportImages.length > 0) {
        setSelectedImages(incident.reportImages);
      }

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

      if (incident.koiIncidents && koiFishes?.data) {
        const selectedKoisList: SelectedKoi[] = incident.koiIncidents
          .map((koiIncident) => {
            const koi = koiFishes.data.find(
              (k: KoiFish) => k.id === koiIncident.koiFishId
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
      formData.occurredAt;

    // Require at least one pond or koi
    const hasAssets = selectedPonds.length > 0 || selectedKois.length > 0;

    const pondsValid = selectedPonds.every((pond) => {
      return pond.environmentalChanges?.trim();
    });

    const koisValid = selectedKois.every((koi) => {
      return koi.specificSymptoms?.trim();
    });

    return basicFormValid && hasAssets && pondsValid && koisValid;
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
      // Upload images first
      const uploadedUrls: string[] = [];
      for (const imageUri of selectedImages) {
        // Skip images that are already uploaded (URLs)
        if (imageUri.startsWith('http')) {
          uploadedUrls.push(imageUri);
          continue;
        }

        try {
          const filename = imageUri.split('/').pop() || 'incident.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          const fileForUpload: any = { uri: imageUri, name: filename, type };

          const uploadRes = await uploadImageMutation.mutateAsync({
            file: fileForUpload,
          });
          const remoteUrl = uploadRes?.result?.url;

          if (remoteUrl) {
            uploadedUrls.push(remoteUrl);
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          setAlertConfig({
            visible: true,
            title: 'Lỗi',
            message: 'Không thể tải lên ảnh. Vui lòng thử lại.',
            type: 'danger',
          });
          setIsSubmitting(false);
          return;
        }
      }

      const affectedPonds: PondIncidentRequest[] = selectedPonds.map(
        (pond) => ({
          pondId: pond.id,
          pondName: pond.pondName,
          environmentalChanges: pond.environmentalChanges || '',
          requiresWaterChange: pond.requiresWaterChange || false,
          fishDiedCount: 0,
          correctiveActions: '',
          notes: pond.notes || '',
        })
      );

      const affectedKoiFish: KoiIncidentRequest[] = selectedKois.map((koi) => ({
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
        occurredAt: formData.occurredAt!,
        reportImages: uploadedUrls,
        affectedPonds: affectedPonds.length > 0 ? affectedPonds : undefined,
        affectedKoiFish:
          affectedKoiFish.length > 0 ? affectedKoiFish : undefined,
      };

      await updateIncidentMutation.mutateAsync({
        id: incidentId,
        data: incidentPayload,
      });

      setAlertConfig({
        visible: true,
        title: 'Thành công',
        message: 'Đã cập nhật sự cố thành công!',
        type: 'info',
        onConfirm: () => router.back(),
      });
    } catch (error: any) {
      console.error('Error updating incident:', error);
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message:
          error?.message || 'Không thể cập nhật sự cố. Vui lòng thử lại.',
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

  // Image picker functions
  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setAlertConfig({
          visible: true,
          title: 'Quyền truy cập',
          message: 'Cần quyền truy cập camera để chụp ảnh.',
          type: 'warning',
        });
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImages((prev) => [...prev, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Không thể chụp ảnh. Vui lòng thử lại.',
        type: 'danger',
      });
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setAlertConfig({
          visible: true,
          title: 'Quyền truy cập',
          message: 'Cần quyền truy cập thư viện ảnh.',
          type: 'warning',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newImages = result.assets.map((asset) => asset.uri);
        setSelectedImages((prev) => [...prev, ...newImages]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message: 'Không thể chọn ảnh. Vui lòng thử lại.',
        type: 'danger',
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Loading screen
  if (incidentLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50">
        <Loading />
      </SafeAreaView>
    );
  }

  if (!incident) {
    return (
      <SafeAreaView className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-50">
        <View className="flex-1 items-center justify-center p-6">
          <View
            className="items-center rounded-3xl bg-white p-8 shadow-2xl"
            style={{ elevation: 8 }}
          >
            <AlertCircle size={64} color="#ef4444" />
            <Text className="mt-4 text-xl font-bold text-red-600">
              Không tìm thấy sự cố
            </Text>
            <Text className="mt-2 text-center text-gray-600">
              Sự cố này có thể đã bị xóa hoặc không tồn tại
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-6 overflow-hidden rounded-2xl"
            >
              <LinearGradient
                colors={['#3b82f6', '#2563eb']}
                className="px-8 py-4"
              >
                <Text className="font-bold text-white">Quay lại</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
                  Chỉnh sửa sự cố
                </Text>
                <Text className="mt-0.5 text-sm text-white/80">
                  Cập nhật thông tin chi tiết
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
      <KeyboardAwareScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        {/* <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="p-6"
        > */}
        {/* Basic Information Section */}
        {activeSection === 'basic' && (
          <View className="flex-1 gap-4 p-2">
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

            {/* Form Fields */}
            <View>
              <ContextMenuField
                label="Loại sự cố"
                options={
                  incidentTypes?.data?.map((t: IncidentType) => ({
                    label: t.name,
                    value: String(t.id),
                    meta: t.description || undefined,
                  })) || []
                }
                value={
                  formData.incidentTypeId
                    ? String(formData.incidentTypeId)
                    : undefined
                }
                onPress={() => incidentTypesQuery.refetch()}
                onSelect={(v) => {
                  setFormData({
                    ...formData,
                    incidentTypeId: v ? Number(v) : undefined,
                  });
                }}
                placeholder="Chọn loại sự cố"
              />
            </View>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white shadow-sm"
              style={{ elevation: 2 }}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center justify-between px-4 py-4">
                <View className="flex-1 flex-row items-center">
                  <Text className="ml-3 text-base font-medium text-gray-600">
                    Ngày xảy ra *
                  </Text>
                </View>
                <View className="flex-row gap-4">
                  <Text className="text-base text-gray-900">
                    {formData.occurredAt
                      ? new Date(formData.occurredAt).toLocaleDateString(
                          'vi-VN'
                        )
                      : 'Chọn ngày'}
                  </Text>
                  <Clock size={20} color="#6b7280" />
                </View>
              </View>
            </TouchableOpacity>

            {/* Image Upload Section */}
            <View className="gap-3">
              <Text className="text-base font-semibold text-gray-700">
                Hình ảnh minh chứng
              </Text>

              {/* Image Picker Buttons */}
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={takePhoto}
                  className="flex-1 overflow-hidden rounded-full shadow-sm"
                  style={{ elevation: 2 }}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#3b82f6', '#2563eb']}
                    className="flex-row items-center justify-center gap-2 p-4"
                  >
                    <Camera size={20} color="white" />
                    <Text className="text-sm font-semibold text-white">
                      Chụp ảnh
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={pickImage}
                  className="flex-1 overflow-hidden rounded-full shadow-sm"
                  style={{ elevation: 2 }}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#8b5cf6', '#7c3aed']}
                    className="flex-row items-center justify-center gap-2 p-4"
                  >
                    <ImageIcon size={20} color="white" />
                    <Text className="text-sm font-semibold text-white">
                      Chọn ảnh
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Image Preview */}
              {selectedImages.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="gap-3"
                  contentContainerStyle={{ gap: 12 }}
                >
                  {selectedImages.map((uri, index) => (
                    <View
                      key={index}
                      className="relative overflow-hidden rounded-3xl"
                    >
                      <Image
                        source={{ uri }}
                        style={{ width: 120, height: 120, resizeMode: 'cover' }}
                      />
                      <TouchableOpacity
                        onPress={() => removeImage(index)}
                        className="absolute right-2 top-2 overflow-hidden rounded-full bg-red-500 p-2 shadow-lg"
                        style={{ elevation: 4 }}
                        activeOpacity={0.7}
                      >
                        <Trash2 size={16} color="white" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        )}

        {/* Assets Section */}
        {activeSection === 'assets' && (
          <View className="flex-1 gap-6 p-2">
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
        {/* </Animated.View> */}

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
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật sự cố'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {!isFormValid() && (
            <View className="mt-3 flex-row items-center justify-center">
              <AlertCircle size={16} color="#ef4444" />
              <Text className="ml-2 text-sm font-medium text-red-600">
                Vui lòng điền thông tin và chọn ít nhất 1 hồ hoặc 1 cá
              </Text>
            </View>
          )}
        </View>
      </KeyboardAwareScrollView>

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

                    // Format date as YYYY-MM-DD and append time to avoid timezone issues
                    const year = selectedDate.getFullYear();
                    const month = String(selectedDate.getMonth() + 1).padStart(
                      2,
                      '0'
                    );
                    const day = String(selectedDate.getDate()).padStart(2, '0');
                    const dateString = `${year}-${month}-${day}T00:00:00.000Z`;

                    setFormData({
                      ...formData,
                      occurredAt: dateString,
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

                // Format date as YYYY-MM-DD and append time to avoid timezone issues
                const year = selectedDate.getFullYear();
                const month = String(selectedDate.getMonth() + 1).padStart(
                  2,
                  '0'
                );
                const day = String(selectedDate.getDate()).padStart(2, '0');
                const dateString = `${year}-${month}-${day}T00:00:00.000Z`;

                setFormData({
                  ...formData,
                  occurredAt: dateString,
                });
              }
            }}
            style={{ alignSelf: 'center' }}
          />
        ))}

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onCancel={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        onConfirm={() => {
          alertConfig.onConfirm?.();
          setAlertConfig((prev) => ({ ...prev, visible: false }));
        }}
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
}
