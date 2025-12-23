import { CustomAlert } from '@/components/CustomAlert';
import Loading from '@/components/Loading';
import FishSvg from '@/components/icons/FishSvg';
import PondSvg from '@/components/icons/PondSvg';
import { useChangeKoiFishPond } from '@/hooks/useKoiFish';
import { useGetPonds } from '@/hooks/usePond';
import { KoiFish } from '@/lib/api/services/fetchKoiFish';
import { Pond, PondStatus } from '@/lib/api/services/fetchPond';
import { TypeOfPond } from '@/lib/api/services/fetchPondType';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Droplets,
  MapPin,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ModalChangePondForKoiProps {
  visible: boolean;
  koi: KoiFish | null;
  onClose: () => void;
  onSuccess?: (newPondId: number) => void;
}

export default function ModalChangePondForKoi({
  visible,
  koi,
  onClose,
  onSuccess,
}: ModalChangePondForKoiProps) {
  const [selectedPondId, setSelectedPondId] = useState<number | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
  }>({ visible: false, title: '', message: '' });

  // API hooks
  const {
    data: ponds,
    isLoading: pondsLoading,
    refetch,
  } = useGetPonds(
    {
      pageIndex: 1,
      pageSize: 100,
      pondTypeEnum: TypeOfPond.QUARANTINE,
      isNotMaintenance: true,
    },
    visible
  );
  const changeKoiFishPondMutation = useChangeKoiFishPond();

  useEffect(() => {
    if (visible) {
      refetch();
    }
  }, [visible, refetch]);

  const handleChangePond = async () => {
    if (!koi || !selectedPondId) return;

    try {
      await changeKoiFishPondMutation.mutateAsync({
        id: koi.id,
        pondId: selectedPondId,
      });

      onSuccess?.(selectedPondId);
      onClose();
      setSelectedPondId(null);
    } catch (error: any) {
      setAlertConfig({
        visible: true,
        title: 'Lỗi',
        message:
          error?.message || 'Không thể chuyển ao cho cá. Vui lòng thử lại.',
        type: 'danger',
      });
    }
  };

  const handleClose = () => {
    setSelectedPondId(null);
    onClose();
  };

  const getPondStatusInfo = (status: PondStatus) => {
    switch (status) {
      case PondStatus.ACTIVE:
        return {
          text: 'Hoạt động',
          color: 'text-green-700',
          bg: 'bg-green-100',
          icon: '🟢',
        };
      case PondStatus.MAINTENANCE:
        return {
          text: 'Bảo trì',
          color: 'text-yellow-700',
          bg: 'bg-yellow-100',
          icon: '🟡',
        };
      case PondStatus.EMPTY:
        return {
          text: 'Trống',
          color: 'text-gray-700',
          bg: 'bg-gray-100',
          icon: '⚪',
        };
    }
  };

  if (!koi) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-white">
        {/* Header */}
        <View className="overflow-hidden shadow-lg" style={{ elevation: 8 }}>
          <LinearGradient
            colors={['#f97316', '#ea580c']}
            className="px-6 pb-6 pt-4"
          >
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={handleClose}
                className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-white/20"
                activeOpacity={0.7}
              >
                <ChevronLeft size={24} color="white" />
              </TouchableOpacity>
              <View className="flex-1">
                <Text className="text-center text-xl font-black text-white">
                  Chuyển ao cách ly
                </Text>
                <Text className="text-center text-sm text-white/80">
                  Chọn ao mới cho Cá #{koi.id}
                </Text>
              </View>
              <View className="h-10 w-10" />
            </View>
          </LinearGradient>
        </View>

        {/* Current Koi Info */}
        <View
          className="mx-6 mt-4 overflow-hidden rounded-2xl border-2 border-orange-200 bg-white shadow-md"
          style={{ elevation: 3 }}
        >
          <LinearGradient colors={['#f97316', '#ea580c']} className="px-4 py-3">
            <View className="flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <FishSvg size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-black text-white">
                  Cá #{koi.id}
                </Text>
                <Text className="text-sm text-white/80">RFID: {koi.rfid}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Pond List */}
        <View className="mx-6 mt-4 flex-1">
          <Text className="mb-4 text-lg font-bold text-gray-900">
            Chọn ao mới ({ponds?.data?.length || 0} ao khả dụng)
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {pondsLoading ? (
              <View className="py-20">
                <Loading />
              </View>
            ) : ponds?.data?.length === 0 ? (
              <View className="items-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 py-12">
                <PondSvg size={48} color="#9ca3af" />
                <Text className="mt-3 text-base font-medium text-gray-500">
                  Không có ao khả dụng
                </Text>
                <Text className="mt-1 text-sm text-gray-400">
                  Tất cả ao đều đang bảo trì hoặc không hoạt động
                </Text>
              </View>
            ) : (
              <View className="gap-3 pb-4">
                {ponds?.data?.map((pond: Pond) => {
                  const statusInfo = getPondStatusInfo(pond.pondStatus);
                  const isSelected = selectedPondId === pond.id;

                  return (
                    <TouchableOpacity
                      key={pond.id}
                      onPress={() => setSelectedPondId(pond.id)}
                      className={`overflow-hidden rounded-2xl border-2 ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 bg-white'
                      } shadow-md`}
                      style={{ elevation: isSelected ? 4 : 2 }}
                      activeOpacity={0.7}
                    >
                      <View className="p-4">
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 flex-row items-center">
                            <View
                              className={`mr-3 h-12 w-12 items-center justify-center rounded-full ${
                                isSelected ? 'bg-orange-100' : 'bg-blue-100'
                              }`}
                            >
                              <PondSvg
                                size={24}
                                color={isSelected ? '#ea580c' : '#3b82f6'}
                              />
                            </View>
                            <View className="flex-1">
                              <Text
                                className={`text-lg font-bold ${
                                  isSelected
                                    ? 'text-orange-900'
                                    : 'text-gray-900'
                                }`}
                              >
                                {pond.pondName}
                              </Text>
                              <View className="mt-1 flex-row items-center">
                                <MapPin size={14} color="#6b7280" />
                                <Text className="ml-1 text-sm text-gray-600">
                                  {pond.location}
                                </Text>
                              </View>
                              <View className="mt-1 flex-row items-center">
                                <View
                                  className={`rounded-full px-2 py-1 ${statusInfo.bg}`}
                                >
                                  <Text
                                    className={`text-xs font-bold ${statusInfo.color}`}
                                  >
                                    {statusInfo.icon} {statusInfo.text}
                                  </Text>
                                </View>
                              </View>
                            </View>
                          </View>

                          <View className="items-center">
                            {isSelected ? (
                              <View className="h-8 w-8 items-center justify-center rounded-full bg-orange-500">
                                <Check size={16} color="white" />
                              </View>
                            ) : (
                              <ArrowRight size={20} color="#9ca3af" />
                            )}
                          </View>
                        </View>

                        {/* Pond Details */}
                        <View className="mt-3 flex-row gap-3">
                          <View className="flex-1 rounded-2xl bg-gray-50 p-3">
                            <View className="flex-row items-center">
                              <Droplets size={14} color="#6b7280" />
                              <Text className="ml-1 text-xs font-bold text-gray-600">
                                Dung tích
                              </Text>
                            </View>
                            <Text className="mt-1 text-sm font-bold text-gray-900">
                              {pond.capacityLiters?.toLocaleString() || 'N/A'}L
                            </Text>
                          </View>

                          <View className="flex-1 rounded-2xl bg-gray-50 p-3">
                            <View className="flex-row items-center">
                              <FishSvg size={14} color="#6b7280" />
                              <Text className="ml-1 text-xs font-bold text-gray-600">
                                Số cá hiện tại
                              </Text>
                            </View>
                            <Text className="mt-1 text-sm font-bold text-gray-900">
                              {pond.currentCount || 0}/
                              {pond.maxFishCount || 'N/A'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </ScrollView>
        </View>

        {/* Bottom Actions */}
        <View
          className="border-t border-gray-200 bg-white px-6 py-4 shadow-lg"
          style={{ elevation: 8 }}
        >
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={handleClose}
              className="flex-1 items-center justify-center rounded-2xl border-2 border-gray-200 bg-white py-4"
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <X size={20} color="#6b7280" />
                <Text className="ml-2 text-base font-bold text-gray-700">
                  Hủy
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleChangePond}
              disabled={!selectedPondId || changeKoiFishPondMutation.isPending}
              className={`flex-1 overflow-hidden rounded-2xl ${
                selectedPondId && !changeKoiFishPondMutation.isPending
                  ? ''
                  : 'opacity-50'
              }`}
              activeOpacity={selectedPondId ? 0.8 : 1}
            >
              <LinearGradient
                colors={['#f97316', '#ea580c']}
                className="items-center justify-center py-4"
              >
                <View className="flex-row items-center">
                  {changeKoiFishPondMutation.isPending ? (
                    <ActivityIndicator />
                  ) : (
                    <>
                      <ArrowRight size={20} color="white" />
                      <Text className="ml-2 text-base font-black text-white">
                        Chuyển ao
                      </Text>
                    </>
                  )}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onCancel={() =>
          setAlertConfig({ visible: false, title: '', message: '' })
        }
        onConfirm={() =>
          setAlertConfig({ visible: false, title: '', message: '' })
        }
        cancelText="Đóng"
        confirmText="OK"
      />
    </Modal>
  );
}
