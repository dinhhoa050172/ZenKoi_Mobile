import ContextMenuField from '@/components/ContextMenuField';
import { useCreateKoiFish } from '@/hooks/useKoiFish';
import { useGetPonds } from '@/hooks/usePond';
import { useUploadImage } from '@/hooks/useUpload';
import { useGetVarieties } from '@/hooks/useVariety';
import type { KoiFishRequest } from '@/lib/api/services/fetchKoiFish';
import {
  FishSize,
  Gender,
  HealthStatus,
  KoiType,
  SaleStatus,
} from '@/lib/api/services/fetchKoiFish';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Camera, LibraryBig, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

const initialForm: KoiFishRequest = {
  pondId: 0,
  varietyId: 0,
  breedingProcessId: null,
  rfid: '',
  origin: '',
  size: FishSize.FROM21TO25CM,
  type: KoiType.HIGH,
  birthDate: '',
  gender: Gender.MALE,
  healthStatus: HealthStatus.HEALTHY,
  saleStatus: SaleStatus.NOT_FOR_SALE,
  images: [],
  videos: [],
  sellingPrice: 0,
  bodyShape: '',
  colorPattern: '',
  description: '',
};

export default function AddKoiPage() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const redirect = (params?.redirect as string) || undefined;
  const breedingId = params?.breedingId ? Number(params.breedingId) : null;
  const insets = useSafeAreaInsets();

  const [formData, setFormData] = useState<KoiFishRequest>(initialForm);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<'date' | 'time'>('date');
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useFocusEffect(
    React.useCallback(() => {
      setFormData({
        ...initialForm,
        breedingProcessId: breedingId,
      });
      setErrors({});
      return undefined;
    }, [breedingId])
  );

  const { data: pondsPage, isLoading: pondsLoading } = useGetPonds(
    {
      pageIndex: 1,
      pageSize: 100,
    },
    true
  );
  const { data: varietiesPage, isLoading: varietiesLoading } = useGetVarieties(
    { pageIndex: 1, pageSize: 100 },
    true
  );
  const pondOptions = pondsPage?.data ?? [];
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
      case SaleStatus.RESERVED:
        return 'Đã đặt trước';
      case SaleStatus.SOLD:
        return 'Đã bán';
      default:
        return s;
    }
  };

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

  const fishSizeToLabel = (s: FishSize) => {
    switch (s) {
      case FishSize.UNDER10CM:
        return 'Dưới 10 cm';
      case FishSize.FROM10TO20CM:
        return '10 - 20 cm';
      case FishSize.FROM21TO25CM:
        return '21 - 25 cm';
      case FishSize.FROM26TO30CM:
        return '26 - 30 cm';
      case FishSize.FROM31TO40CM:
        return '31 - 40 cm';
      case FishSize.FROM41TO45CM:
        return '41 - 45 cm';
      case FishSize.FROM46TO50CM:
        return '46 - 50 cm';
      case FishSize.OVER50CM:
        return 'Trên 50 cm';
      default:
        return s;
    }
  };

  const fishSizeOptions = Object.values(FishSize).map((s) => ({
    label: fishSizeToLabel(s),
    value: s,
  }));

  const createKoi = useCreateKoiFish();
  const uploadImage = useUploadImage();

  const pickImageFromLibrary = async () => {
    if ((formData.images ?? []).length >= 6) {
      Alert.alert('Giới hạn', 'Bạn chỉ có thể tải lên tối đa 6 ảnh.');
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Quyền truy cập bị từ chối',
        'Vui lòng cho phép truy cập ảnh để chọn ảnh từ thư viện'
      );
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

        // append only if under the 6-image limit
        const existing = formData.images ?? [];
        if (existing.length < 6) {
          setFormData({
            ...formData,
            images: [...existing, remoteUrl],
          });
        } else {
          Alert.alert('Giới hạn', 'Bạn chỉ có thể tải lên tối đa 6 ảnh.');
        }
      } catch (err) {
        console.warn('upload error', err);
        Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
      } finally {
        setIsUploading(false);
      }
    } catch (err) {
      console.warn('pickImageFromLibrary error', err);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Thử lại sau.');
    }
  };

  const takePhoto = async () => {
    if ((formData.images ?? []).length >= 6) {
      Alert.alert('Giới hạn', 'Bạn chỉ có thể tải lên tối đa 6 ảnh.');
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Quyền truy cập bị từ chối',
        'Vui lòng cho phép truy cập camera để chụp ảnh'
      );
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
          setFormData({
            ...formData,
            images: [...existing, remoteUrl],
          });
        } else {
          Alert.alert('Giới hạn', 'Bạn chỉ có thể tải lên tối đa 6 ảnh.');
        }
      } catch (err) {
        console.warn('upload error', err);
        Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại.');
      } finally {
        setIsUploading(false);
      }
    } catch (err) {
      console.warn('takePhoto error', err);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Thử lại sau.');
    }
  };

  const handleSave = () => {
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
    if (!formData.bodyShape.trim())
      nextErrors.bodyShape = 'Vui lòng nhập hình dáng cá';
    if (!formData.colorPattern.trim())
      nextErrors.colorPattern = 'Vui lòng nhập màu sắc';
    if (!formData.description.trim())
      nextErrors.description = 'Vui lòng nhập mô tả';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: KoiFishRequest = {
      pondId: Number(formData.pondId),
      varietyId: Number(formData.varietyId),
      type: formData.type as KoiType,
      breedingProcessId: formData.breedingProcessId ?? null,
      rfid: String(formData.rfid),
      origin: String(formData.origin ?? ''),
      size: formData.size,
      birthDate: formData.birthDate || new Date().toISOString(),
      gender: formData.gender as Gender,
      healthStatus: formData.healthStatus as HealthStatus,
      saleStatus: formData.saleStatus as SaleStatus,
      images: formData.images ?? [],
      videos: formData.videos ?? [],
      sellingPrice: Number(formData.sellingPrice ?? 0),
      bodyShape: String(formData.bodyShape ?? ''),
      colorPattern: String(formData.colorPattern ?? ''),
      description: String(formData.description ?? ''),
    };

    createKoi.mutate(payload, {
      onSuccess: () => {
        router.replace({ pathname: redirect ?? '/koi' } as any);
      },
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center justify-between border-b border-gray-200 p-4">
        <Text className="text-lg font-semibold text-gray-900">Thêm cá Koi</Text>
        <TouchableOpacity
          onPress={() =>
            router.replace({ pathname: redirect ?? '/koi' } as any)
          }
          className="p-1"
        >
          <X size={24} color="red" />
        </TouchableOpacity>
      </View>

      <KeyboardAwareScrollView
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={Platform.OS === 'android' ? 120 : 50}
        keyboardOpeningTime={0}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mb-6">
          <Text className="mb-2 text-base font-medium text-gray-900">
            Ảnh cá
          </Text>

          {/* Image gallery grid */}
          <View className="-m-2 flex-row flex-wrap">
            {(formData.images || []).map((url, idx) => {
              console.log('Displaying image:', url); // Debug log
              return (
                <View key={idx} className="p-2" style={{ width: '50%' }}>
                  <View className="relative">
                    <Image
                      source={{ uri: url }}
                      className="h-40 w-full rounded-lg"
                      resizeMode="cover"
                      onError={(e) => {
                        console.error(
                          'Image load error:',
                          url,
                          e.nativeEvent.error
                        );
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', url);
                      }}
                    />
                    <TouchableOpacity
                      onPress={() => {
                        // remove image at idx
                        setFormData({
                          ...formData,
                          images: (formData.images || []).filter(
                            (_, i) => i !== idx
                          ),
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

            {/* Uploading indicator: show when uploadImage is loading */}
            {(uploadImage as any).isLoading ||
            (uploadImage as any).isMutating ? (
              <View className="p-2" style={{ width: '50%' }}>
                <View className="h-40 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white/60">
                  <ActivityIndicator size="small" color="#0A3D62" />
                  <Text className="mt-2 text-gray-600">Đang tải lên...</Text>
                </View>
              </View>
            ) : null}

            {/* Add tile: only show when less than 6 images */}
            {(formData.images ?? []).length < 6 && (
              <View className="p-2" style={{ width: '50%' }}>
                <TouchableOpacity
                  className="h-40 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
                  onPress={() => {
                    if ((formData.images ?? []).length >= 6) {
                      Alert.alert(
                        'Giới hạn',
                        'Bạn chỉ có thể tải lên tối đa 6 ảnh.'
                      );
                      return;
                    }
                    setShowImageOptions(true);
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <Camera size={28} color="#374151" />
                    <Text className="mt-2 font-medium text-gray-900">
                      Thêm ảnh
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Chụp hoặc chọn từ thư viện
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Modal
            visible={showImageOptions}
            transparent
            animationType="fade"
            onRequestClose={() => setShowImageOptions(false)}
          >
            <View className="flex-1 items-center justify-center bg-black/50 p-4">
              <View className="w-full max-w-sm rounded-2xl bg-white p-4">
                <Text className="mb-4 text-center text-lg font-semibold text-gray-900">
                  Chọn ảnh
                </Text>
                <TouchableOpacity
                  className="mb-3 items-center rounded-lg border border-gray-200 bg-white py-4"
                  onPress={() => {
                    setShowImageOptions(false);
                    pickImageFromLibrary();
                  }}
                >
                  <LibraryBig size={28} color="#374151" />
                  <Text className="mt-2 text-center text-gray-900">
                    Chọn từ thư viện
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="mb-3 items-center rounded-lg border border-gray-200 bg-white py-4"
                  onPress={() => {
                    setShowImageOptions(false);
                    takePhoto();
                  }}
                >
                  <Camera size={28} color="#374151" />
                  <Text className="mt-2 text-center text-gray-900">
                    Chụp ảnh
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="rounded-lg bg-red-500 py-3"
                  onPress={() => setShowImageOptions(false)}
                >
                  <Text className="text-center text-white">Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>

        {/* RFID single row */}
        <View className="mb-4">
          <Text className="mb-2 text-base font-medium text-gray-900">
            Mã RFID <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            placeholder="Nhập mã RFID"
            value={formData.rfid}
            onChangeText={(t) => setFormData({ ...formData, rfid: t })}
          />
          {errors.rfid && (
            <Text className="mt-1 text-sm text-red-500">{errors.rfid}</Text>
          )}
        </View>

        {/* Variety + Pond on one row */}
        <View className="mb-4 flex-row">
          <View className="mr-2 flex-1">
            <ContextMenuField
              label="Giống"
              value={
                formData.varietyId ? String(formData.varietyId) : undefined
              }
              options={varietySelectOptions}
              onSelect={(v: string) => {
                if (v === '__none')
                  return setFormData({ ...formData, varietyId: 0 });
                setFormData({ ...formData, varietyId: Number(v) });
              }}
              placeholder="Chọn giống"
            />
            {errors.varietyId && (
              <Text className="text-sm text-red-500">{errors.varietyId}</Text>
            )}
          </View>

          <View className="flex-1">
            <ContextMenuField
              label="Loại"
              value={formData.type}
              options={typeOptionsVN}
              onSelect={(v: string) =>
                setFormData({ ...formData, type: v as KoiType })
              }
              placeholder="Chọn loại"
            />
            {errors.type && (
              <Text className="text-sm text-red-500">{errors.type}</Text>
            )}
          </View>
        </View>

        <View className="mb-4">
          <ContextMenuField
            label="Bể"
            value={formData.pondId ? String(formData.pondId) : undefined}
            options={pondSelectOptions}
            onSelect={(v: string) => {
              if (v === '__none')
                return setFormData({ ...formData, pondId: 0 });
              setFormData({ ...formData, pondId: Number(v) });
            }}
            placeholder="Chọn bể"
          />
          {errors.pondId && (
            <Text className="text-sm text-red-500">{errors.pondId}</Text>
          )}
        </View>

        {/* Gender + Size */}
        <View className="mb-4 flex-row">
          <View className="mr-2 flex-1">
            <ContextMenuField
              label="Giới tính"
              value={formData.gender}
              options={genderOptionsVN}
              onSelect={(v: string) =>
                setFormData({ ...formData, gender: v as Gender })
              }
              placeholder="Chọn giới tính"
            />
            {errors.gender && (
              <Text className="mt-1 text-sm text-red-500">{errors.gender}</Text>
            )}
          </View>

          <View className="flex-1">
            <ContextMenuField
              label="Chiều dài (cm)"
              value={formData.size}
              options={fishSizeOptions}
              onSelect={(v: string) =>
                setFormData({ ...formData, size: v as FishSize })
              }
              placeholder="Chọn kích thước"
            />
            {errors.size && (
              <Text className="mt-1 text-sm text-red-500">{errors.size}</Text>
            )}
          </View>
        </View>

        {/* Gender + HealthStatus */}
        <View className="mb-4 flex-row">
          <View className="mr-2 flex-1">
            <Text className="mb-2 text-base font-medium text-gray-900">
              Nguồn gốc
            </Text>
            <TextInput
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
              placeholder="Nhập nguồn gốc"
              value={formData.origin}
              onChangeText={(t) => setFormData({ ...formData, origin: t })}
            />
            {errors.origin && (
              <Text className="mt-1 text-sm text-red-500">{errors.origin}</Text>
            )}
          </View>

          <View className="flex-1">
            <ContextMenuField
              label="Tình trạng sức khỏe"
              value={formData.healthStatus}
              options={healthOptionsVN}
              onSelect={(v: string) =>
                setFormData({ ...formData, healthStatus: v as HealthStatus })
              }
              placeholder="Chọn tình trạng"
            />
            {errors.healthStatus && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.healthStatus}
              </Text>
            )}
          </View>
        </View>

        {/* Sale Status */}
        <View className="mb-4">
          <ContextMenuField
            label="Trạng thái bán"
            value={formData.saleStatus}
            options={saleStatusOptionsVN}
            onSelect={(v: string) =>
              setFormData({ ...formData, saleStatus: v as SaleStatus })
            }
            placeholder="Chọn trạng thái bán"
          />
        </View>

        {/* BirthDate + SellingPrice */}
        <View className="mb-4 flex-row">
          <View className="mr-2 flex-1">
            <Text className="mb-2 text-base font-medium text-gray-900">
              Ngày sinh
            </Text>
            <TouchableOpacity
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
              onPress={() => {
                setDatePickerMode('date');
                setShowDatePicker(true);
              }}
            >
              <Text
                className={`${formData.birthDate ? 'text-gray-900' : 'text-gray-500'}`}
              >
                {formData.birthDate || 'Chọn ngày'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={
                  formData.birthDate ? new Date(formData.birthDate) : new Date()
                }
                mode={datePickerMode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(e: any, selected?: Date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (!selected) return;
                  const y = selected.getFullYear();
                  const m = String(selected.getMonth() + 1).padStart(2, '0');
                  const d = String(selected.getDate()).padStart(2, '0');
                  setFormData({ ...formData, birthDate: `${y}-${m}-${d}` });
                }}
              />
            )}
            {errors.birthDate && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.birthDate}
              </Text>
            )}
          </View>

          <View className="flex-1">
            <Text className="mb-2 text-base font-medium text-gray-900">
              Giá bán
            </Text>
            <TextInput
              keyboardType="numeric"
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
              placeholder="Nhập giá bán"
              value={
                formData.sellingPrice && Number(formData.sellingPrice) > 0
                  ? String(formData.sellingPrice)
                  : ''
              }
              onChangeText={(t) => {
                if (t.trim() === '') {
                  setFormData({ ...formData, sellingPrice: 0 });
                  return;
                }
                const parsed = Number(t.replace(/[^0-9.-]/g, ''));
                setFormData({
                  ...formData,
                  sellingPrice: Number.isFinite(parsed) ? parsed : 0,
                });
              }}
            />
            {errors.sellingPrice && (
              <Text className="mt-1 text-sm text-red-500">
                {errors.sellingPrice}
              </Text>
            )}
          </View>
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-base font-medium text-gray-900">
            Hình dáng
          </Text>
          <TextInput
            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            placeholder="Mô tả hình dáng"
            value={formData.bodyShape}
            onChangeText={(t) => setFormData({ ...formData, bodyShape: t })}
          />
          {errors.bodyShape && (
            <Text className="mt-1 text-sm text-red-500">
              {errors.bodyShape}
            </Text>
          )}
        </View>

        <View className="mb-4">
          <Text className="mb-2 text-base font-medium text-gray-900">
            Màu sắc
          </Text>
          <TextInput
            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            placeholder="Mô tả màu sắc và hoa văn"
            value={formData.colorPattern}
            onChangeText={(t) => setFormData({ ...formData, colorPattern: t })}
          />
          {errors.colorPattern && (
            <Text className="mt-1 text-sm text-red-500">
              {errors.colorPattern}
            </Text>
          )}
        </View>

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
            onChangeText={(t) => setFormData({ ...formData, description: t })}
          />
          {errors.description && (
            <Text className="mt-1 text-sm text-red-500">
              {errors.description}
            </Text>
          )}
        </View>

        <View className="flex-row border-t border-gray-200 p-4">
          <TouchableOpacity
            className="mr-2 flex-1 rounded-lg bg-gray-100 py-3"
            onPress={() =>
              router.replace({ pathname: redirect ?? '/koi' } as any)
            }
          >
            <Text className="text-center font-medium text-gray-900">Hủy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="ml-2 flex-1 rounded-lg py-3"
            style={{ backgroundColor: '#0A3D62' }}
            onPress={handleSave}
          >
            <Text className="text-center font-medium text-white">Lưu</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
      {/* Full-screen upload overlay */}
      {isUploading && (
        <View className="absolute inset-0 items-center justify-center bg-black/40">
          <View className="items-center rounded-lg bg-white p-4">
            <ActivityIndicator size="large" color="#0A3D62" />
            <Text className="mt-2 font-medium">Đang tải ảnh lên...</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
