import { useGetKoiFishById } from '@/hooks/useKoiFish';
import { Gender, HealthStatus, KoiFish } from '@/lib/api/services/fetchKoiFish';
import { formatDate } from '@/lib/utils/formatDate';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Edit, Loader2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function KoiDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, redirect } = useLocalSearchParams();
  const [activeTab, setActiveTab] = useState<'info' | 'health'>('info');

  const koiId = Number(id);
  const { data: koi, isLoading } = useGetKoiFishById(koiId, !!koiId);

  const getHealthColor = (health?: HealthStatus | string) => {
    switch (health) {
      case HealthStatus.HEALTHY:
        return '#10b981';
      case HealthStatus.WARNING:
        return '#f59e0b';
      case HealthStatus.SICK:
        return '#e5e7eb';
      case HealthStatus.DEAD:
        return '#ef4444';
      default:
        return '#6b7280';
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

  const typeToLabel = (type?: string) => {
    switch (type) {
      case 'High':
        return 'High';
      case 'Show':
        return 'Show';
      default:
        return type ?? '-';
    }
  };

  const getSizeLabel = (size?: KoiFish['size']) => {
    switch (size) {
      case 'Under10cm':
        return '< 10 cm';
      case 'From10To20cm':
        return '10 - 20 cm';
      case 'From21To25cm':
        return '21 - 25 cm';
      case 'From26To30cm':
        return '26 - 30 cm';
      case 'From31To40cm':
        return '31 - 40 cm';
      case 'From41To45cm':
        return '41 - 45 cm';
      case 'From46To50cm':
        return '46 - 50 cm';
      case 'Over50cm':
        return '> 50 cm';
      default:
        return String(size ?? '—');
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
            if (redirect) {
              router.push(redirect as any);
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
          {/* <TouchableOpacity className="mr-2 p-2">
            <Share2 size={20} color="#6b7280" />
          </TouchableOpacity> */}
          <TouchableOpacity
            className="p-2"
            onPress={() => {
              if (koiId)
                router.push(
                  `/koi/edit?id=${koiId}&redirect=${encodeURIComponent((redirect as string) ?? `/koi/${koiId}`)}`
                );
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
          <View className="mb-2 items-center">
            <View className="mb-3 h-72 w-5/6 items-center justify-center rounded-2xl bg-gray-200">
              {isLoading ? (
                <View className="h-full w-full items-center justify-center">
                  <Loader2 size={36} color="#0A3D62" className="animate-spin" />
                </View>
              ) : koi?.images && koi.images.length > 0 ? (
                <Image
                  source={{ uri: koi.images[0] }}
                  className="h-full w-full rounded-2xl"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-20 w-32 rounded-full bg-orange-400" />
              )}
            </View>
          </View>

          {/* Basic Info */}
          <View className="items-center">
            <Text className="mb-1 text-2xl font-bold text-gray-900">
              RFID: {koi?.rfid ?? ''}
            </Text>
            {koi?.variety?.varietyName && (
              <Text className="mb-2 text-base text-gray-600">
                {koi.variety.varietyName}
              </Text>
            )}
            <View
              className="rounded-full px-3 py-1"
              style={{
                backgroundColor: getHealthColor(koi?.healthStatus) + '20',
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: getHealthColor(koi?.healthStatus) }}
              >
                Sức khỏe:{' '}
                {healthToLabel(koi?.healthStatus as HealthStatus) ?? 'Không rõ'}
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
          </View>

          {/* Tab Content */}
          <View className="p-4">
            {activeTab === 'info' && (
              <View>
                <Text className="mb-4 text-lg font-semibold text-gray-900">
                  Thông tin chi tiết
                </Text>

                <View>
                  <View className="flex-row items-start py-2">
                    <Text className="w-36 text-sm text-gray-600">
                      Giống cá:
                    </Text>
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {koi?.variety?.varietyName ?? '-'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start py-2">
                    <Text className="w-36 text-sm text-gray-600">Loại:</Text>
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {typeToLabel(koi?.type)}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start py-2">
                    <Text className="w-36 text-sm text-gray-600">
                      Giới tính:
                    </Text>
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {genderToLabel(koi?.gender as Gender) ?? '-'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start py-2">
                    <Text className="w-36 text-sm text-gray-600">
                      Ngày sinh:
                    </Text>
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {formatDate(koi?.birthDate, 'dd/MM/yyyy') ?? '-'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start py-2">
                    <Text className="w-36 text-sm text-gray-600">Kích cỡ:</Text>
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {getSizeLabel(koi?.size) ?? '-'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start py-2">
                    <Text className="w-36 text-sm text-gray-600">Bể nuôi:</Text>
                    <View className="ml-2 flex-1 flex-row items-center">
                      <View className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                      <Text className="text-sm font-medium text-gray-900">
                        {koi?.pond?.pondName ?? '-'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start py-2">
                    <Text className="w-36 text-sm text-gray-600">Xuất xứ:</Text>
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {koi?.origin ?? '-'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start py-2">
                    <Text className="w-36 text-sm text-gray-600">
                      Giá tiền:
                    </Text>
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {koi?.sellingPrice
                          ? formatCurrency(koi.sellingPrice)
                          : '-'}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-start py-2">
                    <Text className="w-36 text-sm text-gray-600">
                      Hình dáng cơ thể:
                    </Text>
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {koi?.bodyShape ?? '-'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start py-2">
                    <Text className="w-36 text-sm text-gray-600">Màu sắc:</Text>
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {koi?.colorPattern ?? '-'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-start py-2">
                    <Text className="w-36 text-sm text-gray-600">
                      Giới thiệu:
                    </Text>
                    <View className="ml-2 flex-1">
                      <Text className="text-sm font-medium text-gray-900">
                        {koi?.description ?? '-'}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'health' && (
              <View>
                <Text className="mb-4 text-lg font-semibold text-gray-900">
                  Lịch sử sức khỏe
                </Text>

                {/* {(koi?.healthHistory || []).map(
                  (record: any, index: number) => (
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
                  )
                )} */}
              </View>
            )}
          </View>
        </View>

        {/* Action Buttons */}
        {/* <View className="mx-4 mt-4 flex-row">
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
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}
