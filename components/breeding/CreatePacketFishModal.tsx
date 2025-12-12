import ContextMenuField from '@/components/ContextMenuField';
import ContextMenuMultiSelect from '@/components/ContextMenuMultiSelect';
import { CustomAlert } from '@/components/CustomAlert';
import { useGetBreedingProcessDetailById } from '@/hooks/useBreedingProcess';
import {
  useCreatePacketFish,
  useDeletePacketFish,
  useGetPacketFishById,
  useUpdatePacketFish,
} from '@/hooks/usePacketFish';
import { useGetPonds } from '@/hooks/usePond';
import { useCreatePondPacketFish } from '@/hooks/usePondPacketFish';
import { useUploadImage } from '@/hooks/useUpload';
import { useGetVarieties } from '@/hooks/useVariety';
import {
  PacketFish,
  PacketFishRequest,
  PacketFishVariety,
} from '@/lib/api/services/fetchPacketFish';
import { Pond, PondStatus } from '@/lib/api/services/fetchPond';
import { TypeOfPond } from '@/lib/api/services/fetchPondType';
import { Variety } from '@/lib/api/services/fetchVariety';
import * as ImagePicker from 'expo-image-picker';
import {
  Camera,
  DollarSign,
  Droplet,
  FileText,
  Image as ImageIcon,
  Layers,
  Plus,
  Ruler,
  Save,
  X,
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Image as RNImage,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import FishSvg from '../icons/FishSvg';

type Props = {
  visible: boolean;
  onClose: () => void;
  breedingId: number;
  currentPondId?: number;
  onSuccess?: () => void;
  packetFishId?: number;
};

export const CreatePacketFishModal: React.FC<Props> = ({
  visible,
  onClose,
  breedingId,
  currentPondId,
  onSuccess,
  packetFishId,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fishPerPacket, setFishPerPacket] = useState<string>('10');
  const [pricePerPacket, setPricePerPacket] = useState<string>('0');
  const [minSize, setMinSize] = useState<string>('21');
  const [maxSize, setMaxSize] = useState<string>('25');
  const [selectedVarietyIds, setSelectedVarietyIds] = useState<number[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);

  const createPacketMutation = useCreatePacketFish();
  const createPondPacketMutation = useCreatePondPacketFish();
  const deletePacketMutation = useDeletePacketFish();
  const updatePacketMutation = useUpdatePacketFish();

  const packetQuery = useGetPacketFishById(packetFishId ?? 0, !!packetFishId);
  const breedingDetailQuery = useGetBreedingProcessDetailById(
    breedingId,
    !!breedingId
  );

  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const pondsQuery = useGetPonds(
    { pageIndex: 1, pageSize: 200, pondTypeEnum: TypeOfPond.BROOD_STOCK },
    !!visible
  );

  const varietiesQuery = useGetVarieties(
    { pageIndex: 1, pageSize: 200 },
    !!visible
  );
  const varietyOptions = useMemo(() => {
    const list = varietiesQuery.data?.data ?? [];
    return list.map((v: Variety) => ({
      label: v.varietyName ?? `Giống ${v.id}`,
      value: String(v.id),
    }));
  }, [varietiesQuery.data]);

  const allPonds = useMemo(() => {
    const list: Pond[] = pondsQuery.data?.data ?? [];
    return list.filter(
      (p) =>
        p.pondStatus === PondStatus.EMPTY || p.pondStatus === PondStatus.ACTIVE
    );
  }, [pondsQuery.data]);
  const defaultPondId = currentPondId ?? allPonds?.[0]?.id ?? null;
  const [selectedPondId, setSelectedPondId] = useState<number | null>(
    defaultPondId
  );

  const [customAlert, setCustomAlert] = useState<{
    visible: boolean;
    title?: string;
    message?: string;
    type?: 'danger' | 'warning' | 'info';
  }>({ visible: false, title: undefined, message: undefined, type: 'danger' });

  const showCustomAlert = (
    title: string,
    message?: string,
    type: 'danger' | 'warning' | 'info' = 'danger'
  ) => {
    setCustomAlert({ visible: true, title, message, type });
  };

  useEffect(() => {
    if (visible && !packetFishId) {
      resetForm();
      setSelectedPondId(currentPondId ?? allPonds?.[0]?.id ?? null);
    }
  }, [visible, packetFishId, currentPondId, allPonds]);

  useEffect(() => {
    if (packetQuery.data) {
      const p = packetQuery.data as PacketFish;
      setName(p.name ?? '');
      setDescription(p.description ?? '');
      setFishPerPacket(String(p.fishPerPacket ?? 1));
      setPricePerPacket(String(p.pricePerPacket ?? 0));
      if (p.size) {
        const m = String(p.size).match(/(\d+)\s*-\s*(\d+)/);
        if (m) {
          setMinSize(m[1]);
          setMaxSize(m[2]);
        }
      }
      if (p.varietyPacketFishes && p.varietyPacketFishes.length > 0) {
        const ids = p.varietyPacketFishes
          .map((vp: PacketFishVariety) => Number(vp.varietyId))
          .filter((n: number) => !Number.isNaN(n));
        setSelectedVarietyIds(ids);
      }
      setIsAvailable(!!p.isAvailable);
      setImages(p.images ?? []);
      setSelectedPondId(currentPondId ?? allPonds?.[0]?.id ?? null);
    }
  }, [packetQuery.data, visible, currentPondId, allPonds]);

  const uploadImage = useUploadImage();

  const onlyDigits = (s: string) => s.replace(/[^0-9]/g, '');
  const pickImageFromLibrary = async () => {
    if (images.length >= 6) {
      showCustomAlert(
        'Giới hạn',
        'Bạn chỉ có thể tải lên tối đa 6 ảnh.',
        'warning'
      );
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showCustomAlert(
        'Quyền truy cập bị từ chối',
        'Vui lòng cho phép truy cập ảnh để chọn ảnh từ thư viện',
        'warning'
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

      setShowImageOptions(false);

      const filename = uri.split('/').pop() || `photo.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      const fileForUpload: any = { uri, name: filename, type };

      setIsUploading(true);
      try {
        const res = await uploadImage.mutateAsync({ file: fileForUpload });
        const remoteUrl = (res as any)?.result?.url;
        if (!remoteUrl) throw new Error('Không nhận được URL từ server');
        setImages((prev) => [...prev, remoteUrl]);
      } catch (err: any) {
        console.warn('upload error', err);
        showCustomAlert(
          'Lỗi',
          'Không thể tải ảnh lên. Vui lòng thử lại.',
          'danger'
        );
      } finally {
        setIsUploading(false);
      }
    } catch (err) {
      console.warn('pickImageFromLibrary error', err);
      showCustomAlert('Lỗi', 'Không thể chọn ảnh. Thử lại sau.', 'danger');
    }
  };

  const takePhoto = async () => {
    if (images.length >= 6) {
      showCustomAlert(
        'Giới hạn',
        'Bạn chỉ có thể tải lên tối đa 6 ảnh.',
        'warning'
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      showCustomAlert(
        'Quyền truy cập bị từ chối',
        'Vui lòng cho phép truy cập camera để chụp ảnh',
        'warning'
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

      setShowImageOptions(false);

      const filename = uri.split('/').pop() || `photo.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      const fileForUpload: any = { uri, name: filename, type };

      setIsUploading(true);
      try {
        const res = await uploadImage.mutateAsync({ file: fileForUpload });
        const remoteUrl = (res as any)?.result?.url;
        if (!remoteUrl) throw new Error('Không nhận được URL từ server');
        setImages((prev) => [...prev, remoteUrl]);
      } catch (err: any) {
        console.warn('upload error', err);
        showCustomAlert(
          'Lỗi',
          'Không thể tải ảnh lên. Vui lòng thử lại.',
          'danger'
        );
      } finally {
        setIsUploading(false);
      }
    } catch (err) {
      console.warn('takePhoto error', err);
      showCustomAlert('Lỗi', 'Không thể chụp ảnh. Thử lại sau.', 'danger');
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setFishPerPacket('1');
    setPricePerPacket('0');
    setMinSize('21');
    setMaxSize('25');
    setIsAvailable(true);
    setImages([]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showCustomAlert('Lỗi', 'Tên lô không được bỏ trống', 'danger');
      return;
    }

    if (!selectedPondId) {
      showCustomAlert('Lỗi', 'Vui lòng chọn hồ cho lô cá', 'danger');
      return;
    }

    if (images.length === 0) {
      showCustomAlert('Lỗi', 'Vui lòng thêm ít nhất 1 ảnh cho lô cá', 'danger');
      return;
    }

    if (selectedVarietyIds.length === 0) {
      showCustomAlert('Lỗi', 'Vui lòng chọn ít nhất 1 giống cá', 'danger');
      return;
    }

    const price = Number(pricePerPacket);
    if (isNaN(price) || price <= 0) {
      showCustomAlert('Lỗi', 'Giá phải là lớn hơn 0', 'danger');
      return;
    }

    const min = Number(minSize);
    const max = Number(maxSize);
    if (isNaN(min) || isNaN(max) || min <= 0 || max <= 0) {
      showCustomAlert('Lỗi', 'Size phải lớn hơn 0', 'danger');
      return;
    }
    if (min >= max) {
      showCustomAlert(
        'Lỗi',
        'Size nhỏ nhất phải nhỏ hơn size lớn nhất',
        'danger'
      );
      return;
    }

    const fishCount = Number(fishPerPacket);
    if (isNaN(fishCount) || fishCount <= 0) {
      showCustomAlert('Lỗi', 'Số cá/lô phải lớn hơn 0', 'danger');
      return;
    }

    setSubmitting(true);
    try {
      const birthDate =
        breedingDetailQuery.data?.fryFish?.startDate ||
        breedingDetailQuery.data?.startDate ||
        new Date().toISOString();

      const packetReq: PacketFishRequest = {
        name: name.trim(),
        description: description.trim(),
        minSize: min,
        maxSize: max,
        fishPerPacket: fishCount,
        pricePerPacket: Number(pricePerPacket) || 0,
        birthDate,
        varietyIds:
          selectedVarietyIds && selectedVarietyIds.length
            ? selectedVarietyIds
            : [],
        images: images,
        videos: [],
        isAvailable,
      };

      if (packetFishId) {
        await updatePacketMutation.mutateAsync({
          id: packetFishId,
          data: packetReq,
        });
        Toast.show({ type: 'success', text1: 'Cập nhật lô cá thành công' });
        resetForm();
        onClose();
        onSuccess && onSuccess();
      } else {
        const created = await createPacketMutation.mutateAsync(packetReq);
        const packetId = (created as PacketFish)?.id;
        if (!packetId)
          throw new Error('Không lấy được thông tin lô cá vừa tạo');

        try {
          if (!selectedPondId) throw new Error('Chưa chọn hồ cho lô cá');
          await createPondPacketMutation.mutateAsync({
            pondId: selectedPondId,
            packetFishId: packetId,
            breedingProcessId: breedingId,
          });

          Toast.show({ type: 'success', text1: 'Tạo lô cá thành công' });
          resetForm();
          onClose();
          onSuccess && onSuccess();
        } catch (err: any) {
          try {
            if (packetId) {
              await deletePacketMutation.mutateAsync(packetId);
            }
          } catch (rollbackErr) {
            console.error('Rollback failed', rollbackErr);
          }

          showCustomAlert(
            'Tạo lô thất bại',
            err?.message ?? String(err),
            'danger'
          );
        }
      }
    } catch (err: any) {
      showCustomAlert('Tạo lô thất bại', err?.message ?? String(err), 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="rounded-t-2xl bg-primary pb-3">
          <View className="flex-row items-center justify-between px-5 pt-3">
            <View className="ml-5 flex-1 items-center">
              <Text className="text-base font-medium uppercase tracking-wide text-white/80">
                {packetFishId ? 'Chỉnh sửa' : 'Tạo mới'}
              </Text>
              <Text className="text-2xl font-bold text-white">Lô cá</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
              disabled={submitting}
            >
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: 80,
          }}
          bottomOffset={20}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Info */}
          <View className="mb-4">
            <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
              Thông tin cơ bản
            </Text>

            <View className="rounded-2xl border border-gray-200 bg-white p-4">
              {/* Pond Selection */}
              <View className="mb-4 flex-row items-start">
                <View className="mr-3 mt-1 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                  <Droplet size={18} color="#3b82f6" />
                </View>
                <View className="flex-1">
                  <ContextMenuField
                    label="Chọn hồ *"
                    value={selectedPondId ? String(selectedPondId) : undefined}
                    placeholder="Chọn hồ"
                    options={(allPonds ?? []).map((p: Pond) => ({
                      label: p.pondName,
                      value: String(p.id),
                    }))}
                    onSelect={(v) => setSelectedPondId(Number(v))}
                    onPress={() => pondsQuery.refetch()}
                  />
                </View>
              </View>

              {/* Name */}
              <View className="mb-4 flex-row items-center">
                <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                  <FishSvg size={18} color="#a855f7" />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-medium text-gray-600">
                    Tên lô <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="VD: Lô cá Koi đẹp A1"
                    placeholderTextColor="#9ca3af"
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-base font-medium text-gray-900"
                  />
                </View>
              </View>

              {/* Description */}
              <View className="flex-row items-start">
                <View className="mr-3 mt-1 h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                  <FileText size={18} color="#f59e0b" />
                </View>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-medium text-gray-600">
                    Mô tả (tùy chọn)
                  </Text>
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Thêm mô tả chi tiết về lô cá..."
                    placeholderTextColor="#9ca3af"
                    className="rounded-2xl border border-gray-200 bg-gray-50 px-3 py-3 text-base text-gray-900"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* Images */}
          <View className="mb-4">
            <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
              Hình ảnh ({images.length}/6)
            </Text>
            <View className="rounded-2xl border border-gray-200 bg-white p-4">
              <View className="flex-row flex-wrap" style={{ margin: -6 }}>
                {images.map((url, idx) => (
                  <View key={idx} style={{ width: '50%', padding: 6 }}>
                    <View className="relative">
                      <RNImage
                        source={{ uri: url }}
                        style={{
                          height: 150,
                          width: '100%',
                          borderRadius: 12,
                        }}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        className="absolute right-2 top-2 h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm"
                        onPress={() =>
                          setImages((prev) => prev.filter((_, i) => i !== idx))
                        }
                      >
                        <X size={20} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {images.length < 6 && (
                  <View style={{ width: '50%', padding: 6 }}>
                    <TouchableOpacity
                      className="h-[150px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50"
                      onPress={() => setShowImageOptions(true)}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <ActivityIndicator color="#3b82f6" />
                      ) : (
                        <>
                          <View className="mb-1 h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <Plus size={26} color="#3b82f6" />
                          </View>
                          <Text className="text-base text-gray-500">
                            Thêm ảnh
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Details */}
          <View className="mb-4">
            <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
              Chi tiết lô cá
            </Text>

            <View className="rounded-2xl border border-gray-200 bg-white p-4">
              {/* Variety/Price */}
              <View className="mb-3">
                <View className="mt-3 flex-row">
                  <View className="mr-2 flex-1">
                    <View className="mb-2 flex-row items-center">
                      <View className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-cyan-100">
                        <Ruler size={22} color="#06b6d4" />
                      </View>
                      <Text className="text-base font-medium text-gray-600">
                        Giống
                      </Text>
                    </View>

                    <ContextMenuMultiSelect
                      label=""
                      values={selectedVarietyIds.map(String)}
                      options={
                        varietyOptions.length
                          ? varietyOptions
                          : [{ label: 'Đang tải...', value: '' }]
                      }
                      onChange={(vals) =>
                        setSelectedVarietyIds(vals.map(Number))
                      }
                      placeholder="Chọn giống"
                      onPress={() => varietiesQuery.refetch()}
                    />
                  </View>

                  <View className="flex-1">
                    <View className="mb-2 flex-row items-center">
                      <View className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                        <DollarSign size={22} color="#22c55e" />
                      </View>
                      <Text className="text-base font-medium text-gray-600">
                        Giá (VNĐ)
                      </Text>
                    </View>
                    <TextInput
                      value={pricePerPacket}
                      onChangeText={(t) => setPricePerPacket(onlyDigits(t))}
                      keyboardType="numeric"
                      placeholder="VD: 50000"
                      placeholderTextColor="#9ca3af"
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-base font-medium text-gray-900"
                    />
                  </View>
                </View>
              </View>

              {/* Min/Max size row */}
              <View className="mb-4 flex-row">
                <View className="mr-2 flex-1">
                  <Text className="mb-2 text-base font-medium text-gray-600">
                    Size nhỏ nhất (cm)
                  </Text>
                  <TextInput
                    value={minSize}
                    onChangeText={(t) => setMinSize(onlyDigits(t))}
                    keyboardType="numeric"
                    placeholder="VD: 21cm"
                    placeholderTextColor="#9ca3af"
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-base font-medium text-gray-900"
                  />
                </View>
                <View className="flex-1">
                  <Text className="mb-2 text-base font-medium text-gray-600">
                    Size lớn nhất (cm)
                  </Text>
                  <TextInput
                    value={maxSize}
                    onChangeText={(t) => setMaxSize(onlyDigits(t))}
                    keyboardType="numeric"
                    placeholder="VD: 25cm"
                    placeholderTextColor="#9ca3af"
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-base font-medium text-gray-900"
                  />
                </View>
              </View>

              {/* Fish Count & Availability Row */}
              <View className="flex-row items-center">
                <View className="flex-1">
                  <View className="mb-2 flex-row items-center">
                    <View className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                      <Layers size={22} color="#6366f1" />
                    </View>
                    <Text className="text-base font-medium text-gray-600">
                      Số cá/lô
                    </Text>
                  </View>
                  <TextInput
                    value={fishPerPacket}
                    onChangeText={(t) => setFishPerPacket(onlyDigits(t))}
                    keyboardType="numeric"
                    placeholder="VD: 10"
                    placeholderTextColor="#9ca3af"
                    className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-base font-medium text-gray-900"
                  />
                </View>

                <View className="ml-4 mt-12 flex-row items-center">
                  <Text className="mr-3 text-base font-medium text-gray-700">
                    Đang bán
                  </Text>
                  <Switch
                    value={isAvailable}
                    onValueChange={setIsAvailable}
                    trackColor={{ true: '#22c55e', false: '#d1d5db' }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>
            </View>
          </View>
        </KeyboardAwareScrollView>

        {/* Fixed Bottom Actions */}
        <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-5 py-4">
          <View className="flex-row">
            <TouchableOpacity
              onPress={onClose}
              className="mr-2 flex-1 rounded-2xl border-2 border-gray-200 bg-gray-50 py-4"
              disabled={submitting}
            >
              <Text className="text-center text-base font-semibold text-gray-700">
                Hủy
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              className={`ml-2 flex-1 flex-row items-center justify-center rounded-2xl py-4 ${
                submitting ? 'bg-gray-300' : 'bg-primary'
              }`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text className="ml-2 text-base font-semibold text-white">
                    Đang lưu...
                  </Text>
                </>
              ) : (
                <>
                  {packetFishId ? (
                    <Save size={20} color="white" />
                  ) : (
                    <Plus size={20} color="white" />
                  )}
                  <Text className="ml-2 text-base font-semibold text-white">
                    {packetFishId ? 'Cập nhật' : 'Tạo lô'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Image Options Modal */}
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
                  onPress={pickImageFromLibrary}
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
                  onPress={takePhoto}
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

        <CustomAlert
          visible={customAlert.visible}
          title={customAlert.title ?? 'Lỗi'}
          message={customAlert.message ?? ''}
          type={customAlert.type ?? 'danger'}
          cancelText="Đóng"
          confirmText="OK"
          onCancel={() => setCustomAlert({ ...customAlert, visible: false })}
          onConfirm={() => setCustomAlert({ ...customAlert, visible: false })}
        />
      </SafeAreaView>
    </Modal>
  );
};

export default CreatePacketFishModal;
