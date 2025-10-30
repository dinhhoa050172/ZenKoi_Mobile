import { CustomAlert } from '@/components/CustomAlert';
import PondSvg from '@/components/icons/PondSvg';
import {
  useGetBreedingProcessDetailById,
  useGetKoiFishByBreedingProcessId,
} from '@/hooks/useBreedingProcess';
import { formatKoiAge } from '@/lib/utils/formatKoiAge';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Calendar,
  Edit,
  Eye,
  Plus,
  Ruler,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

export default function FishListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, redirect } = useLocalSearchParams();
  const breedingId = Number(id);

  const [showExitAlert, setShowExitAlert] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const {
    data: koiFishList,
    isLoading,
    refetch,
  } = useGetKoiFishByBreedingProcessId(breedingId, !!breedingId);

  const { data: breedingDetail } = useGetBreedingProcessDetailById(
    breedingId,
    !!breedingId
  );

  useFocusEffect(
    React.useCallback(() => {
      if (breedingId) {
        refetch();
      }
    }, [breedingId, refetch])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleBack = () => {
    const currentFishCount = koiFishList?.length ?? 0;
    const expectedCount =
      breedingDetail?.classificationStage?.showQualifiedCount ?? 0;

    if (currentFishCount !== expectedCount) {
      setShowExitAlert(true);
    } else {
      if (redirect) {
        router.push(redirect as any);
      } else {
        router.back();
      }
    }
  };

  const confirmExit = () => {
    setShowExitAlert(false);
    if (redirect) {
      router.push(redirect as any);
    } else {
      router.back();
    }
  };

  const getSizeLabel = (size?: string) => {
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

  const genderToLabel = (g: string) => {
    switch (g) {
      case 'Male':
        return 'Đực';
      case 'Female':
        return 'Cái';
      case 'Other':
        return 'Chưa xác định';
      default:
        return g;
    }
  };

  // Skeleton loading component
  const renderSkeleton = () => (
    <>
      {[1, 2, 3, 4].map((item) => (
        <View key={item} className="my-4 rounded-2xl bg-white p-2 shadow-sm">
          <View className="flex-row">
            {/* Image skeleton */}
            <View className="mr-4 h-20 w-20 animate-pulse rounded-lg bg-gray-200" />

            {/* Content skeleton */}
            <View className="flex-1">
              <View className="mb-2 h-5 w-24 animate-pulse rounded bg-gray-200" />
              <View className="mb-2 h-4 w-32 animate-pulse rounded bg-gray-200" />
              <View className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200" />
              <View className="h-4 w-40 animate-pulse rounded bg-gray-200" />
            </View>
          </View>
        </View>
      ))}
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 bg-white p-4">
        <TouchableOpacity className="mr-3" onPress={handleBack}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-gray-900">
          Danh sách cá định danh
        </Text>
        <TouchableOpacity
          className="rounded-lg bg-primary px-3 py-2"
          onPress={() => {
            router.push(
              `/koi/add?breedingId=${breedingId}&redirect=${encodeURIComponent(`/breeding/${breedingId}/fish-list?redirect=${encodeURIComponent((redirect as string) ?? '/breeding')}`)}`
            );
          }}
        >
          <View className="flex-row items-center">
            <Plus size={18} color="white" />
            <Text className="ml-1 font-medium text-white">Thêm cá</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0A3D62']}
            tintColor="#0A3D62"
          />
        }
      >
        <View className="px-4">
          {isLoading ? (
            renderSkeleton()
          ) : !koiFishList || koiFishList.length === 0 ? (
            <View className="mt-20 items-center">
              <Text className="mb-2 text-lg font-semibold text-gray-600">
                Chưa có cá nào
              </Text>
              <Text className="text-sm text-gray-500">
                Nhấn &quot;Thêm cá&quot; để thêm cá vào danh sách
              </Text>
            </View>
          ) : (
            koiFishList.map((fish) => (
              <View
                key={fish.id}
                className="my-4 rounded-2xl bg-white p-2 shadow-sm"
              >
                <View className="flex-row">
                  {/* Fish Image */}
                  {fish.images && fish.images.length > 0 ? (
                    <Image
                      source={{ uri: fish.images[0] }}
                      style={{
                        width: 100,
                        height: 100,
                        borderRadius: 12,
                        marginRight: 14,
                      }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="mr-4 h-20 w-20 rounded-lg bg-gray-200" />
                  )}

                  {/* Fish Info */}
                  <View className="flex-1">
                    <Text className="mb-1 text-lg font-bold text-gray-900">
                      {fish.rfid}
                    </Text>
                    <Text className="mb-2 text-sm text-gray-600">
                      {fish.variety.varietyName} • {genderToLabel(fish.gender)}
                    </Text>

                    <View className="mb-2 flex-row items-center">
                      <PondSvg />
                      <Text className="ml-1 text-sm text-gray-600">
                        {fish.pond.pondName}
                      </Text>
                    </View>

                    <View className="flex-row">
                      <View className="mr-4 flex-row items-center">
                        <Ruler size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-600">
                          {' '}
                          {getSizeLabel(fish.size)}
                        </Text>
                      </View>
                      <View className="flex-row items-center">
                        <Calendar size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-600">
                          {' '}
                          {formatKoiAge(fish.birthDate)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View className="mt-4 flex-row border-t border-gray-100 pt-1">
                  <TouchableOpacity
                    className="mr-2 flex-1 flex-row items-center justify-center py-2"
                    onPress={() => {
                      router.push(
                        `/koi/${fish.id}?redirect=${encodeURIComponent(`/breeding/${breedingId}/fish-list?redirect=${encodeURIComponent((redirect as string) ?? '/breeding')}`)}`
                      );
                    }}
                  >
                    <Eye size={16} color="#6b7280" />
                    <Text className="ml-2 text-sm text-gray-600">Xem</Text>
                  </TouchableOpacity>
                  <Text className="self-stretch border-l border-gray-200" />
                  <TouchableOpacity
                    className="ml-2 flex-1 flex-row items-center justify-center py-2"
                    onPress={() => {
                      router.push(
                        `/koi/edit?id=${fish.id}&redirect=${encodeURIComponent(`/breeding/${breedingId}/fish-list?redirect=${encodeURIComponent((redirect as string) ?? '/breeding')}`)}`
                      );
                    }}
                  >
                    <Edit size={16} color="#6b7280" />
                    <Text className="ml-2 text-sm text-gray-600">Sửa</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Exit Confirmation Alert */}
      <CustomAlert
        visible={showExitAlert}
        title="Xác nhận thoát"
        message={`Số lượng cá hiện tại (${koiFishList?.length ?? 0}) không khớp với số cá Show đã tuyển chọn (${breedingDetail?.classificationStage?.showQualifiedCount ?? 0}). Bạn có chắc chắn muốn thoát không?`}
        type="warning"
        cancelText="Hủy"
        confirmText="Thoát"
        onCancel={() => setShowExitAlert(false)}
        onConfirm={confirmExit}
      />
    </SafeAreaView>
  );
}
