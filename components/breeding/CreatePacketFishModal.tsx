import ContextMenuField from '@/components/ContextMenuField';
import { CustomAlert } from '@/components/CustomAlert';
import { useGetBreedingProcessDetailById } from '@/hooks/useBreedingProcess';
import {
  useCreatePacketFish,
  useDeletePacketFish,
  useGetPacketFishById,
  useUpdatePacketFish,
} from '@/hooks/usePacketFish';
import { useCreatePondPacketFish } from '@/hooks/usePondPacketFish';
import { useUploadImage } from '@/hooks/useUpload';
import { FishSize } from '@/lib/api/services/fetchKoiFish';
import {
  PacketFish,
  PacketFishRequest,
} from '@/lib/api/services/fetchPacketFish';
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
import React, { useEffect, useState } from 'react';
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
  ponds?: { id: number; pondName: string }[];
  currentPondId?: number;
  onSuccess?: () => void;
  packetFishId?: number;
};

export const CreatePacketFishModal: React.FC<Props> = ({
  visible,
  onClose,
  breedingId,
  ponds,
  currentPondId,
  onSuccess,
  packetFishId,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fishPerPacket, setFishPerPacket] = useState<string>('10');
  const [pricePerPacket, setPricePerPacket] = useState<string>('0');
  const [size, setSize] = useState<FishSize>(FishSize.FROM21TO25CM);
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
  const defaultPondId = currentPondId ?? ponds?.[0]?.id ?? null;
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
    if (visible) {
      setSelectedPondId(currentPondId ?? ponds?.[0]?.id ?? null);
    }
  }, [visible, ponds, currentPondId]);

  useEffect(() => {
    if (packetQuery.data) {
      const p = packetQuery.data as PacketFish;
      setName(p.name ?? '');
      setDescription(p.description ?? '');
      setFishPerPacket(String(p.fishPerPacket ?? 1));
      setPricePerPacket(String(p.pricePerPacket ?? 0));
      setSize((p.size as FishSize) ?? FishSize.FROM21TO25CM);
      setIsAvailable(!!p.isAvailable);
      setImages(p.images ?? []);
    }
  }, [packetQuery.data]);

  const uploadImage = useUploadImage();

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
    setSize(FishSize.FROM21TO25CM);
    setIsAvailable(true);
    setImages([]);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      showCustomAlert('Lỗi', 'Tên lô không được bỏ trống', 'danger');
      return;
    }

    const fishCount = Number(fishPerPacket) || 1;

    setSubmitting(true);
    try {
      const birthDate =
        breedingDetailQuery.data?.fryFish?.startDate ||
        breedingDetailQuery.data?.startDate ||
        new Date().toISOString();

      const packetReq: PacketFishRequest = {
        name: name.trim(),
        description: description.trim(),
        fishPerPacket: fishCount,
        pricePerPacket: Number(pricePerPacket) || 0,
        size: size as FishSize,
        birthDate,
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

  const getSizeLabel = (s: FishSize) => {
    const labels: Record<FishSize, string> = {
      [FishSize.UNDER10CM]: '< 10 cm',
      [FishSize.FROM10TO20CM]: '10-20 cm',
      [FishSize.FROM21TO25CM]: '21-25 cm',
      [FishSize.FROM26TO30CM]: '26-30 cm',
      [FishSize.FROM31TO40CM]: '31-40 cm',
      [FishSize.FROM41TO45CM]: '41-45 cm',
      [FishSize.FROM46TO50CM]: '46-50 cm',
      [FishSize.OVER50CM]: '> 50 cm',
    };
    return labels[s] || s;
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
            paddingBottom: 100,
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
                    options={(ponds ?? []).map((p) => ({
                      label: p.pondName,
                      value: String(p.id),
                    }))}
                    onSelect={(v) => setSelectedPondId(Number(v))}
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
              {/* Size & Price Row */}
              <View className="mb-4 flex-row">
                <View className="mr-2 flex-1">
                  <View className="mb-2 flex-row items-center">
                    <View className="mr-2 h-10 w-10 items-center justify-center rounded-full bg-cyan-100">
                      <Ruler size={22} color="#06b6d4" />
                    </View>
                    <Text className="text-base font-medium text-gray-600">
                      Kích thước
                    </Text>
                  </View>
                  <ContextMenuField
                    label=""
                    value={String(size)}
                    options={Object.values(FishSize).map((v) => ({
                      label: getSizeLabel(v),
                      value: String(v),
                    }))}
                    onSelect={(v) => setSize(v as FishSize)}
                    placeholder="Chọn kích thước"
                  />
                </View>

                <View className="ml-2 flex-1">
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
                    onChangeText={setPricePerPacket}
                    keyboardType="numeric"
                    placeholder="0"
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
                    onChangeText={setFishPerPacket}
                    keyboardType="numeric"
                    placeholder="10"
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
                  <Save size={20} color="white" />
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
