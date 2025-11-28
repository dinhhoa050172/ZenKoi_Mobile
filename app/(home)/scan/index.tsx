import { CustomAlert } from '@/components/CustomAlert';
import { useGetKoiFishByRFID, useIdentifyKoiReID } from '@/hooks/useKoiFish';
import { useUploadImage } from '@/hooks/useUpload';
import { KoiFish } from '@/lib/api/services/fetchKoiFish';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
  Camera,
  CheckCircle,
  Image as ImageIcon,
  Search,
  X,
  Zap,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
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

export default function ScanScreen() {
  const [activeTab, setActiveTab] = useState<'rfid' | 'image'>('rfid');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const [rfidToSearch, setRfidToSearch] = useState('');
  const koiQuery = useGetKoiFishByRFID(rfidToSearch, !!rfidToSearch);

  // Image identification states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const identifyMutation = useIdentifyKoiReID();
  const uploadImage = useUploadImage();

  // Reset search input each time screen is focused
  useFocusEffect(
    React.useCallback(() => {
      setCode('');
      setRfidToSearch('');
      setIsLoading(false);
      setSelectedImage(null);
      setIsUploadingImage(false);
      return () => {};
    }, [])
  );

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

  const handleSearch = async (searchCode = code) => {
    if (!searchCode.trim()) {
      showCustomAlert({
        title: 'Lỗi',
        message: 'Vui lòng nhập mã hoặc quét RFID',
        type: 'warning',
      });
      return;
    }
    setIsLoading(true);
    Keyboard.dismiss();
    setRfidToSearch(searchCode.trim());
  };

  useEffect(() => {
    if (koiQuery.isFetching) {
      setIsLoading(true);
      return;
    }

    if (koiQuery.data) {
      setIsLoading(false);
      const koi = koiQuery.data as any;
      const id = koi?.id;
      if (id) {
        router.push({
          pathname: '/koi/[id]',
          params: { id: String(id), redirect: '/scan' },
        });
        setRfidToSearch('');
      }
    } else if (koiQuery.isError) {
      setIsLoading(false);
      showCustomAlert({
        title: 'Lỗi',
        message: 'Không tìm thấy cá Koi hoặc có lỗi khi tìm kiếm.',
        type: 'danger',
      });
    }
  }, [koiQuery.data, koiQuery.isFetching, koiQuery.isError]);

  const clearInput = () => {
    setCode('');
    inputRef.current?.focus();
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showCustomAlert({
        title: 'Quyền truy cập bị từ chối',
        message: 'Vui lòng cho phép truy cập ảnh để chọn ảnh',
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
      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      setSelectedImage(uri);
    } catch (err) {
      console.warn('pickImage error', err);
      showCustomAlert({
        title: 'Lỗi',
        message: 'Không thể chọn ảnh. Thử lại sau.',
        type: 'danger',
      });
    }
  };

  const takePhoto = async () => {
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
      if (result.canceled) return;
      const uri = result.assets?.[0]?.uri;
      if (!uri) return;

      setSelectedImage(uri);
    } catch (err) {
      console.warn('takePhoto error', err);
      showCustomAlert({
        title: 'Lỗi',
        message: 'Không thể chụp ảnh. Thử lại sau.',
        type: 'danger',
      });
    }
  };

  const identifyFish = async () => {
    if (!selectedImage) return;

    setIsUploadingImage(true);
    try {
      // Upload image first
      const filename = selectedImage.split('/').pop() || `photo.jpg`;
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      const fileForUpload: any = { uri: selectedImage, name: filename, type };

      const uploadRes = await uploadImage.mutateAsync({ file: fileForUpload });
      const remoteUrl = uploadRes?.result?.url;

      if (!remoteUrl) {
        throw new Error('Không nhận được URL từ server');
      }

      // Identify fish
      await identifyMutation.mutateAsync(remoteUrl);
    } catch (err) {
      console.warn('identifyFish error', err);
      showCustomAlert({
        title: 'Lỗi',
        message: 'Không thể nhận diện cá. Vui lòng thử lại.',
        type: 'danger',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white shadow-sm">
          <View className="flex-row items-center justify-between p-4 pt-2">
            <View className="w-10" />

            <Text className="text-lg font-semibold text-gray-900">
              {activeTab === 'rfid' ? 'Quét RFID' : 'Nhận diện cá Koi'}
            </Text>

            <TouchableOpacity
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            >
              <X size={20} color="red" />
            </TouchableOpacity>
          </View>
        </View>

        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
          showsVerticalScrollIndicator={false}
          bottomOffset={20}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tab Selector */}
          <View className="mx-6 mt-4 flex-row rounded-2xl border border-gray-200 bg-white p-1">
            <TouchableOpacity
              onPress={() => setActiveTab('rfid')}
              className={`flex-1 rounded-2xl px-4 py-3 ${
                activeTab === 'rfid' ? 'bg-primary' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === 'rfid' ? 'text-white' : 'text-gray-600'
                }`}
              >
                RFID
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('image')}
              className={`flex-1 rounded-2xl px-4 py-3 ${
                activeTab === 'image' ? 'bg-primary' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === 'image' ? 'text-white' : 'text-gray-600'
                }`}
              >
                Nhận diện ảnh
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'rfid' ? (
            <>
              {/* RFID Scanner Section */}
              <View className="p-6">
                <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <View className="mb-6 items-center">
                    <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Zap size={32} color="#0A3D62" />
                    </View>
                    <Text className="mb-2 text-xl font-semibold text-gray-900">
                      RFID Scanner
                    </Text>
                    <Text className="text-center leading-5 text-gray-600">
                      Đặt thẻ RFID gần thiết bị để quét tự động
                    </Text>
                  </View>

                  {/* Manual Input */}
                  <Text className="mb-3 font-medium text-gray-700">
                    Nhập mã RFID:
                  </Text>

                  <View className="mb-4 flex-row">
                    <View className="relative flex-1">
                      <TextInput
                        ref={inputRef}
                        value={code}
                        onChangeText={setCode}
                        placeholder="Nhập mã RFID..."
                        placeholderTextColor="#9ca3af"
                        className="rounded-2xl border border-primary/30 bg-gray-50 px-4 py-3 text-base text-gray-900 focus:border-primary"
                        autoCapitalize="characters"
                        autoCorrect={false}
                      />
                      {code.length > 0 && (
                        <TouchableOpacity
                          onPress={clearInput}
                          className="absolute right-3 top-3"
                        >
                          <X size={20} color="#9ca3af" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Search Button */}
                  <TouchableOpacity
                    onPress={() => handleSearch()}
                    disabled={!code.trim() || isLoading}
                    className={`${
                      !code.trim() || isLoading
                        ? 'bg-gray-300'
                        : 'bg-primary active:bg-primary/90'
                    } rounded-2xl px-6 py-3`}
                  >
                    <View className="flex-row items-center justify-center">
                      {isLoading ? (
                        <>
                          <ActivityIndicator size="small" color="white" />
                          <Text className="ml-2 font-semibold text-white">
                            Đang tìm kiếm...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Search size={20} color="white" />
                          <Text className="ml-2 font-semibold text-white">
                            Tìm kiếm
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Instructions */}
              <View className="px-6">
                <View className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <View className="flex-row items-start">
                    <View className="mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <CheckCircle size={14} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-2 font-medium text-primary">
                        Hướng dẫn sử dụng:
                      </Text>
                      <Text className="text-sm leading-5 text-primary/80">
                        • Nhập mã thủ công vào ô tìm kiếm{'\n'}• Nhấn &quot;Tìm
                        kiếm&quot; để xem thông tin chi tiết của cá Koi
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </>
          ) : (
            <>
              {/* Image Identification Section */}
              <View className="p-6">
                <View className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <View className="mb-6 items-center">
                    <Text className="mb-2 text-xl font-semibold text-gray-900">
                      Nhận diện cá Koi
                    </Text>
                    <Text className="text-center leading-5 text-gray-600">
                      Chụp ảnh hoặc chọn ảnh từ thư viện để nhận diện cá Koi
                    </Text>
                  </View>

                  {/* Image Selection */}
                  <View className="mb-6">
                    {selectedImage ? (
                      <View className="items-center">
                        <Image
                          source={{ uri: selectedImage }}
                          className="mb-4 h-80 w-full rounded-2xl"
                          resizeMode="cover"
                        />
                        <TouchableOpacity
                          onPress={() => setSelectedImage(null)}
                          className="rounded-2xl bg-red-500 px-4 py-2"
                        >
                          <Text className="font-medium text-white">
                            Chọn ảnh khác
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View className="flex-row justify-center space-x-4">
                        <TouchableOpacity
                          onPress={pickImage}
                          className="flex-1 items-center rounded-2xl bg-gray-50 p-4"
                        >
                          <ImageIcon size={24} color="#6b7280" />
                          <Text className="mt-2 text-center text-sm text-gray-600">
                            Chọn từ thư viện
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={takePhoto}
                          className="flex-1 items-center rounded-2xl bg-gray-50 p-4"
                        >
                          <Camera size={24} color="#6b7280" />
                          <Text className="mt-2 text-center text-sm text-gray-600">
                            Chụp ảnh
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                  {/* Identify Button */}
                  <TouchableOpacity
                    onPress={identifyFish}
                    disabled={
                      !selectedImage ||
                      isUploadingImage ||
                      identifyMutation.isPending
                    }
                    className={`${
                      !selectedImage ||
                      isUploadingImage ||
                      identifyMutation.isPending
                        ? 'bg-gray-300'
                        : 'bg-primary active:bg-primary/90'
                    } rounded-2xl px-6 py-3`}
                  >
                    <View className="flex-row items-center justify-center">
                      {isUploadingImage || identifyMutation.isPending ? (
                        <>
                          <ActivityIndicator size="small" color="white" />
                          <Text className="ml-2 font-semibold text-white">
                            Đang nhận diện...
                          </Text>
                        </>
                      ) : (
                        <>
                          <Search size={20} color="white" />
                          <Text className="ml-2 font-semibold text-white">
                            Nhận diện cá
                          </Text>
                        </>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Identification Result */}
              {identifyMutation.data &&
                (() => {
                  const res = identifyMutation.data;
                  const koi = res.koiFish as KoiFish;
                  const imageUri =
                    koi?.images && koi.images.length > 0
                      ? koi.images[0]
                      : res.imageUrl || null;

                  return (
                    <View className="mb-4 px-6">
                      <View className="overflow-hidden rounded-3xl border border-green-200 bg-white shadow-lg">
                        {/* Header Section */}
                        <View className="bg-gradient-to-r from-green-50 to-emerald-50 px-5 py-4">
                          <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center">
                              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-500">
                                <CheckCircle size={20} color="white" />
                              </View>
                              <View>
                                <Text className="text-base font-bold text-gray-900">
                                  Kết quả nhận diện
                                </Text>
                                <Text className="text-sm text-gray-500">
                                  Tìm thấy kết quả phù hợp
                                </Text>
                              </View>
                            </View>

                            <View className="items-end">
                              <View className="rounded-full bg-green-500 px-3 py-1.5">
                                <Text className="text-sm font-bold text-white">
                                  {res.confidence.toFixed(1)}%
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>

                        {/* Content Section */}
                        <View className="p-5">
                          <View className="flex-row">
                            {/* Image */}
                            <View className="mr-2">
                              {imageUri ? (
                                <Image
                                  source={{ uri: imageUri }}
                                  className="h-32 w-32 rounded-2xl bg-gray-100"
                                  resizeMode="cover"
                                />
                              ) : (
                                <View className="h-32 w-32 items-center justify-center rounded-2xl bg-gray-100">
                                  <ImageIcon size={40} color="#9ca3af" />
                                </View>
                              )}
                            </View>

                            {/* Details */}
                            <View className="flex-1">
                              <View className="rounded-2xl bg-blue-50 px-2 py-1 text-center">
                                <Text className="text-sm font-medium text-blue-700">
                                  RFID: {koi?.rfid ?? 'N/A'}
                                </Text>
                              </View>

                              {/* Info Cards */}
                              <View className="gap-2">
                                <View className="flex-row items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
                                  <Text className="text-sm text-gray-500">
                                    Giống cá
                                  </Text>
                                  <Text className="mt-0.5 text-sm font-semibold text-gray-900">
                                    {koi?.variety?.varietyName ?? '-'}
                                  </Text>
                                </View>

                                <View className="flex-row items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
                                  <Text className="text-sm text-gray-500">
                                    Bể nuôi
                                  </Text>
                                  <Text className="mt-0.5 text-sm font-semibold text-gray-900">
                                    {koi?.pond?.pondName ?? '-'}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>

                          {/* Action Buttons */}
                          <View className="mt-5 flex-row space-x-3">
                            <TouchableOpacity
                              onPress={() =>
                                router.push({
                                  pathname: '/koi/[id]',
                                  params: {
                                    id: String(koi?.id ?? ''),
                                    redirect: '/scan',
                                  },
                                })
                              }
                              className="flex-1 items-center justify-center rounded-2xl bg-primary px-4 py-3.5 shadow-sm"
                            >
                              <Text className="font-semibold text-white">
                                Xem chi tiết
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })()}

              {/* Instructions */}
              <View className="px-6">
                <View className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
                  <View className="flex-row items-start">
                    <View className="mr-3 mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-primary">
                      <CheckCircle size={14} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-2 font-medium text-primary">
                        Hướng dẫn sử dụng:
                      </Text>
                      <Text className="text-sm leading-5 text-primary/80">
                        • Chọn ảnh hoặc chụp ảnh cá Koi{'\n'}• Nhấn &quot;Nhận
                        diện cá&quot; để tìm kiếm thông tin
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </>
          )}
        </KeyboardAwareScrollView>
      </View>

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
