import ClassificationStageSection from '@/components/breeding/ClassificationStageSection';
import { CountEggModal } from '@/components/breeding/CountEggModal';
import { CreatePacketFishModal } from '@/components/breeding/CreatePacketFishModal';
import FryFishInfo from '@/components/breeding/FryFishInfo';
import FryFishSummary from '@/components/breeding/FryFishSummary';
import { FrySurvivalRecordModal } from '@/components/breeding/FrySurvivalRecordModal';
import IncubationSummary from '@/components/breeding/IncubationSummary';
import { SelectionModal } from '@/components/breeding/SelectionModal';
import { UpdateEggBatchModal } from '@/components/breeding/UpdateEggBatchModal';
import ContextMenuField from '@/components/ContextMenuField';
import { CustomAlert } from '@/components/CustomAlert';
import FishSvg from '@/components/icons/FishSvg';
import Loading from '@/components/Loading';
import {
  useGetBreedingProcesses,
  useMarkBreedingProcessAsSpawned,
} from '@/hooks/useBreedingProcess';
import { useGetPonds } from '@/hooks/usePond';
import type { BreedingProcess } from '@/lib/api/services/fetchBreedingProcess';
import {
  BreedingProcessSearchParams,
  BreedingResult,
  BreedingStatus,
} from '@/lib/api/services/fetchBreedingProcess';
import { PondStatus } from '@/lib/api/services/fetchPond';
import { TypeOfPond } from '@/lib/api/services/fetchPondType';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Check,
  Egg,
  Eye,
  Filter,
  Fish,
  Mars,
  RefreshCcw,
  Search,
  Venus,
  X,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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

