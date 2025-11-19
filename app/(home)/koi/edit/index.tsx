import ContextMenuField from '@/components/ContextMenuField';
import { CustomAlert } from '@/components/CustomAlert';
import FishSvg from '@/components/icons/FishSvg';
import PondSvg from '@/components/icons/PondSvg';
import InputField from '@/components/InputField';
import { useGetKoiFishById, useUpdateKoiFish } from '@/hooks/useKoiFish';
import { useGetPatternByVarietyId } from '@/hooks/usePattern';
import { useGetPonds } from '@/hooks/usePond';
import { useUploadImage } from '@/hooks/useUpload';
import { useGetVarieties } from '@/hooks/useVariety';
import type { KoiFishRequest } from '@/lib/api/services/fetchKoiFish';
import {
  Gender,
  HealthStatus,
  KoiType,
  SaleStatus,
} from '@/lib/api/services/fetchKoiFish';
import { PondStatus } from '@/lib/api/services/fetchPond';
import { formatDate } from '@/lib/utils/formatDate';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Biohazard,
  Blend,
  Calendar,
  Camera,
  Coins,
  Dna,
  DollarSign,
  Hash,
  HeartPulse,
  ImageIcon,
  List,
  MapPin,
  Ruler,
  VenusAndMars,
  X,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Switch,
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
import Toast from 'react-native-toast-message';

