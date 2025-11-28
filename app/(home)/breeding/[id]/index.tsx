import { ChangePondModal } from '@/components/breeding/ChangePondModal';
import { CountEggModal } from '@/components/breeding/CountEggModal';
import { CreatePacketFishModal } from '@/components/breeding/CreatePacketFishModal';
import { EditClassificationRecordModal } from '@/components/breeding/EditClassificationRecordModal';
import { EditFrySurvivalRecordModal } from '@/components/breeding/EditFrySurvivalRecordModal';
import { EditIncubationRecordModal } from '@/components/breeding/EditIncubationRecordModal';
import { FrySurvivalRecordModal } from '@/components/breeding/FrySurvivalRecordModal';
import { SelectionModal } from '@/components/breeding/SelectionModal';
import { UpdateEggBatchModal } from '@/components/breeding/UpdateEggBatchModal';
import { CustomAlert } from '@/components/CustomAlert';
import FishSvg from '@/components/icons/FishSvg';
import {
  useGetBreedingProcessDetailById,
  useGetKoiFishByBreedingProcessId,
  useMarkBreedingProcessAsSpawned,
} from '@/hooks/useBreedingProcess';
import { useDeleteClassificationRecord } from '@/hooks/useClassificationRecord';
import { useUpdateClassificationStage } from '@/hooks/useClassificationStage';
import { useUpdateFryFish } from '@/hooks/useFryFish';
import { useDeleteFrySurvivalRecord } from '@/hooks/useFrySurvivalRecord';
import { useDeleteIncubationDailyRecord } from '@/hooks/useIncubationDailyRecord';
import { useGetPondPacketFishes } from '@/hooks/usePondPacketFish';
import {
  BreedingStatus,
  ClassificationRecordBreeding,
  FrySurvivalRecordsBreeding,
  IncubationDailyReordBreeding,
} from '@/lib/api/services/fetchBreedingProcess';
import { EggBatchStatus } from '@/lib/api/services/fetchEggBatch';
import { FryFishStatus } from '@/lib/api/services/fetchFryFish';
import { TypeOfPond } from '@/lib/api/services/fetchPondType';
import { formatDate } from '@/lib/utils/formatDate';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit,
  Egg,
  Package,
  Plus,
  Trash2,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
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
import Toast from 'react-native-toast-message';

