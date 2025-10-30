import ClassificationStageSection from '@/components/breeding/ClassificationStageSection';
import { CountEggModal } from '@/components/breeding/CountEggModal';
import FryFishInfo from '@/components/breeding/FryFishInfo';
import FryFishSummary from '@/components/breeding/FryFishSummary';
import { FrySurvivalRecordModal } from '@/components/breeding/FrySurvivalRecordModal';
import IncubationSummary from '@/components/breeding/IncubationSummary';
import { SelectionModal } from '@/components/breeding/SelectionModal';
import { UpdateEggBatchModal } from '@/components/breeding/UpdateEggBatchModal';
import ContextMenuField from '@/components/ContextMenuField';
import { CustomAlert } from '@/components/CustomAlert';
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
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Egg,
  Eye,
  Filter,
  Fish,
  Mars,
  Search,
  Venus,
  X,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
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

  const [currentBreedingId, setCurrentBreedingId] = useState<number | null>(
    null
  );

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
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatusLabel, setFilterStatusLabel] = useState('Tất cả');
  const [filterResultLabel, setFilterResultLabel] = useState('Tất cả');
  const [filterPondId, setFilterPondId] = useState('');
  const [filterPondLabel, setFilterPondLabel] = useState('Chọn hồ');
  const [filterStartDateFrom, setFilterStartDateFrom] = useState('');
  const [filterStartDateTo, setFilterStartDateTo] = useState('');

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
  } = useGetPonds(
    {
      pageIndex: 1,
      pageSize: 200,
    },
    true
  );
  const { data: emptyPondPage, refetch: refetchEmptyPonds } = useGetPonds(
    {
      pageIndex: 1,
      pageSize: 200,
      status: PondStatus.EMPTY,
    },
    true
  );

  // Refetch breeding data when screen gains focus
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

  const breedingListToRender: BreedingProcess[] =
    (breedingPages?.pages?.flatMap(
      (p) => (p?.data as BreedingProcess[]) || []
    ) ?? []) as BreedingProcess[];

  const getStatusColor = (status?: BreedingStatus | string) => {
    switch (status) {
      case BreedingStatus.PAIRING:
        return '#3b82f6'; // blue
      case BreedingStatus.SPAWNED:
        return '#f59e0b'; // amber
      case BreedingStatus.EGG_BATCH:
        return '#fb923c'; // orange
      case BreedingStatus.FRY_FISH:
        return '#10b981'; // green
      case BreedingStatus.CLASSIFICATION:
        return '#6366f1'; // indigo
      case BreedingStatus.FAILED:
        return '#ef4444'; // red
      case BreedingStatus.COMPLETE:
        return '#06b6d4'; // teal-ish for complete
      default: {
        const s = String(status ?? '');
        if (/pairing/i.test(s)) return '#3b82f6';
        if (/spawned|đã đẻ/i.test(s)) return '#f59e0b';
        if (/egg|Ấp trứng/i.test(s)) return '#fb923c';
        if (/fry|bột/i.test(s)) return '#10b981';
        if (/classification|tuyển/i.test(s)) return '#6366f1';
        if (/failed|hủy/i.test(s)) return '#ef4444';
        if (/complete|hoàn/i.test(s)) return '#06b6d4';
        return '#6b7280'; // gray
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

  const getStatusText = (status: string) => {
    return status;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4">
        {/* Search */}
        <View className="mb-4">
          <View className="flex-row items-center rounded-2xl border border-gray-200 bg-white px-4">
            <TextInput
              className="flex-1 text-gray-900"
              placeholder="Tìm kiếm ..."
              value={filterSearch}
              onChangeText={(t) => setFilterSearch(t)}
              onSubmitEditing={() => {
                setAppliedFilters((prev: any) => ({
                  ...(prev || {}),
                  search: filterSearch,
                }));
                refetchBreeding();
              }}
              placeholderTextColor="#9ca3af"
            />

            {filterSearch ? (
              <TouchableOpacity
                className="p-2"
                onPress={() => {
                  setFilterSearch('');
                  setAppliedFilters((prev: any) => {
                    if (!prev) return prev;
                    const copy = { ...prev };
                    delete copy.search;
                    return Object.keys(copy).length ? copy : undefined;
                  });
                  refetchBreeding();
                }}
                accessibilityLabel="Xóa tìm kiếm"
              >
                <X size={16} color="#6b7280" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              className="left-4 rounded-r-2xl bg-primary p-3"
              onPress={() => {
                setAppliedFilters((prev: any) => ({
                  ...(prev || {}),
                  search: filterSearch,
                }));
                refetchBreeding();
              }}
            >
              <Search size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-bold text-gray-900">
            Quản lý sinh sản
          </Text>
          <TouchableOpacity
            className="rounded-lg border border-gray-300 px-3 py-2"
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={16} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-4">
          <View className="w-11/12 rounded-2xl bg-white p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-lg font-semibold">Bộ lọc</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {pondLoading ? (
              <View className="mb-3 rounded border border-gray-200 p-2">
                <Text className="text-sm text-gray-600">Đang tải hồ...</Text>
              </View>
            ) : (
              <ContextMenuField
                label="Hồ"
                value={filterPondLabel}
                options={(pondPage?.data ?? []).map((p) => ({
                  label: `${p.id}: ${p.pondName ?? p.id}`,
                  value: `${p.id}: ${p.pondName ?? p.id}`,
                }))}
                onSelect={(v) => {
                  const id = String(v).split(':')[0]?.trim();
                  setFilterPondId(id ?? '');
                  setFilterPondLabel(String(v));
                }}
                onPress={() => refetchPonds()}
                placeholder="Chọn hồ"
              />
            )}

            <ContextMenuField
              label="Trạng thái"
              value={filterStatusLabel}
              options={[
                { label: 'Tất cả', value: 'Tất cả' },
                { label: 'Đang ghép cặp', value: 'Đang ghép cặp' },
                { label: 'Đã đẻ', value: 'Đã đẻ' },
                { label: 'Ấp trứng', value: 'Ấp trứng' },
                { label: 'Nuôi cá bột', value: 'Nuôi cá bột' },
                { label: 'Tuyển chọn', value: 'Tuyển chọn' },
                { label: 'Hoàn thành', value: 'Hoàn thành' },
                { label: 'Hủy ghép cặp', value: 'Hủy ghép cặp' },
              ]}
              onSelect={(v) => setFilterStatusLabel(v)}
              placeholder="Chọn trạng thái"
            />

            <ContextMenuField
              label="Kết quả"
              value={filterResultLabel}
              options={[
                { label: 'Tất cả', value: 'Tất cả' },
                { label: 'Thành công', value: 'Thành công' },
                { label: 'Thất bại', value: 'Thất bại' },
                { label: 'Một phần thành công', value: 'Một phần thành công' },
                { label: 'Chưa rõ', value: 'Chưa rõ' },
              ]}
              onSelect={(v) => setFilterResultLabel(v)}
              placeholder="Chọn kết quả"
            />

            <View className="mt-4 flex-row justify-between">
              <TouchableOpacity
                className="rounded-lg border border-gray-200 px-4 py-2"
                onPress={() => {
                  setFilterSearch('');
                  setFilterPondId('');
                  setFilterPondLabel('Chọn hồ');
                  setFilterStatusLabel('Tất cả');
                  setFilterResultLabel('Tất cả');
                  setFilterStartDateFrom('');
                  setFilterStartDateTo('');
                  setAppliedFilters(undefined);
                  refetchBreeding();
                }}
              >
                <Text>Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg bg-primary px-4 py-2"
                onPress={() => {
                  const f: BreedingProcessSearchParams = {};
                  if (filterSearch) f.search = filterSearch;
                  if (filterPondId) f.pondId = Number(filterPondId);
                  if (filterStatusLabel && filterStatusLabel !== 'Tất cả') {
                    const label = filterStatusLabel;
                    if (label === 'Đang ghép cặp')
                      f.status = BreedingStatus.PAIRING;
                    else if (label === 'Đã đẻ')
                      f.status = BreedingStatus.SPAWNED;
                    else if (label === 'Ấp trứng')
                      f.status = BreedingStatus.EGG_BATCH;
                    else if (label === 'Nuôi cá bột')
                      f.status = BreedingStatus.FRY_FISH;
                    else if (label === 'Tuyển chọn')
                      f.status = BreedingStatus.CLASSIFICATION;
                    else if (label === 'Hoàn thành')
                      f.status = BreedingStatus.COMPLETE;
                    else if (label === 'Hủy ghép cặp')
                      f.status = BreedingStatus.FAILED;
                  }
                  if (filterResultLabel && filterResultLabel !== 'Tất cả') {
                    const label = filterResultLabel;
                    if (label === 'Thành công')
                      f.result = BreedingResult.SUCCESS;
                    else if (label === 'Thất bại')
                      f.result = BreedingResult.FAILED;
                    else if (label === 'Một phần thành công')
                      f.result = BreedingResult.PARTIAL_SUCCESS;
                  }
                  if (filterStartDateFrom)
                    f.startDateFrom = filterStartDateFrom;
                  if (filterStartDateTo) f.startDateTo = filterStartDateTo;

                  setAppliedFilters(Object.keys(f).length ? f : undefined);
                  setShowFilterModal(false);
                }}
              >
                <Text className="text-white">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <FlatList
        data={breedingListToRender}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 30,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={() => (
          <>
            {breedingLoading ? (
              <View className="h-[50vh] w-full items-center justify-center">
                <Loading />
              </View>
            ) : (
              <View className="mt-8 items-center">
                <Text className="mb-4 text-gray-600">
                  Chưa có quy trình sinh sản nào.
                </Text>
                {appliedFilters ? (
                  <TouchableOpacity
                    className="rounded-lg bg-primary px-4 py-2"
                    onPress={() => {
                      setAppliedFilters(undefined);
                      setFilterSearch('');
                      setFilterPondId('');
                      setFilterPondLabel('Chọn hồ');
                      setFilterStatusLabel('Tất cả');
                      setFilterResultLabel('Tất cả');
                      setFilterStartDateFrom('');
                      setFilterStartDateTo('');
                      refetchBreeding();
                    }}
                  >
                    <Text className="text-white">Xóa bộ lọc</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )}
          </>
        )}
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
              className="mb-4 rounded-2xl bg-white px-4 py-2 shadow-sm"
            >
              {/* Header */}
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-lg font-bold text-gray-900">
                  {b.code !== '' ? `#${b.code}` : `Quy trình #${b.id}`}
                </Text>
                <View
                  className="rounded-full px-2 py-1"
                  style={{ backgroundColor: badgeBg }}
                >
                  <Text className="text-xs font-medium" style={{ color }}>
                    {getStatusText(statusLabel)}
                  </Text>
                </View>
              </View>

              {/* Common top info */}
              <View className="mb-3">
                <View className="mb-2 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <Text className="text-base">{maleFish}</Text>
                    <Mars
                      size={12}
                      color="#6b7280"
                      style={{ marginHorizontal: 2 }}
                    />
                    <Text className="text-sm"> × </Text>
                    <Text className="text-base">{femaleFish}</Text>
                    <Venus
                      size={12}
                      color="#6b7280"
                      style={{ marginLeft: 2 }}
                    />
                  </View>
                </View>

                <View className="flex-col">
                  <View className="flex-row items-center">
                    <View className="mr-2 h-2 w-2 rounded-full bg-blue-500" />
                    <Text className="text-sm text-gray-600">Hồ: {pond}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-sm text-gray-600">
                      Ngày bắt đầu quy trình: {formatDate(b.startDate)}
                    </Text>
                    <Text className="ml-1 text-sm text-gray-500">•</Text>
                    <Text className="ml-1 text-sm text-gray-600">
                      {daysSince(b.startDate)} ngày
                    </Text>
                  </View>
                </View>
              </View>

              {/* Variants by status */}
              {statusLabel === 'Đang ghép cặp' && (
                <View>
                  <View className="mt-2 flex-row border-t border-gray-200 pt-2">
                    <TouchableOpacity
                      className={`mr-2 flex-1 flex-row items-center justify-center rounded-lg py-2 ${markingSpawnedId === b.id ? 'bg-green-500 opacity-60' : 'bg-green-600'}`}
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
                          <Text className="ml-2 font-medium text-white">
                            Đang cập nhật...
                          </Text>
                        </View>
                      ) : (
                        <Text className="font-medium text-white">
                          Cập nhật: Đã đẻ
                        </Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="ml-2 flex-1 flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                      onPress={() => router.push(`/breeding/${b.id}`)}
                    >
                      <Eye size={16} color="#6b7280" />
                      <Text className="ml-2 text-sm text-gray-600">
                        Chi tiết
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {statusLabel === 'Đã đẻ' && (
                <View>
                  <View className="mt-2 border-t border-gray-200 pt-2">
                    <View className="mb-2 flex-row">
                      <TouchableOpacity
                        className="mr-2 flex-1 flex-row items-center justify-center rounded-lg py-2"
                        style={{ backgroundColor: '#fb923c' }}
                        onPress={() => {
                          setCurrentBreedingId(b.id ?? null);
                          setShowCountModal(true);
                        }}
                      >
                        <Egg size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">
                          Đếm trứng
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                        onPress={() => router.push(`/breeding/${b.id}`)}
                      >
                        <Eye size={16} color="#6b7280" />
                        <Text className="ml-2 text-sm text-gray-700">
                          Xem chi tiết
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )}

              {statusLabel === 'Ấp trứng' && (
                <View>
                  <View className="rounded-lg bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">
                      Số trứng:{' '}
                      <Text className="font-semibold text-gray-900">
                        {b.totalEggs ?? 0} quả
                      </Text>{' '}
                      Tỷ lệ thụ tinh:{' '}
                      <Text className="font-semibold text-gray-900">
                        {b.fertilizationRate
                          ? `${b.fertilizationRate.toFixed(1)}%`
                          : '0%'}
                      </Text>
                    </Text>
                    <Text className="mt-2 text-sm text-gray-600">
                      Số ngày ấp:{' '}
                      <Text className="font-semibold text-gray-900">
                        {daysSince(b.startDate)} ngày
                      </Text>
                    </Text>
                  </View>

                  {/* Incubation Summary Component */}
                  <IncubationSummary breedingProcessId={b.id} />

                  <View className="mt-4 border-t border-gray-200 pt-2">
                    <View className="flex-row">
                      <TouchableOpacity
                        className="mr-2 flex-1 flex-row items-center justify-center rounded-lg py-2"
                        style={{ backgroundColor: '#10b981' }}
                        onPress={() => {
                          setCurrentBreedingId(b.id ?? null);
                          setShowTransferModal(true);
                        }}
                      >
                        <Egg size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">
                          Cập nhập trứng
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                        onPress={() => router.push(`/breeding/${b.id}`)}
                      >
                        <Eye size={16} color="#6b7280" />
                        <Text className="ml-2 text-sm text-gray-700">
                          Xem chi tiết
                        </Text>
                      </TouchableOpacity>
                    </View>
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

                  {/* <View className="mt-4 border-t border-gray-200 pt-2">
                    <View className="mb-2 flex-row space-x-2">
                      <TouchableOpacity className="mr-2 flex-1 flex-row items-center justify-center rounded-lg bg-purple-600 py-2" onPress={() => setShowFryUpdateModal(true)}>
                        <Fish size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">Cập nhật cá bột</Text>
                      </TouchableOpacity>
                      <TouchableOpacity className="flex-1 flex-row items-center justify-center rounded-lg bg-indigo-600 py-2" onPress={() => {}}>
                        <Camera size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">Đếm bằng camera</Text>
                      </TouchableOpacity>
                    </View>
                    <View>
                      <TouchableOpacity className="w-full flex-row items-center justify-center rounded-lg border border-gray-200 py-2" onPress={() => router.push(`/breeding/${b.id}`)}>
                        <Eye size={16} color="#6b7280" />
                        <Text className="ml-2 text-gray-700">Chi tiết</Text>
                      </TouchableOpacity>
                    </View>
                  </View> */}

                  <View className="mt-4 border-t border-gray-200 pt-2">
                    <View className="mb-2 flex-row space-x-2">
                      <TouchableOpacity
                        className="mr-2 flex-1 flex-row items-center justify-center rounded-lg bg-purple-600 py-2"
                        onPress={() => {
                          setCurrentBreedingId(b.id ?? null);
                          setShowFryUpdateModal(true);
                        }}
                      >
                        <Fish size={16} color="white" />
                        <Text className="ml-2 font-medium text-white">
                          Cập nhật cá bột
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                        onPress={() => router.push(`/breeding/${b.id}`)}
                      >
                        <Eye size={16} color="#6b7280" />
                        <Text className="ml-2 text-gray-700">Chi tiết</Text>
                      </TouchableOpacity>
                    </View>
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
                  />
                </View>
              )}

              {statusLabel === 'Hoàn thành' && (
                <View>
                  <View className="rounded-lg bg-green-50 p-3">
                    <Text className="text-sm text-gray-600">
                      Kết quả:{' '}
                      <Text className="font-semibold text-green-700">
                        {mapResult(b.result)}
                      </Text>
                    </Text>
                    <Text className="mt-2 text-sm text-gray-600">
                      Tổng số cá đạt chuẩn:{' '}
                      <Text className="font-semibold text-gray-900">
                        {b.totalFishQualified || 0} con
                      </Text>
                    </Text>
                    <Text className="mt-1 text-sm text-gray-600">
                      Số gói:{' '}
                      <Text className="font-semibold text-gray-900">
                        {b.totalPackage || 0} gói
                      </Text>
                    </Text>
                    {b.endDate && (
                      <Text className="mt-1 text-sm text-gray-600">
                        Ngày hoàn thành:{' '}
                        <Text className="font-semibold text-gray-900">
                          {formatDate(b.endDate)}
                        </Text>
                      </Text>
                    )}
                  </View>

                  <View className="mt-4 border-t border-gray-200 pt-2">
                    <TouchableOpacity
                      className="flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                      onPress={() => router.push(`/breeding/${b.id}`)}
                    >
                      <Eye size={16} color="#6b7280" />
                      <Text className="ml-2 text-gray-700">Chi tiết</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {statusLabel === 'Hủy ghép cặp' && (
                <View>
                  <View className="rounded-lg bg-gray-50 p-3">
                    <Text className="text-sm text-gray-600">
                      Kết quả:{' '}
                      <Text className="font-semibold text-gray-900">
                        {mapResult(b.result)}
                      </Text>
                    </Text>
                    <Text className="mt-2 text-sm text-gray-600">
                      Số cá:{' '}
                      <Text className="font-semibold text-gray-900">
                        {eggCount} con
                      </Text>
                    </Text>
                  </View>

                  <View className="mt-4 border-t border-gray-200 pt-2">
                    <TouchableOpacity
                      className="flex-row items-center justify-center rounded-lg border border-gray-200 py-2"
                      onPress={() => router.push(`/breeding/${b.id}`)}
                    >
                      <Eye size={16} color="#6b7280" />
                      <Text className="ml-2 text-gray-700">Chi tiết</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
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
              <ActivityIndicator size="small" color="#6b7280" />
            </View>
          ) : null
        }
      />

      {/* Modals */}
      <CountEggModal
        visible={showCountModal}
        onClose={() => {
          setShowCountModal(false);
          setCurrentBreedingId(null);
        }}
        breedingId={currentBreedingId}
        emptyPonds={emptyPondPage?.data ?? []}
        onRefetchPonds={refetchEmptyPonds}
      />

      <UpdateEggBatchModal
        visible={showTransferModal}
        onClose={() => {
          setShowTransferModal(false);
          setCurrentBreedingId(null);
        }}
        breedingId={currentBreedingId}
        emptyPonds={emptyPondPage?.data ?? []}
        onRefetchPonds={refetchEmptyPonds}
      />

      <FrySurvivalRecordModal
        visible={showFryUpdateModal}
        onClose={() => {
          setShowFryUpdateModal(false);
          setCurrentBreedingId(null);
        }}
        breedingId={currentBreedingId}
        emptyPonds={emptyPondPage?.data ?? []}
        onRefetchPonds={refetchEmptyPonds}
      />

      <SelectionModal
        visible={showSelectionModal}
        onClose={() => {
          setShowSelectionModal(false);
          setCurrentBreedingId(null);
        }}
        breedingId={currentBreedingId}
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
    </SafeAreaView>
  );
}
