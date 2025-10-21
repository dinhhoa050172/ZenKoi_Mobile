import { useLogout } from '@/hooks/useAuth';
import { router } from 'expo-router';
import {
  Calendar,
  Camera,
  Check,
  Edit,
  LogOut,
  Mail,
  MapPin,
  Phone,
  User,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

interface UserInfo {
  name: string;
  email: string;
  phone: string;
  position: string;
  birthday: string;
  joinDate: string;
  address: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@zenkoi.com',
    phone: '0123 456 789',
    position: 'Nhân viên chăm sóc cá',
    birthday: '15/08/1990',
    joinDate: '15/03/2023',
    address: 'Quận 1, TP. Hồ Chí Minh',
  });
  const [editForm, setEditForm] = useState<UserInfo>(userInfo);
  const { logout } = useLogout();

  const handleSaveProfile = () => {
    setUserInfo(editForm);
    setShowEditModal(false);
    setShowSuccessAlert(true);
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

  const ProfileInfoItem = ({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) => (
    <View className="mb-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <View className="flex-row items-center">
        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          {icon}
        </View>
        <View className="flex-1">
          <Text className="mb-1 text-sm text-gray-500">{label}</Text>
          <Text className="font-medium text-gray-900">{value}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-gray-900">
              Hồ sơ cá nhân
            </Text>
            <TouchableOpacity
              className="flex-row items-center rounded-lg bg-primary px-4 py-2"
              onPress={() => {
                setEditForm({ ...userInfo });
                setShowEditModal(true);
              }}
            >
              <Edit size={16} color="white" />
              <Text className="ml-2 font-medium text-white">Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Avatar */}
          <View className="mb-6 items-center">
            <View className="relative">
              <View className="h-24 w-24 items-center justify-center rounded-full bg-primary">
                <User size={40} color="white" />
              </View>
              <TouchableOpacity className="absolute -bottom-2 -right-2 rounded-full border border-gray-200 bg-white p-2 shadow-md">
                <Camera size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text className="mt-3 text-xl font-bold text-gray-900">
              {userInfo.name}
            </Text>
            <Text className="text-gray-600">{userInfo.position}</Text>
          </View>

          {/* Profile Information */}
          <View className="mb-2">
            <Text className="mb-4 text-lg font-semibold text-gray-900">
              Thông tin cá nhân
            </Text>

            <ProfileInfoItem
              icon={<Mail size={20} color="#0A3D62" />}
              label="Email"
              value={userInfo.email}
            />

            <ProfileInfoItem
              icon={<Phone size={20} color="#0A3D62" />}
              label="Số điện thoại"
              value={userInfo.phone}
            />

            <ProfileInfoItem
              icon={<Calendar size={20} color="#0A3D62" />}
              label="Ngày sinh"
              value={userInfo.birthday}
            />

            <ProfileInfoItem
              icon={<Calendar size={20} color="#0A3D62" />}
              label="Ngày vào làm"
              value={userInfo.joinDate}
            />

            <ProfileInfoItem
              icon={<MapPin size={20} color="#0A3D62" />}
              label="Địa chỉ"
              value={userInfo.address}
            />
          </View>

          {/* Logout Button */}
          <View className="px-4">
            <TouchableOpacity
              onPress={handleLogout}
              className="flex-row items-center justify-center rounded-2xl bg-red-500 py-4 shadow-sm"
            >
              <LogOut size={20} color="white" />
              <Text className="ml-2 text-lg font-bold text-white">
                Đăng xuất
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
          {/* Modern Header */}
          <View className="bg-white shadow-sm">
            <View className="flex-row items-center justify-between px-6 py-4">
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                className="rounded-full bg-gray-100 px-4 py-2"
              >
                <Text className="font-medium text-gray-700">Hủy</Text>
              </TouchableOpacity>

              <View className="items-center">
                <Text className="text-xl font-bold text-gray-900">
                  Chỉnh sửa hồ sơ
                </Text>
                <Text className="mt-1 text-sm text-gray-500">
                  Cập nhật thông tin cá nhân
                </Text>
              </View>

              <TouchableOpacity
                onPress={handleSaveProfile}
                className="rounded-full bg-primary px-4 py-2 shadow-sm"
              >
                <Text className="font-semibold text-white">Lưu</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="px-6 py-3">
              {/* Form Fields */}
              <View className="space-y-6">
                <View>
                  <Text className="mb-1 text-base font-semibold text-gray-800">
                    <User size={16} color="#6b7280" /> Họ và tên
                  </Text>
                  <TextInput
                    className="mb-2 rounded-2xl border-2 border-gray-100 bg-white px-5 py-4 font-medium text-gray-900 shadow-sm"
                    style={{ fontSize: 16 }}
                    value={editForm.name}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, name: text })
                    }
                    placeholder="Nhập họ và tên"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View>
                  <Text className="mb-1 text-base font-semibold text-gray-800">
                    <Phone size={16} color="#6b7280" /> Số điện thoại
                  </Text>
                  <TextInput
                    className="mb-2 rounded-2xl border-2 border-gray-100 bg-white px-5 py-4 font-medium text-gray-900 shadow-sm"
                    style={{ fontSize: 16 }}
                    value={editForm.phone}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, phone: text })
                    }
                    keyboardType="phone-pad"
                    placeholder="0123 456 789"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View>
                  <Text className="mb-1 text-base font-semibold text-gray-800">
                    <Calendar size={16} color="#6b7280" /> Ngày sinh
                  </Text>
                  <TextInput
                    className="mb-2 rounded-2xl border-2 border-gray-100 bg-white px-5 py-4 font-medium text-gray-900 shadow-sm"
                    style={{ fontSize: 16 }}
                    value={editForm.birthday}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, birthday: text })
                    }
                    placeholder="dd/mm/yyyy"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                <View>
                  <Text className="mb-1 text-base font-semibold text-gray-800">
                    <MapPin size={16} color="#6b7280" /> Địa chỉ
                  </Text>
                  <TextInput
                    className="mb-2 rounded-2xl border-2 border-gray-100 bg-white px-5 py-4 font-medium text-gray-900 shadow-sm"
                    style={{ fontSize: 16 }}
                    value={editForm.address}
                    onChangeText={(text) =>
                      setEditForm({ ...editForm, address: text })
                    }
                    placeholder="Nhập địa chỉ chi tiết"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Custom Success Alert */}
      <Modal visible={showSuccessAlert} transparent={true} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="mx-8 rounded-3xl bg-white p-6 shadow-2xl">
            <View className="items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Text className="text-2xl">
                  <Check size={24} color="#22c55e" />
                </Text>
              </View>
              <Text className="mb-2 text-xl font-bold text-gray-900">
                Thành công!
              </Text>
              <Text className="mb-6 text-center text-gray-600">
                Thông tin đã được cập nhật thành công
              </Text>
              <TouchableOpacity
                onPress={() => setShowSuccessAlert(false)}
                className="w-full rounded-2xl bg-primary px-8 py-3"
              >
                <Text className="text-center text-lg font-semibold text-white">
                  Đóng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Logout Alert */}
      <Modal visible={showLogoutAlert} transparent={true} animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50">
          <View className="mx-8 rounded-3xl bg-white p-6 shadow-2xl">
            <View className="items-center">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <LogOut size={32} color="#ef4444" />
              </View>
              <Text className="mb-2 text-xl font-bold text-gray-900">
                Đăng xuất
              </Text>
              <Text className="mb-6 text-center text-gray-600">
                Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?
              </Text>
              <View className="w-full flex-row">
                <TouchableOpacity
                  onPress={() => setShowLogoutAlert(false)}
                  className="mr-2 flex-1 rounded-2xl bg-gray-100 py-3"
                >
                  <Text className="text-center text-lg font-semibold text-gray-700">
                    Hủy
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={confirmLogout}
                  className="flex-1 rounded-2xl bg-red-500 py-3"
                >
                  <Text className="text-center text-lg font-semibold text-white">
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
