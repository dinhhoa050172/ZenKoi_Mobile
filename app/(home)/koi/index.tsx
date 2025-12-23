import ContextMenuField from '@/components/ContextMenuField';
import FishSvg from '@/components/icons/FishSvg';
import PondSvg from '@/components/icons/PondSvg';
import Loading from '@/components/Loading';
import { useGetKoiFish } from '@/hooks/useKoiFish';
import { useGetPonds } from '@/hooks/usePond';
import { useGetVarieties } from '@/hooks/useVariety';
import type {
  KoiFish,
  KoiFishSearchParams,
} from '@/lib/api/services/fetchKoiFish';
import {
  Gender,
  HealthStatus,
  SaleStatus,
} from '@/lib/api/services/fetchKoiFish';
import { formatKoiAge } from '@/lib/utils/formatKoiAge';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useRouter } from 'expo-router';
import {
  Calendar,
  DollarSign,
  Edit,
  Eye,
  Filter,
  Fish,
  MapPin,
  Plus,
  RefreshCcw,
  Ruler,
  Search,
  X,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
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

export default function KoiManagementScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchRFID, setSearchRFID] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState<KoiFishSearchParams>({});

  const [modalSearch, setModalSearch] = useState<string>('');
  const [modalGender, setModalGender] = useState<Gender | undefined>(undefined);
  const [modalHealth, setModalHealth] = useState<HealthStatus | undefined>(
    undefined
  );
  const [modalVarietyId, setModalVarietyId] = useState<number | undefined>(
    undefined
  );
  const [modalMinSize, setModalMinSize] = useState<number>(0);
  const [modalMaxSize, setModalMaxSize] = useState<number>(999);
  const [modalSaleStatus, setModalSaleStatus] = useState<
    SaleStatus | undefined
  >(undefined);
  const [modalPondId, setModalPondId] = useState<number | undefined>(undefined);
  const [modalOrigin, setModalOrigin] = useState<string>('');
  const PRICE_MIN = 0;
  const PRICE_MAX = 100000000;
  const PRICE_STEP = 1000;
  const [modalMinPrice, setModalMinPrice] = useState<number>(PRICE_MIN);
  const [modalMaxPrice, setModalMaxPrice] = useState<number>(PRICE_MAX);
  // Size slider range (cm)
  const SIZE_MIN = 0;
  const SIZE_MAX = 200;
  const SIZE_STEP = 1;

  const resetModalFilters = () => {
    setModalSearch('');
    setModalGender(undefined);
    setModalHealth(undefined);
    setModalVarietyId(undefined);
    setModalMinSize(0);
    setModalMaxSize(999);
    setModalSaleStatus(undefined);
    setModalPondId(undefined);
    setModalOrigin('');
    setModalMinPrice(PRICE_MIN);
    setModalMaxPrice(PRICE_MAX);
  };

  const formatCurrency = (n: number) => {
    try {
      return n.toLocaleString('vi-VN');
    } catch {
      return String(n);
    }
  };

  const {
    data: koiPagination,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useGetKoiFish({ ...appliedFilters, isSale: true });
  const koiList: KoiFish[] = koiPagination?.data ?? [];

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

  const genderToLabel = (g: Gender) => {
    switch (g) {
      case Gender.MALE:
        return 'Đực';
      case Gender.FEMALE:
        return 'Cái';
      default:
        return g;
    }
  };

  const healthToLabel = (h: HealthStatus) => {
    switch (h) {
      case HealthStatus.HEALTHY:
        return 'Khỏe mạnh';
      case HealthStatus.WARNING:
        return 'Cảnh báo';
      case HealthStatus.WEAK:
        return 'Yếu';
      case HealthStatus.SICK:
        return 'Bệnh';
      case HealthStatus.DEAD:
        return 'Chết';
      default:
        return h;
    }
  };

  const saleStatusToLabel = (s: SaleStatus) => {
    switch (s) {
      case SaleStatus.NOT_FOR_SALE:
        return 'Không bán';
      case SaleStatus.AVAILABLE:
        return 'Có sẵn';
      case SaleStatus.SOLD:
        return 'Đã bán';
      default:
        return s;
    }
  };

  const getHealthColor = (h: HealthStatus) => {
    switch (h) {
      case HealthStatus.HEALTHY:
        return {
          bg: 'bg-green-100',
          text: 'text-green-700',
          border: 'border-green-200',
        };
      case HealthStatus.WARNING:
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
        };
      case HealthStatus.WEAK:
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-700',
          border: 'border-orange-200',
        };
      case HealthStatus.SICK:
        return {
          bg: 'bg-red-100',
          text: 'text-red-700',
          border: 'border-red-200',
        };
      case HealthStatus.DEAD:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-200',
        };
    }
  };

  const { data: pondsPage, isLoading: pondsLoading } = useGetPonds(
    {
      pageIndex: 1,
      pageSize: 100,
    },
    true
  );

  const { data: varietiesPage, isLoading: varietiesLoading } = useGetVarieties(
    { pageIndex: 1, pageSize: 100 },
    true
  );

  const pondOptions = pondsPage?.data ?? [];
  const varietyOptions = varietiesPage?.data ?? [];

  // Derived lists for enum options
  const genderOptions = useMemo(() => Object.values(Gender), []);
  const healthOptions = useMemo(() => Object.values(HealthStatus), []);
  const saleStatusOptions = useMemo(() => Object.values(SaleStatus), []);

  const activeFiltersCount = Object.keys(appliedFilters || {}).length;

  const RangeSlider = React.memo(function RangeSlider({
    initialValues,
    min,
    max,
    step,
    onFinish,
  }: {
    initialValues: [number, number];
    min: number;
    max: number;
    step: number;
    onFinish: (vals: [number, number]) => void;
  }) {
    const [vals, setVals] = useState<[number, number]>(initialValues);

    return (
      <View>
        <MultiSlider
          values={vals}
          min={min}
          max={max}
          step={step}
          onValuesChange={(values: number[]) => {
            setVals([values[0], values[1]]);
          }}
          onValuesChangeFinish={(values: number[]) => {
            const v: [number, number] = [values[0], values[1]];
            setVals(v);
            onFinish(v);
          }}
          selectedStyle={{ backgroundColor: '#06b6d4' }}
          unselectedStyle={{ backgroundColor: '#e5e7eb' }}
          trackStyle={{ height: 6, borderRadius: 3 }}
          markerStyle={{
            marginTop: 4,
            backgroundColor: '#06b6d4',
            height: 20,
            width: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: '#fff',
          }}
          pressedMarkerStyle={{
            height: 28,
            width: 28,
            backgroundColor: '#06b6d4',
          }}
          touchDimensions={{
            height: 48,
            width: 48,
            borderRadius: 24,
            slipDisplacement: 200,
          }}
          allowOverlap={false}
          minMarkerOverlapDistance={16}
        />
      </View>
    );
  });

  return (
    <>
      <SafeAreaView className="flex-1 bg-gray-50">
        {/* Header */}
        <View className="rounded-t-2xl bg-primary pb-6">
          <View className="px-4 pt-2">
            <View className="mb-4 mt-2 flex-row items-center justify-between">
              <View>
                <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
                  Quản lý
                </Text>
                <Text className="text-2xl font-bold text-white">
                  Hồ sơ cá Koi
                </Text>
              </View>
              <TouchableOpacity
                className="h-12 w-12 items-center justify-center rounded-full bg-white/20"
                onPress={() =>
                  router.push(`/koi/add?redirect=${encodeURIComponent('/koi')}`)
                }
              >
                <Plus size={24} color="white" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="flex-row items-center rounded-2xl bg-white px-4 shadow-sm">
              <Search size={20} color="#9ca3af" />
              <TextInput
                className="flex-1 py-3 pl-3 text-base text-gray-900"
                placeholder="Tìm kiếm theo RFID..."
                value={searchRFID}
                onChangeText={(t) => setSearchRFID(t)}
                onSubmitEditing={() => {
                  setAppliedFilters((prev: any) => ({
                    ...(prev || {}),
                    search: searchRFID,
                  }));
                  refetch();
                }}
                placeholderTextColor="#9ca3af"
              />
              <TouchableOpacity
                className="ml-2 rounded-full bg-primary p-2"
                onPress={() => {
                  setAppliedFilters((prev: any) => ({
                    ...(prev || {}),
                    search: searchRFID,
                  }));
                  refetch();
                }}
              >
                <Search size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Filter Bar */}
        <View className="flex-row items-center justify-between bg-white px-4 py-3 shadow-sm">
          <Text className="text-base font-medium text-gray-700">
            {koiPagination?.totalItems} cá Koi
          </Text>
          <TouchableOpacity
            className="flex-row items-center rounded-full bg-gray-100 px-4 py-2"
            onPress={() => setShowFilterSheet(true)}
          >
            <Filter size={18} color="#6b7280" />
            <Text className="ml-2 text-base font-medium text-gray-700">
              Bộ lọc
            </Text>
            {activeFiltersCount > 0 && (
              <View className="ml-2 h-5 w-5 items-center justify-center rounded-full bg-primary">
                <Text className="text-xs font-bold text-white">
                  {activeFiltersCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <FlatList
          data={koiList}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 60,
            paddingHorizontal: 16,
            paddingTop: 16,
          }}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={() => {
            const hasActiveFilters = activeFiltersCount > 0;
            return (
              <>
                {isLoading ? (
                  <View className="h-[50vh] w-full items-center justify-center">
                    <Loading />
                  </View>
                ) : isError ? (
                  <View className="items-center rounded-2xl bg-white p-8 shadow-sm">
                    <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-100">
                      <X size={32} color="#dc2626" />
                    </View>
                    <Text className="mb-2 text-lg font-semibold text-gray-900">
                      Lỗi tải dữ liệu
                    </Text>
                    <Text className="mb-4 text-center text-sm text-gray-600">
                      {(error as any)?.message ?? 'Không xác định'}
                    </Text>
                    <TouchableOpacity
                      className="rounded-2xl bg-primary px-6 py-3"
                      onPress={() => refetch()}
                    >
                      <Text className="font-semibold text-white">Thử lại</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="items-center rounded-2xl bg-white p-8 shadow-sm">
                    <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-blue-100">
                      <Fish size={40} color="#3b82f6" />
                    </View>
                    {hasActiveFilters ? (
                      <>
                        <Text className="mb-2 text-lg font-semibold text-gray-900">
                          Không tìm thấy kết quả
                        </Text>
                        <Text className="mb-6 text-center text-sm text-gray-600">
                          Không có cá Koi nào phù hợp với bộ lọc hiện tại
                        </Text>
                        <View className="flex-row">
                          <TouchableOpacity
                            className="mr-2 rounded-2xl bg-gray-100 px-6 py-3"
                            onPress={() => {
                              setAppliedFilters({});
                              setSearchRFID('');
                              refetch();
                            }}
                          >
                            <Text className="font-semibold text-gray-900">
                              Xóa bộ lọc
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            className="rounded-2xl bg-blue-500 px-6 py-3"
                            onPress={() => setShowFilterSheet(true)}
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
                          Chưa có cá Koi
                        </Text>
                        <Text className="mb-6 text-center text-sm text-gray-600">
                          Hệ thống chưa có cá Koi nào. Thêm cá mới để bắt đầu
                          quản lý.
                        </Text>
                        <TouchableOpacity
                          className="rounded-2xl bg-blue-500 px-6 py-3"
                          onPress={() =>
                            router.push(
                              `/koi/add?redirect=${encodeURIComponent('/koi')}`
                            )
                          }
                        >
                          <Text className="font-semibold text-white">
                            Thêm cá mới
                          </Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </>
            );
          }}
          renderItem={({ item: koi }) => {
            const healthColors = getHealthColor(koi.healthStatus);

            return (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push(`/koi/${koi.id}`)}
                className="mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
              >
                {/* Header with RFID */}
                <View className="flex-row items-center justify-between border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3">
                  <View className="flex-1 flex-row items-center">
                    <View className="mr-2 rounded-full bg-blue-100 p-1.5">
                      <FishSvg size={18} color="#3b82f6" />
                    </View>
                    <Text
                      className="flex-1 text-lg font-bold text-gray-900"
                      numberOfLines={1}
                    >
                      {koi.rfid}
                    </Text>
                  </View>

                  {/* Health Status Badge */}
                  <View
                    className={`rounded-full border px-3 py-1 ${healthColors.border} ${healthColors.bg}`}
                  >
                    <Text
                      className={`text-sm font-semibold ${healthColors.text}`}
                    >
                      {healthToLabel(koi.healthStatus)}
                    </Text>
                  </View>
                </View>

                {/* Main Content */}
                <View className="p-4">
                  <View className="flex-row">
                    {/* Image Section */}
                    <View className="mr-4">
                      {koi.images && koi.images.length > 0 ? (
                        <Image
                          source={{ uri: koi.images[0] }}
                          style={{
                            width: 150,
                            height: 150,
                            borderRadius: 16,
                          }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="h-[150px] w-[150px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                          <Fish size={36} color="#d1d5db" strokeWidth={1.5} />
                          <Text className="mt-1 text-xs text-gray-400">
                            Không có ảnh
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Info Section */}
                    <View className="flex-1">
                      {/* Variety Badge */}
                      <View className="mb-3 flex-row items-center">
                        <View className="mr-2 rounded-full bg-purple-100 p-1">
                          <FishSvg size={18} color="#a855f7" />
                        </View>
                        <View className="flex-1 rounded-2xl border border-purple-200 bg-purple-50 px-3 py-1.5">
                          <Text
                            className="text-base font-bold text-purple-700"
                            numberOfLines={1}
                          >
                            {koi.variety?.varietyName || 'Chưa xác định'}
                          </Text>
                        </View>
                      </View>

                      {/* Pond Location */}
                      <View className="mb-3 flex-row items-center">
                        <View className="mr-2 rounded-full bg-blue-50 p-1.5">
                          <PondSvg size={18} color="#3b82f6" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-gray-500">
                            Ao nuôi
                          </Text>
                          <Text
                            className="text-base font-semibold text-gray-900"
                            numberOfLines={1}
                          >
                            {koi.pond?.pondName || 'Chưa có ao'}
                          </Text>
                        </View>
                      </View>

                      {/* Size & Age */}
                      <View className="flex-col items-start">
                        {/* Size */}
                        <View className="mr-4 flex-1 flex-row items-center">
                          <View className="mr-1.5 rounded-full bg-cyan-50 p-1">
                            <Ruler
                              size={16}
                              color="#06b6d4"
                              strokeWidth={2.5}
                            />
                          </View>
                          <View>
                            <Text className="text-sm text-gray-500">
                              Kích thước
                            </Text>
                            <Text className="text-base font-bold text-gray-900">
                              {getSizeLabel(koi.size)}
                            </Text>
                          </View>
                        </View>

                        {/* Age */}
                        <View className="mt-1 flex-1 flex-row items-center">
                          <View className="mr-1.5 rounded-full bg-amber-50 p-1">
                            <Calendar
                              size={16}
                              color="#f59e0b"
                              strokeWidth={2.5}
                            />
                          </View>
                          <View>
                            <Text className="text-sm text-gray-500">Tuổi</Text>
                            <Text className="text-base font-bold text-gray-900">
                              {formatKoiAge(koi.birthDate)}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Gender & Sale Status Row */}
                      <View className="mt-3 flex-row items-center">
                        {/* Gender Badge */}
                        <View className="mr-2 rounded-2xl bg-gray-100 px-2 py-1">
                          <Text className="text-sm font-medium text-gray-700">
                            {genderToLabel(koi.gender)}
                          </Text>
                        </View>

                        {/* Sale Status Badge */}
                        {koi.saleStatus && (
                          <View className="rounded-2xl bg-emerald-100 px-2 py-1">
                            <Text className="text-sm font-medium text-emerald-700">
                              {saleStatusToLabel(koi.saleStatus)}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Additional Info Row (Optional) */}
                  {koi.origin && (
                    <View className="mt-3 flex-row items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2">
                      <MapPin size={18} color="#9ca3af" strokeWidth={2} />
                      <Text className="ml-2 text-base text-gray-500">
                        Xuất xứ:{' '}
                      </Text>
                      <Text
                        className="flex-1 text-base font-medium text-gray-700"
                        numberOfLines={1}
                      >
                        {koi.origin}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Action Footer */}
                <View className="flex-row border-t border-gray-100 bg-gray-50/50">
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-3.5 active:bg-blue-50"
                    onPress={() => router.push(`/koi/${koi.id}`)}
                  >
                    <Eye size={18} color="#3b82f6" strokeWidth={2.5} />
                    <Text className="ml-2 text-base font-semibold text-blue-600">
                      Xem chi tiết
                    </Text>
                  </TouchableOpacity>

                  <View className="w-px bg-gray-200" />

                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center py-3.5 active:bg-gray-100"
                    onPress={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/koi/edit?id=${koi.id}&redirect=${encodeURIComponent('/koi')}`
                      );
                    }}
                  >
                    <Edit size={18} color="#6b7280" strokeWidth={2.5} />
                    <Text className="ml-2 text-base font-semibold text-gray-700">
                      Chỉnh sửa
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (!isFetchingNextPage && hasNextPage) {
              fetchNextPage();
            }
          }}
          refreshing={!!isRefetching}
          onRefresh={() => {
            refetch();
          }}
          ListFooterComponent={() =>
            isFetchingNextPage ? (
              <View className="items-center py-4">
                <ActivityIndicator color="#3b82f6" size="small" />
                <Text className="mt-2 text-sm text-gray-500">
                  Đang tải thêm...
                </Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>

      {/* Filter Sheet Modal */}
      <Modal
        visible={showFilterSheet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterSheet(false)}
      >
        <SafeAreaView className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="rounded-t-2xl bg-primary pb-2">
            <View className="flex-row items-center justify-between px-4 pt-2">
              <View className="ml-4 flex-1 items-center">
                <Text className="text-base font-medium uppercase tracking-wide text-white/80">
                  Tùy chỉnh
                </Text>
                <Text className="text-2xl font-bold text-white">Bộ lọc</Text>
              </View>

              <TouchableOpacity
                className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
                onPress={() => setShowFilterSheet(false)}
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
            {/* Pond & Variety */}
            <View className="mb-4">
              <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                Thông tin cơ bản
              </Text>

              <View className="rounded-2xl border border-gray-200 bg-white p-4">
                <View className="mb-4 flex-row items-start">
                  <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                    <PondSvg size={18} />
                  </View>
                  <View className="flex-1">
                    <ContextMenuField
                      label="Bể cá"
                      value={modalPondId ? String(modalPondId) : undefined}
                      options={
                        pondsLoading
                          ? [{ label: 'Đang tải...', value: '' }]
                          : pondOptions.map((p) => ({
                              label: p.pondName ?? String(p.id),
                              value: String(p.id),
                            }))
                      }
                      onSelect={(v) =>
                        setModalPondId(v ? Number(v) : undefined)
                      }
                      placeholder="Chọn bể cá"
                    />
                  </View>
                </View>

                <View className="mb-4 flex-row items-start">
                  <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                    <FishSvg size={20} color="#a855f7" />
                  </View>
                  <View className="flex-1">
                    <ContextMenuField
                      label="Giống"
                      value={
                        modalVarietyId ? String(modalVarietyId) : undefined
                      }
                      options={
                        varietiesLoading
                          ? [{ label: 'Đang tải...', value: '' }]
                          : varietyOptions.map((v) => ({
                              label: v.varietyName ?? String(v.id),
                              value: String(v.id),
                            }))
                      }
                      onSelect={(v) =>
                        setModalVarietyId(v ? Number(v) : undefined)
                      }
                      placeholder="Chọn giống"
                    />
                  </View>
                </View>

                {/* Origin */}
                <View className="flex-row items-center">
                  <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                    <MapPin size={18} color="#f59e0b" />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-base font-bold text-gray-600">
                      Nguồn gốc
                    </Text>
                    <TextInput
                      className="rounded-2xl border border-gray-200 bg-gray-50 p-3 text-base font-medium text-gray-900"
                      placeholder="Xuất xứ"
                      placeholderTextColor="#9ca3af"
                      value={modalOrigin}
                      onChangeText={setModalOrigin}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Gender */}
            <View className="mb-4">
              <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                Giới tính
              </Text>
              <View className="rounded-2xl border border-gray-200 bg-white p-3">
                <View className="flex-row flex-wrap items-center">
                  {genderOptions.map((g) => {
                    const isSelected = modalGender === g;
                    return (
                      <TouchableOpacity
                        key={g}
                        className={`mb-2 mr-2 rounded-2xl border px-4 py-2 ${
                          isSelected
                            ? 'border-blue-700 bg-primary'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        onPress={() =>
                          setModalGender(isSelected ? undefined : (g as Gender))
                        }
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isSelected ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {genderToLabel(g)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Size Range */}
            <View className="mb-4">
              <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                Kích thước (cm)
              </Text>
              <View className="rounded-2xl border border-gray-200 bg-white p-4">
                <View className="mb-3 flex-row items-center">
                  <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-cyan-100">
                    <Ruler size={18} color="#06b6d4" />
                  </View>
                  <Text className="text-sm font-medium text-gray-700">
                    Từ {modalMinSize} đến {modalMaxSize} cm
                  </Text>
                </View>
                <View style={{ paddingHorizontal: 12 }}>
                  <RangeSlider
                    initialValues={[modalMinSize, modalMaxSize]}
                    min={SIZE_MIN}
                    max={SIZE_MAX}
                    step={SIZE_STEP}
                    onFinish={([minV, maxV]) => {
                      setModalMinSize(minV);
                      setModalMaxSize(maxV);
                    }}
                  />
                </View>
              </View>
            </View>

            {/* Health Status */}
            <View className="mb-4">
              <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                Tình trạng sức khỏe
              </Text>
              <View className="rounded-2xl border border-gray-200 bg-white p-3">
                <View className="flex-row flex-wrap items-center">
                  {healthOptions.map((h) => {
                    const isSelected = modalHealth === h;
                    return (
                      <TouchableOpacity
                        key={h}
                        className={`mb-2 mr-2 rounded-2xl border px-4 py-2 ${
                          isSelected
                            ? 'border-blue-700 bg-primary'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        onPress={() =>
                          setModalHealth(
                            isSelected ? undefined : (h as HealthStatus)
                          )
                        }
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isSelected ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {healthToLabel(h)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Sale Status */}
            <View className="mb-4">
              <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                Trạng thái bán
              </Text>
              <View className="rounded-2xl border border-gray-200 bg-white p-3">
                <View className="flex-row flex-wrap items-center">
                  {saleStatusOptions.map((s) => {
                    const isSelected = modalSaleStatus === s;
                    return (
                      <TouchableOpacity
                        key={s}
                        className={`mb-2 mr-2 rounded-2xl border px-4 py-2 ${
                          isSelected
                            ? 'border-blue-700 bg-primary'
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        onPress={() =>
                          setModalSaleStatus(
                            isSelected ? undefined : (s as SaleStatus)
                          )
                        }
                      >
                        <Text
                          className={`text-sm font-medium ${
                            isSelected ? 'text-white' : 'text-gray-700'
                          }`}
                        >
                          {saleStatusToLabel(s)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Price Range */}
            <View className="mb-4">
              <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                Giá bán
              </Text>
              <View className="rounded-2xl border border-gray-200 bg-white p-4">
                <View className="mb-3 flex-row items-center">
                  <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-green-100">
                    <DollarSign size={18} color="#22c55e" />
                  </View>
                  <View>
                    <Text className="text-xs text-gray-500">Khoảng giá</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {formatCurrency(modalMinPrice)} -{' '}
                      {formatCurrency(modalMaxPrice)} VNĐ
                    </Text>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 12 }}>
                  <RangeSlider
                    initialValues={[modalMinPrice, modalMaxPrice]}
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={PRICE_STEP}
                    onFinish={([minV, maxV]) => {
                      setModalMinPrice(minV);
                      setModalMaxPrice(maxV);
                    }}
                  />
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
                  setAppliedFilters({});
                  setSearchRFID('');
                  refetch();
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
                  const filters: any = {};
                  if (modalSearch) filters.search = modalSearch;
                  if (modalGender) filters.gender = modalGender;
                  if (modalHealth) filters.health = modalHealth;
                  if (modalVarietyId) filters.varietyId = modalVarietyId;
                  if (modalMinSize) filters.minSize = modalMinSize;
                  if (modalMaxSize) filters.maxSize = modalMaxSize;
                  if (modalSaleStatus) filters.saleStatus = modalSaleStatus;
                  if (modalPondId) filters.pondId = modalPondId;
                  if (modalOrigin) filters.origin = modalOrigin;
                  if (modalMinPrice) filters.minPrice = Number(modalMinPrice);
                  if (modalMaxPrice) filters.maxPrice = Number(modalMaxPrice);
                  setAppliedFilters(filters);
                  setShowFilterSheet(false);
                  refetch();
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
    </>
  );
}
