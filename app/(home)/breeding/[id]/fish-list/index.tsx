import { CustomAlert } from '@/components/CustomAlert';
import FishSvg from '@/components/icons/FishSvg';
import PondSvg from '@/components/icons/PondSvg';
import {
  useGetBreedingProcessDetailById,
  useGetKoiFishByBreedingProcessId,
} from '@/hooks/useBreedingProcess';
import { formatKoiAge } from '@/lib/utils/formatKoiAge';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Edit,
  Eye,
  Fish,
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

  const currentFishCount = koiFishList?.length ?? 0;
  const expectedCount =
    (breedingDetail?.classificationStage?.showQualifiedCount ?? 0) +
    (breedingDetail?.classificationStage?.highQualifiedCount ?? 0);
  const isComplete = currentFishCount === expectedCount;
  const progress =
    expectedCount > 0 ? (currentFishCount / expectedCount) * 100 : 0;

  // Skeleton loading component
  const renderSkeleton = () => (
    <>
      {[1, 2, 3, 4].map((item) => (
        <View
          key={item}
          className="mb-3 overflow-hidden rounded-2xl border border-gray-200 bg-white"
        >
          <View className="p-4">
            <View className="flex-row">
              {/* Image skeleton */}
              <View className="mr-4 h-24 w-24 animate-pulse rounded-2xl bg-gray-200" />

              {/* Content skeleton */}
              <View className="flex-1 justify-center">
                <View className="mb-2 h-5 w-32 animate-pulse rounded-lg bg-gray-200" />
                <View className="mb-2 h-4 w-40 animate-pulse rounded bg-gray-200" />
                <View className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              </View>
            </View>
          </View>
        </View>
      ))}
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="rounded-t-2xl bg-primary pb-6">
        <View className="flex-row items-center px-4 pt-4">
          <TouchableOpacity
            onPress={handleBack}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/20"
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
              Định danh
            </Text>
            <Text className="text-xl font-bold text-white">Danh sách cá</Text>
          </View>
          <TouchableOpacity
            className="items-center justify-center rounded-2xl bg-white px-4 py-2"
            onPress={() => {
              router.push(
                `/koi/add?breedingId=${breedingId}&hatchedTime=${breedingDetail?.hatchedTime ?? ''}&redirect=${encodeURIComponent(`/breeding/${breedingId}/fish-list?redirect=${encodeURIComponent((redirect as string) ?? '/breeding')}`)}`
              );
            }}
          >
            <View className="flex-row items-center">
              <Plus size={18} color="#0A3D62" />
              <Text className="ml-1 text-base font-semibold text-primary">
                Thêm cá
              </Text>
            </View>
          </TouchableOpacity>
        </View>
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
        <View className="mt-2 px-4">
          {/* Progress Card */}
          <View className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <View
              className={`border-b px-4 py-3 ${
                isComplete
                  ? 'border-green-100 bg-green-50'
                  : 'border-blue-100 bg-blue-50'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  {isComplete ? (
                    <CheckCircle2 size={20} color="#10b981" />
                  ) : (
                    <FishSvg size={20} color="#3b82f6" />
                  )}
                  <Text
                    className={`ml-2 text-base font-semibold ${
                      isComplete ? 'text-green-700' : 'text-blue-700'
                    }`}
                  >
                    {isComplete ? 'Hoàn thành' : 'Đang định danh'}
                  </Text>
                </View>
                <View
                  className={`rounded-full px-3 py-1 ${
                    isComplete ? 'bg-green-100' : 'bg-blue-100'
                  }`}
                >
                  <Text
                    className={`text-sm font-bold ${
                      isComplete ? 'text-green-700' : 'text-blue-700'
                    }`}
                  >
                    {currentFishCount}/{expectedCount}
                  </Text>
                </View>
              </View>
            </View>

            {/* Progress Bar */}
            <View className="p-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-sm text-gray-600">Tiến độ</Text>
                <Text className="text-sm font-semibold text-gray-900">
                  {progress.toFixed(0)}%
                </Text>
              </View>
              <View className="h-2 overflow-hidden rounded-full bg-gray-200">
                <View
                  className={`h-full rounded-full ${
                    isComplete ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </View>
            </View>

            {/* Warning if incomplete */}
            {!isComplete && currentFishCount > 0 && (
              <View className="border-t border-amber-100 bg-amber-50 px-4 py-3">
                <View className="flex-row items-start">
                  <AlertTriangle size={16} color="#f59e0b" />
                  <Text className="ml-2 flex-1 text-sm text-amber-700">
                    Còn thiếu {expectedCount - currentFishCount} cá Show cần
                    định danh
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Fish List */}
          {isLoading ? (
            renderSkeleton()
          ) : !koiFishList || koiFishList.length === 0 ? (
            <View className="mt-12 items-center rounded-2xl border-2 border-dashed border-gray-300 bg-white py-12">
              <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <FishSvg size={40} color="#9ca3af" />
              </View>
              <Text className="mb-2 text-xl font-semibold text-gray-900">
                Chưa có cá nào
              </Text>
              <Text className="mb-4 text-center text-base text-gray-500">
                Bắt đầu thêm cá vào danh sách{'\n'}để hoàn thành định danh
              </Text>
              <TouchableOpacity
                className="rounded-2xl bg-primary px-6 py-3"
                onPress={() => {
                  router.push(
                    `/koi/add?breedingId=${breedingId}&hatchedTime=${breedingDetail?.hatchedTime ?? ''}&redirect=${encodeURIComponent(`/breeding/${breedingId}/fish-list?redirect=${encodeURIComponent((redirect as string) ?? '/breeding')}`)}`
                  );
                }}
              >
                <View className="flex-row items-center">
                  <Plus size={18} color="white" />
                  <Text className="ml-2 font-semibold text-white">
                    Thêm cá đầu tiên
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text className="mb-3 px-1 text-sm font-semibold uppercase tracking-wide text-gray-500">
                {koiFishList.length} cá đã định danh
              </Text>
              {koiFishList.map((fish, index) => (
                <View
                  key={fish.id}
                  className="mb-3 overflow-hidden rounded-2xl border border-gray-200 bg-white"
                >
                  {/* Fish Content */}
                  <View className="p-4">
                    <View className="flex-row">
                      {/* Fish Image */}
                      {fish.images && fish.images.length > 0 ? (
                        <View className="relative mr-4">
                          <Image
                            source={{ uri: fish.images[0] }}
                            style={{
                              width: 96,
                              height: 96,
                              borderRadius: 12,
                            }}
                            resizeMode="cover"
                          />
                          {/* Index Badge */}
                          <View className="absolute -right-2 -top-2 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary">
                            <Text className="text-xs font-bold text-white">
                              #{index + 1}
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View className="relative mr-4 h-24 w-24 items-center justify-center rounded-2xl bg-gray-100">
                          <Fish size={32} color="#9ca3af" />
                          {/* Index Badge */}
                          <View className="absolute -right-2 -top-2 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-primary">
                            <Text className="text-xs font-bold text-white">
                              #{index + 1}
                            </Text>
                          </View>
                        </View>
                      )}

                      {/* Fish Info */}
                      <View className="flex-1 justify-center">
                        <Text className="mb-1 text-lg font-bold text-gray-900">
                          {fish.rfid}
                        </Text>
                        <Text className="mb-2 text-base font-medium text-gray-600">
                          {fish.variety.varietyName} •{' '}
                          {genderToLabel(fish.gender)}
                        </Text>

                        <View className="mb-2 flex-row items-center">
                          <View className="mr-1 h-6 w-6 items-center justify-center rounded-full bg-blue-100">
                            <PondSvg size={12} />
                          </View>
                          <Text className="text-base text-gray-600">
                            {fish.pond.pondName}
                          </Text>
                        </View>

                        <View className="flex-row flex-wrap gap-2">
                          <View className="flex-row items-center rounded-full bg-purple-50 px-2 py-1">
                            <Ruler size={12} color="#a855f7" />
                            <Text className="ml-1 text-sm font-medium text-purple-700">
                              {fish.size}
                            </Text>
                          </View>
                          <View className="flex-row items-center rounded-full bg-orange-50 px-2 py-1">
                            <Calendar size={12} color="#f97316" />
                            <Text className="ml-1 text-sm font-medium text-orange-700">
                              {formatKoiAge(fish.birthDate)}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View className="flex-row border-t border-gray-100">
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center py-3"
                      onPress={() => {
                        router.push(
                          `/koi/${fish.id}?redirect=${encodeURIComponent(`/breeding/${breedingId}/fish-list?redirect=${encodeURIComponent((redirect as string) ?? '/breeding')}`)}`
                        );
                      }}
                    >
                      <Eye size={18} color="#3b82f6" />
                      <Text className="ml-2 text-sm font-semibold text-blue-600">
                        Xem chi tiết
                      </Text>
                    </TouchableOpacity>
                    <View className="w-px self-stretch bg-gray-200" />
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center py-3"
                      onPress={() => {
                        router.push(
                          `/koi/edit?id=${fish.id}&redirect=${encodeURIComponent(`/breeding/${breedingId}/fish-list?redirect=${encodeURIComponent((redirect as string) ?? '/breeding')}`)}`
                        );
                      }}
                    >
                      <Edit size={18} color="#10b981" />
                      <Text className="ml-2 text-sm font-semibold text-green-600">
                        Chỉnh sửa
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Exit Confirmation Alert */}
      <CustomAlert
        visible={showExitAlert}
        title="Xác nhận thoát"
        message={`Số lượng cá hiện tại (${currentFishCount}) không khớp với số cá Show đã tuyển chọn (${expectedCount}). Bạn có chắc chắn muốn thoát không?`}
        type="warning"
        cancelText="Tiếp tục định danh"
        confirmText="Thoát"
        onCancel={() => setShowExitAlert(false)}
        onConfirm={confirmExit}
      />
    </SafeAreaView>
  );
}