export default function BreedingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Modal states
  const [showCountModal, setShowCountModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showFryUpdateModal, setShowFryUpdateModal] = useState(false);
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [showCreatePacketModal, setShowCreatePacketModal] = useState(false);

  const [editPacketFishId, setEditPacketFishId] = useState<number | null>(null);
  const [currentBreedingId, setCurrentBreedingId] = useState<number | null>(
    null
  );
  const [editPondId, setEditPondId] = useState<number | null>(null);

  // Custom alert state
  const [customAlertVisible, setCustomAlertVisible] = useState(false);
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertMessage, setCustomAlertMessage] = useState('');
  const [customAlertType, setCustomAlertType] = useState<
    'danger' | 'warning' | 'info'
  >('danger');
  const [customAlertOnConfirm, setCustomAlertOnConfirm] = useState<
    (() => void) | null
  >(null);

  const showCustomAlert = (opts: {
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm?: () => void;
  }) => {
    setCustomAlertTitle(opts.title);
    setCustomAlertMessage(opts.message);
    setCustomAlertType(opts.type ?? 'danger');
    setCustomAlertOnConfirm(
      () => opts.onConfirm ?? (() => setCustomAlertVisible(false))
    );
    setCustomAlertVisible(true);
  };

  // Filter modal and filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Modal filter states
  const [modalPondId, setModalPondId] = useState<number | undefined>(undefined);
  const [modalPondLabel, setModalPondLabel] = useState('');
  const [modalStatus, setModalStatus] = useState<BreedingStatus | undefined>(
    undefined
  );
  const [modalResult, setModalResult] = useState<BreedingResult | undefined>(
    undefined
  );

  const [appliedFilters, setAppliedFilters] = useState<
    BreedingProcessSearchParams | undefined
  >(undefined);

  const breedingQueryFilters: BreedingProcessSearchParams = appliedFilters
    ? { ...appliedFilters }
    : {};
  breedingQueryFilters.pageIndex = 1;
  breedingQueryFilters.pageSize = 30;

  const {
    data: breedingPages,
    isLoading: breedingLoading,
    refetch: refetchBreeding,
    isRefetching: breedingRefetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetBreedingProcesses(breedingQueryFilters, true);

  const {
    data: pondPage,
    isLoading: pondLoading,
    refetch: refetchPonds,
  } = useGetPonds({ pageIndex: 1, pageSize: 200 }, true);

  const pondOptions = (pondPage?.data ?? []).filter(
    (p) =>
      p.pondStatus === PondStatus.EMPTY || p.pondStatus === PondStatus.ACTIVE
  );

  useFocusEffect(
    useCallback(() => {
      refetchBreeding();
    }, [refetchBreeding])
  );

  const markAsSpawned = useMarkBreedingProcessAsSpawned();
  const [markingSpawnedId, setMarkingSpawnedId] = useState<number | null>(null);

  const mapStatus = (status?: BreedingStatus | string) => {
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
      case BreedingStatus.FAILED:
        return 'Hủy ghép cặp';
      case BreedingStatus.COMPLETE:
        return 'Hoàn thành';
      default:
        const s = String(status ?? '');
        if (/pairing/i.test(s)) return 'Đang ghép cặp';
        if (/spawned/i.test(s)) return 'Đã đẻ';
        if (/egg/i.test(s)) return 'Ấp trứng';
        if (/fry/i.test(s)) return 'Nuôi cá bột';
        if (/classification/i.test(s)) return 'Tuyển chọn';
        if (/failed/i.test(s)) return 'Hủy ghép cặp';
        if (/complete/i.test(s)) return 'Hoàn thành';
        return s;
    }
  };

  const statusToLabel = (status: BreedingStatus) => {
    return mapStatus(status);
  };

  const resultToLabel = (result: BreedingResult) => {
    switch (result) {
      case BreedingResult.SUCCESS:
        return 'Thành công';
      case BreedingResult.FAILED:
        return 'Thất bại';
      case BreedingResult.PARTIAL_SUCCESS:
        return 'Một phần thành công';
      default:
        return 'Chưa rõ';
    }
  };

  const breedingListToRender: BreedingProcess[] =
    (breedingPages?.pages?.flatMap(
      (p) => (p?.data as BreedingProcess[]) || []
    ) ?? []) as BreedingProcess[];

  const totalBreeding = breedingPages?.pages[0]?.totalItems || 0;

  const getStatusColor = (status?: BreedingStatus | string) => {
    switch (status) {
      case BreedingStatus.PAIRING:
        return '#3b82f6';
      case BreedingStatus.SPAWNED:
        return '#f59e0b';
      case BreedingStatus.EGG_BATCH:
        return '#fb923c';
      case BreedingStatus.FRY_FISH:
        return '#10b981';
      case BreedingStatus.CLASSIFICATION:
        return '#6366f1';
      case BreedingStatus.FAILED:
        return '#ef4444';
      case BreedingStatus.COMPLETE:
        return '#06b6d4';
      default: {
        const s = String(status ?? '');
        if (/pairing/i.test(s)) return '#3b82f6';
        if (/spawned|đã đẻ/i.test(s)) return '#f59e0b';
        if (/egg|Ấp trứng/i.test(s)) return '#fb923c';
        if (/fry|bột/i.test(s)) return '#10b981';
        if (/classification|tuyển/i.test(s)) return '#6366f1';
        if (/failed|hủy/i.test(s)) return '#ef4444';
        if (/complete|hoàn/i.test(s)) return '#06b6d4';
        return '#6b7280';
      }
    }
  };

  const mapResult = (r?: BreedingResult | string) => {
    const s = String(r ?? 'Unknown');
    switch (s) {
      case BreedingResult.SUCCESS:
        return 'Thành công';
      case BreedingResult.FAILED:
        return 'Thất bại';
      case BreedingResult.PARTIAL_SUCCESS:
        return 'Một phần thành công';
      default:
        return 'Chưa rõ';
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const daysSince = (iso?: string) => {
    if (!iso) return 0;
    const start = new Date(iso);
    if (isNaN(start.getTime())) return 0;
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const resetModalFilters = () => {
    setModalPondId(undefined);
    setModalPondLabel('');
    setModalStatus(undefined);
    setModalResult(undefined);
  };

  const activeFiltersCount = Object.values(appliedFilters || {}).filter(
    (v) => v !== undefined
  ).length;

  const statusOptions = [
    BreedingStatus.PAIRING,
    BreedingStatus.SPAWNED,
    BreedingStatus.EGG_BATCH,
    BreedingStatus.FRY_FISH,
    BreedingStatus.CLASSIFICATION,
    BreedingStatus.COMPLETE,
    BreedingStatus.FAILED,
  ];

  const resultOptions = [
    BreedingResult.SUCCESS,
    BreedingResult.FAILED,
    BreedingResult.PARTIAL_SUCCESS,
  ];

  return (
    <>
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="rounded-t-2xl bg-primary pb-6">
          <View className="px-4 pt-2">
            <View className="mb-4 mt-2">
              <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
                Quản lý
              </Text>
              <Text className="text-2xl font-bold text-white">Sinh sản</Text>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center rounded-2xl bg-white px-4 shadow-sm">
              <Search size={20} color="#9ca3af" />
              <TextInput
                placeholder="Tìm kiếm quy trình..."
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={() => {
                  setAppliedFilters((prev) => ({
                    ...(prev || {}),
                    search: searchText,
                  }));
                  refetchBreeding();
                }}
                className="flex-1 py-3 pl-3 text-base text-gray-900"
                placeholderTextColor="#9ca3af"
              />
              {searchText.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setSearchText('');
                    setAppliedFilters((prev) => {
                      if (!prev) return prev;
                      const copy = { ...prev };
                      delete copy.search;
                      return Object.keys(copy).length ? copy : undefined;
                    });
                    refetchBreeding();
                  }}
                  className="p-1"
                >
                  <X size={18} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Filter Bar */}
        <View className="flex-row items-center justify-between bg-white px-4 py-3 shadow-sm">
          <Text className="text-sm font-medium text-gray-700">
            {totalBreeding} quy trình
          </Text>
          <TouchableOpacity
            className="flex-row items-center rounded-full bg-gray-100 px-4 py-2"
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={16} color="#6b7280" />
            <Text className="ml-2 text-sm font-medium text-gray-700">
              Bộ lọc
            </Text>
            {activeFiltersCount > 0 && (
              <View className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                <Text className="text-xs font-bold text-white">
                  {activeFiltersCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={breedingListToRender}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 30,
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={() => {
            const hasActiveFilters = activeFiltersCount > 0 || searchText;
            return (
              <>
                {breedingLoading ? (
                  <View className="h-[50vh] w-full items-center justify-center">
                    <Loading />
                  </View>
                ) : (
                  <View className="items-center rounded-2xl bg-white p-8 shadow-sm">
                    <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                      <FishSvg size={40} color="#3b82f6" />
                    </View>
                    {hasActiveFilters ? (
                      <>
                        <Text className="mb-2 text-lg font-semibold text-gray-900">
                          Không tìm thấy kết quả
                        </Text>
                        <Text className="mb-6 text-center text-sm text-gray-600">
                          Không có quy trình nào phù hợp với bộ lọc hiện tại
                        </Text>
                        <View className="flex-row">
                          <TouchableOpacity
                            onPress={() => {
                              setAppliedFilters(undefined);
                              setSearchText('');
                              resetModalFilters();
                            }}
                            className="mr-2 rounded-2xl bg-gray-100 px-6 py-3"
                          >
                            <Text className="font-semibold text-gray-900">
                              Xóa bộ lọc
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="rounded-2xl bg-primary px-6 py-3"
                            onPress={() => setShowFilterModal(true)}
                          >
                            <Text className="font-semibold text-white">
                              Điều chỉnh
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </>
                    ) : (
                      <>
                        <Text className="mb-2 text-lg font-semibold text-gray-900">
                          Chưa có quy trình sinh sản
                        </Text>
                        <Text className="mb-6 text-center text-sm text-gray-600">
                          Các quy trình sinh sản sẽ được hiển thị ở đây
                        </Text>
                      </>
                    )}
                  </View>
                )}
              </>
            );
          }}
          renderItem={({ item: b }) => {
            const statusLabel = mapStatus(b.status ?? '');
            const color = getStatusColor(b.status ?? statusLabel);
            const badgeBg = color + '20';

            const maleFish = b.maleKoiVariety ?? '—';
            const femaleFish = b.femaleKoiVariety ?? '—';
            const pond = b.pondName ?? '—';
            const eggCount = b.koiFishes?.length ?? 0;

            return (
              <View
                key={b.id}
                className="mb-4 overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <View className="p-4">
                  {/* Header */}
                  <View className="mb-3 flex-row items-center justify-between">
                    <Text className="text-lg font-bold text-gray-900">
                      {b.code !== '' ? `#${b.code}` : `Quy trình #${b.id}`}
                    </Text>
                    <View
                      className="rounded-full px-3 py-1"
                      style={{ backgroundColor: badgeBg }}
                    >
                      <Text className="text-sm font-semibold" style={{ color }}>
                        {statusLabel}
                      </Text>
                    </View>
                  </View>

                  {/* Common info */}
                  <View className="mb-3 rounded-2xl bg-gray-50 p-3">
                    <View className="mb-2 flex-row items-center">
                      <Mars size={16} color="#3b82f6" />
                      <Text className="ml-1 text-base font-medium text-gray-900">
                        {maleFish}
                      </Text>
                      <Text className="mx-2 text-sm text-gray-500">
                        <X size={16} />
                      </Text>
                      <Venus size={16} color="#ec4899" />
                      <Text className="ml-1 text-base font-medium text-gray-900">
                        {femaleFish}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <View className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                      <Text className="text-base text-gray-600">
                        Hồ: {pond}
                      </Text>
                    </View>
                    <View className="mt-1 flex-row items-center">
                      <Text className="text-base text-gray-600">
                        Bắt đầu: {formatDate(b.startDate)}
                      </Text>
                      <Text className="mx-1 text-base text-gray-400">•</Text>
                      <Text className="text-base text-gray-600">
                        {daysSince(b.startDate)} ngày
                      </Text>
                    </View>
                  </View>

                  {/* Status-specific content */}
                  {statusLabel === 'Đang ghép cặp' && (
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        className={`flex-1 flex-row items-center justify-center rounded-2xl py-3 ${
                          markingSpawnedId === b.id
                            ? 'bg-green-500 opacity-60'
                            : 'bg-green-600'
                        }`}
                        onPress={async () => {
                          if (!b.id) return;
                          setMarkingSpawnedId(b.id);
                          try {
                            await markAsSpawned.mutateAsync(b.id);
                            refetchBreeding();
                          } catch (err: any) {
                            showCustomAlert({
                              title: 'Lỗi',
                              message:
                                err?.message ?? 'Không thể cập nhật trạng thái',
                              type: 'danger',
                              onConfirm: () => setCustomAlertVisible(false),
                            });
                          } finally {
                            setMarkingSpawnedId(null);
                          }
                        }}
                        disabled={markingSpawnedId === b.id}
                      >
                        {markingSpawnedId === b.id ? (
                          <View className="flex-row items-center">
                            <ActivityIndicator size="small" color="#fff" />
                            <Text className="ml-2 font-semibold text-white">
                              Đang cập nhật...
                            </Text>
                          </View>
                        ) : (
                          <View className="flex-row items-center">
                            <Check size={18} color="white" />
                            <Text className="ml-2 font-semibold text-white">
                              Đã đẻ trứng
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="h-12 w-12 items-center justify-center rounded-2xl border border-gray-200"
                        onPress={() => router.push(`/breeding/${b.id}`)}
                      >
                        <Eye size={18} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {statusLabel === 'Đã đẻ' && (
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-2xl bg-orange-500 py-3"
                        onPress={() => {
                          setCurrentBreedingId(b.id ?? null);
                          setShowCountModal(true);
                        }}
                      >
                        <Egg size={16} color="white" />
                        <Text className="ml-2 font-semibold text-white">
                          Đếm trứng
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="h-12 w-12 items-center justify-center rounded-2xl border border-gray-200"
                        onPress={() => router.push(`/breeding/${b.id}`)}
                      >
                        <Eye size={18} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {statusLabel === 'Ấp trứng' && (
                    <View>
                      <View className="mb-3 rounded-2xl bg-orange-50 p-3">
                        <View className="flex-row justify-between">
                          <View className="items-center">
                            <Text className="text-xs text-gray-600">
                              Tổng số trứng
                            </Text>
                            <Text className="text-lg font-bold text-orange-600">
                              {b.totalEggs ?? 0}
                            </Text>
                          </View>
                          <View className="items-center">
                            <Text className="text-xs text-gray-600">
                              Tỷ lệ thụ tinh
                            </Text>
                            <Text className="text-lg font-bold text-orange-600">
                              {b.fertilizationRate
                                ? `${b.fertilizationRate.toFixed(1)}%`
                                : '0%'}
                            </Text>
                          </View>
                          <View className="items-center">
                            <Text className="text-xs text-gray-600">
                              Số ngày ấp
                            </Text>
                            <Text className="text-lg font-bold text-orange-600">
                              {daysSince(b.startDate)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <IncubationSummary breedingProcessId={b.id} />

                      <View className="mt-3 flex-row gap-2">
                        <TouchableOpacity
                          className="flex-1 flex-row items-center justify-center rounded-2xl bg-green-600 py-3"
                          onPress={() => {
                            setCurrentBreedingId(b.id ?? null);
                            setShowTransferModal(true);
                          }}
                        >
                          <Egg size={16} color="white" />
                          <Text className="ml-2 font-semibold text-white">
                            Cập nhật trứng
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="h-12 w-12 items-center justify-center rounded-2xl border border-gray-200"
                          onPress={() => router.push(`/breeding/${b.id}`)}
                        >
                          <Eye size={18} color="#6b7280" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {statusLabel === 'Nuôi cá bột' && (
                    <View>
                      <FryFishInfo
                        breedingProcessId={b.id}
                        startDate={b.startDate}
                      />
                      <FryFishSummary breedingProcessId={b.id} />

                      <View className="mt-3 flex-row gap-2">
                        <TouchableOpacity
                          className="flex-1 flex-row items-center justify-center rounded-2xl bg-purple-600 py-3"
                          onPress={() => {
                            setCurrentBreedingId(b.id ?? null);
                            setShowFryUpdateModal(true);
                          }}
                        >
                          <Fish size={16} color="white" />
                          <Text className="ml-2 font-semibold text-white">
                            Cập nhật cá bột
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          className="h-12 w-12 items-center justify-center rounded-2xl border border-gray-200"
                          onPress={() => router.push(`/breeding/${b.id}`)}
                        >
                          <Eye size={18} color="#6b7280" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {statusLabel === 'Tuyển chọn' && (
                    <View>
                      <ClassificationStageSection
                        breedingProcessId={b.id}
                        onStartSelection={() => {
                          setCurrentBreedingId(b.id);
                          setShowSelectionModal(true);
                        }}
                        onCreatePacket={() => {
                          setCurrentBreedingId(b.id);
                          setEditPacketFishId(null);
                          setEditPondId(null);
                          setShowCreatePacketModal(true);
                        }}
                        onEditPacket={(
                          breedingProcessId: number,
                          packetFishId: number,
                          pondId: number
                        ) => {
                          setCurrentBreedingId(breedingProcessId);
                          setEditPacketFishId(packetFishId ?? null);
                          setEditPondId(pondId);
                          setShowCreatePacketModal(true);
                        }}
                      />
                    </View>
                  )}

                  {statusLabel === 'Hoàn thành' && (
                    <View>
                      <View className="mb-3 rounded-2xl bg-green-50 p-3">
                        <View className="mb-2 flex-row items-center justify-between">
                          <Text className="text-lg font-semibold text-gray-600">
                            Kết quả
                          </Text>
                          <Text className="font-semibold text-green-700">
                            {mapResult(b.result)}
                          </Text>
                        </View>
                        <View className="mb-2 flex-row items-center justify-between">
                          <Text className="text-lg font-semibold text-gray-600">
                            Cá đạt chuẩn
                          </Text>
                          <Text className="font-semibold text-gray-900">
                            {b.totalFishQualified || 0} con
                          </Text>
                        </View>
                        <View className="mb-2 flex-row items-center justify-between">
                          <Text className="text-lg font-semibold text-gray-600">
                            Số gói
                          </Text>
                          <Text className="font-semibold text-gray-900">
                            {b.totalPackage || 0}
                          </Text>
                        </View>
                        {b.endDate && (
                          <View className="flex-row items-center justify-between">
                            <Text className="text-lg font-semibold text-gray-600">
                              Hoàn thành
                            </Text>
                            <Text className="font-semibold text-gray-900">
                              {formatDate(b.endDate)}
                            </Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        className="flex-row items-center justify-center rounded-2xl border border-gray-200 py-3"
                        onPress={() => router.push(`/breeding/${b.id}`)}
                      >
                        <Eye size={18} color="#6b7280" />
                        <Text className="ml-2 font-medium text-gray-700">
                          Chi tiết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {statusLabel === 'Hủy ghép cặp' && (
                    <View>
                      <View className="mb-3 rounded-2xl bg-red-50 p-3">
                        <View className="mb-2 flex-row items-center justify-between">
                          <Text className="text-lg font-semibold text-gray-600">
                            Kết quả
                          </Text>
                          <Text className="font-semibold text-red-700">
                            {mapResult(b.result)}
                          </Text>
                        </View>
                        <View className="flex-row items-center justify-between">
                          <Text className="text-lg font-semibold text-gray-600">
                            Số cá
                          </Text>
                          <Text className="font-semibold text-gray-900">
                            {eggCount} con
                          </Text>
                        </View>
                        {b.note && (
                          <View className="mt-2">
                            <Text className="text-base font-semibold italic text-gray-500">
                              Ghi chú: {b.note}
                            </Text>
                          </View>
                        )}
                      </View>

                      <TouchableOpacity
                        className="flex-row items-center justify-center rounded-2xl border border-gray-200 py-3"
                        onPress={() => router.push(`/breeding/${b.id}`)}
                      >
                        <Eye size={16} color="#6b7280" />
                        <Text className="ml-2 font-medium text-gray-700">
                          Chi tiết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            );
          }}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!isFetchingNextPage && hasNextPage) {
              fetchNextPage();
            }
          }}
          refreshing={!!breedingRefetching}
          onRefresh={() => refetchBreeding()}
          ListFooterComponent={() =>
            isFetchingNextPage ? (
              <View className="items-center py-4">
                <ActivityIndicator size="small" color="#3b82f6" />
                <Text className="mt-2 text-sm text-gray-500">
                  Đang tải thêm...
                </Text>
              </View>
            ) : !hasNextPage && breedingListToRender.length > 0 ? (
              <View className="pb-16">
                <Text className="text-center text-sm text-gray-500">
                  Đã hiển thị tất cả {totalBreeding} quy trình
                </Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="rounded-t-2xl bg-primary pb-4">
            <View className="flex-row items-center justify-between px-4 pt-2">
              <View className="mt-2 flex-1 items-center">
                <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
                  Tùy chỉnh
                </Text>
                <Text className="text-xl font-bold text-white">Bộ lọc</Text>
              </View>

              <TouchableOpacity
                className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
                onPress={() => setShowFilterModal(false)}
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: 20,
              paddingBottom: 100,
            }}
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-4">
              <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                Lọc theo tiêu chí
              </Text>

              <View className="rounded-2xl border border-gray-200 bg-white p-4">
                {/* Pond Filter */}
                <View className="mb-4 flex-row items-start">
                  <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                    <FishSvg size={22} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    {pondLoading ? (
                      <View className="rounded-2xl border border-gray-200 p-3">
                        <Text className="text-sm text-gray-600">
                          Đang tải hồ...
                        </Text>
                      </View>
                    ) : (
                      <ContextMenuField
                        label="Hồ"
                        value={modalPondLabel}
                        placeholder="Chọn hồ"
                        options={pondOptions.map((p) => ({
                          label: `${p.id}: ${p.pondName ?? p.id}`,
                          value: String(p.id),
                        }))}
                        onSelect={(val) => {
                          setModalPondId(Number(val));
                          const selected = pondOptions.find(
                            (p) => p.id === Number(val)
                          );
                          setModalPondLabel(
                            selected
                              ? `${selected.id}: ${selected.pondName}`
                              : ''
                          );
                        }}
                        onPress={() => refetchPonds()}
                      />
                    )}
                    {modalPondId && (
                      <TouchableOpacity
                        onPress={() => {
                          setModalPondId(undefined);
                          setModalPondLabel('');
                        }}
                        className="mt-2"
                      >
                        <Text className="text-sm font-medium text-blue-500">
                          Xóa lựa chọn
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Status Filter */}
                <View className="mb-4 flex-row items-start">
                  <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-green-100">
                    <Egg size={18} color="#22c55e" />
                  </View>
                  <View className="flex-1">
                    <ContextMenuField
                      label="Trạng thái"
                      value={modalStatus || ''}
                      placeholder="Chọn trạng thái"
                      options={statusOptions.map((s) => ({
                        label: statusToLabel(s),
                        value: s,
                      }))}
                      onSelect={(val) => setModalStatus(val as BreedingStatus)}
                    />
                    {modalStatus && (
                      <TouchableOpacity
                        onPress={() => setModalStatus(undefined)}
                        className="mt-2"
                      >
                        <Text className="text-sm font-medium text-blue-500">
                          Xóa lựa chọn
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Result Filter */}
                <View className="flex-row items-start">
                  <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                    <Filter size={18} color="#a855f7" />
                  </View>
                  <View className="flex-1">
                    <ContextMenuField
                      label="Kết quả"
                      value={modalResult || ''}
                      placeholder="Chọn kết quả"
                      options={resultOptions.map((r) => ({
                        label: resultToLabel(r),
                        value: r,
                      }))}
                      onSelect={(val) => setModalResult(val as BreedingResult)}
                    />
                    {modalResult && (
                      <TouchableOpacity
                        onPress={() => setModalResult(undefined)}
                        className="mt-2"
                      >
                        <Text className="text-sm font-medium text-blue-500">
                          Xóa lựa chọn
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Fixed Bottom Actions */}
          <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-4 py-4">
            <View className="flex-row">
              <TouchableOpacity
                className="mr-2 flex-1 flex-row items-center justify-center rounded-2xl bg-gray-100 py-4"
                onPress={() => {
                  resetModalFilters();
                  setAppliedFilters(undefined);
                  setSearchText('');
                  refetchBreeding();
                }}
              >
                <RefreshCcw size={18} color="#6b7280" />
                <Text className="ml-2 text-base font-semibold text-gray-700">
                  Đặt lại
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="ml-2 flex-1 flex-row items-center justify-center rounded-2xl bg-primary py-4"
                onPress={() => {
                  const f: BreedingProcessSearchParams = {};
                  if (searchText) f.search = searchText;
                  if (modalPondId) f.pondId = modalPondId;
                  if (modalStatus) f.status = modalStatus;
                  if (modalResult) f.result = modalResult;

                  setAppliedFilters(Object.keys(f).length ? f : undefined);
                  setShowFilterModal(false);
                  refetchBreeding();
                }}
              >
                <Filter size={18} color="white" />
                <Text className="ml-2 text-base font-semibold text-white">
                  Áp dụng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Count Egg Modals */}
      <CountEggModal
        visible={showCountModal}
        onClose={() => {
          setShowCountModal(false);
          setCurrentBreedingId(null);
        }}
        breedingId={currentBreedingId}
        pondTypeEnum={TypeOfPond.EGG_BATCH}
      />

      {/* Update Egg Batch Modals */}
      <UpdateEggBatchModal
        visible={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setCurrentBreedingId(null);
        }}
        breedingId={currentBreedingId}
        pondTypeEnum={TypeOfPond.FRY_FISH}
      />

      {/* Fry Survival Record Modals */}
      <FrySurvivalRecordModal
        visible={showFryUpdateModal}
        onClose={() => {
          setShowFryUpdateModal(false);
          setCurrentBreedingId(null);
        }}
        breedingId={currentBreedingId}
        pondTypeEnum={TypeOfPond.CLASSIFICATION}
      />

      {/* Selection Modals */}
      <SelectionModal
        visible={showSelectionModal}
        onClose={() => {
          setShowSelectionModal(false);
          setCurrentBreedingId(null);
        }}
        breedingId={currentBreedingId}
      />

      <CreatePacketFishModal
        visible={showCreatePacketModal}
        onClose={() => {
          setShowCreatePacketModal(false);
          setEditPondId(null);
        }}
        breedingId={currentBreedingId ?? 0}
        currentPondId={
          editPondId ??
          breedingListToRender.find((x) => x.id === currentBreedingId)
            ?.pondId ??
          undefined
        }
        packetFishId={editPacketFishId ?? undefined}
        onSuccess={() => refetchBreeding()}
      />

      <CustomAlert
        visible={customAlertVisible}
        title={customAlertTitle}
        message={customAlertMessage}
        type={customAlertType}
        cancelText="Đóng"
        confirmText="OK"
        onCancel={() => setCustomAlertVisible(false)}
        onConfirm={() => {
          setCustomAlertVisible(false);
          if (customAlertOnConfirm) customAlertOnConfirm();
        }}
      />
    </>
  );
}
