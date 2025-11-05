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
import {
  useGetBreedingProcessDetailById,
  useMarkBreedingProcessAsSpawned,
} from '@/hooks/useBreedingProcess';
import { useDeleteClassificationRecord } from '@/hooks/useClassificationRecord';
import { useUpdateClassificationStage } from '@/hooks/useClassificationStage';
import { useUpdateFryFish } from '@/hooks/useFryFish';
import { useDeleteFrySurvivalRecord } from '@/hooks/useFrySurvivalRecord';
import { useDeleteIncubationDailyRecord } from '@/hooks/useIncubationDailyRecord';
import { useGetPonds } from '@/hooks/usePond';
import { useGetPondPacketFishes } from '@/hooks/usePondPacketFish';
import {
  BreedingStatus,
  ClassificationRecordBreeding,
  FrySurvivalRecordsBreeding,
  IncubationDailyReordBreeding,
} from '@/lib/api/services/fetchBreedingProcess';
import { ClassificationStatus } from '@/lib/api/services/fetchClassificationStage';
import { EggBatchStatus } from '@/lib/api/services/fetchEggBatch';
import { FryFishStatus } from '@/lib/api/services/fetchFryFish';
import { PondStatus } from '@/lib/api/services/fetchPond';
import { formatDate } from '@/lib/utils/formatDate';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Edit,
  Egg,
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

  // State for UpdateEggBatchModal
  const [showUpdateEggModal, setShowUpdateEggModal] = useState(false);

  // State for CountEggModal
  const [showCountEggModal, setShowCountEggModal] = useState(false);

  // State for EditIncubationRecordModal
  const [showEditIncubationModal, setShowEditIncubationModal] = useState(false);
  const [editingIncubationRecord, setEditingIncubationRecord] =
    useState<IncubationDailyReordBreeding | null>(null);
  const [isFirstIncubationRecord, setIsFirstIncubationRecord] = useState(false);

  // State for ChangePondModal (for fry fish)
  const [showChangePondModal, setShowChangePondModal] = useState(false);

  // State for ChangePondModal (for classification)
  const [
    showChangePondModalClassification,
    setShowChangePondModalClassification,
  ] = useState(false);

  // State for FrySurvivalRecordModal
  const [showFrySurvivalRecordModal, setShowFrySurvivalRecordModal] =
    useState(false);

  // State for EditFrySurvivalRecordModal
  const [showEditFrySurvivalModal, setShowEditFrySurvivalModal] =
    useState(false);
  const [editingFrySurvivalRecord, setEditingFrySurvivalRecord] =
    useState<FrySurvivalRecordsBreeding | null>(null);

  // State for EditClassificationRecordModal
  const [showEditClassificationModal, setShowEditClassificationModal] =
    useState(false);
  const [editingClassificationRecord, setEditingClassificationRecord] =
    useState<ClassificationRecordBreeding | null>(null);
  const [
    editingClassificationRecordIndex,
    setEditingClassificationRecordIndex,
  ] = useState(0);

  // State for SelectionModal
  const [showSelectionModal, setShowSelectionModal] = useState(false);

  // State for Create Packet Fish Modal
  const [showCreatePacketModal, setShowCreatePacketModal] = useState(false);
  const [editPacketFishId, setEditPacketFishId] = useState<number | null>(null);

  // State for marking as spawned
  const [isMarkingSpawned, setIsMarkingSpawned] = useState(false);

  // State for Custom Alerts
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

  // Delete mutations
  const deleteIncubationMutation = useDeleteIncubationDailyRecord();
  const deleteFrySurvivalMutation = useDeleteFrySurvivalRecord();
  const deleteClassificationMutation = useDeleteClassificationRecord();
  const markAsSpawnedMutation = useMarkBreedingProcessAsSpawned();

  // Update mutations
  const updateFryFishMutation = useUpdateFryFish();
  const updateClassificationStageMutation = useUpdateClassificationStage();

  // Get empty ponds for modal
  const { data: emptyPondPage, refetch: refetchEmptyPonds } = useGetPonds(
    {
      pageIndex: 1,
      pageSize: 200,
      status: PondStatus.EMPTY,
    },
    true
  );

  const pondPacketQuery = useGetPondPacketFishes(
    { breedingProcessId: breedingId, pageIndex: 1, pageSize: 1 },
    !!breedingId
  );

  const hasPondPacket = (pondPacketQuery.data?.data ?? []).length > 0;

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

  // State cho việc đóng/mở các card theo giai đoạn
  const [expandedSections, setExpandedSections] = useState({
    pairing: false,
    spawned: false,
    eggBatch: false,
    fryFish: false,
    classification: false,
    complete: false,
  });

  // Auto expand card based on current status
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
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Hàm chuyển đổi BreedingStatus sang tiếng Việt
  const getBreedingStatusText = (status: BreedingStatus) => {
    switch (status) {
      case BreedingStatus.PAIRING:
        return 'Đang ghép cặp';
      case BreedingStatus.SPAWNED:
        return 'Đã đẻ';
      case BreedingStatus.EGG_BATCH:
        return 'Ấp trứng';
      case BreedingStatus.FRY_FISH:
        return 'Nuôi cá bột';
      case BreedingStatus.CLASSIFICATION:
        return 'Tuyển chọn';
      case BreedingStatus.COMPLETE:
        return 'Hoàn thành';
      case BreedingStatus.FAILED:
        return 'Hủy ghép cặp';
      default:
        return status;
    }
  };

  // Hàm chuyển đổi EggBatchStatus sang tiếng Việt
  const getEggBatchStatusText = (status: EggBatchStatus) => {
    switch (status) {
      case EggBatchStatus.COLLECTED:
        return 'Đã thu';
      case EggBatchStatus.INCUBATING:
        return 'Đang ấp';
      case EggBatchStatus.PARTIALLY_HATCHED:
        return 'Đã nở một phần';
      case EggBatchStatus.SUCCESS:
        return 'Thành công';
      case EggBatchStatus.FAILED:
        return 'Thất bại';
      default:
        return status;
    }
  };

  // Hàm chuyển đổi FryFishStatus sang tiếng Việt
  const getFryFishStatusText = (status: FryFishStatus) => {
    switch (status) {
      case FryFishStatus.HATCHED:
        return 'Vừa nở';
      case FryFishStatus.GROWING:
        return 'Đang phát triển';
      case FryFishStatus.SELECTING:
        return 'Đang chọn lọc';
      case FryFishStatus.COMPLETED:
        return 'Hoàn thành';
      case FryFishStatus.DEAD:
        return 'Chết';
      default:
        return status;
    }
  };

  // Hàm chuyển đổi ClassificationStatus sang tiếng Việt
  const getClassificationStatusText = (status: ClassificationStatus) => {
    switch (status) {
      case ClassificationStatus.PREPARING:
        return 'Đang chuẩn bị';
      case ClassificationStatus.STAGE1:
        return 'Giai đoạn 1';
      case ClassificationStatus.STAGE2:
        return 'Giai đoạn 2';
      case ClassificationStatus.STAGE3:
        return 'Giai đoạn 3';
      case ClassificationStatus.STAGE4:
        return 'Giai đoạn 4';
      case ClassificationStatus.SUCCESS:
        return 'Thành công';
      default:
        return status;
    }
  };

  const getStatusColor = (status: BreedingStatus) => {
    switch (status) {
      case BreedingStatus.PAIRING:
        return '#3b82f6';
      case BreedingStatus.SPAWNED:
        return '#f59e0b';
      case BreedingStatus.EGG_BATCH:
        return '#f59e0b';
      case BreedingStatus.FRY_FISH:
        return '#10b981';
      case BreedingStatus.CLASSIFICATION:
        return '#6366f1';
      case BreedingStatus.COMPLETE:
        return '#10b981';
      case BreedingStatus.FAILED:
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (breedingDetailQuery.isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center border-b border-gray-200 bg-white p-4">
          <TouchableOpacity
            className="mr-3"
            onPress={() => router.push('/breeding')}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="flex-1 text-lg font-semibold text-gray-900">
            Chi tiết chu kỳ sinh sản
          </Text>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          {/* Skeleton Basic Info */}
          <View className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <View className="mb-4 h-6 w-32 rounded bg-gray-200" />
            <View className="flex-row flex-wrap">
              <View className="w-1/2 pr-4">
                <View className="mb-4">
                  <View className="mb-1 h-4 w-20 rounded bg-gray-200" />
                  <View className="h-5 w-full rounded bg-gray-200" />
                </View>
                <View className="mb-4">
                  <View className="mb-1 h-4 w-20 rounded bg-gray-200" />
                  <View className="h-5 w-full rounded bg-gray-200" />
                </View>
              </View>
              <View className="w-1/2 pl-4">
                <View className="mb-4">
                  <View className="mb-1 h-4 w-20 rounded bg-gray-200" />
                  <View className="h-5 w-full rounded bg-gray-200" />
                </View>
                <View className="mb-4">
                  <View className="mb-1 h-4 w-20 rounded bg-gray-200" />
                  <View className="h-5 w-full rounded bg-gray-200" />
                </View>
              </View>
            </View>
          </View>

          {/* Skeleton Stats */}
          <View className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <View className="mb-4 h-6 w-40 rounded bg-gray-200" />
            <View className="flex-row flex-wrap">
              {[1, 2, 3, 4].map((i) => (
                <View key={i} className="mb-4 w-1/2">
                  <View className="mb-1 h-3 w-20 rounded bg-gray-200" />
                  <View className="h-7 w-24 rounded bg-gray-200" />
                </View>
              ))}
            </View>
          </View>

          {/* Skeleton Progress */}
          <View className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <View className="mb-4 h-6 w-36 rounded bg-gray-200" />
            {[1, 2, 3].map((i) => (
              <View key={i} className="mb-4">
                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center">
                    <View className="mr-3 h-3 w-3 rounded-full bg-gray-200" />
                    <View className="h-5 w-32 rounded bg-gray-200" />
                  </View>
                  <View className="h-5 w-5 rounded bg-gray-200" />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (breedingDetailQuery.isError || !breedingDetailQuery.data) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center border-b border-gray-200 bg-white p-4">
          <TouchableOpacity
            className="mr-3"
            onPress={() => router.push('/breeding')}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="flex-1 text-lg font-semibold text-gray-900">
            Chi tiết chu kỳ sinh sản
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-gray-600">Không thể tải dữ liệu</Text>
        </View>
      </SafeAreaView>
    );
  }

  const breedingDetail = breedingDetailQuery.data;
  // Guarded array for incubation daily records to avoid possible undefined access
  const incubationRecords = breedingDetail.batch?.incubationDailyRecords ?? [];

  // Pond options for CreatePacketFishModal: include current pond first if missing
  const pondOptions = (() => {
    const emptyPonds = emptyPondPage?.data ?? [];
    const currentPondId = breedingDetail.pondId;
    const currentPondExists = emptyPonds.some((p) => p.id === currentPondId);

    if (!currentPondExists) {
      return [
        {
          id: currentPondId,
          pondName: breedingDetail.pondName,
        } as any,
        ...emptyPonds,
      ];
    }
    return emptyPonds;
  })();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 bg-white p-4">
        <TouchableOpacity
          className="mr-3"
          onPress={() => router.push('/breeding')}
        >
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-gray-900">
          Chi tiết chu kỳ sinh sản
        </Text>
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
        {/* Basic Info Card */}
        <View className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Thông tin cơ bản
          </Text>

          {/* Info Grid */}
          <View className="flex-row flex-wrap">
            {/* Left Column */}
            <View className="w-1/2 pr-4">
              <View className="mb-4">
                <Text className="mb-1 text-sm text-gray-600">Mã chu kỳ:</Text>
                <Text className="text-base font-medium text-gray-900">
                  {breedingDetail.code}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="mb-1 text-sm text-gray-600">Cá đực:</Text>
                <Text className="text-base font-medium text-gray-900">
                  {breedingDetail.maleKoiRFID} - {breedingDetail.maleKoiVariety}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="mb-1 text-sm text-gray-600">Bể nuôi:</Text>
                <Text className="text-base font-medium text-gray-900">
                  {breedingDetail.pondName}
                </Text>
              </View>
            </View>

            {/* Right Column */}
            <View className="w-1/2 pl-4">
              <View className="mb-4">
                <Text className="mb-1 text-sm text-gray-600">Trạng thái:</Text>
                <View
                  className="self-start rounded-full px-3 py-1"
                  style={{
                    backgroundColor:
                      getStatusColor(breedingDetail.status) + '20',
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: getStatusColor(breedingDetail.status) }}
                  >
                    {getBreedingStatusText(breedingDetail.status)}
                  </Text>
                </View>
              </View>

              <View className="mb-4">
                <Text className="mb-1 text-sm text-gray-600">Cá cái:</Text>
                <Text className="text-base font-medium text-gray-900">
                  {breedingDetail.femaleKoiRFID} -{' '}
                  {breedingDetail.femaleKoiVariety}
                </Text>
              </View>

              <View className="mb-4">
                <Text className="mb-1 text-sm text-gray-600">
                  Ngày bắt đầu:
                </Text>
                <Text className="text-base font-medium text-gray-900">
                  {formatDate(breedingDetail.startDate, 'dd/MM/yyyy')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Current Stats */}
        <View className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Thống kê tổng quan
          </Text>

          <View className="flex-row flex-wrap">
            <View className="mb-4 w-1/2">
              <Text className="text-xs text-gray-500">Số trứng</Text>
              <Text className="text-lg font-bold text-gray-900">
                {(breedingDetail.totalEggs ?? 0).toLocaleString()}
              </Text>
            </View>

            <View className="mb-4 w-1/2">
              <Text className="text-xs text-gray-500">Tỷ lệ thụ tinh</Text>
              <Text className="text-lg font-bold text-gray-900">
                {(breedingDetail.fertilizationRate ?? 0).toFixed(1)}%
              </Text>
            </View>

            <View className="mb-4 w-1/2">
              <Text className="text-xs text-gray-500">Tỷ lệ sống hiện tại</Text>
              <Text className="text-lg font-bold text-gray-900">
                {breedingDetail.currentSurvivalRate != null
                  ? `${breedingDetail.currentSurvivalRate.toFixed(1)}%`
                  : 'N/A'}
              </Text>
            </View>

            <View className="mb-4 w-1/2">
              <Text className="text-xs text-gray-500">Cá đạt chuẩn</Text>
              <Text className="text-lg font-bold text-gray-900">
                {(breedingDetail.totalFishQualified ?? 0).toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Breeding Progress Sections */}
        <View className="mx-4 mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-gray-900">
            Tiến trình sinh sản
          </Text>

          {/* Ghép cặp - Pairing */}
          <View className="mb-4">
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={() => toggleSection('pairing')}
            >
              <View className="flex-row items-center">
                <View
                  className="mr-3 h-3 w-3 rounded-full"
                  style={{
                    backgroundColor:
                      breedingDetail.status === BreedingStatus.PAIRING
                        ? '#3b82f6'
                        : '#10b981',
                  }}
                />
                <Text className="text-base font-medium text-gray-900">
                  Ghép cặp
                </Text>
              </View>
              {expandedSections.pairing ? (
                <ChevronDown size={20} color="#6b7280" />
              ) : (
                <ChevronRight size={20} color="#6b7280" />
              )}
            </TouchableOpacity>

            {expandedSections.pairing && (
              <View className="ml-6 mt-2 border-l border-gray-200 pl-3">
                <Text className="mb-2 text-sm text-gray-600">
                  {formatDate(breedingDetail.startDate, 'dd/MM/yyyy')} -{' '}
                  {breedingDetail.status === BreedingStatus.PAIRING
                    ? 'Đang tiến hành'
                    : 'Hoàn thành'}
                </Text>
                <Text className="text-base font-medium text-gray-900">
                  Ghép cặp
                </Text>
                <Text className="mt-1 text-sm text-gray-600">
                  Cá đực: {breedingDetail.maleKoiRFID} -{' '}
                  {breedingDetail.maleKoiVariety}
                </Text>
                <Text className="text-sm text-gray-600">
                  Cá cái: {breedingDetail.femaleKoiRFID} -{' '}
                  {breedingDetail.femaleKoiVariety}
                </Text>
                {breedingDetail.note && (
                  <Text className="mt-2 text-sm italic text-gray-500">
                    Ghi chú: {breedingDetail.note}
                  </Text>
                )}

                {breedingDetail.status === BreedingStatus.PAIRING && (
                  <View className="mt-3 flex-row border-t border-gray-200 pt-3">
                    <TouchableOpacity
                      className={`flex-1 flex-row items-center justify-center rounded-lg py-2.5 ${isMarkingSpawned ? 'bg-green-500 opacity-60' : 'bg-green-600'}`}
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
                          <Text className="ml-2 font-medium text-white">
                            Đang cập nhật...
                          </Text>
                        </View>
                      ) : (
                        <Text className="font-medium text-white">Đã đẻ</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Đẻ trứng - Spawned */}
          {(breedingDetail.status === BreedingStatus.SPAWNED ||
            breedingDetail.status === BreedingStatus.EGG_BATCH ||
            breedingDetail.status === BreedingStatus.FRY_FISH ||
            breedingDetail.status === BreedingStatus.CLASSIFICATION ||
            breedingDetail.status === BreedingStatus.COMPLETE) && (
            <View className="mb-4">
              <TouchableOpacity
                className="flex-row items-center justify-between py-2"
                onPress={() => toggleSection('spawned')}
              >
                <View className="flex-row items-center">
                  <View
                    className="mr-3 h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        breedingDetail.status === BreedingStatus.SPAWNED
                          ? '#f59e0b'
                          : '#10b981',
                    }}
                  />
                  <Text className="text-base font-medium text-gray-900">
                    Đẻ trứng
                  </Text>
                </View>
                {expandedSections.spawned ? (
                  <ChevronDown size={20} color="#6b7280" />
                ) : (
                  <ChevronRight size={20} color="#6b7280" />
                )}
              </TouchableOpacity>

              {expandedSections.spawned && (
                <View className="ml-6 mt-2 border-l border-gray-200 pl-3">
                  <Text className="mb-2 text-sm text-gray-600">
                    {breedingDetail.status === BreedingStatus.SPAWNED
                      ? 'Đang tiến hành'
                      : 'Hoàn thành'}
                  </Text>
                  <Text className="mb-2 text-base font-medium text-gray-900">
                    Thông tin đẻ trứng
                  </Text>
                  <Text className="text-sm text-gray-900">
                    Số trứng: {(breedingDetail.totalEggs ?? 0).toLocaleString()}{' '}
                    trứng
                  </Text>
                  <Text className="text-sm text-gray-900">
                    Tỷ lệ thụ tinh:{' '}
                    {(breedingDetail.fertilizationRate ?? 0).toFixed(1)}%
                  </Text>

                  {breedingDetail.status === BreedingStatus.SPAWNED && (
                    <View className="mt-3 flex-row border-t border-gray-200 pt-3">
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-lg bg-orange-500 py-2.5"
                        onPress={() => setShowCountEggModal(true)}
                      >
                        <Egg size={20} color="#fff" className="mr-2" />
                        <Text className="font-medium text-white">
                          Đếm trứng
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Ấp trứng - Egg Batch */}
          {(breedingDetail.status === BreedingStatus.EGG_BATCH ||
            breedingDetail.status === BreedingStatus.FRY_FISH ||
            breedingDetail.status === BreedingStatus.CLASSIFICATION ||
            breedingDetail.status === BreedingStatus.COMPLETE) &&
            breedingDetail.batch && (
              <View className="mb-4">
                {breedingDetail.status === BreedingStatus.EGG_BATCH ? (
                  <View className="flex-row items-center justify-between py-2">
                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={() => toggleSection('eggBatch')}
                    >
                      <View
                        className="mr-3 h-3 w-3 rounded-full"
                        style={{
                          backgroundColor:
                            breedingDetail.status === BreedingStatus.EGG_BATCH
                              ? '#f59e0b'
                              : '#10b981',
                        }}
                      />
                      <Text className="text-base font-medium text-gray-900">
                        Ấp trứng
                      </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center">
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
                        className="mr-3 p-1"
                      >
                        <Edit size={18} color="#3b82f6" />
                      </TouchableOpacity>
                      {expandedSections.eggBatch ? (
                        <ChevronDown size={20} color="#6b7280" />
                      ) : (
                        <ChevronRight size={20} color="#6b7280" />
                      )}
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="flex-row items-center justify-between py-2"
                    onPress={() => toggleSection('eggBatch')}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="mr-3 h-3 w-3 rounded-full"
                        style={{ backgroundColor: '#10b981' }}
                      />
                      <Text className="text-base font-medium text-gray-900">
                        Ấp trứng
                      </Text>
                    </View>
                    {expandedSections.eggBatch ? (
                      <ChevronDown size={20} color="#6b7280" />
                    ) : (
                      <ChevronRight size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                )}

                {expandedSections.eggBatch && (
                  <View className="ml-6 mt-2 border-l border-gray-200 pl-3">
                    <View className="mb-3">
                      <Text className="mb-2 text-sm text-gray-600">
                        {formatDate(
                          breedingDetail.batch.spawnDate,
                          'dd/MM/yyyy'
                        )}
                      </Text>
                      <View className="mb-2 flex-row items-center justify-between">
                        <Text className="text-base font-medium text-gray-900">
                          Thông tin ấp trứng
                        </Text>
                        {breedingDetail.status === BreedingStatus.EGG_BATCH && (
                          <TouchableOpacity
                            onPress={() => {
                              setShowUpdateEggModal(true);
                            }}
                            className="flex-row items-center gap-1 rounded-full bg-blue-500 px-3 py-1"
                          >
                            <Text className="text-xs font-medium text-white">
                              + Bản ghi
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text className="text-sm text-gray-900">
                        Số lượng:{' '}
                        {(breedingDetail.batch.quantity ?? 0).toLocaleString()}{' '}
                        trứng
                      </Text>
                      <Text className="text-sm text-gray-900">
                        Tỷ lệ thụ tinh:{' '}
                        {(breedingDetail.batch.fertilizationRate ?? 0).toFixed(
                          1
                        )}
                        %
                      </Text>
                      {breedingDetail.batch.hatchingTime && (
                        <Text className="text-sm text-gray-900">
                          Thời gian ấp:{' '}
                          {formatDate(
                            breedingDetail.batch.hatchingTime,
                            'dd/MM/yyyy'
                          )}
                        </Text>
                      )}
                      <Text className="text-sm text-gray-900">
                        Trạng thái:{' '}
                        {getEggBatchStatusText(breedingDetail.batch.status)}
                      </Text>

                      {/* Daily Records */}
                      {incubationRecords.length > 0 && (
                        <View className="mt-3">
                          <Text className="mb-2 text-sm font-medium text-gray-900">
                            Theo dõi hàng ngày
                          </Text>
                          <View className="space-y-2">
                            <View className="flex-row items-center border-b border-gray-200 pb-2">
                              <Text className="flex-1 text-xs font-medium text-gray-600">
                                Ngày
                              </Text>
                              <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                                Khỏe
                              </Text>
                              <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                                Hỏng
                              </Text>
                              <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                                Nở
                              </Text>
                              {breedingDetail.status ===
                                BreedingStatus.EGG_BATCH && (
                                <Text className="w-16 text-center text-xs font-medium text-gray-600">
                                  Thao tác
                                </Text>
                              )}
                            </View>
                            {incubationRecords.map((record, index) => (
                              <View
                                key={record.id}
                                className="flex-row items-center py-1"
                              >
                                <Text className="flex-1 text-sm text-gray-900">
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
                                      <Edit size={16} color="#3b82f6" />
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
                                        size={16}
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
                  </View>
                )}
              </View>
            )}

          {/* Nuôi cá bột - Fry Fish */}
          {(breedingDetail.status === BreedingStatus.FRY_FISH ||
            breedingDetail.status === BreedingStatus.CLASSIFICATION ||
            breedingDetail.status === BreedingStatus.COMPLETE) &&
            breedingDetail.fryFish && (
              <View className="mb-4">
                {breedingDetail.status === BreedingStatus.FRY_FISH ? (
                  <View className="flex-row items-center justify-between py-2">
                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={() => toggleSection('fryFish')}
                    >
                      <View
                        className="mr-3 h-3 w-3 rounded-full"
                        style={{ backgroundColor: '#10b981' }}
                      />
                      <Text className="text-base font-medium text-gray-900">
                        Nuôi cá bột
                      </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center">
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
                        className="mr-3 p-1"
                      >
                        <Edit size={18} color="#3b82f6" />
                      </TouchableOpacity>
                      {expandedSections.fryFish ? (
                        <ChevronDown size={20} color="#6b7280" />
                      ) : (
                        <ChevronRight size={20} color="#6b7280" />
                      )}
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="flex-row items-center justify-between py-2"
                    onPress={() => toggleSection('fryFish')}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="mr-3 h-3 w-3 rounded-full"
                        style={{ backgroundColor: '#10b981' }}
                      />
                      <Text className="text-base font-medium text-gray-900">
                        Nuôi cá bột
                      </Text>
                    </View>
                    {expandedSections.fryFish ? (
                      <ChevronDown size={20} color="#6b7280" />
                    ) : (
                      <ChevronRight size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                )}

                {expandedSections.fryFish && (
                  <View className="ml-6 mt-2 border-l border-gray-200 pl-3">
                    <View className="mb-3">
                      <Text className="mb-2 text-sm text-gray-600">
                        {formatDate(
                          breedingDetail.fryFish.startDate,
                          'dd/MM/yyyy'
                        )}{' '}
                        -{' '}
                        {breedingDetail.fryFish.endDate &&
                        breedingDetail.fryFish.endDate !== '0001-01-01T00:00:00'
                          ? formatDate(
                              breedingDetail.fryFish.endDate,
                              'dd/MM/yyyy'
                            )
                          : 'Đang nuôi'}
                      </Text>
                      <View className="mb-2 flex-row items-center justify-between">
                        <Text className="text-base font-medium text-gray-900">
                          Tỷ lệ sống theo thời gian
                        </Text>
                        {breedingDetail.status === BreedingStatus.FRY_FISH && (
                          <TouchableOpacity
                            onPress={() => setShowFrySurvivalRecordModal(true)}
                            className="flex-row items-center gap-1 rounded-full bg-blue-500 px-3 py-1"
                          >
                            <Text className="text-xs font-medium text-white">
                              + Bản ghi
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <Text className="text-sm text-gray-900">
                        Số lượng ban đầu:{' '}
                        {(
                          breedingDetail.fryFish.initialCount ?? 0
                        ).toLocaleString()}{' '}
                        con
                      </Text>
                      <Text className="text-sm text-gray-900">
                        Tỷ lệ sống hiện tại:{' '}
                        {(
                          breedingDetail.fryFish.currentSurvivalRate ?? 0
                        ).toFixed(1)}
                        %
                      </Text>
                      <Text className="text-sm text-gray-900">
                        Trạng thái:{' '}
                        {getFryFishStatusText(breedingDetail.fryFish.status)}
                      </Text>

                      {/* Survival Records */}
                      {breedingDetail.fryFish.frySurvivalRecords &&
                        breedingDetail.fryFish.frySurvivalRecords.length >
                          0 && (
                          <View className="mt-3">
                            <Text className="mb-2 text-sm font-medium text-gray-900">
                              Bản ghi theo dõi
                            </Text>
                            <View className="space-y-2">
                              <View className="flex-row items-center border-b border-gray-200 pb-2">
                                <Text className="flex-1 text-xs font-medium text-gray-600">
                                  Ngày
                                </Text>
                                <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                                  Còn sống
                                </Text>
                                <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                                  Tỷ lệ
                                </Text>
                                {breedingDetail.status ===
                                  BreedingStatus.FRY_FISH && (
                                  <Text className="w-16 text-center text-xs font-medium text-gray-600">
                                    Thao tác
                                  </Text>
                                )}
                              </View>
                              {breedingDetail.fryFish.frySurvivalRecords.map(
                                (record, index) => (
                                  <View
                                    key={record.id}
                                    className="flex-row items-center py-1"
                                  >
                                    <Text className="flex-1 text-sm text-gray-900">
                                      {formatDate(record.dayNumber, 'dd/MM')}
                                    </Text>
                                    <Text className="flex-1 text-center text-sm text-gray-900">
                                      {record.countAlive ?? 0}
                                    </Text>
                                    <Text className="flex-1 text-center text-sm text-gray-900">
                                      {(record.survivalRate ?? 0).toFixed(1)}%
                                    </Text>
                                    {index ===
                                      (breedingDetail.fryFish
                                        ?.frySurvivalRecords?.length ?? 0) -
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
                                          <Edit size={16} color="#3b82f6" />
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
                                            size={16}
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
                  </View>
                )}
              </View>
            )}

          {/* Tuyển chọn - Classification */}
          {(breedingDetail.status === BreedingStatus.CLASSIFICATION ||
            breedingDetail.status === BreedingStatus.COMPLETE) &&
            breedingDetail.classificationStage && (
              <View className="mb-4">
                {breedingDetail.status === BreedingStatus.CLASSIFICATION ? (
                  <View className="flex-row items-center justify-between py-2">
                    <TouchableOpacity
                      className="flex-row items-center"
                      onPress={() => toggleSection('classification')}
                    >
                      <View
                        className="mr-3 h-3 w-3 rounded-full"
                        style={{ backgroundColor: '#6366f1' }}
                      />
                      <Text className="text-base font-medium text-gray-900">
                        Tuyển chọn
                      </Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center">
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
                        className="mr-3 p-1"
                      >
                        <Edit size={18} color="#3b82f6" />
                      </TouchableOpacity>
                      {expandedSections.classification ? (
                        <ChevronDown size={20} color="#6b7280" />
                      ) : (
                        <ChevronRight size={20} color="#6b7280" />
                      )}
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    className="flex-row items-center justify-between py-2"
                    onPress={() => toggleSection('classification')}
                  >
                    <View className="flex-row items-center">
                      <View
                        className="mr-3 h-3 w-3 rounded-full"
                        style={{ backgroundColor: '#10b981' }}
                      />
                      <Text className="text-base font-medium text-gray-900">
                        Tuyển chọn
                      </Text>
                    </View>
                    {expandedSections.classification ? (
                      <ChevronDown size={20} color="#6b7280" />
                    ) : (
                      <ChevronRight size={20} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                )}

                {expandedSections.classification && (
                  <View className="ml-6 mt-2 border-l border-gray-200 pl-3">
                    <View className="mb-3">
                      <Text className="mb-2 text-sm text-gray-600">
                        {formatDate(
                          breedingDetail.classificationStage.startDate,
                          'dd/MM/yyyy'
                        )}{' '}
                        -{' '}
                        {getClassificationStatusText(
                          breedingDetail.classificationStage.status
                        )}
                      </Text>
                      <View className="mb-2 flex-row items-center justify-between">
                        <Text className="text-base font-medium text-gray-900">
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
                                className="flex-row items-center gap-1 rounded-full bg-blue-500 px-3 py-2"
                              >
                                <Plus size={18} color="#fff" />
                                <Text className="text-xs font-medium text-white">
                                  Bản ghi
                                </Text>
                              </TouchableOpacity>
                            )}
                          {breedingDetail.status ===
                            BreedingStatus.CLASSIFICATION &&
                            breedingDetail.classificationStage
                              .classificationRecords.length === 4 && (
                              <TouchableOpacity
                                onPress={() =>
                                  router.push(
                                    `/breeding/${breedingId}/fish-list?redirect=/breeding/${breedingId}`
                                  )
                                }
                                className="flex-row items-center gap-1 rounded-full bg-green-600 px-3 py-2"
                              >
                                <Text className="text-xs font-medium text-white">
                                  Danh sách cá
                                </Text>
                              </TouchableOpacity>
                            )}
                        </View>
                      </View>
                      <View className="flex-row items-center justify-between">
                        <Text className="text-sm text-gray-900">
                          Tổng số cá:{' '}
                          {(
                            breedingDetail.classificationStage.totalCount ?? 0
                          ).toLocaleString()}{' '}
                          con
                        </Text>
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
                          className="rounded-full bg-blue-500 px-3 py-2"
                        >
                          {hasPondPacket ? (
                            <View className="flex-row items-center">
                              <Edit size={16} color="#fff" />
                              <Text className="ml-2 text-xs font-medium text-white">
                                Sửa lô cá
                              </Text>
                            </View>
                          ) : (
                            <View className="flex-row items-center">
                              <Plus size={16} color="#fff" />
                              <Text className="ml-2 text-xs font-medium text-white">
                                Tạo lô cá
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>

                      {/* Classification Records Table */}
                      {breedingDetail.classificationStage
                        .classificationRecords &&
                        breedingDetail.classificationStage.classificationRecords
                          .length > 0 && (
                          <View className="mt-3">
                            <View className="mb-1 flex-row rounded bg-gray-50 p-2">
                              <Text className="w-12 text-center text-xs font-medium text-gray-600">
                                Lần
                              </Text>
                              <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                                Show
                              </Text>
                              <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                                High
                              </Text>
                              <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                                Pond
                              </Text>
                              <Text className="flex-1 text-center text-xs font-medium text-gray-600">
                                Cull
                              </Text>
                              {breedingDetail.status ===
                                BreedingStatus.CLASSIFICATION && (
                                <Text className="w-16 text-center text-xs font-medium text-gray-600">
                                  Thao tác
                                </Text>
                              )}
                            </View>

                            {breedingDetail.classificationStage.classificationRecords.map(
                              (record, idx) => (
                                <View
                                  key={record.id}
                                  className="flex-row items-center border-b border-gray-100 p-2"
                                >
                                  <Text className="w-12 text-center text-sm text-gray-900">
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
                                  {idx ===
                                    (breedingDetail.classificationStage
                                      ?.classificationRecords?.length ?? 0) -
                                      1 &&
                                  breedingDetail.status ===
                                    BreedingStatus.CLASSIFICATION ? (
                                    <View className="w-16 flex-row items-center justify-center gap-1">
                                      <TouchableOpacity
                                        onPress={() => {
                                          setEditingClassificationRecord(
                                            record
                                          );
                                          setEditingClassificationRecordIndex(
                                            idx
                                          );
                                          setShowEditClassificationModal(true);
                                        }}
                                        className="p-1"
                                      >
                                        <Edit size={16} color="#3b82f6" />
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
                                          'pending'
                                        }
                                      >
                                        <Trash2
                                          size={16}
                                          color={
                                            deleteClassificationMutation.status ===
                                            'pending'
                                              ? '#9ca3af'
                                              : '#ef4444'
                                          }
                                        />
                                      </TouchableOpacity>
                                    </View>
                                  ) : (
                                    breedingDetail.status ===
                                      BreedingStatus.CLASSIFICATION && (
                                      <View className="w-16" />
                                    )
                                  )}
                                </View>
                              )
                            )}

                            <View className="mt-3">
                              <Text className="mb-1 text-sm font-medium text-gray-900">
                                Tổng kết:
                              </Text>
                              <Text className="text-sm text-gray-900">
                                Show:{' '}
                                {breedingDetail.classificationStage
                                  .showQualifiedCount ?? 0}{' '}
                                con
                              </Text>
                              <Text className="text-sm text-gray-900">
                                High:{' '}
                                {breedingDetail.classificationStage
                                  .highQualifiedCount ?? 0}{' '}
                                con
                              </Text>
                              <Text className="text-sm text-gray-900">
                                Pond:{' '}
                                {breedingDetail.classificationStage
                                  .pondQualifiedCount ?? 0}{' '}
                                con
                              </Text>
                              <Text className="text-sm text-gray-900">
                                Cull:{' '}
                                {breedingDetail.classificationStage
                                  .cullQualifiedCount ?? 0}{' '}
                                con
                              </Text>
                              {breedingDetail.classificationStage.notes && (
                                <Text className="mt-2 text-sm italic text-gray-500">
                                  Ghi chú:{' '}
                                  {breedingDetail.classificationStage.notes}
                                </Text>
                              )}
                            </View>
                          </View>
                        )}
                    </View>
                  </View>
                )}
              </View>
            )}

          {/* Hoàn thành - Complete */}
          {breedingDetail.status === BreedingStatus.COMPLETE && (
            <View className="mb-4">
              <TouchableOpacity
                className="flex-row items-center justify-between py-2"
                onPress={() => toggleSection('complete')}
              >
                <View className="flex-row items-center">
                  <View className="mr-3 h-3 w-3 rounded-full bg-green-500" />
                  <Text className="text-base font-medium text-gray-900">
                    Hoàn thành
                  </Text>
                </View>
                {expandedSections.complete ? (
                  <ChevronDown size={20} color="#6b7280" />
                ) : (
                  <ChevronRight size={20} color="#6b7280" />
                )}
              </TouchableOpacity>

              {expandedSections.complete && (
                <View className="ml-6 mt-2 border-l border-gray-200 pl-3">
                  <Text className="mb-2 text-sm text-gray-600">
                    {breedingDetail.endDate
                      ? formatDate(breedingDetail.endDate, 'dd/MM/yyyy')
                      : 'N/A'}
                  </Text>
                  <View className="mb-2 flex-row items-center justify-between">
                    <Text className="text-base font-medium text-gray-900">
                      Kết quả tổng quan
                    </Text>
                    <View className="flex-row items-center gap-2">
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
                        className="rounded-full bg-blue-500 px-3 py-2"
                      >
                        {hasPondPacket ? (
                          <View className="flex-row items-center">
                            <Edit size={16} color="#fff" className="mr-2" />
                            <Text className="text-xs font-medium text-white">
                              Sửa lô cá
                            </Text>
                          </View>
                        ) : (
                          <View className="flex-row items-center">
                            <Plus size={16} color="#fff" className="mr-2" />
                            <Text className="text-xs font-medium text-white">
                              Tạo lô cá
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          router.push(
                            `/breeding/${breedingId}/fish-list?redirect=/breeding/${breedingId}`
                          )
                        }
                        className="flex-row items-center gap-1 rounded-full bg-green-600 px-3 py-2"
                      >
                        <Text className="text-xs font-medium text-white">
                          Danh sách cá
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text className="text-sm text-gray-900">
                    Tổng số cá đạt chuẩn:{' '}
                    {(breedingDetail.totalFishQualified ?? 0).toLocaleString()}{' '}
                    con
                  </Text>
                  <Text className="text-sm text-gray-900">
                    Số lô cá:{' '}
                    {(breedingDetail.totalPackage ?? 0).toLocaleString()} lô
                  </Text>
                  <Text className="text-sm text-gray-900">
                    Tỷ lệ thụ tinh:{' '}
                    {(breedingDetail.fertilizationRate ?? 0).toFixed(1)}%
                  </Text>
                  {breedingDetail.currentSurvivalRate != null && (
                    <Text className="text-sm text-gray-900">
                      Tỷ lệ sống cuối:{' '}
                      {breedingDetail.currentSurvivalRate.toFixed(2)}%
                    </Text>
                  )}
                  {breedingDetail.note && (
                    <Text className="mt-2 text-sm italic text-gray-500">
                      Ghi chú: {breedingDetail.note}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Packet Fish Modal */}
      <CreatePacketFishModal
        visible={showCreatePacketModal}
        onClose={() => {
          setShowCreatePacketModal(false);
        }}
        breedingId={breedingId}
        ponds={pondOptions}
        currentPondId={breedingDetail.pondId}
        packetFishId={editPacketFishId ?? undefined}
        onSuccess={() => breedingDetailQuery.refetch()}
      />

      {/* Update Egg Batch Modal */}
      <UpdateEggBatchModal
        visible={showUpdateEggModal}
        onClose={() => {
          setShowUpdateEggModal(false);
          breedingDetailQuery.refetch();
        }}
        breedingId={breedingId}
        emptyPonds={emptyPondPage?.data ?? []}
        onRefetchPonds={refetchEmptyPonds}
      />

      {/* Count Egg Modal */}
      <CountEggModal
        visible={showCountEggModal}
        onClose={() => {
          setShowCountEggModal(false);
          breedingDetailQuery.refetch();
        }}
        breedingId={breedingId}
        emptyPonds={emptyPondPage?.data ?? []}
        onRefetchPonds={refetchEmptyPonds}
        allPonds={
          breedingDetail.status === BreedingStatus.EGG_BATCH
            ? (() => {
                const emptyPonds = emptyPondPage?.data ?? [];
                if (breedingDetail.batch) {
                  const currentPondId = breedingDetail.pondId;
                  const currentPondExists = emptyPonds.some(
                    (p) => p.id === currentPondId
                  );

                  if (!currentPondExists) {
                    return [
                      {
                        id: currentPondId,
                        pondName: breedingDetail.pondName,
                        status: PondStatus.EMPTY,
                      } as any,
                      ...emptyPonds,
                    ];
                  }
                }
                return emptyPonds;
              })()
            : undefined
        }
        onRefetchAllPonds={refetchEmptyPonds}
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

      {/* Edit Incubation Record Modal */}
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

      {/* Change Pond Modal for Fry Fish */}
      <ChangePondModal
        visible={showChangePondModal}
        onClose={() => {
          setShowChangePondModal(false);
          breedingDetailQuery.refetch();
        }}
        currentPondId={breedingDetail.pondId}
        currentPondName={breedingDetail.pondName}
        allPonds={(() => {
          const emptyPonds = emptyPondPage?.data ?? [];
          const currentPondId = breedingDetail.pondId;
          const currentPondExists = emptyPonds.some(
            (p) => p.id === currentPondId
          );

          if (!currentPondExists) {
            return [
              {
                id: currentPondId,
                pondName: breedingDetail.pondName,
                status: PondStatus.EMPTY,
              } as any,
              ...emptyPonds,
            ];
          }
          return emptyPonds;
        })()}
        onRefetchPonds={refetchEmptyPonds}
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

      {/* Fry Survival Record Modal */}
      <FrySurvivalRecordModal
        visible={showFrySurvivalRecordModal}
        onClose={() => {
          setShowFrySurvivalRecordModal(false);
          breedingDetailQuery.refetch();
        }}
        breedingId={breedingId}
        emptyPonds={emptyPondPage?.data ?? []}
        onRefetchPonds={refetchEmptyPonds}
      />

      {/* Edit Fry Survival Record Modal */}
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

      {/* Edit Classification Record Modal */}
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

      {/* Selection Modal for New Classification Record */}
      <SelectionModal
        visible={showSelectionModal}
        onClose={() => {
          setShowSelectionModal(false);
          breedingDetailQuery.refetch();
        }}
        breedingId={breedingDetail?.id ?? null}
      />

      {/* Change Pond Modal for Classification */}
      <ChangePondModal
        visible={showChangePondModalClassification}
        onClose={() => {
          setShowChangePondModalClassification(false);
          breedingDetailQuery.refetch();
        }}
        currentPondId={breedingDetail.pondId}
        currentPondName={breedingDetail.pondName}
        allPonds={(() => {
          const emptyPonds = emptyPondPage?.data ?? [];
          const currentPondId = breedingDetail.pondId;
          const currentPondExists = emptyPonds.some(
            (p) => p.id === currentPondId
          );

          if (!currentPondExists) {
            return [
              {
                id: currentPondId,
                pondName: breedingDetail.pondName,
                status: PondStatus.EMPTY,
              } as any,
              ...emptyPonds,
            ];
          }
          return emptyPonds;
        })()}
        onRefetchPonds={refetchEmptyPonds}
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

      {/* Custom Alert for Delete Confirmation */}
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

            // Close alert and refetch data
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
