import { router } from 'expo-router';
import { Calendar, Camera, Check, Edit, LogOut, Mail, MapPin, Phone, User } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

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
    address: 'Quận 1, TP. Hồ Chí Minh'
  });
  const [editForm, setEditForm] = useState<UserInfo>(userInfo);

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
    // Clear any stored auth data here if needed
    router.replace('/(auth)/login');
  };

  const ProfileInfoItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
    <View className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100">
      <View className="flex-row items-center">
        <View className="w-10 h-10 bg-primary/10 rounded-full items-center justify-center mr-3">
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-sm text-gray-500 mb-1">{label}</Text>
          <Text className="text-gray-900 font-medium">{value}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <Text className="text-2xl font-bold text-gray-900">
              Hồ sơ cá nhân
            </Text>
            <TouchableOpacity 
              className="bg-primary rounded-lg px-4 py-2 flex-row items-center"
              onPress={() => {
                setEditForm({...userInfo});
                setShowEditModal(true);
              }}
            >
              <Edit size={16} color="white" />
              <Text className="text-white font-medium ml-2">Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>

          {/* Profile Avatar */}
          <View className="items-center mb-6">
            <View className="relative">
              <View className="w-24 h-24 bg-primary rounded-full items-center justify-center">
                <User size={40} color="white" />
              </View>
              <TouchableOpacity className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md border border-gray-200">
                <Camera size={16} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <Text className="text-xl font-bold text-gray-900 mt-3">{userInfo.name}</Text>
            <Text className="text-gray-600">{userInfo.position}</Text>
          </View>

          {/* Profile Information */}
          <View className="mb-2">
            <Text className="text-lg font-semibold text-gray-900 mb-4">
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
              className="bg-red-500 rounded-2xl py-4 flex-row items-center justify-center shadow-sm"
            >
              <LogOut size={20} color="white" />
              <Text className="text-white font-bold text-lg ml-2">
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
                className="bg-gray-100 rounded-full px-4 py-2"
              >
                <Text className="text-gray-700 font-medium">Hủy</Text>
              </TouchableOpacity>
              
              <View className="items-center">
                <Text className="text-xl font-bold text-gray-900">Chỉnh sửa hồ sơ</Text>
                <Text className="text-sm text-gray-500 mt-1">Cập nhật thông tin cá nhân</Text>
              </View>
              
              <TouchableOpacity 
                onPress={handleSaveProfile}
                className="bg-primary rounded-full px-4 py-2 shadow-sm"
              >
                <Text className="text-white font-semibold">Lưu</Text>
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
                  <Text className="text-gray-800 font-semibold mb-1 text-base">
                    <User size={16} color="#6b7280" /> Họ và tên
                  </Text>
                  <TextInput
                    className="bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 mb-2 text-gray-900 font-medium shadow-sm"
                    style={{ fontSize: 16 }}
                    value={editForm.name}
                    onChangeText={(text) => setEditForm({...editForm, name: text})}
                    placeholder="Nhập họ và tên"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                
                <View>
                  <Text className="text-gray-800 font-semibold mb-1 text-base">
                    <Phone size={16} color="#6b7280" /> Số điện thoại
                  </Text>
                  <TextInput
                    className="bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 mb-2 text-gray-900 font-medium shadow-sm"
                    style={{ fontSize: 16 }}
                    value={editForm.phone}
                    onChangeText={(text) => setEditForm({...editForm, phone: text})}
                    keyboardType="phone-pad"
                    placeholder="0123 456 789"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                
                <View>
                  <Text className="text-gray-800 font-semibold mb-1 text-base">
                    <Calendar size={16} color="#6b7280" /> Ngày sinh
                  </Text>
                  <TextInput
                    className="bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 mb-2 text-gray-900 font-medium shadow-sm"
                    style={{ fontSize: 16 }}
                    value={editForm.birthday}
                    onChangeText={(text) => setEditForm({...editForm, birthday: text})}
                    placeholder="dd/mm/yyyy"
                    placeholderTextColor="#9ca3af"
                  />
                </View>
                
                <View>
                  <Text className="text-gray-800 font-semibold mb-1 text-base">
                    <MapPin size={16} color="#6b7280" /> Địa chỉ
                  </Text>
                  <TextInput
                    className="bg-white border-2 border-gray-100 rounded-2xl px-5 py-4 mb-2 text-gray-900 font-medium shadow-sm"
                    style={{ fontSize: 16 }}
                    value={editForm.address}
                    onChangeText={(text) => setEditForm({...editForm, address: text})}
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
      <Modal
        visible={showSuccessAlert}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-3xl p-6 mx-8 shadow-2xl">
            <View className="items-center">
              <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                <Text className="text-2xl"><Check size={24} color="#22c55e" /></Text>
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Thành công!</Text>
              <Text className="text-gray-600 text-center mb-6">
                Thông tin đã được cập nhật thành công
              </Text>
              <TouchableOpacity 
                onPress={() => setShowSuccessAlert(false)}
                className="bg-primary rounded-2xl py-3 px-8 w-full"
              >
                <Text className="text-white font-semibold text-center text-lg">Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Logout Alert */}
      <Modal
        visible={showLogoutAlert}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-3xl p-6 mx-8 shadow-2xl">
            <View className="items-center">
              <View className="w-16 h-16 bg-red-100 rounded-full items-center justify-center mb-4">
                <LogOut size={32} color="#ef4444" />
              </View>
              <Text className="text-xl font-bold text-gray-900 mb-2">Đăng xuất</Text>
              <Text className="text-gray-600 text-center mb-6">
                Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng?
              </Text>
              <View className="flex-row w-full">
                <TouchableOpacity 
                  onPress={() => setShowLogoutAlert(false)}
                  className="flex-1 bg-gray-100 rounded-2xl py-3 mr-2"
                >
                  <Text className="text-gray-700 font-semibold text-center text-lg">Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={confirmLogout}
                  className="flex-1 bg-red-500 rounded-2xl py-3"
                >
                  <Text className="text-white font-semibold text-center text-lg">Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}