export default function EditKoiPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const redirect = (params?.redirect as string) || undefined;
  const idParam = params?.id as string | undefined;
  const koiId = idParam ? Number(idParam) : undefined;
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<any>(null);

  const [formData, setFormData] = useState<KoiFishRequest | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sizeText, setSizeText] = useState('');

  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertType, setCustomAlertType] = useState<
    'danger' | 'warning' | 'info'
  >('danger');
  const [customAlertOnConfirm, setCustomAlertOnConfirm] = useState<
    (() => void) | undefined
  >(() => undefined);

  const showCustomAlert = (opts: {
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm?: () => void;
  }) => {
    setCustomAlertTitle(opts.title);
    setCustomAlertMessage(opts.message);
    setCustomAlertType(opts.type ?? 'danger');
    setCustomAlertOnConfirm(
      () => opts.onConfirm ?? (() => setCustomAlertVisible(false))
    );
    setCustomAlertVisible(true);
  };

  const { data: koiData, isLoading: koiLoading } = useGetKoiFishById(
    koiId ?? 0,
    !!koiId
  );

  useFocusEffect(
    React.useCallback(() => {
      if (koiData) {
        const extractCm = (s?: string | null) => {
          if (!s) return 0;
          // try to find a number followed by 'cm' (e.g. '20 cm' or '20cm')
          const cmMatch = s.match(/([0-9]+(?:[.,][0-9]+)?)\s*cm/i);
          if (cmMatch && cmMatch[1]) {
            const num = parseFloat(cmMatch[1].replace(',', '.'));
            return Number.isFinite(num) ? num : 0;
          }
          // fallback: take the last numeric token in the string
          const lastNumMatch = s.match(/([0-9]+(?:[.,][0-9]+)?)(?!.*[0-9])/);
          if (lastNumMatch && lastNumMatch[1]) {
            const num = parseFloat(lastNumMatch[1].replace(',', '.'));
            return Number.isFinite(num) ? num : 0;
          }
          // ultimate fallback: parseFloat on whole string
          const pf = parseFloat(s.replace(',', '.'));
          return Number.isFinite(pf) ? pf : 0;
        };

        const sizeVal = extractCm(koiData.size as any);
        setFormData({
          pondId: koiData.pond?.id ?? 0,
          varietyId: koiData.variety?.id ?? 0,
          breedingProcessId: null,
          rfid: koiData.rfid ?? '',
          origin: koiData.origin ?? '',
          size: sizeVal,
          type: koiData.type ?? KoiType.HIGH,
          pattern: koiData.pattern,
          birthDate: koiData.birthDate ?? '',
          gender: koiData.gender ?? Gender.MALE,
          healthStatus: koiData.healthStatus ?? HealthStatus.HEALTHY,
          saleStatus: koiData.saleStatus ?? SaleStatus.NOT_FOR_SALE,
          images: koiData.images ?? [],
          videos: koiData.videos ?? [],
          sellingPrice: koiData.sellingPrice ?? 0,
          description: koiData.description ?? '',
          isMutated: koiData.isMutated ?? false,
          mutationDescription: koiData.mutationDescription,
        });
        setSizeText(sizeVal > 0 ? String(sizeVal) : '');
        setErrors({});
      } else {
        setFormData(null);
        setSizeText('');
        setErrors({});
      }
      setTimeout(() => {
        try {
          scrollRef.current?.scrollTo?.({ x: 0, y: 0, animated: false });
        } catch (error) {
          console.log('Error scroll', error);
        }
      }, 0);
      return undefined;
    }, [koiData])
  );

  const { data: pondsPage, isLoading: pondsLoading } = useGetPonds(
    {
      pageIndex: 1,
      pageSize: 100,
      available: true,
    },
    true
  );
  const { data: varietiesPage, isLoading: varietiesLoading } = useGetVarieties(
    { pageIndex: 1, pageSize: 100 },
    true
  );
  const pondOptions = (pondsPage?.data ?? []).filter(
    (p) =>
      p.pondStatus === PondStatus.EMPTY || p.pondStatus === PondStatus.ACTIVE
  );
  const varietyOptions = varietiesPage?.data ?? [];

  const pondSelectOptions = pondsLoading
    ? [{ label: 'Đang tải bể...', value: '' }]
    : pondOptions.length === 0
      ? [{ label: 'Chưa có bể cá nào', value: '__none' }]
      : pondOptions.map((p) => ({
          label: p.pondName ?? `Bể ${p.id}`,
          value: String(p.id),
        }));

  const varietySelectOptions = varietiesLoading
    ? [{ label: 'Đang tải giống...', value: '' }]
    : varietyOptions.length === 0
      ? [{ label: 'Chưa có giống cá nào', value: '__none' }]
      : varietyOptions.map((v) => ({
          label: v.varietyName ?? `Giống ${v.id}`,
          value: String(v.id),
        }));

  const genderToLabel = (g: Gender) => {
    switch (g) {
      case Gender.MALE:
        return 'Đực';
      case Gender.FEMALE:
        return 'Cái';
      case Gender.OTHER:
        return 'Chưa xác định';
      default:
        return g;
    }
  };

  const healthToLabel = (h: HealthStatus) => {
    switch (h) {
      case HealthStatus.HEALTHY:
        return 'Khỏe mạnh';
      case HealthStatus.WARNING:
        return 'Cảnh báo';
      case HealthStatus.WEAK:
        return 'Yếu';
      case HealthStatus.SICK:
        return 'Bệnh';
      case HealthStatus.DEAD:
        return 'Chết';
      default:
        return h;
    }
  };

  const saleStatusToLabel = (s: SaleStatus) => {
    switch (s) {
      case SaleStatus.NOT_FOR_SALE:
        return 'Không bán';
      case SaleStatus.AVAILABLE:
        return 'Có sẵn';
      case SaleStatus.SOLD:
        return 'Đã bán';
      default:
        return s;
    }
  };

  // mutation labels are dynamic or not provided via enums here

  const typeOptionsVN = Object.values(KoiType).map((t) => ({
    label: t,
    value: t,
  }));

  const genderOptionsVN = Object.values(Gender).map((g) => ({
    label: genderToLabel(g),
    value: g,
  }));
  const healthOptionsVN = Object.values(HealthStatus).map((h) => ({
    label: healthToLabel(h),
    value: h,
  }));
  const saleStatusOptionsVN = Object.values(SaleStatus).map((s) => ({
    label: saleStatusToLabel(s),
    value: s,
  }));
  const patternQuery = useGetPatternByVarietyId(
    formData?.varietyId ?? 0,
    !!formData?.varietyId
  );
  const patternOptionsVN = ((): {
    label: string;
    value: string;
    meta?: string;
  }[] => {
    const vid = formData?.varietyId ?? 0;
    if (!vid) return [{ label: 'Vui lòng chọn giống trước', value: '' }];
    if (patternQuery.isLoading)
      return [{ label: 'Đang tải hoa văn...', value: '' }];
    const data = patternQuery.data?.data ?? [];
    // if (!data || data.length === 0) return [{ label: 'Không có hoa văn', value: '__none' }];
    return data.map((p) => ({
      label: p.patternName,
      value: p.patternName,
      meta: p.description,
    }));
  })();

  const updateKoi = useUpdateKoiFish();
  const isSaving =
    (updateKoi as any).isLoading || (updateKoi as any).isMutating || false;
  const uploadImage = useUploadImage();

  const pickImageFromLibrary = async () => {
    if (!formData) return;
    if ((formData.images ?? []).length >= 6) {
      showCustomAlert({
        title: 'Giới hạn',
        message: 'Bạn chỉ có thể tải lên tối đa 6 ảnh.',
        type: 'warning',
      });
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showCustomAlert({
        title: 'Quyền truy cập bị từ chối',
        message: 'Vui lòng cho phép truy cập ảnh để chọn ảnh từ thư viện',
        type: 'warning',
      });
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });
      if ((result as any).canceled) return;
      const uri = (result as any).assets?.[0]?.uri;
      if (!uri) return;

      const filename = uri.split('/').pop() || `photo.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      const fileForUpload: any = { uri, name: filename, type };

      setIsUploading(true);
      try {
        const res = await uploadImage.mutateAsync({ file: fileForUpload });
        const remoteUrl = res?.result?.url;

        if (!remoteUrl) {
          throw new Error('Không nhận được URL từ server');
        }

        const existing = formData.images ?? [];
        if (existing.length < 6) {
          setFormData({ ...formData, images: [...existing, remoteUrl] });
          setErrors((prev) => {
            const copy = { ...prev };
            delete copy.images;
            return copy;
          });
        } else {
          showCustomAlert({
            title: 'Giới hạn',
            message: 'Bạn chỉ có thể tải lên tối đa 6 ảnh.',
            type: 'warning',
          });
        }
      } catch (err) {
        console.warn('upload error', err);
        showCustomAlert({
          title: 'Lỗi',
          message: 'Không thể tải ảnh lên. Vui lòng thử lại.',
          type: 'danger',
        });
      } finally {
        setIsUploading(false);
      }
    } catch (err) {
      console.warn('pickImageFromLibrary error', err);
      showCustomAlert({
        title: 'Lỗi',
        message: 'Không thể chọn ảnh. Thử lại sau.',
        type: 'danger',
      });
    }
  };

  const takePhoto = async () => {
    if (!formData) return;
    if ((formData.images ?? []).length >= 6) {
      showCustomAlert({
        title: 'Giới hạn',
        message: 'Bạn chỉ có thể tải lên tối đa 6 ảnh.',
        type: 'warning',
      });
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showCustomAlert({
        title: 'Quyền truy cập bị từ chối',
        message: 'Vui lòng cho phép truy cập camera để chụp ảnh',
        type: 'warning',
      });
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if ((result as any).canceled) return;
      const uri = (result as any).assets?.[0]?.uri;
      if (!uri) return;

      const filename = uri.split('/').pop() || `photo.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      const fileForUpload: any = { uri, name: filename, type };

      setIsUploading(true);
      try {
        const res = await uploadImage.mutateAsync({ file: fileForUpload });
        const remoteUrl = res?.result?.url;

        if (!remoteUrl) {
          throw new Error('Không nhận được URL từ server');
        }

        const existing = formData.images ?? [];
        if (existing.length < 6) {
          setFormData({ ...formData, images: [...existing, remoteUrl] });
          setErrors((prev) => {
            const copy = { ...prev };
            delete copy.images;
            return copy;
          });
        } else {
          showCustomAlert({
            title: 'Giới hạn',
            message: 'Bạn chỉ có thể tải lên tối đa 6 ảnh.',
            type: 'warning',
          });
        }
      } catch (err) {
        console.warn('upload error', err);
        showCustomAlert({
          title: 'Lỗi',
          message: 'Không thể tải ảnh lên. Vui lòng thử lại.',
          type: 'danger',
        });
      } finally {
        setIsUploading(false);
      }
    } catch (err) {
      console.warn('takePhoto error', err);
      showCustomAlert({
        title: 'Lỗi',
        message: 'Không thể chụp ảnh. Thử lại sau.',
        type: 'danger',
      });
    }
  };

  const handleSave = () => {
    if (!formData || !koiId) return;
    const nextErrors: Record<string, string> = {};
    if (!formData.pondId) nextErrors.pondId = 'Vui lòng chọn bể';
    if (!formData.varietyId) nextErrors.varietyId = 'Vui lòng chọn giống';
    if (!formData.type) nextErrors.type = 'Vui lòng chọn loại';
    if (!formData.rfid || !formData.rfid.trim())
      nextErrors.rfid = 'Vui lòng nhập mã RFID';
    if (!formData.size) nextErrors.size = 'Vui lòng chọn chiều dài';
    if (!formData.birthDate) nextErrors.birthDate = 'Vui lòng chọn ngày sinh';
    if (!formData.gender) nextErrors.gender = 'Vui lòng chọn giới tính';
    if (!formData.origin || !formData.origin.trim())
      nextErrors.origin = 'Vui lòng nhập nguồn gốc';
    if (!formData.healthStatus)
      nextErrors.healthStatus = 'Vui lòng chọn tình trạng sức khỏe';
    if (!formData.images || formData.images.length === 0)
      nextErrors.images = 'Vui lòng thêm ít nhất 1 ảnh';
    if (!formData.sellingPrice || Number(formData.sellingPrice) <= 0)
      nextErrors.sellingPrice = 'Vui lòng nhập giá bán > 0';
    if (!formData.description.trim())
      nextErrors.description = 'Vui lòng nhập giới thiệu';
    if (formData.isMutated && !formData.mutationDescription)
      nextErrors.mutationDescription = 'Vui lòng chọn loại đột biến';

    setErrors(nextErrors);
    if (nextErrors.images) {
      Toast.show({ type: 'error', text1: nextErrors.images, position: 'top' });
    }
    if (Object.keys(nextErrors).length > 0) return;

    const payload: KoiFishRequest = {
      pondId: Number(formData.pondId),
      varietyId: Number(formData.varietyId),
      type: formData.type as KoiType,
      breedingProcessId: formData.breedingProcessId ?? null,
      rfid: String(formData.rfid),
      origin: String(formData.origin ?? ''),
      size: formData.size,
      pattern: formData.pattern as string | null,
      birthDate: formData.birthDate || new Date().toISOString(),
      gender: formData.gender as Gender,
      healthStatus: formData.healthStatus as HealthStatus,
      saleStatus: formData.saleStatus as SaleStatus,
      images: formData.images ?? [],
      videos: formData.videos ?? [],
      sellingPrice: Number(formData.sellingPrice ?? 0),
      description: String(formData.description ?? ''),
      isMutated: formData.isMutated ?? false,
      mutationDescription: formData.mutationDescription as string | null,
    };

    updateKoi.mutate(
      { id: koiId, data: payload },
      {
        onSuccess: () => {
          router.replace({ pathname: redirect ?? '/koi' } as any);
        },
      }
    );
  };

  if (koiLoading || !formData) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0A3D62" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="relative rounded-t-3xl bg-primary pb-6">
        <View className="px-4 pt-4">
          <View className="items-center">
            <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
              Chỉnh sửa
            </Text>
            <Text className="text-2xl font-bold text-white">
              Chỉnh sửa cá Koi
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              router.replace({ pathname: redirect ?? '/koi' } as any)
            }
            className="absolute right-4 top-4 h-10 w-10 items-center justify-center rounded-full bg-white/20"
            accessibilityLabel="Đóng"
          >
            <X size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAwareScrollView
        ref={scrollRef}
        bottomOffset={insets.bottom + 60}
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-4">
          <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
            Hình ảnh cá Koi
          </Text>

          <View className="rounded-2xl border border-gray-200 bg-white p-4">
            <View className="-m-2 flex-row flex-wrap">
              {(formData.images || []).map((url: string, idx: number) => {
                return (
                  <View key={idx} className="p-2" style={{ width: '50%' }}>
                    <View className="relative">
                      <Image
                        source={{ uri: url }}
                        className="h-40 w-full rounded-2xl"
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => {
                          const newImages = (formData.images || []).filter(
                            (_: any, i: number) => i !== idx
                          );
                          setFormData({ ...formData, images: newImages });
                          setErrors((prev) => {
                            const copy = { ...prev };
                            delete copy.images;
                            return copy;
                          });
                        }}
                        className="absolute right-2 top-2 rounded-full bg-white p-1"
                        style={{ elevation: 2 }}
                      >
                        <X size={18} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}

              {(uploadImage as any).isLoading ||
              (uploadImage as any).isMutating ? (
                <View className="p-2" style={{ width: '50%' }}>
                  <View className="h-40 w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/60">
                    <ActivityIndicator size="small" color="#0A3D62" />
                    <Text className="mt-2 text-gray-600">Đang tải lên...</Text>
                  </View>
                </View>
              ) : null}

              {(formData.images ?? []).length < 6 && (
                <View className="p-2" style={{ width: '50%' }}>
                  <TouchableOpacity
                    className="h-40 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
                    onPress={() => setShowImageOptions(true)}
                  >
                    <View style={{ alignItems: 'center' }}>
                      <Camera size={28} color="#374151" />
                      <Text className="mt-2 font-medium text-gray-600">
                        Thêm ảnh
                      </Text>
                      <Text className="mt-0.5 text-xs text-gray-400">
                        {(formData.images ?? []).length}/6
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {errors.images && (
              <Text className="mt-2 text-sm text-red-500">{errors.images}</Text>
            )}

            <Modal
              visible={showImageOptions}
              transparent
              animationType="fade"
              onRequestClose={() => setShowImageOptions(false)}
            >
              <View className="flex-1 items-center justify-center bg-black/50 px-4">
                <View className="w-full max-w-sm overflow-hidden rounded-2xl bg-white">
                  <View className="border-b border-gray-200 p-4">
                    <Text className="text-center text-lg font-semibold text-gray-900">
                      Chọn ảnh
                    </Text>
                  </View>

                  <View className="p-4">
                    <TouchableOpacity
                      className="mb-3 flex-row items-center rounded-2xl border border-gray-200 bg-white p-4"
                      onPress={() => {
                        setShowImageOptions(false);
                        pickImageFromLibrary();
                      }}
                    >
                      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        <ImageIcon size={20} color="#3b82f6" />
                      </View>
                      <Text className="text-base font-medium text-gray-900">
                        Chọn từ thư viện
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="mb-3 flex-row items-center rounded-2xl border border-gray-200 bg-white p-4"
                      onPress={() => {
                        setShowImageOptions(false);
                        takePhoto();
                      }}
                    >
                      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                        <Camera size={20} color="#a855f7" />
                      </View>
                      <Text className="text-base font-medium text-gray-900">
                        Chụp ảnh
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      className="rounded-2xl bg-gray-100 py-3"
                      onPress={() => setShowImageOptions(false)}
                    >
                      <Text className="text-center text-base font-medium text-gray-700">
                        Hủy
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </View>

        {/* Basic Info Section */}
        <View className="mb-4">
          <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
            Thông tin cơ bản
          </Text>

          <View className="rounded-2xl border border-gray-200 bg-white p-4">
            {/* RFID */}
            <View className="mb-4">
              <InputField
                icon={<Hash size={18} color="#0A3D62" />}
                label="Mã RFID *"
                placeholder="Nhập mã RFID"
                value={formData.rfid}
                onChangeText={(t) => {
                  setFormData({ ...formData, rfid: t });
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.rfid;
                    return copy;
                  });
                }}
                iconBg="bg-blue-100"
              />
              {errors.rfid && (
                <Text className="mt-1 text-sm text-red-500">{errors.rfid}</Text>
              )}
            </View>

            {/* Variety */}
            <View className="mb-4">
              <View className="flex-row items-start">
                <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <FishSvg size={18} color="#0A3D62" />
                </View>
                <View className="flex-1">
                  <ContextMenuField
                    label="Giống *"
                    value={
                      formData.varietyId
                        ? String(formData.varietyId)
                        : undefined
                    }
                    options={varietySelectOptions}
                    onSelect={(v: string) => {
                      if (v === '__none') {
                        setFormData({ ...formData, varietyId: 0 });
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.varietyId;
                          return copy;
                        });
                        return;
                      }
                      setFormData({ ...formData, varietyId: Number(v) });
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.varietyId;
                        return copy;
                      });
                    }}
                    placeholder="Chọn giống"
                  />
                  {errors.varietyId && (
                    <Text className="mt-1 text-sm text-red-500">
                      {errors.varietyId}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Type */}
            <View className="mb-4">
              <View className="flex-row items-start">
                <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                  <List size={18} color="#059669" />
                </View>
                <View className="flex-1">
                  <ContextMenuField
                    label="Loại *"
                    value={formData.type}
                    options={typeOptionsVN}
                    onSelect={(v: string) => {
                      setFormData({ ...formData, type: v as KoiType });
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.type;
                        return copy;
                      });
                    }}
                    placeholder="Chọn loại"
                  />
                  {errors.type && (
                    <Text className="mt-1 text-sm text-red-500">
                      {errors.type}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Pond */}
            <View className="mb-4">
              <View className="flex-row items-start">
                <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <PondSvg size={18} color="#0A3D62" />
                </View>
                <View className="flex-1">
                  <ContextMenuField
                    label="Bể *"
                    value={
                      formData.pondId ? String(formData.pondId) : undefined
                    }
                    options={pondSelectOptions}
                    onSelect={(v: string) => {
                      if (v === '__none') {
                        setFormData({ ...formData, pondId: 0 });
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.pondId;
                          return copy;
                        });
                        return;
                      }
                      setFormData({ ...formData, pondId: Number(v) });
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.pondId;
                        return copy;
                      });
                    }}
                    placeholder="Chọn bể"
                  />
                  {errors.pondId && (
                    <Text className="mt-1 text-sm text-red-500">
                      {errors.pondId}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Physical Info Section */}
        <View className="mb-4">
          <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
            Thông số vật lý
          </Text>

          <View className="rounded-2xl border border-gray-200 bg-white p-4">
            {/* Gender */}
            <View className="mb-4">
              <View className="flex-row items-start">
                <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-rose-100">
                  <VenusAndMars size={18} color="#f43f5e" />
                </View>
                <View className="flex-1">
                  <ContextMenuField
                    label="Giới tính *"
                    value={formData.gender}
                    options={genderOptionsVN}
                    onSelect={(v: string) => {
                      setFormData({ ...formData, gender: v as Gender });
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.gender;
                        return copy;
                      });
                    }}
                    placeholder="Chọn giới tính"
                  />
                  {errors.gender && (
                    <Text className="mt-1 text-sm text-red-500">
                      {errors.gender}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Size */}
            <View className="mb-4">
              <InputField
                icon={<Ruler size={18} color="#8b5cf6" />}
                label="Chiều dài (cm) *"
                placeholder="VD: 25cm"
                value={sizeText}
                onChangeText={(t) => {
                  // allow digits and one decimal separator (either . or ,)
                  let s = t.replace(/[^0-9.,]/g, '');
                  const firstDot = s.indexOf('.');
                  const firstComma = s.indexOf(',');
                  let sepIndex = -1;
                  let sepChar = '';
                  if (firstDot !== -1 && firstComma !== -1) {
                    if (firstDot < firstComma) {
                      sepIndex = firstDot;
                      sepChar = '.';
                    } else {
                      sepIndex = firstComma;
                      sepChar = ',';
                    }
                  } else if (firstDot !== -1) {
                    sepIndex = firstDot;
                    sepChar = '.';
                  } else if (firstComma !== -1) {
                    sepIndex = firstComma;
                    sepChar = ',';
                  }

                  if (sepIndex === -1) {
                    s = s.replace(/[.,]/g, '');
                  } else {
                    const before = s.slice(0, sepIndex).replace(/[.,]/g, '');
                    const after = s.slice(sepIndex + 1).replace(/[.,]/g, '');
                    s = before + sepChar + after;
                  }

                  setSizeText(s);

                  // convert comma to dot for parsing
                  const numeric = parseFloat(s.replace(',', '.'));
                  setFormData({
                    ...formData,
                    size: Number.isFinite(numeric) ? numeric : 0,
                  });
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.size;
                    return copy;
                  });
                }}
                keyboardType="numeric"
                iconBg="bg-violet-100"
              />
              {errors.size && (
                <Text className="mt-1 text-sm text-red-500">{errors.size}</Text>
              )}
            </View>

            {/* Origin */}
            <View className="mb-4">
              <InputField
                icon={<MapPin size={18} color="#f97316" />}
                label="Nguồn gốc *"
                placeholder="Nhập nguồn gốc"
                value={formData.origin}
                onChangeText={(t) => {
                  setFormData({ ...formData, origin: t });
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.origin;
                    return copy;
                  });
                }}
                iconBg="bg-orange-100"
              />
              {errors.origin && (
                <Text className="mt-1 text-sm text-red-500">
                  {errors.origin}
                </Text>
              )}
            </View>

            {/* Health */}
            <View className="mb-4">
              <View className="flex-row items-start">
                <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-rose-100">
                  <HeartPulse size={18} color="#f43f5e" />
                </View>
                <View className="flex-1">
                  <ContextMenuField
                    label="Tình trạng sức khỏe"
                    value={formData.healthStatus}
                    options={healthOptionsVN}
                    onSelect={(v: string) => {
                      setFormData({
                        ...formData,
                        healthStatus: v as HealthStatus,
                      });
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.healthStatus;
                        return copy;
                      });
                    }}
                    placeholder="Chọn tình trạng"
                  />
                  {errors.healthStatus && (
                    <Text className="mt-1 text-sm text-red-500">
                      {errors.healthStatus}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Sale Status */}
            <View className="mb-4">
              <View className="flex-row items-start">
                <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-rose-100">
                  <Coins size={18} color="#f43f5e" />
                </View>
                <View className="flex-1">
                  <ContextMenuField
                    label="Trạng thái bán"
                    value={formData.saleStatus}
                    options={saleStatusOptionsVN}
                    onSelect={(v: string) => {
                      setFormData({ ...formData, saleStatus: v as SaleStatus });
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.saleStatus;
                        return copy;
                      });
                    }}
                    placeholder="Chọn trạng thái bán"
                  />
                </View>
              </View>
            </View>

            {/* Pattern Type */}
            <View className="mb-4">
              <View className="flex-row items-start">
                <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                  <Blend size={18} color="#7c3aed" />
                </View>
                <View className="flex-1">
                  <ContextMenuField
                    label="Kiểu hoa văn"
                    value={formData.pattern ?? undefined}
                    options={patternOptionsVN}
                    onPress={() => patternQuery.refetch()}
                    onSelect={(v: string) => {
                      if (!v || v === '__none') {
                        setFormData({ ...formData, pattern: null });
                        return;
                      }
                      setFormData({ ...formData, pattern: v });
                      setErrors((prev) => {
                        const copy = { ...prev };
                        delete copy.pattern;
                        return copy;
                      });
                    }}
                    placeholder={
                      formData?.varietyId
                        ? 'Chọn kiểu hoa văn'
                        : 'Chọn giống trước'
                    }
                    disabled={!formData?.varietyId}
                  />
                </View>
              </View>
            </View>

            {/* Is Mutated toggle */}
            <View className="mb-4">
              <View className="flex-row items-start">
                <View className="mr-3 mt-2 h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                  <Biohazard size={18} color="#d97706" />
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="text-base font-medium text-gray-900">
                      Đột biến
                    </Text>
                    <Switch
                      value={!!formData.isMutated}
                      onValueChange={(val) =>
                        setFormData({
                          ...formData,
                          isMutated: val,
                          mutationDescription: val ? formData.mutationDescription : null,
                        })
                      }
                      trackColor={{ false: '#e5e7eb', true: '#bbf7d0' }}
                      thumbColor={formData.isMutated ? '#16a34a' : '#f3f4f6'}
                      ios_backgroundColor="#e5e7eb"
                    />
                  </View>
                  {errors.mutationDescription && (
                    <Text className="mt-1 text-sm text-red-500">
                      {errors.mutationDescription}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Mutation Type (conditional) */}
            {formData.isMutated && (
              <View className="mb-4">
                <View className="flex-row items-start">
                  <View className="flex-1">
                    <InputField
                      icon={<Dna size={18} color="#d97706" />}
                      label="Loại đột biến *"
                      placeholder="Nhập loại đột biến"
                      value={formData.mutationDescription || ''}
                      onChangeText={(t) => {
                        setFormData({
                          ...formData,
                          mutationDescription: t || null,
                        });
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.mutationDescription;
                          return copy;
                        });
                      }}
                      iconBg="bg-amber-100"
                    />
                    {errors.mutationDescription && (
                      <Text className="mt-1 text-sm text-red-500">{errors.mutationDescription}</Text>
                    )}
                  </View>
                </View>
              </View>
            )}

            {/* BirthDate */}
            <View className="mb-4">
              <View className="flex-row items-start">
                <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                  <Calendar size={18} color="#6b7280" />
                </View>
                <View className="flex-1">
                  <Text className="mb-2 text-base font-medium text-gray-900">
                    Ngày sinh
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3"
                    onPress={() => {
                      setDatePickerMode('date');
                      setShowDatePicker(true);
                    }}
                  >
                    <Text
                      className={`ml-0 ${formData.birthDate ? 'text-gray-900' : 'text-gray-500'}`}
                    >
                      {formatDate(formData.birthDate, 'dd/MM/yyyy') ||
                        'Chọn ngày'}
                    </Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={
                        formData.birthDate
                          ? new Date(formData.birthDate)
                          : new Date()
                      }
                      mode={datePickerMode}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      maximumDate={new Date()}
                      onChange={(e: any, selected?: Date) => {
                        setShowDatePicker(Platform.OS === 'ios');
                        if (!selected) return;
                        const now = new Date();
                        const sel = new Date(
                          selected.getFullYear(),
                          selected.getMonth(),
                          selected.getDate()
                        );
                        const today = new Date(
                          now.getFullYear(),
                          now.getMonth(),
                          now.getDate()
                        );
                        if (sel > today) {
                          setErrors((prev) => ({
                            ...prev,
                            birthDate: 'Không được chọn ngày trong tương lai',
                          }));
                          return;
                        }
                        setErrors((prev) => {
                          const copy = { ...prev };
                          delete copy.birthDate;
                          return copy;
                        });
                        const y = selected.getFullYear();
                        const m = String(selected.getMonth() + 1).padStart(
                          2,
                          '0'
                        );
                        const d = String(selected.getDate()).padStart(2, '0');
                        setFormData({
                          ...formData,
                          birthDate: `${y}-${m}-${d}`,
                        });
                      }}
                    />
                  )}
                  {errors.birthDate && (
                    <Text className="mt-1 text-sm text-red-500">
                      {errors.birthDate}
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* Selling Price */}
            <View className="mb-4">
              <InputField
                icon={<DollarSign size={18} color="#059669" />}
                label="Giá bán"
                placeholder="Nhập giá bán"
                keyboardType="numeric"
                value={
                  formData.sellingPrice && Number(formData.sellingPrice) > 0
                    ? String(formData.sellingPrice)
                    : ''
                }
                onChangeText={(t) => {
                  if (t.trim() === '') {
                    setFormData({ ...formData, sellingPrice: 0 });
                    setErrors((prev) => {
                      const copy = { ...prev };
                      delete copy.sellingPrice;
                      return copy;
                    });
                    return;
                  }
                  const parsed = Number(t.replace(/[^0-9.-]/g, ''));
                  setFormData({
                    ...formData,
                    sellingPrice: Number.isFinite(parsed) ? parsed : 0,
                  });
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.sellingPrice;
                    return copy;
                  });
                }}
                iconBg="bg-emerald-100"
              />
              {errors.sellingPrice && (
                <Text className="mt-1 text-sm text-red-500">
                  {errors.sellingPrice}
                </Text>
              )}
            </View>

            {/* Description */}
            <View className="mb-4">
              <Text className="mb-2 text-base font-medium text-gray-900">
                Giới thiệu
              </Text>
              <TextInput
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                style={{ minHeight: 80 }}
                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                placeholder="Thông tin về cá Koi..."
                value={formData.description}
                onChangeText={(t) => {
                  setFormData({ ...formData, description: t });
                  setErrors((prev) => {
                    const copy = { ...prev };
                    delete copy.description;
                    return copy;
                  });
                }}
              />
              {errors.description && (
                <Text className="mt-1 text-sm text-red-500">
                  {errors.description}
                </Text>
              )}
            </View>

            <View className="flex-row border-t border-gray-200 p-4">
              <TouchableOpacity
                className="mr-2 flex-1 rounded-2xl bg-gray-100 py-3"
                onPress={() =>
                  router.replace({ pathname: redirect ?? '/koi' } as any)
                }
              >
                <Text className="text-center font-medium text-gray-900">
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-2 flex-1 rounded-2xl py-3"
                style={{
                  backgroundColor: '#0A3D62',
                  opacity: isSaving ? 0.7 : 1,
                }}
                onPress={() => {
                  if (!isSaving) handleSave();
                }}
                disabled={isSaving}
                accessibilityState={{ busy: isSaving, disabled: isSaving }}
              >
                {isSaving ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text className="ml-2 text-center font-medium text-white">
                      Đang lưu...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-center font-medium text-white">
                    Lưu
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      {isUploading && (
        <View className="absolute inset-0 items-center justify-center bg-black/40">
          <View className="items-center rounded-lg bg-white p-4">
            <ActivityIndicator size="large" color="#0A3D62" />
            <Text className="mt-2 font-medium">Đang tải ảnh lên...</Text>
          </View>
        </View>
      )}
      <CustomAlert
        visible={customAlertVisible}
        title={customAlertTitle}
        message={customAlertMessage}
        type={customAlertType}
        onCancel={() => setCustomAlertVisible(false)}
        onConfirm={() => {
          setCustomAlertVisible(false);
          if (customAlertOnConfirm) customAlertOnConfirm();
        }}
      />
    </SafeAreaView>
  );
}
