import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Activity,
  ArrowLeft,
  Calendar,
  Camera,
  Edit,
  Heart,
  Ruler,
  Share2,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

interface KoiDetail {
  id: string;
  name: string;
  code: string;
  breed: string;
  pond: string;
  weight: number;
  length: number;
  age: string;
  birthDate: string;
  gender: 'Đực' | 'Cái' | 'Chưa xác định';
  health: 'Tốt' | 'Trung bình' | 'Kém';
  color: string;
  pattern: string;
  origin: string;
  price: number;
  images: string[];
  healthHistory: {
    date: string;
    status: string;
    notes: string;
  }[];
  growthHistory: {
    date: string;
    weight: number;
    length: number;
  }[];
}

export default function KoiDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'info' | 'health' | 'growth'>(
    'info'
  );

  // Mock data - in real app, fetch based on id
  const koiDetail: KoiDetail = {
    id: (id as string) || '1',
    name: 'Sakura',
    code: 'KOI-001',
    breed: 'Kohaku',
    pond: 'Bể A',
    weight: 1.2,
    length: 35,
    age: '2 năm',
    birthDate: '15/03/2022',
    gender: 'Cái',
    health: 'Tốt',
    color: 'Trắng đỏ',
    pattern: 'Kohaku truyền thống',
    origin: 'Niigata, Nhật Bản',
    price: 2500000,
    images: [],
    healthHistory: [
      {
        date: '01/12/2024',
        status: 'Tốt',
        notes: 'Kiểm tra định kỳ, cá khỏe mạnh',
      },
      {
        date: '15/11/2024',
        status: 'Trung bình',
        notes: 'Phát hiện vết xước nhỏ, đã điều trị',
      },
      {
        date: '01/11/2024',
        status: 'Tốt',
        notes: 'Hoàn thành liệu trình điều trị',
      },
    ],
    growthHistory: [
      {
        date: '01/12/2024',
        weight: 1.2,
        length: 35,
      },
      {
        date: '01/11/2024',
        weight: 1.1,
        length: 34,
      },
      {
        date: '01/10/2024',
        weight: 1.0,
        length: 33,
      },
      {
        date: '01/09/2024',
        weight: 0.95,
        length: 32,
      },
    ],
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Tốt':
        return '#10b981';
      case 'Trung bình':
        return '#f59e0b';
      case 'Kém':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 bg-white p-4">
        <TouchableOpacity
          className="mr-3"
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.push('/koi');
            }
          }}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-gray-900">
          Chi tiết cá Koi
        </Text>
        <View className="flex-row">
          <TouchableOpacity className="mr-2 p-2">
            <Share2 size={20} color="#6b7280" />
          </TouchableOpacity>
          <TouchableOpacity
            className="p-2"
            onPress={() => {
              // TODO: Implement edit functionality
              console.log('Edit koi', id);
            }}
          >
            <Edit size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Koi Image and Basic Info */}
        <View className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
          {/* Main Image */}
          <View className="mb-4 items-center">
            <View className="mb-3 h-48 w-48 items-center justify-center rounded-2xl bg-gray-200">
              {koiDetail.images.length > 0 ? (
                <Image
                  source={{ uri: koiDetail.images[0] }}
                  className="h-full w-full rounded-2xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-20 w-32 rounded-full bg-orange-400" />
              )}
            </View>
            <TouchableOpacity className="absolute right-4 top-4 rounded-full bg-white/80 p-2">
              <Camera size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Basic Info */}
          <View className="mb-4 items-center">
            <Text className="mb-1 text-2xl font-bold text-gray-900">
              {koiDetail.name}
            </Text>
            <Text className="mb-2 text-base text-gray-600">
              {koiDetail.code} • {koiDetail.breed}
            </Text>
            <View
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: getHealthColor(koiDetail.health) + '20',
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: getHealthColor(koiDetail.health) }}
              >
                Sức khỏe: {koiDetail.health}
              </Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View className="flex-row justify-around border-t border-gray-200 pt-4">
            <View className="items-center">
              <View className="mb-1 flex-row items-center">
                <Image
                  source={require('@/assets/images/weight-icon.png')}
                  style={{ width: 16, height: 16 }}
                />
                <Text className="ml-1 text-xs text-gray-500">Cân nặng</Text>
              </View>
              <Text className="text-lg font-bold text-gray-900">
                {koiDetail.weight}kg
              </Text>
            </View>
            <View className="items-center">
              <View className="mb-1 flex-row items-center">
                <Ruler size={16} color="#6b7280" />
                <Text className="ml-1 text-xs text-gray-500">Chiều dài</Text>
              </View>
              <Text className="text-lg font-bold text-gray-900">
                {koiDetail.length}cm
              </Text>
            </View>
            <View className="items-center">
              <View className="mb-1 flex-row items-center">
                <Calendar size={16} color="#6b7280" />
                <Text className="ml-1 text-xs text-gray-500">Tuổi</Text>
              </View>
              <Text className="text-lg font-bold text-gray-900">
                {koiDetail.age}
              </Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="mx-4 mt-4 rounded-2xl bg-white shadow-sm">
          <View className="flex-row">
            <TouchableOpacity
              className={`flex-1 py-4 ${activeTab === 'info' ? 'border-b-2 border-blue-500' : ''}`}
              onPress={() => setActiveTab('info')}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === 'info' ? 'text-blue-500' : 'text-gray-600'
                }`}
              >
                Thông tin
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 ${activeTab === 'health' ? 'border-b-2 border-blue-500' : ''}`}
              onPress={() => setActiveTab('health')}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === 'health' ? 'text-blue-500' : 'text-gray-600'
                }`}
              >
                Sức khỏe
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 py-4 ${activeTab === 'growth' ? 'border-b-2 border-blue-500' : ''}`}
              onPress={() => setActiveTab('growth')}
            >
              <Text
                className={`text-center font-medium ${
                  activeTab === 'growth' ? 'text-blue-500' : 'text-gray-600'
                }`}
              >
                Phát triển
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View className="p-4">
            {activeTab === 'info' && (
              <View>
                <Text className="mb-4 text-lg font-semibold text-gray-900">
                  Thông tin chi tiết
                </Text>

                <View className="space-y-3">
                  <View className="flex-row justify-between py-2">
                    <Text className="text-sm text-gray-600">Giới tính:</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {koiDetail.gender}
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-sm text-gray-600">Ngày sinh:</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {koiDetail.birthDate}
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-sm text-gray-600">Bể nuôi:</Text>
                    <View className="flex-row items-center">
                      <View className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                      <Text className="text-sm font-medium text-gray-900">
                        {koiDetail.pond}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-sm text-gray-600">Màu sắc:</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {koiDetail.color}
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-sm text-gray-600">Họa tiết:</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {koiDetail.pattern}
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-sm text-gray-600">Xuất xứ:</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {koiDetail.origin}
                    </Text>
                  </View>
                  <View className="flex-row justify-between py-2">
                    <Text className="text-sm text-gray-600">Giá trị:</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {formatCurrency(koiDetail.price)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'health' && (
              <View>
                <Text className="mb-4 text-lg font-semibold text-gray-900">
                  Lịch sử sức khỏe
                </Text>

                {koiDetail.healthHistory.map((record, index) => (
                  <View
                    key={index}
                    className="mb-4 flex-row border-b border-gray-100 pb-4"
                  >
                    <View className="mr-3 mt-1">
                      <View
                        className="h-3 w-3 rounded-full"
                        style={{
                          backgroundColor: getHealthColor(record.status),
                        }}
                      />
                    </View>
                    <View className="flex-1">
                      <View className="mb-1 flex-row items-start justify-between">
                        <Text className="text-sm font-medium text-gray-900">
                          {record.date}
                        </Text>
                        <Text
                          className="text-sm font-medium"
                          style={{ color: getHealthColor(record.status) }}
                        >
                          {record.status}
                        </Text>
                      </View>
                      <Text className="text-sm text-gray-600">
                        {record.notes}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'growth' && (
              <View>
                <Text className="mb-4 text-lg font-semibold text-gray-900">
                  Lịch sử phát triển
                </Text>

                {/* Growth Chart Header */}
                <View className="mb-2 flex-row rounded-lg bg-gray-50 p-3">
                  <Text className="flex-1 text-xs font-medium text-gray-600">
                    Ngày
                  </Text>
                  <Text className="w-20 text-center text-xs font-medium text-gray-600">
                    Cân nặng
                  </Text>
                  <Text className="w-20 text-center text-xs font-medium text-gray-600">
                    Chiều dài
                  </Text>
                </View>

                {/* Growth Data */}
                {koiDetail.growthHistory.map((record, index) => (
                  <View
                    key={index}
                    className="flex-row border-b border-gray-100 py-3"
                  >
                    <Text className="flex-1 text-sm text-gray-900">
                      {record.date}
                    </Text>
                    <Text className="w-20 text-center text-sm text-gray-900">
                      {record.weight}kg
                    </Text>
                    <Text className="w-20 text-center text-sm text-gray-900">
                      {record.length}cm
                    </Text>
                  </View>
                ))}

                {/* Growth Summary */}
                <View className="mt-4 rounded-2xl bg-blue-50 p-3">
                  <Text className="mb-2 text-sm font-medium text-blue-900">
                    Tóm tắt phát triển
                  </Text>
                  <Text className="text-xs text-blue-700">
                    Tăng trọng: +
                    {(
                      koiDetail.growthHistory[0].weight -
                      koiDetail.growthHistory[
                        koiDetail.growthHistory.length - 1
                      ].weight
                    ).toFixed(2)}
                    kg
                  </Text>
                  <Text className="text-xs text-blue-700">
                    Tăng chiều dài: +
                    {koiDetail.growthHistory[0].length -
                      koiDetail.growthHistory[
                        koiDetail.growthHistory.length - 1
                      ].length}
                    cm
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mx-4 mt-4 flex-row">
          <TouchableOpacity className="mr-4 flex-1 flex-row items-center justify-center rounded-2xl border border-gray-300 bg-white py-3">
            <Heart size={18} color="#6b7280" />
            <Text className="ml-2 font-medium text-gray-700">Yêu thích</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center rounded-2xl py-3"
            style={{ backgroundColor: '#0A3D62' }}
          >
            <Activity size={18} color="white" />
            <Text className="ml-2 font-medium text-white">Theo dõi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
