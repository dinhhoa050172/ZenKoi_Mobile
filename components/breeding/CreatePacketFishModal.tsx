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
import { Plus } from 'lucide-react-native';
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
import Toast from 'react-native-toast-message';

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

  // When editing an existing packet, fill the form with fetched data
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

      // Close the image options modal immediately when upload will start
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
        setShowImageOptions(false);
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
        setShowImageOptions(false);
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
      // Build PacketFishRequest
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
        // Edit existing packet: update packet fish only
        await updatePacketMutation.mutateAsync({
          id: packetFishId,
          data: packetReq,
        });
        Toast.show({ type: 'success', text1: 'Cập nhật lô cá thành công' });
        resetForm();
        onClose();
        onSuccess && onSuccess();
      } else {
        // Create packet fish
        const created = await createPacketMutation.mutateAsync(packetReq);
        const packetId = (created as PacketFish)?.id;
        if (!packetId)
          throw new Error('Không lấy được thông tin lô cá vừa tạo');

        try {
          // Create PondPacketFish
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
          // If creating pond-packet fails, rollback packet fish creation
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
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/40">
        <View className="rounded-t-2xl bg-white p-4">
          <Text className="mb-3 text-lg font-semibold text-gray-900">
            {packetFishId ? 'Cập nhật lô cá' : 'Tạo lô cá'}
          </Text>

          <ContextMenuField
            label="Chọn hồ"
            value={selectedPondId ? String(selectedPondId) : undefined}
            placeholder="Chọn hồ"
            options={(ponds ?? []).map((p) => ({
              label: p.pondName,
              value: String(p.id),
            }))}
            onSelect={(v) => setSelectedPondId(Number(v))}
          />

          <Text className="mb-2 text-base font-medium text-gray-900">
            Tên lô
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Tên"
            className="mb-3 mt-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
          />

          <Text className="mb-2 text-base font-medium text-gray-900">
            Mô tả
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Mô tả (tùy chọn)"
            className="mb-3 mt-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
            multiline
          />

          {/* Images gallery */}
          <View className="mb-3">
            <Text className="mb-2 text-base font-medium text-gray-900">
              Ảnh lô cá
            </Text>
            <View className="-m-2 flex-row flex-wrap">
              {images.map((url, idx) => (
                <View key={idx} className="p-2" style={{ width: '33.3333%' }}>
                  <View className="relative">
                    <RNImage
                      source={{ uri: url }}
                      style={{ height: 96, width: '100%', borderRadius: 8 }}
                    />
                    <TouchableOpacity
                      className="absolute right-1 top-1 rounded-full bg-white px-2 py-1"
                      onPress={() =>
                        setImages((prev) => prev.filter((_, i) => i !== idx))
                      }
                    >
                      <Text className="text-sm text-red-500">✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              {(images.length ?? 0) < 6 && (
                <View className="p-2" style={{ width: '33.3333%' }}>
                  <TouchableOpacity
                    className="h-28 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
                    onPress={() => setShowImageOptions(true)}
                  >
                    {isUploading ? (
                      <ActivityIndicator />
                    ) : (
                      <View className="flex-row items-center space-x-2">
                        <Plus size={20} color="#6b7280" />
                        <Text className="text-gray-500">Thêm ảnh</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <ContextMenuField
                label="Kích thước"
                value={String(size)}
                options={Object.values(FishSize).map((v) => ({
                  label:
                    v === FishSize.UNDER10CM
                      ? 'Dưới 10 cm'
                      : v === FishSize.FROM10TO20CM
                        ? '10 - 20 cm'
                        : v === FishSize.FROM21TO25CM
                          ? '21 - 25 cm'
                          : v === FishSize.FROM26TO30CM
                            ? '26 - 30 cm'
                            : v === FishSize.FROM31TO40CM
                              ? '31 - 40 cm'
                              : v === FishSize.FROM41TO45CM
                                ? '41 - 45 cm'
                                : v === FishSize.FROM46TO50CM
                                  ? '46 - 50 cm'
                                  : 'Trên 50 cm',
                  value: String(v),
                }))}
                onSelect={(v) => setSize(v as FishSize)}
                placeholder="Chọn kích thước"
              />
            </View>

            <View className="flex-1 pl-2">
              <Text className="mb-2 text-base font-medium text-gray-900">
                Giá mỗi lô (VNĐ)
              </Text>
              <TextInput
                value={pricePerPacket}
                onChangeText={setPricePerPacket}
                keyboardType="numeric"
                className="mb-3 mt-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
              />
            </View>
          </View>

          {/* Số cá mỗi lô */}

          <View className="flex-row items-center justify-between">
            <View className="mb-3 flex-1 pr-2">
              <Text className="mb-2 text-base font-medium text-gray-900">
                Số cá mỗi lô (con)
              </Text>
              <TextInput
                value={fishPerPacket}
                onChangeText={setFishPerPacket}
                keyboardType="numeric"
                className="mb-3 mt-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
              />
            </View>

            <View className="mt-6 flex-1 flex-row items-center justify-between pl-2">
              <Text className="mb-2 text-base font-medium text-gray-900">
                Đang bán
              </Text>
              <Switch value={isAvailable} onValueChange={setIsAvailable} />
            </View>
          </View>

          <View className="flex-row items-center justify-between">
            <TouchableOpacity
              onPress={() => {
                if (submitting) return;
                onClose();
              }}
              className="mr-2 flex-1 items-center justify-center rounded-lg border border-gray-200 px-4 py-2"
            >
              <Text>Hủy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSubmit}
              className="ml-2 flex-1 items-center justify-center rounded-lg bg-primary px-4 py-2"
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white">
                  {packetFishId ? 'Cập nhật lô cá' : 'Tạo lô cá'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
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

          {/* Image options modal */}
          <Modal
            visible={showImageOptions}
            transparent
            animationType="fade"
            onRequestClose={() => setShowImageOptions(false)}
          >
            <View className="flex-1 items-center justify-center bg-black/50 p-4">
              <View className="w-full max-w-sm rounded-2xl bg-white p-4">
                <TouchableOpacity
                  className="mb-3 items-center rounded-lg border border-gray-200 bg-white py-4"
                  onPress={() => pickImageFromLibrary()}
                >
                  <Text className="text-base font-medium text-gray-900">
                    Chọn từ thư viện
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="mb-3 items-center rounded-lg border border-gray-200 bg-white py-4"
                  onPress={() => takePhoto()}
                >
                  <Text className="text-base font-medium text-gray-900">
                    Chụp ảnh
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="items-center rounded-lg border border-gray-200 bg-white py-3"
                  onPress={() => setShowImageOptions(false)}
                >
                  <Text className="text-base text-red-500">Hủy</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

export default CreatePacketFishModal;
