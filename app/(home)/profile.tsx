import { useLogout } from '@/hooks/useAuth';
import { useUploadImage } from '@/hooks/useUpload';
import {
  useUpdateAvatar,
  useUpdateUserProfile,
  useUserDetails,
} from '@/hooks/useUserDetails';
import { UpdateProfileRequest } from '@/lib/api/services/fetchUser';
import { formatDate } from '@/lib/utils/formatDate';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
  Calendar,
  Camera,
  Check,
  Edit3,
  LogOut,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  RefreshControl,
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

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  position: string;
  birthday: string;
  joinDate: string;
  address: string;
  avatar?: string;
  gender?: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { profile, isLoading, refetch } = useUserDetails();
  const updateAvatarMutation = useUpdateAvatar();
  const updateProfileMutation = useUpdateUserProfile();
  const isUpdating = (updateProfileMutation as any).isPending ?? false;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!refetch) return;
    setIsRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const [userInfo, setUserInfo] = useState<UserInfo>(() => ({
    name: '',
    email: '',
    phone: '',
    position: '',
    birthday: '',
    joinDate: '',
    address: '',
    avatar: undefined,
    gender: '',
  }));
  const [editForm, setEditForm] = useState<UserInfo>(userInfo);

  React.useEffect(() => {
    if (profile) {
      const mapped: UserInfo = {
        name: profile.fullName || '',
        email: profile.email || '',
        phone: profile.phoneNumber || '',
        position: profile.role || '',
        birthday: profile.dateOfBirth || '',
        joinDate: '',
        address: profile.address || '',
        avatar: profile.avatarURL || undefined,
        gender: (profile as any)?.gender || '',
      };
      setUserInfo(mapped);
      setEditForm(mapped);
    }
  }, [profile]);

  const { logout } = useLogout();
  const uploadImage = useUploadImage();
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleSaveProfile = async () => {
    setShowEditModal(false);
    try {
      const payload: UpdateProfileRequest = {
        fullName: editForm.name || profile?.fullName || '',
        phoneNumber: editForm.phone || (profile as any)?.phoneNumber || '',
        dateOfBirth: editForm.birthday || profile?.dateOfBirth || '',
        gender: editForm.gender || (profile as any)?.gender || '',
        avatarURL: profile?.avatarURL || '',
        address: editForm.address || profile?.address || '',
      };

      await updateProfileMutation.mutateAsync(payload);
      // update UI state after success
      setUserInfo(editForm);
      setShowSuccessAlert(true);
      try {
        await refetch?.();
      } catch {}
    } catch (err) {
      console.error('Update profile failed', err);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể cập nhật hồ sơ',
        position: 'top',
      });
    }
  };

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = () => {
    setShowLogoutAlert(false);
    (async () => {
      try {
        await logout();
      } catch (err) {
        console.error('Logout failed', err);
      } finally {
        router.replace('/(auth)/login');
      }
    })();
  };

  const handleChangeAvatar = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Quyền truy cập bị từ chối',
          text2: 'Vui lòng cho phép truy cập ảnh để chọn ảnh đại diện',
          position: 'top',
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      setIsUploadingAvatar(true);

      const filename = uri.split('/').pop() || 'avatar.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      const file = {
        uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
        name: filename,
        type: type,
      } as any;

      uploadImage.mutate(
        { file },
        {
          onSuccess: (data) => {
            if (data.result?.url) {
              const newUrl = data.result.url;
              setUserInfo({ ...userInfo, avatar: newUrl });
              // persist avatar to server
              (async () => {
                try {
                  await updateAvatarMutation.mutateAsync(newUrl);
                  setShowSuccessAlert(true);
                  // refetch profile to ensure cache sync
                  try {
                    await refetch?.();
                  } catch {}
                } catch (err) {
                  console.error('Update avatar failed', err);
                  Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: 'Không thể cập nhật ảnh đại diện',
                    position: 'top',
                  });
                } finally {
                  setIsUploadingAvatar(false);
                }
              })();
            } else {
              setIsUploadingAvatar(false);
            }
          },
          onError: (error) => {
            console.error('Upload failed:', error);
            setIsUploadingAvatar(false);
            Toast.show({
              type: 'error',
              text1: 'Lỗi',
              text2: 'Không thể tải ảnh lên. Vui lòng thử lại sau.',
              position: 'top',
            });
          },
        }
      );
    } catch (error) {
      console.error('Error picking image:', error);
      setIsUploadingAvatar(false);
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Có lỗi xảy ra khi chọn ảnh. Vui lòng thử lại.',
        position: 'top',
      });
    }
  };

  const ProfileInfoItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <View className="mb-3 flex-row items-center rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
          {label}
        </Text>
        <Text className="text-base font-semibold text-gray-900">
          {value || '—'}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#0A3D62']}
            tintColor="#0A3D62"
          />
        }
      >
        {/* Header with Gradient Background */}
        <View className="bg-primary pb-8 pt-4">
          <View className="px-6">
            <View className="mb-6 flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
                  Xin chào
                </Text>
                <Text className="text-2xl font-bold text-white">
                  Hồ sơ cá nhân
                </Text>
              </View>
              <TouchableOpacity
                className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
                onPress={() => {
                  setEditForm({ ...userInfo });
                  setShowEditModal(true);
                }}
              >
                <Edit3 size={20} color="white" />
              </TouchableOpacity>
            </View>

            {/* Profile Avatar Section */}
            <View className="items-center">
              <View className="relative">
                {isLoading ? (
                  <View className="h-28 w-28 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg">
                    <ActivityIndicator size="large" color="#0A3D62" />
                  </View>
                ) : userInfo.avatar ? (
                  <Image
                    source={{ uri: userInfo.avatar }}
                    className="h-32 w-32 rounded-full border-4 border-white shadow-lg"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-primary to-blue-600 shadow-lg">
                    <User size={48} color="white" />
                  </View>
                )}
                <TouchableOpacity
                  className="absolute -bottom-1 -right-1 h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-primary shadow-lg"
                  onPress={handleChangeAvatar}
                  disabled={isUploadingAvatar}
                >
                  {isUploadingAvatar ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Camera size={18} color="white" />
                  )}
                </TouchableOpacity>
              </View>
              <Text className="mt-4 text-xl font-bold text-white">
                {isLoading ? 'Đang tải...' : userInfo.name}
              </Text>
              <View className="mt-1 rounded-full bg-white/20 px-4 py-1">
                <Text className="text-sm font-medium text-white">
                  {isLoading ? '' : userInfo.position}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Information Cards */}
        <View className="px-6 pt-6">
          <View className="mb-4">
            <Text className="mb-3 text-base font-bold text-gray-900">
              Thông tin liên hệ
            </Text>

            <ProfileInfoItem
              icon={<Mail size={22} color="#0A3D62" />}
              label="Email"
              value={userInfo.email}
            />

            <ProfileInfoItem
              icon={<Phone size={22} color="#0A3D62" />}
              label="Số điện thoại"
              value={userInfo.phone}
            />
          </View>

          <View className="mb-4">
            <Text className="mb-3 text-base font-bold text-gray-900">
              Thông tin cá nhân
            </Text>

            <ProfileInfoItem
              icon={<Calendar size={22} color="#0A3D62" />}
              label="Ngày sinh"
              value={formatDate(userInfo.birthday, 'dd/MM/yyyy')}
            />

            <ProfileInfoItem
              icon={<User size={22} color="#0A3D62" />}
              label="Giới tính"
              value={
                userInfo.gender === 'Male'
                  ? 'Nam'
                  : userInfo.gender === 'Female'
                    ? 'Nữ'
                    : 'Khác'
              }
            />

            <ProfileInfoItem
              icon={<MapPin size={22} color="#0A3D62" />}
              label="Địa chỉ"
              value={userInfo.address}
            />
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="mb-4 flex-row items-center justify-center rounded-2xl bg-red-500 py-4 shadow-sm"
          >
            <LogOut size={22} color="white" />
            <Text className="ml-2 text-base font-bold text-white">
              Đăng xuất
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-4">
          <View
            className="w-full max-w-lg flex-1 overflow-hidden rounded-3xl bg-white"
            style={{ maxHeight: '90%' }}
          >
            {/* Header */}
            <View className="bg-primary pb-6 pt-4">
              <View className="flex-row items-center justify-between px-5">
                <View className="h-10 w-10" />
                <View className="flex-1 items-center">
                  <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <Edit3 size={24} color="white" />
                  </View>
                  <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
                    Cập nhật
                  </Text>
                  <Text className="text-lg font-bold text-white">
                    Chỉnh sửa hồ sơ
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
                  disabled={isUpdating}
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
              {/* Form Fields */}
              <View>
                <FormField
                  icon={<User size={18} color="#6b7280" />}
                  label="Họ và tên"
                  value={editForm.name}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, name: text })
                  }
                  placeholder="Nhập họ và tên"
                />

                <FormField
                  icon={<Phone size={18} color="#6b7280" />}
                  label="Số điện thoại"
                  value={editForm.phone}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, phone: text })
                  }
                  placeholder="0123 456 789"
                  keyboardType="phone-pad"
                />

                {/* Date Picker Field */}
                <View className="mb-3">
                  <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                    Ngày sinh
                  </Text>
                  <TouchableOpacity
                    className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white"
                    onPress={() => setShowDatePicker(true)}
                  >
                    <View className="flex-row items-center px-4 py-4">
                      <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                        <Calendar size={20} color="#3b82f6" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm text-gray-500">Ngày sinh</Text>
                        <Text className="mt-0.5 text-base font-semibold text-gray-900">
                          {formatDate(editForm.birthday, 'dd/MM/yyyy') ||
                            'Chọn ngày sinh'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Gender Selection */}
                <View className="mb-3">
                  <Text className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                    Giới tính
                  </Text>
                  <View className="flex-row gap-3">
                    <TouchableOpacity
                      onPress={() =>
                        setEditForm({ ...editForm, gender: 'Male' })
                      }
                      className={`flex-1 overflow-hidden rounded-2xl border-2 ${
                        editForm.gender === 'Male'
                          ? 'border-primary bg-primary'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <View className="items-center py-4">
                        <View
                          className={`mb-2 h-12 w-12 items-center justify-center rounded-full ${
                            editForm.gender === 'Male'
                              ? 'bg-white/20'
                              : 'bg-blue-50'
                          }`}
                        >
                          <Text className="text-2xl">👨</Text>
                        </View>
                        <Text
                          className={`text-base font-semibold ${editForm.gender === 'Male' ? 'text-white' : 'text-gray-700'}`}
                        >
                          Nam
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() =>
                        setEditForm({ ...editForm, gender: 'Female' })
                      }
                      className={`flex-1 overflow-hidden rounded-2xl border-2 ${
                        editForm.gender === 'Female'
                          ? 'border-pink-500 bg-pink-500'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <View className="items-center py-4">
                        <View
                          className={`mb-2 h-12 w-12 items-center justify-center rounded-full ${
                            editForm.gender === 'Female'
                              ? 'bg-white/20'
                              : 'bg-pink-50'
                          }`}
                        >
                          <Text className="text-2xl">👩</Text>
                        </View>
                        <Text
                          className={`text-base font-semibold ${
                            editForm.gender === 'Female'
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        >
                          Nữ
                        </Text>
                      </View>
                    </TouchableOpacity>

                    {/* <TouchableOpacity
                      onPress={() =>
                        setEditForm({ ...editForm, gender: 'Other' })
                      }
                      className={`flex-1 overflow-hidden rounded-2xl border-2 ${
                        editForm.gender === 'Other'
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <View className="items-center py-4">
                        <View
                          className={`mb-2 h-12 w-12 items-center justify-center rounded-full ${
                            editForm.gender === 'Other'
                              ? 'bg-white/20'
                              : 'bg-purple-50'
                          }`}
                        >
                          <Text className="text-2xl">🧑</Text>
                        </View>
                        <Text
                          className={`text-base font-semibold ${
                            editForm.gender === 'Other'
                              ? 'text-white'
                              : 'text-gray-700'
                          }`}
                        >
                          Khác
                        </Text>
                      </View>
                    </TouchableOpacity> */}
                  </View>
                </View>

                <FormField
                  icon={<MapPin size={18} color="#6b7280" />}
                  label="Địa chỉ"
                  value={editForm.address}
                  onChangeText={(text) =>
                    setEditForm({ ...editForm, address: text })
                  }
                  placeholder="Nhập địa chỉ chi tiết"
                  multiline
                />
              </View>
            </KeyboardAwareScrollView>

            {/* Fixed Bottom Actions */}
            <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-5 py-4">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 items-center justify-center rounded-2xl border-2 border-gray-300 bg-white py-4"
                  onPress={() => setShowEditModal(false)}
                  disabled={isUpdating}
                >
                  <Text className="text-base font-semibold text-gray-700">
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`flex-1 items-center justify-center rounded-2xl py-4 ${
                    isUpdating ? 'bg-primary/60' : 'bg-primary'
                  }`}
                  onPress={handleSaveProfile}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <View className="flex-row items-center">
                      <ActivityIndicator color="#fff" size="small" />
                      <Text className="ml-2 text-base font-semibold text-white">
                        Đang lưu...
                      </Text>
                    </View>
                  ) : (
                    <View className="flex-row items-center">
                      <Check size={18} color="white" />
                      <Text className="ml-2 text-base font-semibold text-white">
                        Lưu thay đổi
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Date Picker Modal */}
        {showDatePicker && Platform.OS === 'ios' && (
          <View className="absolute bottom-0 left-0 right-0 bg-white">
            <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-2">
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text className="text-base font-medium text-primary">Xong</Text>
              </TouchableOpacity>
              <Text className="font-semibold text-gray-900">
                Chọn ngày sinh
              </Text>
              <View style={{ width: 50 }} />
            </View>
            <DateTimePicker
              value={
                editForm.birthday ? new Date(editForm.birthday) : new Date()
              }
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(e: any, selected?: Date) => {
                if (!selected) return;
                const y = selected.getFullYear();
                const m = String(selected.getMonth() + 1).padStart(2, '0');
                const d = String(selected.getDate()).padStart(2, '0');
                setEditForm({ ...editForm, birthday: `${y}-${m}-${d}` });
              }}
            />
          </View>
        )}
        {showDatePicker && Platform.OS === 'android' && (
          <DateTimePicker
            value={editForm.birthday ? new Date(editForm.birthday) : new Date()}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={(e: any, selected?: Date) => {
              setShowDatePicker(false);
              if (!selected) return;
              const y = selected.getFullYear();
              const m = String(selected.getMonth() + 1).padStart(2, '0');
              const d = String(selected.getDate()).padStart(2, '0');
              setEditForm({ ...editForm, birthday: `${y}-${m}-${d}` });
            }}
          />
        )}
      </Modal>

      {/* Success Alert */}
      <Modal visible={showSuccessAlert} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <View className="items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Check size={32} color="#22c55e" />
              </View>
              <Text className="mb-2 text-xl font-bold text-gray-900">
                Thành công!
              </Text>
              <Text className="mb-6 text-center text-sm text-gray-600">
                Thông tin của bạn đã được cập nhật thành công
              </Text>
              <TouchableOpacity
                onPress={() => setShowSuccessAlert(false)}
                className="w-full rounded-2xl bg-primary py-3"
              >
                <Text className="text-center text-base font-semibold text-white">
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Alert */}
      <Modal visible={showLogoutAlert} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <View className="items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <LogOut size={32} color="#ef4444" />
              </View>
              <Text className="mb-2 text-xl font-bold text-gray-900">
                Xác nhận đăng xuất
              </Text>
              <Text className="mb-6 text-center text-sm text-gray-600">
                Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?
              </Text>
              <View className="w-full flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setShowLogoutAlert(false)}
                  className="flex-1 rounded-2xl border-2 border-gray-200 bg-white py-3"
                >
                  <Text className="text-center text-base font-semibold text-gray-700">
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmLogout}
                  className="flex-1 rounded-2xl bg-red-500 py-3"
                >
                  <Text className="text-center text-base font-semibold text-white">
                    Đăng xuất
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Form Field Component
const FormField = ({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: any;
  multiline?: boolean;
}) => (
  <View className="mb-3 overflow-hidden rounded-2xl border border-gray-200 bg-white">
    <View className="flex-row items-center border-b border-gray-100 px-4 py-3">
      <View className="mr-2">{icon}</View>
      <Text className="text-base font-semibold text-gray-700">{label}</Text>
    </View>
    <TextInput
      className="px-4 py-3 text-base font-medium text-gray-900"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#9ca3af"
      keyboardType={keyboardType}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);