export default function BreedingDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const breedingId = Number(id);
  const breedingDetailQuery = useGetBreedingProcessDetailById(
    breedingId,
    !!breedingId
  );
  const [refreshing, setRefreshing] = useState(false);

  // State for modals
  const [showUpdateEggModal, setShowUpdateEggModal] = useState(false);
  const [showCountEggModal, setShowCountEggModal] = useState(false);
  const [showEditIncubationModal, setShowEditIncubationModal] = useState(false);
  const [editingIncubationRecord, setEditingIncubationRecord] =
    useState<IncubationDailyReordBreeding | null>(null);
  const [isFirstIncubationRecord, setIsFirstIncubationRecord] = useState(false);
  const [showChangePondModal, setShowChangePondModal] = useState(false);
  const [
    showChangePondModalClassification,
    setShowChangePondModalClassification,
  ] = useState(false);
  const [showFrySurvivalRecordModal, setShowFrySurvivalRecordModal] =
    useState(false);
  const [showEditFrySurvivalModal, setShowEditFrySurvivalModal] =
    useState(false);
  const [editingFrySurvivalRecord, setEditingFrySurvivalRecord] =
    useState<FrySurvivalRecordsBreeding | null>(null);
  const [showEditClassificationModal, setShowEditClassificationModal] =
    useState(false);
  const [editingClassificationRecord, setEditingClassificationRecord] =
    useState<ClassificationRecordBreeding | null>(null);
  const [
    editingClassificationRecordIndex,
    setEditingClassificationRecordIndex,
  ] = useState(0);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showCreatePacketModal, setShowCreatePacketModal] = useState(false);
  const [editPacketFishId, setEditPacketFishId] = useState<number | null>(null);
  const [isMarkingSpawned, setIsMarkingSpawned] = useState(false);

  // Delete alert state
  const [deleteAlert, setDeleteAlert] = useState<{
    visible: boolean;
    type: 'incubation' | 'frySurvival' | 'classification' | null;
    recordId: number | null;
    message: string;
  }>({
    visible: false,
    type: null,
    recordId: null,
    message: '',
  });

  // Mutations
  const deleteIncubationMutation = useDeleteIncubationDailyRecord();
  const deleteFrySurvivalMutation = useDeleteFrySurvivalRecord();
  const deleteClassificationMutation = useDeleteClassificationRecord();
  const markAsSpawnedMutation = useMarkBreedingProcessAsSpawned();
  const updateFryFishMutation = useUpdateFryFish();
  const updateClassificationStageMutation = useUpdateClassificationStage();

  const pondPacketQuery = useGetPondPacketFishes(
    { breedingProcessId: breedingId, pageIndex: 1, pageSize: 1 },
    !!breedingId
  );
  const hasPondPacket = (pondPacketQuery.data?.data ?? []).length > 0;
  const koiFishQuery = useGetKoiFishByBreedingProcessId(
    breedingId,
    !!breedingId
  );
  const hasKoiFish = koiFishQuery.data && koiFishQuery.data.length > 0;

  const canEditClassification = !hasKoiFish;

  useFocusEffect(
    useCallback(() => {
      if (breedingId) {
        breedingDetailQuery.refetch();
      }
    }, [breedingId, breedingDetailQuery])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await breedingDetailQuery.refetch();
    setRefreshing(false);
  }, [breedingDetailQuery]);

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState({
    pairing: false,
    spawned: false,
    eggBatch: false,
    fryFish: false,
    classification: false,
    complete: false,
  });

  // Auto expand based on status
  useEffect(() => {
    if (breedingDetailQuery.data?.status) {
      const status = breedingDetailQuery.data.status;
      setExpandedSections({
        pairing: status === BreedingStatus.PAIRING,
        spawned: status === BreedingStatus.SPAWNED,
        eggBatch: status === BreedingStatus.EGG_BATCH,
        fryFish: status === BreedingStatus.FRY_FISH,
        classification: status === BreedingStatus.CLASSIFICATION,
        complete: status === BreedingStatus.COMPLETE,
      });
    }
  }, [breedingDetailQuery.data?.status]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Status text helpers
  const getBreedingStatusText = (status: BreedingStatus) => {
    const map = {
      [BreedingStatus.PAIRING]: 'Đang ghép cặp',
      [BreedingStatus.SPAWNED]: 'Đã đẻ',
      [BreedingStatus.EGG_BATCH]: 'Ấp trứng',
      [BreedingStatus.FRY_FISH]: 'Nuôi cá bột',
      [BreedingStatus.CLASSIFICATION]: 'Tuyển chọn',
      [BreedingStatus.COMPLETE]: 'Hoàn thành',
      [BreedingStatus.FAILED]: 'Hủy ghép cặp',
    };
    return map[status] || status;
  };

  const getEggBatchStatusText = (status: EggBatchStatus) => {
    const map = {
      [EggBatchStatus.COLLECTED]: 'Đã thu',
      [EggBatchStatus.INCUBATING]: 'Đang ấp',
      [EggBatchStatus.PARTIALLY_HATCHED]: 'Đã nở một phần',
      [EggBatchStatus.SUCCESS]: 'Thành công',
      [EggBatchStatus.FAILED]: 'Thất bại',
    };
    return map[status] || status;
  };

  const getFryFishStatusText = (status: FryFishStatus) => {
    const map = {
      [FryFishStatus.HATCHED]: 'Vừa nở',
      [FryFishStatus.GROWING]: 'Đang phát triển',
      [FryFishStatus.SELECTING]: 'Đang chọn lọc',
      [FryFishStatus.COMPLETED]: 'Hoàn thành',
      [FryFishStatus.DEAD]: 'Chết',
    };
    return map[status] || status;
  };

  // const getClassificationStatusText = (status: ClassificationStatus) => {
  //   const map = {
  //     [ClassificationStatus.PREPARING]: 'Đang chuẩn bị',
  //     [ClassificationStatus.STAGE1]: 'Giai đoạn 1',
  //     [ClassificationStatus.STAGE2]: 'Giai đoạn 2',
  //     [ClassificationStatus.STAGE3]: 'Giai đoạn 3',
  //     [ClassificationStatus.STAGE4]: 'Giai đoạn 4',
  //     [ClassificationStatus.SUCCESS]: 'Thành công',
  //   };
  //   return map[status] || status;
  // };

  const getStatusColor = (status: BreedingStatus) => {
    const map = {
      [BreedingStatus.PAIRING]: '#3b82f6',
      [BreedingStatus.SPAWNED]: '#f59e0b',
      [BreedingStatus.EGG_BATCH]: '#fb923c',
      [BreedingStatus.FRY_FISH]: '#10b981',
      [BreedingStatus.CLASSIFICATION]: '#6366f1',
      [BreedingStatus.COMPLETE]: '#06b6d4',
      [BreedingStatus.FAILED]: '#ef4444',
    };
    return map[status] || '#6b7280';
  };

  if (breedingDetailQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-primary pb-4">
          <View className="flex-row items-center px-4 pt-2">
            <TouchableOpacity
              className="mr-3"
              onPress={() => router.push('/breeding')}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="flex-1 text-lg font-semibold text-white">
              Chi tiết sinh sản
            </Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: insets.bottom + 40,
            padding: 16,
          }}
        >
          {/* Skeleton cards */}
          <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
            <View className="mb-4 h-6 w-32 rounded bg-gray-200" />
            <View className="space-y-3">
              {[1, 2, 3].map((i) => (
                <View key={i} className="flex-row justify-between">
                  <View className="h-4 w-20 rounded bg-gray-200" />
                  <View className="h-4 w-32 rounded bg-gray-300" />
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (breedingDetailQuery.isError || !breedingDetailQuery.data) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="bg-primary pb-4">
          <View className="flex-row items-center px-4 pt-2">
            <TouchableOpacity
              className="mr-3"
              onPress={() => router.push('/breeding')}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="flex-1 text-lg font-semibold text-white">
              Chi tiết sinh sản
            </Text>
          </View>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Không thể tải dữ liệu</Text>
        </View>
      </SafeAreaView>
    );
  }

  const breedingDetail = breedingDetailQuery.data;
  const incubationRecords = breedingDetail.batch?.incubationDailyRecords ?? [];

  const statusColor = getStatusColor(breedingDetail.status);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="rounded-t-2xl bg-primary pb-6">
        <View className="px-4 pt-3">
          <View className="mb-4 flex-row items-center">
            <TouchableOpacity
              className="mr-3"
              onPress={() => router.push('/breeding')}
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>

            <View className="flex-1">
              <Text className="text-base font-medium uppercase tracking-wide text-white/80">
                Chi tiết
              </Text>
              <Text className="text-2xl font-bold text-white">
                {breedingDetail.code !== ''
                  ? `#${breedingDetail.code}`
                  : `Quy trình #${breedingDetail.id}`}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                const redirect = `/breeding/${breedingId}`;
                router.push(
                  `/breeding/${breedingId}/fish-list?redirect=${encodeURIComponent(
                    redirect
                  )}`
                );
              }}
              className="ml-3 rounded-2xl bg-white/10 px-3 py-2"
            >
              <Text className="text-sm font-semibold text-white">
                Định danh cá
              </Text>
            </TouchableOpacity>
          </View>

          {/* Status Badge */}
          <View className="flex-row items-center justify-between rounded-2xl bg-white/10 p-3">
            <Text className="text-base font-medium text-white/90">
              Trạng thái hiện tại
            </Text>
            <View className="rounded-full bg-white px-3 py-1">
              <Text
                className="text-base font-semibold"
                style={{ color: statusColor }}
              >
                {getBreedingStatusText(breedingDetail.status)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        {/* Stats Grid */}
        <View className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="border-b border-gray-100 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-900">
              Thống kê tổng quan
            </Text>
          </View>
          <View className="flex-row flex-wrap p-2">
            <StatCard
              label="Số trứng"
              value={(breedingDetail.totalEggs ?? 0).toLocaleString()}
              color="#fb923c"
            />
            <StatCard
              label="Tỷ lệ thụ tinh"
              value={`${(breedingDetail.fertilizationRate ?? 0).toFixed(1)}%`}
              color="#10b981"
            />
            <StatCard
              label="Tỷ lệ sống"
              value={
                breedingDetail.survivalRate != null
                  ? `${breedingDetail.survivalRate.toFixed(1)}%`
                  : 'N/A'
              }
              color="#3b82f6"
            />
            <StatCard
              label="Cá đạt chuẩn"
              value={(breedingDetail.totalFishQualified ?? 0).toLocaleString()}
              color="#6366f1"
            />
          </View>
        </View>

        {/* Basic Info */}
        <View className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="border-b border-gray-100 px-4 py-3">
            <Text className="text-lg font-semibold text-gray-900">
              Thông tin cơ bản
            </Text>
          </View>
          <View className="p-4">
            <InfoRow
              label="Cá đực"
              value={`${breedingDetail.maleKoiRFID} - ${breedingDetail.maleKoiVariety}`}
            />
            <InfoRow
              label="Cá cái"
              value={`${breedingDetail.femaleKoiRFID} - ${breedingDetail.femaleKoiVariety}`}
            />
            <InfoRow label="Bể nuôi" value={breedingDetail.pondName} />
            <InfoRow
              label="Ngày bắt đầu"
              value={formatDate(breedingDetail.startDate, 'dd/MM/yyyy')}
              isLast
            />
          </View>
        </View>

        {/* Progress Timeline */}
        <View className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="border-b border-gray-100 px-4 py-3">
            <Text className="text-base font-semibold text-gray-900">
              Tiến trình sinh sản
            </Text>
          </View>
          <View className="p-4">
            {/* Pairing */}
            <TimelineItem
              title="Ghép cặp"
              isActive={breedingDetail.status === BreedingStatus.PAIRING}
              isCompleted={breedingDetail.status !== BreedingStatus.PAIRING}
              isExpanded={expandedSections.pairing}
              onToggle={() => toggleSection('pairing')}
              icon={
                <FishSvg
                  size={16}
                  color={
                    breedingDetail.status === BreedingStatus.PAIRING
                      ? '#3b82f6'
                      : '#10b981'
                  }
                />
              }
            >
              <View className="mt-2 rounded-2xl bg-gray-50 p-3">
                <Text className="mb-1 text-lg text-gray-600">
                  {formatDate(breedingDetail.startDate, 'dd/MM/yyyy')} -{' '}
                  {breedingDetail.status === BreedingStatus.PAIRING
                    ? 'Đang tiến hành'
                    : 'Hoàn thành'}
                </Text>
                {breedingDetail.note && (
                  <Text className="text-base italic text-gray-500">
                    Ghi chú: {breedingDetail.note}
                  </Text>
                )}

                {breedingDetail.status === BreedingStatus.PAIRING && (
                  <TouchableOpacity
                    className={`mt-3 flex-row items-center justify-center rounded-2xl py-3 ${
                      isMarkingSpawned
                        ? 'bg-green-500 opacity-60'
                        : 'bg-green-600'
                    }`}
                    onPress={async () => {
                      setIsMarkingSpawned(true);
                      try {
                        await markAsSpawnedMutation.mutateAsync(
                          breedingDetail.id
                        );
                        await breedingDetailQuery.refetch();
                        Toast.show({
                          type: 'success',
                          text1: 'Thành công',
                          text2: 'Đã cập nhật trạng thái sang "Đã đẻ"',
                        });
                      } catch (err: any) {
                        Toast.show({
                          type: 'error',
                          text1: 'Lỗi',
                          text2:
                            err?.message ?? 'Không thể cập nhật trạng thái',
                        });
                      } finally {
                        setIsMarkingSpawned(false);
                      }
                    }}
                    disabled={isMarkingSpawned}
                  >
                    {isMarkingSpawned ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="#fff" />
                        <Text className="ml-2 font-semibold text-white">
                          Đang cập nhật...
                        </Text>
                      </View>
                    ) : (
                      <>
                        <Check size={20} color="#fff" />
                        <Text className="ml-2 font-semibold text-white">
                          Đánh dấu đã đẻ
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </TimelineItem>

            {/* Spawned */}
            {(breedingDetail.status === BreedingStatus.SPAWNED ||
              breedingDetail.status === BreedingStatus.EGG_BATCH ||
              breedingDetail.status === BreedingStatus.FRY_FISH ||
              breedingDetail.status === BreedingStatus.CLASSIFICATION ||
              breedingDetail.status === BreedingStatus.COMPLETE) && (
              <TimelineItem
                title="Đẻ trứng"
                isActive={breedingDetail.status === BreedingStatus.SPAWNED}
                isCompleted={breedingDetail.status !== BreedingStatus.SPAWNED}
                isExpanded={expandedSections.spawned}
                onToggle={() => toggleSection('spawned')}
                icon={
                  <Egg
                    size={16}
                    color={
                      breedingDetail.status === BreedingStatus.SPAWNED
                        ? '#f59e0b'
                        : '#10b981'
                    }
                  />
                }
              >
                <View className="mt-2 rounded-2xl bg-orange-50 p-3">
                  <InfoRow
                    label="Số trứng"
                    value={`${(breedingDetail.totalEggs ?? 0).toLocaleString()} trứng`}
                  />
                  <InfoRow
                    label="Tỷ lệ thụ tinh"
                    value={`${(breedingDetail.fertilizationRate ?? 0).toFixed(1)}%`}
                    isLast
                  />

                  {breedingDetail.status === BreedingStatus.SPAWNED && (
                    <TouchableOpacity
                      className="mt-3 flex-row items-center justify-center rounded-2xl bg-orange-500 py-3"
                      onPress={() => setShowCountEggModal(true)}
                    >
                      <Egg size={18} color="#fff" />
                      <Text className="ml-2 font-semibold text-white">
                        Đếm trứng
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </TimelineItem>
            )}

            {/* Egg Batch */}
            {(breedingDetail.status === BreedingStatus.EGG_BATCH ||
              breedingDetail.status === BreedingStatus.FRY_FISH ||
              breedingDetail.status === BreedingStatus.CLASSIFICATION ||
              breedingDetail.status === BreedingStatus.COMPLETE) &&
              breedingDetail.batch && (
                <TimelineItem
                  title="Ấp trứng"
                  isActive={breedingDetail.status === BreedingStatus.EGG_BATCH}
                  isCompleted={
                    breedingDetail.status !== BreedingStatus.EGG_BATCH
                  }
                  isExpanded={expandedSections.eggBatch}
                  onToggle={() => toggleSection('eggBatch')}
                  icon={
                    <Egg
                      size={16}
                      color={
                        breedingDetail.status === BreedingStatus.EGG_BATCH
                          ? '#fb923c'
                          : '#10b981'
                      }
                    />
                  }
                  actionButton={
                    breedingDetail.status === BreedingStatus.EGG_BATCH ? (
                      <TouchableOpacity
                        onPress={() => {
                          if (incubationRecords.length === 0) {
                            setShowCountEggModal(true);
                          } else {
                            Toast.show({
                              type: 'error',
                              text1: 'Không thể chỉnh sửa',
                              text2:
                                'Đã có bản ghi theo dõi, không thể chỉnh sửa lô trứng',
                            });
                          }
                        }}
                        className="p-1"
                      >
                        <Edit size={18} color="#3b82f6" />
                      </TouchableOpacity>
                    ) : null
                  }
                >
                  <View className="mt-2 rounded-2xl bg-orange-50 p-3">
                    <View className="mb-3 flex-row items-center justify-between">
                      <Text className="text-lg font-bold text-gray-900">
                        Thông tin lô trứng
                      </Text>
                      {breedingDetail.status === BreedingStatus.EGG_BATCH && (
                        <TouchableOpacity
                          onPress={() => setShowUpdateEggModal(true)}
                          className="flex-row items-center gap-1 rounded-2xl bg-blue-500 px-3 py-1.5"
                        >
                          <Plus size={14} color="#fff" />
                          <Text className="text-base font-semibold text-white">
                            Bản ghi
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <InfoRow
                      label="Số lượng"
                      value={`${(breedingDetail.batch.quantity ?? 0).toLocaleString()} trứng`}
                    />
                    <InfoRow
                      label="Tỷ lệ thụ tinh"
                      value={`${(breedingDetail.batch.fertilizationRate ?? 0).toFixed(1)}%`}
                    />
                    {breedingDetail.batch.hatchingTime && (
                      <InfoRow
                        label="Thời gian ấp"
                        value={formatDate(
                          breedingDetail.batch.hatchingTime,
                          'dd/MM/yyyy'
                        )}
                      />
                    )}
                    <InfoRow
                      label="Trạng thái"
                      value={getEggBatchStatusText(breedingDetail.batch.status)}
                      isLast
                    />

                    {/* Daily Records Table */}
                    {incubationRecords.length > 0 && (
                      <View className="mt-3">
                        <Text className="mb-2 text-base font-bold text-gray-900">
                          Theo dõi hàng ngày
                        </Text>
                        <View className="overflow-hidden rounded-lg border border-orange-200">
                          <View className="flex-row bg-orange-100 p-2">
                            <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
                              Ngày
                            </Text>
                            <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
                              Khỏe
                            </Text>
                            <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
                              Hỏng
                            </Text>
                            <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
                              Nở
                            </Text>
                            {breedingDetail.status ===
                              BreedingStatus.EGG_BATCH && (
                              <Text className="w-16 text-center text-sm font-semibold text-gray-700">
                                Thao tác
                              </Text>
                            )}
                          </View>
                          {incubationRecords.map((record, index) => (
                            <View
                              key={record.id}
                              className={`flex-row items-center p-2 ${index !== incubationRecords.length - 1 ? 'border-b border-orange-100' : ''}`}
                            >
                              <Text className="flex-1 text-center text-sm text-gray-900">
                                {formatDate(record.dayNumber, 'dd/MM')}
                              </Text>
                              <Text className="flex-1 text-center text-sm text-gray-900">
                                {record.healthyEggs}
                              </Text>
                              <Text className="flex-1 text-center text-sm text-gray-900">
                                {record.rottenEggs || 0}
                              </Text>
                              <Text className="flex-1 text-center text-sm text-gray-900">
                                {record.hatchedEggs}
                              </Text>
                              {index === incubationRecords.length - 1 &&
                              breedingDetail.status ===
                                BreedingStatus.EGG_BATCH ? (
                                <View className="w-16 flex-row items-center justify-center gap-1">
                                  <TouchableOpacity
                                    onPress={() => {
                                      setEditingIncubationRecord(record);
                                      setIsFirstIncubationRecord(index === 0);
                                      setShowEditIncubationModal(true);
                                    }}
                                    className="p-1"
                                  >
                                    <Edit size={18} color="#3b82f6" />
                                  </TouchableOpacity>
                                  <TouchableOpacity
                                    onPress={() => {
                                      setDeleteAlert({
                                        visible: true,
                                        type: 'incubation',
                                        recordId: record.id,
                                        message:
                                          'Bạn có chắc chắn muốn xóa bản ghi ấp trứng này?',
                                      });
                                    }}
                                    className="p-1"
                                    disabled={
                                      deleteIncubationMutation.status ===
                                      'pending'
                                    }
                                  >
                                    <Trash2
                                      size={18}
                                      color={
                                        deleteIncubationMutation.status ===
                                        'pending'
                                          ? '#9ca3af'
                                          : '#ef4444'
                                      }
                                    />
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                breedingDetail.status ===
                                  BreedingStatus.EGG_BATCH && (
                                  <View className="w-16" />
                                )
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                </TimelineItem>
              )}

            {/* Fry Fish */}
            {(breedingDetail.status === BreedingStatus.FRY_FISH ||
              breedingDetail.status === BreedingStatus.CLASSIFICATION ||
              breedingDetail.status === BreedingStatus.COMPLETE) &&
              breedingDetail.fryFish && (
                <TimelineItem
                  title="Nuôi cá bột"
                  isActive={breedingDetail.status === BreedingStatus.FRY_FISH}
                  isCompleted={
                    breedingDetail.status !== BreedingStatus.FRY_FISH
                  }
                  isExpanded={expandedSections.fryFish}
                  onToggle={() => toggleSection('fryFish')}
                  icon={
                    <FishSvg
                      size={16}
                      color={
                        breedingDetail.status === BreedingStatus.FRY_FISH
                          ? '#10b981'
                          : '#10b981'
                      }
                    />
                  }
                  actionButton={
                    breedingDetail.status === BreedingStatus.FRY_FISH ? (
                      <TouchableOpacity
                        onPress={() => {
                          if (
                            breedingDetail.fryFish?.frySurvivalRecords &&
                            breedingDetail.fryFish.frySurvivalRecords.length > 0
                          ) {
                            Toast.show({
                              type: 'error',
                              text1: 'Không thể chỉnh sửa',
                              text2:
                                'Đã có bản ghi theo dõi, không thể chuyển hồ',
                            });
                          } else {
                            setShowChangePondModal(true);
                          }
                        }}
                        className="p-1"
                      >
                        <Edit size={18} color="#3b82f6" />
                      </TouchableOpacity>
                    ) : null
                  }
                >
                  <View className="mt-2 rounded-2xl bg-green-50 p-3">
                    <View className="mb-3 flex-row items-center justify-between">
                      <Text className="text-base font-bold text-gray-900">
                        Thông tin nuôi cá bột
                      </Text>
                      {breedingDetail.status === BreedingStatus.FRY_FISH && (
                        <TouchableOpacity
                          onPress={() => setShowFrySurvivalRecordModal(true)}
                          className="flex-row items-center gap-1 rounded-2xl bg-green-600 px-3 py-1.5"
                        >
                          <Plus size={14} color="#fff" />
                          <Text className="text-base font-semibold text-white">
                            Bản ghi
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <InfoRow
                      label="Số lượng ban đầu"
                      value={`${(breedingDetail.fryFish.initialCount ?? 0).toLocaleString()} con`}
                    />
                    <InfoRow
                      label="Tỷ lệ sống hiện tại"
                      value={`${(breedingDetail.fryFish.currentSurvivalRate ?? 0).toFixed(1)}%`}
                    />
                    <InfoRow
                      label="Trạng thái"
                      value={getFryFishStatusText(
                        breedingDetail.fryFish.status
                      )}
                      isLast
                    />

                    {/* Survival Records Table */}
                    {breedingDetail.fryFish.frySurvivalRecords &&
                      breedingDetail.fryFish.frySurvivalRecords.length > 0 && (
                        <View className="mt-3">
                          <Text className="mb-2 text-base font-bold text-gray-900">
                            Bản ghi theo dõi
                          </Text>
                          <View className="overflow-hidden rounded-lg border border-green-200">
                            <View className="flex-row bg-green-100 p-2">
                              <Text className="flex-1 text-center text-base font-semibold text-gray-700">
                                Ngày
                              </Text>
                              <Text className="flex-1 text-center text-base font-semibold text-gray-700">
                                Còn sống
                              </Text>
                              <Text className="flex-1 text-center text-base font-semibold text-gray-700">
                                Tỷ lệ
                              </Text>
                              {breedingDetail.status ===
                                BreedingStatus.FRY_FISH && (
                                <Text className="w-16 text-center text-base font-semibold text-gray-700">
                                  Thao tác
                                </Text>
                              )}
                            </View>
                            {breedingDetail.fryFish.frySurvivalRecords.map(
                              (record, index) => (
                                <View
                                  key={record.id}
                                  className={`flex-row items-center p-2 ${
                                    index !==
                                    (breedingDetail.fryFish?.frySurvivalRecords
                                      ?.length ?? 0) -
                                      1
                                      ? 'border-b border-green-100'
                                      : ''
                                  }`}
                                >
                                  <Text className="flex-1 text-center text-base text-gray-900">
                                    {formatDate(record.dayNumber, 'dd/MM')}
                                  </Text>
                                  <Text className="flex-1 text-center text-base text-gray-900">
                                    {record.countAlive ?? 0}
                                  </Text>
                                  <Text className="flex-1 text-center text-base text-gray-900">
                                    {(record.survivalRate ?? 0).toFixed(1)}%
                                  </Text>
                                  {index ===
                                    (breedingDetail.fryFish?.frySurvivalRecords
                                      ?.length ?? 0) -
                                      1 &&
                                  breedingDetail.status ===
                                    BreedingStatus.FRY_FISH ? (
                                    <View className="w-16 flex-row items-center justify-center gap-1">
                                      <TouchableOpacity
                                        onPress={() => {
                                          setEditingFrySurvivalRecord(record);
                                          setShowEditFrySurvivalModal(true);
                                        }}
                                        className="p-1"
                                      >
                                        <Edit size={18} color="#3b82f6" />
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        onPress={() => {
                                          setDeleteAlert({
                                            visible: true,
                                            type: 'frySurvival',
                                            recordId: record.id,
                                            message:
                                              'Bạn có chắc chắn muốn xóa bản ghi theo dõi cá bột này?',
                                          });
                                        }}
                                        className="p-1"
                                        disabled={
                                          deleteFrySurvivalMutation.status ===
                                          'pending'
                                        }
                                      >
                                        <Trash2
                                          size={18}
                                          color={
                                            deleteFrySurvivalMutation.status ===
                                            'pending'
                                              ? '#9ca3af'
                                              : '#ef4444'
                                          }
                                        />
                                      </TouchableOpacity>
                                    </View>
                                  ) : (
                                    breedingDetail.status ===
                                      BreedingStatus.FRY_FISH && (
                                      <View className="w-16" />
                                    )
                                  )}
                                </View>
                              )
                            )}
                          </View>
                        </View>
                      )}
                  </View>
                </TimelineItem>
              )}

            {/* Classification */}
            {(breedingDetail.status === BreedingStatus.CLASSIFICATION ||
              breedingDetail.status === BreedingStatus.COMPLETE) &&
              breedingDetail.classificationStage && (
                <TimelineItem
                  title="Tuyển chọn"
                  isActive={
                    breedingDetail.status === BreedingStatus.CLASSIFICATION
                  }
                  isCompleted={
                    breedingDetail.status === BreedingStatus.COMPLETE
                  }
                  isExpanded={expandedSections.classification}
                  onToggle={() => toggleSection('classification')}
                  icon={
                    <Package
                      size={16}
                      color={
                        breedingDetail.status === BreedingStatus.CLASSIFICATION
                          ? '#6366f1'
                          : '#10b981'
                      }
                    />
                  }
                  actionButton={
                    breedingDetail.status === BreedingStatus.CLASSIFICATION &&
                    canEditClassification ? (
                      <TouchableOpacity
                        onPress={() => {
                          if (
                            breedingDetail.classificationStage
                              ?.classificationRecords &&
                            breedingDetail.classificationStage
                              .classificationRecords.length > 0
                          ) {
                            Toast.show({
                              type: 'error',
                              text1: 'Không thể chỉnh sửa',
                              text2:
                                'Đã có bản ghi tuyển chọn, không thể chuyển hồ',
                            });
                          } else {
                            setShowChangePondModalClassification(true);
                          }
                        }}
                        className="p-1"
                      >
                        <Edit size={18} color="#3b82f6" />
                      </TouchableOpacity>
                    ) : null
                  }
                >
                  <View className="mt-2 rounded-2xl bg-indigo-50 p-3">
                    <View className="mb-3 flex-row items-center justify-between">
                      <Text className="text-lg font-bold text-gray-900">
                        Hiệu quả tuyển chọn
                      </Text>
                      <View className="flex-row items-center gap-2">
                        {breedingDetail.status ===
                          BreedingStatus.CLASSIFICATION &&
                          (!breedingDetail.classificationStage
                            .classificationRecords ||
                            breedingDetail.classificationStage
                              .classificationRecords.length < 4) && (
                            <TouchableOpacity
                              onPress={() => setShowSelectionModal(true)}
                              className="flex-row items-center gap-1 rounded-2xl bg-indigo-600 px-3 py-1.5"
                            >
                              <Plus size={14} color="#fff" />
                              <Text className="text-base font-semibold text-white">
                                Bản ghi
                              </Text>
                            </TouchableOpacity>
                          )}
                      </View>
                    </View>

                    <View className="mb-3 flex-row items-center justify-between">
                      <Text className="text-base font-semibold text-gray-600">
                        Tổng số cá:{' '}
                        {(
                          breedingDetail.classificationStage.totalCount ?? 0
                        ).toLocaleString()}{' '}
                        con
                      </Text>
                      {breedingDetail.classificationStage.classificationRecords
                        .length >= 3 && (
                        <TouchableOpacity
                          onPress={async () => {
                            try {
                              const res = await pondPacketQuery.refetch();
                              const items =
                                res.data?.data ??
                                pondPacketQuery.data?.data ??
                                [];
                              const first = items[0];
                              const packetId =
                                first?.packetFishId ?? first?.packetFish?.id;
                              setEditPacketFishId(packetId ?? null);
                            } catch {
                              setEditPacketFishId(null);
                            }
                            setShowCreatePacketModal(true);
                          }}
                          className="flex-row items-center gap-1 rounded-2xl bg-blue-500 px-3 py-1.5"
                        >
                          {hasPondPacket ? (
                            <>
                              <Edit size={14} color="#fff" />
                              <Text className="text-base font-semibold text-white">
                                Sửa lô
                              </Text>
                            </>
                          ) : (
                            <>
                              <Plus size={14} color="#fff" />
                              <Text className="text-base font-semibold text-white">
                                Tạo lô
                              </Text>
                            </>
                          )}
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Classification Records Table */}
                    {breedingDetail.classificationStage.classificationRecords &&
                      breedingDetail.classificationStage.classificationRecords
                        .length > 0 && (
                        <View className="mt-3">
                          <View className="overflow-hidden rounded-lg border border-indigo-200">
                            <View className="flex-row bg-indigo-100 p-2">
                              <Text className="w-10 text-center text-sm font-semibold text-gray-700">
                                Lần
                              </Text>
                              <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
                                Show
                              </Text>
                              <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
                                High
                              </Text>
                              <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
                                Pond
                              </Text>
                              <Text className="flex-1 text-center text-sm font-semibold text-gray-700">
                                Cull
                              </Text>
                              {breedingDetail.status ===
                                BreedingStatus.CLASSIFICATION &&
                                canEditClassification && (
                                  <Text className="w-16 text-center text-sm font-semibold text-gray-700">
                                    Thao tác
                                  </Text>
                                )}
                            </View>

                            {breedingDetail.classificationStage.classificationRecords.map(
                              (record, idx) => (
                                <View
                                  key={record.id}
                                  className={`flex-row items-center p-2 ${
                                    idx !==
                                    (breedingDetail.classificationStage
                                      ?.classificationRecords?.length ?? 0) -
                                      1
                                      ? 'border-b border-indigo-100'
                                      : ''
                                  }`}
                                >
                                  <Text className="w-10 text-center text-sm text-gray-900">
                                    {record.stageNumber || idx + 1}
                                  </Text>
                                  <Text className="flex-1 text-center text-sm text-gray-900">
                                    {record.showQualifiedCount || 0}
                                  </Text>
                                  <Text className="flex-1 text-center text-sm text-gray-900">
                                    {record.highQualifiedCount || 0}
                                  </Text>
                                  <Text className="flex-1 text-center text-sm text-gray-900">
                                    {record.pondQualifiedCount || 0}
                                  </Text>
                                  <Text className="flex-1 text-center text-sm text-gray-900">
                                    {record.cullQualifiedCount || 0}
                                  </Text>
                                  {breedingDetail.status ===
                                    BreedingStatus.CLASSIFICATION &&
                                    canEditClassification && (
                                      <View className="w-16 flex-row items-center justify-center gap-1">
                                        <TouchableOpacity
                                          onPress={() => {
                                            setEditingClassificationRecord(
                                              record
                                            );
                                            setEditingClassificationRecordIndex(
                                              idx
                                            );
                                            setShowEditClassificationModal(
                                              true
                                            );
                                          }}
                                          className="p-1"
                                          disabled={hasPondPacket && idx <= 2}
                                        >
                                          <Edit
                                            size={18}
                                            color={
                                              hasPondPacket && idx <= 2
                                                ? '#9ca3af'
                                                : '#3b82f6'
                                            }
                                          />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                          onPress={() => {
                                            setDeleteAlert({
                                              visible: true,
                                              type: 'classification',
                                              recordId: record.id,
                                              message:
                                                'Bạn có chắc chắn muốn xóa bản ghi tuyển chọn này?',
                                            });
                                          }}
                                          className="p-1"
                                          disabled={
                                            deleteClassificationMutation.status ===
                                              'pending' ||
                                            (hasPondPacket && idx <= 2)
                                          }
                                        >
                                          <Trash2
                                            size={18}
                                            color={
                                              deleteClassificationMutation.status ===
                                                'pending' ||
                                              (hasPondPacket && idx <= 2)
                                                ? '#9ca3af'
                                                : '#ef4444'
                                            }
                                          />
                                        </TouchableOpacity>
                                      </View>
                                    )}
                                </View>
                              )
                            )}
                          </View>

                          <View className="mt-3 rounded-lg bg-white p-3">
                            <Text className="mb-2 text-lg font-bold text-gray-900">
                              Tổng kết:
                            </Text>
                            <View className="flex-row flex-wrap">
                              <View className="w-1/2 py-1">
                                <Text className="text-base text-gray-600">
                                  Show:{' '}
                                  <Text className="font-medium text-gray-900">
                                    {breedingDetail.classificationStage
                                      .showQualifiedCount ?? 0}
                                  </Text>
                                </Text>
                              </View>
                              <View className="w-1/2 py-1">
                                <Text className="text-base text-gray-600">
                                  High:{' '}
                                  <Text className="font-medium text-gray-900">
                                    {breedingDetail.classificationStage
                                      .highQualifiedCount ?? 0}
                                  </Text>
                                </Text>
                              </View>
                              <View className="w-1/2 py-1">
                                <Text className="text-base text-gray-600">
                                  Pond:{' '}
                                  <Text className="font-medium text-gray-900">
                                    {breedingDetail.classificationStage
                                      .pondQualifiedCount ?? 0}
                                  </Text>
                                </Text>
                              </View>
                              <View className="w-1/2 py-1">
                                <Text className="text-base text-gray-600">
                                  Cull:{' '}
                                  <Text className="font-medium text-gray-900">
                                    {breedingDetail.classificationStage
                                      .cullQualifiedCount ?? 0}
                                  </Text>
                                </Text>
                              </View>
                            </View>
                          </View>
                        </View>
                      )}
                  </View>
                </TimelineItem>
              )}

            {/* Complete */}
            {breedingDetail.status === BreedingStatus.COMPLETE && (
              <TimelineItem
                title="Hoàn thành"
                isActive={false}
                isCompleted={true}
                isExpanded={expandedSections.complete}
                onToggle={() => toggleSection('complete')}
                icon={<CheckCircle2 size={16} color="#10b981" />}
              >
                <View className="mt-2 rounded-2xl bg-teal-50 p-3">
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-base font-medium text-gray-900">
                      Kết quả tổng quan
                    </Text>
                    <View className="flex-row gap-1">
                      <TouchableOpacity
                        onPress={async () => {
                          try {
                            const res = await pondPacketQuery.refetch();
                            const items =
                              res.data?.data ??
                              pondPacketQuery.data?.data ??
                              [];
                            const first = items[0];
                            const packetId =
                              first?.packetFishId ?? first?.packetFish?.id;
                            setEditPacketFishId(packetId ?? null);
                          } catch {
                            setEditPacketFishId(null);
                          }
                          setShowCreatePacketModal(true);
                        }}
                        className="flex-row items-center gap-1 rounded-2xl bg-blue-500 px-3 py-1.5"
                      >
                        {hasPondPacket ? (
                          <>
                            <Edit size={16} color="#fff" />
                            <Text className="text-sm font-semibold text-white">
                              Sửa lô
                            </Text>
                          </>
                        ) : (
                          <>
                            <Plus size={16} color="#fff" />
                            <Text className="text-sm font-semibold text-white">
                              Tạo lô
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          router.push(
                            `/breeding/${breedingId}/fish-list?redirect=/breeding/${breedingId}`
                          )
                        }
                        className="flex-row items-center gap-1 rounded-2xl bg-green-600 px-3 py-1.5"
                      >
                        <FishSvg size={16} color="#fff" />
                        <Text className="text-sm font-semibold text-white">
                          Danh sách
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <InfoRow
                    label="Cá đạt chuẩn"
                    value={`${(breedingDetail.totalFishQualified ?? 0).toLocaleString()} con`}
                  />
                  <InfoRow
                    label="Số lô cá"
                    value={`${(breedingDetail.totalPackage ?? 0).toLocaleString()} lô`}
                  />
                  <InfoRow
                    label="Tỷ lệ thụ tinh"
                    value={`${(breedingDetail.fertilizationRate ?? 0).toFixed(1)}%`}
                  />
                  {breedingDetail.survivalRate != null && (
                    <InfoRow
                      label="Tỷ lệ sống cuối"
                      value={`${breedingDetail.survivalRate.toFixed(2)}%`}
                    />
                  )}
                  {breedingDetail.endDate && (
                    <InfoRow
                      label="Ngày hoàn thành"
                      value={formatDate(breedingDetail.endDate, 'dd/MM/yyyy')}
                      isLast
                    />
                  )}
                  {breedingDetail.note && (
                    <Text className="mt-2 text-sm italic text-gray-500">
                      Ghi chú: {breedingDetail.note}
                    </Text>
                  )}
                </View>
              </TimelineItem>
            )}
          </View>
        </View>
      </ScrollView>

      {/* All Modals */}
      <CreatePacketFishModal
        visible={showCreatePacketModal}
        onClose={() => setShowCreatePacketModal(false)}
        breedingId={breedingId}
        currentPondId={breedingDetail.pondId}
        packetFishId={editPacketFishId ?? undefined}
        onSuccess={() => breedingDetailQuery.refetch()}
      />

      <UpdateEggBatchModal
        visible={showUpdateEggModal}
        onClose={() => {
          setShowUpdateEggModal(false);
          breedingDetailQuery.refetch();
        }}
        breedingId={breedingId}
        pondTypeEnum={TypeOfPond.FRY_FISH}
      />

      <CountEggModal
        visible={showCountEggModal}
        onClose={() => {
          setShowCountEggModal(false);
          breedingDetailQuery.refetch();
        }}
        breedingId={breedingId}
        pondTypeEnum={TypeOfPond.EGG_BATCH}
        eggBatchData={
          breedingDetail.status === BreedingStatus.EGG_BATCH &&
          breedingDetail.batch
            ? {
                id: breedingDetail.batch.id,
                pondId: breedingDetail.pondId,
                pondName: breedingDetail.pondName,
              }
            : null
        }
      />

      <EditIncubationRecordModal
        visible={showEditIncubationModal}
        onClose={() => {
          setShowEditIncubationModal(false);
          setEditingIncubationRecord(null);
          breedingDetailQuery.refetch();
        }}
        record={editingIncubationRecord}
        isFirstRecord={isFirstIncubationRecord}
      />

      <ChangePondModal
        visible={showChangePondModal}
        onClose={() => {
          setShowChangePondModal(false);
          breedingDetailQuery.refetch();
        }}
        currentPondId={breedingDetail.pondId}
        currentPondName={breedingDetail.pondName}
        breedingStatus={breedingDetail.status}
        title="Chọn hồ nuôi cá bột"
        onSave={async (newPondId: number) => {
          const fryFishId = breedingDetail.fryFish?.id;
          if (!fryFishId || !breedingId) {
            throw new Error('Không tìm thấy thông tin cá bột');
          }

          await updateFryFishMutation.mutateAsync({
            id: fryFishId,
            data: {
              breedingProcessId: breedingId,
              pondId: newPondId,
            },
          });
        }}
      />

      <FrySurvivalRecordModal
        visible={showFrySurvivalRecordModal}
        onClose={() => {
          setShowFrySurvivalRecordModal(false);
          breedingDetailQuery.refetch();
        }}
        breedingId={breedingId}
        pondTypeEnum={TypeOfPond.CLASSIFICATION}
      />

      <EditFrySurvivalRecordModal
        visible={showEditFrySurvivalModal}
        onClose={() => {
          setShowEditFrySurvivalModal(false);
          setEditingFrySurvivalRecord(null);
          breedingDetailQuery.refetch();
        }}
        record={editingFrySurvivalRecord}
        fryFishId={breedingDetail.fryFish?.id ?? 0}
      />

      <EditClassificationRecordModal
        visible={showEditClassificationModal}
        onClose={() => {
          setShowEditClassificationModal(false);
          setEditingClassificationRecord(null);
          breedingDetailQuery.refetch();
        }}
        record={editingClassificationRecord}
        recordIndex={editingClassificationRecordIndex}
      />

      <SelectionModal
        visible={showSelectionModal}
        onClose={() => {
          setShowSelectionModal(false);
          breedingDetailQuery.refetch();
        }}
        breedingId={breedingDetail?.id ?? null}
      />

      <ChangePondModal
        visible={showChangePondModalClassification}
        onClose={() => {
          setShowChangePondModalClassification(false);
          breedingDetailQuery.refetch();
        }}
        currentPondId={breedingDetail.pondId}
        currentPondName={breedingDetail.pondName}
        breedingStatus={breedingDetail.status}
        title="Chọn hồ tuyển chọn"
        onSave={async (newPondId: number) => {
          const classificationStageId = breedingDetail.classificationStage?.id;
          if (!classificationStageId || !breedingId) {
            throw new Error('Không tìm thấy thông tin giai đoạn tuyển chọn');
          }

          await updateClassificationStageMutation.mutateAsync({
            id: classificationStageId,
            data: {
              breedingProcessId: breedingId,
              pondId: newPondId,
              notes: breedingDetail.classificationStage?.notes ?? '',
            },
          });
        }}
      />

      <CustomAlert
        visible={deleteAlert.visible}
        title="Xác nhận xóa"
        message={deleteAlert.message}
        type="danger"
        cancelText="Hủy"
        confirmText="Xóa"
        onCancel={() => {
          setDeleteAlert({
            visible: false,
            type: null,
            recordId: null,
            message: '',
          });
        }}
        onConfirm={async () => {
          if (!deleteAlert.recordId) return;

          try {
            switch (deleteAlert.type) {
              case 'incubation':
                if (deleteIncubationMutation.status === 'pending') return;
                await deleteIncubationMutation.mutateAsync(
                  deleteAlert.recordId
                );
                break;
              case 'frySurvival':
                if (deleteFrySurvivalMutation.status === 'pending') return;
                await deleteFrySurvivalMutation.mutateAsync(
                  deleteAlert.recordId
                );
                break;
              case 'classification':
                if (deleteClassificationMutation.status === 'pending') return;
                await deleteClassificationMutation.mutateAsync(
                  deleteAlert.recordId
                );
                break;
            }

            setDeleteAlert({
              visible: false,
              type: null,
              recordId: null,
              message: '',
            });
            breedingDetailQuery.refetch();
          } catch (error) {
            console.error(`Error deleting ${deleteAlert.type} record:`, error);
            setDeleteAlert({
              visible: false,
              type: null,
              recordId: null,
              message: '',
            });
          }
        }}
      />
    </SafeAreaView>
  );
}

// Helper Components
const StatCard = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) => (
  <View className="w-1/2 p-2">
    <View className="rounded-2xl bg-gray-50 p-3">
      <Text className="mb-1 text-base text-gray-600">{label}</Text>
      <Text className="text-xl font-bold" style={{ color }}>
        {value}
      </Text>
    </View>
  </View>
);

const InfoRow = ({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) => (
  <View
    className={`flex-row justify-between py-2 ${!isLast ? 'border-b border-gray-100' : ''}`}
  >
    <Text className="text-base font-bold">{label}</Text>
    <Text className="text-base font-medium">{value}</Text>
  </View>
);

const TimelineItem = ({
  title,
  isActive,
  isCompleted,
  isExpanded,
  onToggle,
  icon,
  actionButton,
  children,
}: {
  title: string;
  isActive: boolean;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  icon: React.ReactNode;
  actionButton?: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <View className="mb-3">
    <View className="flex-row items-center justify-between">
      <TouchableOpacity
        className="mr-2 flex-1 flex-row items-center rounded-2xl bg-gray-50 p-3"
        onPress={onToggle}
      >
        <View
          className={`mr-3 rounded-full p-2 ${isActive ? 'bg-blue-100' : 'bg-green-100'}`}
        >
          {icon}
        </View>
        <Text className="flex-1 text-lg font-medium text-gray-900">
          {title}
        </Text>
        {isExpanded ? (
          <ChevronDown size={20} color="#6b7280" />
        ) : (
          <ChevronRight size={20} color="#6b7280" />
        )}
      </TouchableOpacity>
      {actionButton && <View>{actionButton}</View>}
    </View>
    {isExpanded && (
      <View className="ml-6 mt-2 border-l-2 border-gray-200 pl-4">
        {children}
      </View>
    )}
  </View>
);
