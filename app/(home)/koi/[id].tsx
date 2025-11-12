import FishSvg from '@/components/icons/FishSvg';
import PondSvg from '@/components/icons/PondSvg';
import { useGetKoiFishById } from '@/hooks/useKoiFish';
import {
  Gender,
  HealthStatus,
  KoiFish,
  KoiPatternType,
  MutationType,
  SaleStatus,
} from '@/lib/api/services/fetchKoiFish';
import { formatDate } from '@/lib/utils/formatDate';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Biohazard,
  Blend,
  Calendar,
  Coins,
  Dna,
  DollarSign,
  Edit,
  Fish,
  Layers,
  MapPin,
  Percent,
  Ruler,
  VenusAndMars,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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
        return { bg: '#dcfce7', text: '#166534', border: '#86efac' };
      case HealthStatus.WARNING:
        return { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' };
      case HealthStatus.WEAK:
        return { bg: '#fed7aa', text: '#9a3412', border: '#fdba74' };
      case HealthStatus.SICK:
        return { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' };
      case HealthStatus.DEAD:
        return { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', border: '#d1d5db' };
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

  const patternToLabel = (p?: KoiPatternType | string) => {
    switch (p) {
      case KoiPatternType.TANCHO:
        return 'Tancho (Đốm đỏ giữa đầu)';
      case KoiPatternType.MARUTEN:
        return 'Mảuten (Đốm đầu và thân)';
      case KoiPatternType.NIDAN:
        return 'Nidan (2 đốm đỏ)';
      case KoiPatternType.SANDAN:
        return 'Sandan (3 đốm đỏ)';
      case KoiPatternType.INAZUMA:
        return 'Inazuma (Dải đỏ hình tia sét)';
      case KoiPatternType.STRAIGHT_HI:
        return 'Straight hi (Dải đỏ liền thân)';
      case KoiPatternType.MENKABURI:
        return 'Menkaburi (Đầu đỏ toàn phần)';
      case KoiPatternType.BOZU:
        return 'Bozu (Đầu trắng)';
      case KoiPatternType.NONE:
        return 'Không xác định';
      default:
        return String(p ?? '-');
    }
  };

  const saleStatusToLabel = (s?: SaleStatus | string) => {
    switch (s) {
      case SaleStatus.NOT_FOR_SALE:
        return 'Không bán';
      case SaleStatus.AVAILABLE:
        return 'Có sẵn';
      case SaleStatus.RESERVED:
        return 'Đã đặt trước';
      case SaleStatus.SOLD:
        return 'Đã bán';
      default:
        return String(s ?? '-');
    }
  };

  const mutationTypeToLabel = (m?: MutationType | string) => {
    switch (m) {
      case MutationType.DOITSU:
        return 'Doitsu (không vảy)';
      case MutationType.GINRIN:
        return 'Ginrin (vảy ánh kim)';
      case MutationType.HIRENAGA:
        return 'Hirenaga (đuôi dài)';
      case MutationType.METALLIC:
        return 'Metallic (ánh kim)';
      case MutationType.NONE:
        return 'Không';
      default:
        return String(m ?? '-');
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

  const healthColors = getHealthColor(koi?.healthStatus);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="mb-2 rounded-t-2xl bg-primary pb-4">
        <View className="flex-row items-center justify-between px-4 pt-4">
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
            onPress={() => {
              if (redirect) {
                router.push(redirect as any);
              } else {
                router.push('/koi');
              }
            }}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-1 items-center">
            <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
              Chi tiết
            </Text>
            <Text className="text-2xl font-bold text-white">Cá Koi</Text>
          </View>
          <TouchableOpacity
            className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
            onPress={() => {
              if (koiId)
                router.push(
                  `/koi/edit?id=${koiId}&redirect=${encodeURIComponent((redirect as string) ?? `/koi/${koiId}`)}`
                );
            }}
          >
            <Edit size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Card */}
        <View className="mx-4 mt-4 overflow-hidden rounded-3xl bg-white shadow-lg">
          <View className="items-center p-4">
            {/* Main Image */}
            <View className="mb-4 h-80 w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-gray-100 to-gray-200">
              {isLoading ? (
                <View className="h-full w-full items-center justify-center">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className="mt-2 text-sm text-gray-500">
                    Đang tải...
                  </Text>
                </View>
              ) : koi?.images && koi.images.length > 0 ? (
                <Image
                  source={{ uri: koi.images[0] }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="items-center">
                  <Fish size={64} color="#9ca3af" />
                  <Text className="mt-2 text-sm text-gray-500">
                    Chưa có ảnh
                  </Text>
                </View>
              )}
            </View>

            {/* Basic Info */}
            <View className="w-full items-center">
              <Text className="mb-2 text-3xl font-bold text-gray-900">
                {koi?.rfid ?? 'N/A'}
              </Text>
              <View className="flex-row items-center">
                {koi?.variety?.varietyName && (
                  <View className="rounded-full bg-purple-100 px-3 py-1.5">
                    <Text className="text-base font-semibold text-purple-700">
                      {koi.variety.varietyName}
                    </Text>
                  </View>
                )}

                <View
                  className="ml-2 rounded-full border-2 px-3 py-1.5"
                  style={{
                    backgroundColor: healthColors.bg,
                    borderColor: healthColors.border,
                  }}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: healthColors.text }}
                  >
                    {healthToLabel(koi?.healthStatus as HealthStatus) ??
                      'Không rõ'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="mx-4 mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
          <View className="flex-row border-b border-gray-100">
            <TouchableOpacity
              className={`flex-1 py-4 ${activeTab === 'info' ? 'border-b-2 border-blue-500' : ''}`}
              onPress={() => setActiveTab('info')}
            >
              <Text
                className={`text-center text-base font-semibold ${
                  activeTab === 'info' ? 'text-blue-500' : 'text-gray-500'
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
                className={`text-center text-base font-semibold ${
                  activeTab === 'health' ? 'text-blue-500' : 'text-gray-500'
                }`}
              >
                Sức khỏe
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          <View className="p-5">
            {activeTab === 'info' && (
              <View>
                <Text className="mb-4 text-lg font-bold text-gray-900">
                  Thông tin chi tiết
                </Text>

                <View className="space-y-1">
                  <InfoRow
                    icon={<FishSvg size={20} color="#a855f7" />}
                    iconBg="bg-purple-100"
                    label="Giống cá"
                    value={koi?.variety?.varietyName ?? '-'}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<Layers size={18} color="#3b82f6" />}
                    iconBg="bg-blue-100"
                    label="Loại"
                    value={typeToLabel(koi?.type)}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<VenusAndMars size={18} color="#ec4899" />}
                    iconBg="bg-pink-100"
                    label="Giới tính"
                    value={genderToLabel(koi?.gender as Gender) ?? '-'}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<Calendar size={18} color="#10b981" />}
                    iconBg="bg-emerald-100"
                    label="Ngày sinh"
                    value={formatDate(koi?.birthDate, 'dd/MM/yyyy') ?? '-'}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<Ruler size={18} color="#06b6d4" />}
                    iconBg="bg-cyan-100"
                    label="Kích cỡ"
                    value={getSizeLabel(koi?.size) ?? '-'}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<Blend size={18} color="#6b7280" />}
                    iconBg="bg-gray-100"
                    label="Kiểu hoa văn"
                    value={patternToLabel(koi?.patternType)}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<Coins size={18} color="#16a34a" />}
                    iconBg="bg-green-100"
                    label="Trạng thái bán"
                    value={saleStatusToLabel(koi?.saleStatus)}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<Biohazard size={18} color="#475569" />}
                    iconBg="bg-gray-100"
                    label="Đột biến"
                    value={koi?.isMutated ? 'Có' : 'Không'}
                  />
                  {koi?.isMutated && (
                    <>
                      <View style={{ height: 12 }} />
                      <InfoRow
                        icon={<Dna size={18} color="#64748b" />}
                        iconBg="bg-gray-100"
                        label="Loại đột biến"
                        value={mutationTypeToLabel(koi?.mutationType)}
                      />
                      <View style={{ height: 12 }} />
                      <InfoRow
                        icon={<Percent size={18} color="#94a3b8" />}
                        iconBg="bg-gray-100"
                        label="Tỷ lệ đột biến"
                        value={
                          koi?.mutationRate != null
                            ? `${koi.mutationRate}%`
                            : '-'
                        }
                      />
                    </>
                  )}
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<PondSvg size={18} color="#3b82f6" />}
                    iconBg="bg-blue-100"
                    label="Bể nuôi"
                    value={koi?.pond?.pondName ?? '-'}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<MapPin size={18} color="#f59e0b" />}
                    iconBg="bg-amber-100"
                    label="Xuất xứ"
                    value={koi?.origin ?? '-'}
                  />
                  <View style={{ height: 12 }} />

                  <InfoRow
                    icon={<DollarSign size={18} color="#22c55e" />}
                    iconBg="bg-green-100"
                    label="Giá tiền"
                    value={
                      koi?.sellingPrice ? formatCurrency(koi.sellingPrice) : '-'
                    }
                  />

                  {koi?.description && (
                    <>
                      <View style={{ height: 16 }} />
                      <View className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <Text className="mb-2 text-lg font-semibold">
                          Giới thiệu
                        </Text>
                        <Text className="text-base leading-6">
                          {koi.description}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            )}

            {activeTab === 'health' && (
              <View>
                <Text className="mb-4 text-lg font-bold text-gray-900">
                  Lịch sử sức khỏe
                </Text>

                <View className="items-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12">
                  <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                    <FishSvg size={32} color="#9ca3af" />
                  </View>
                  <Text className="text-sm font-medium text-gray-500">
                    Chưa có lịch sử sức khỏe
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable InfoRow Component
function InfoRow({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactElement;
  iconBg: string;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-center">
      <View
        className={`mr-3 h-10 w-10 items-center justify-center rounded-full ${iconBg}`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-base font-medium text-gray-500">{label}</Text>
        <Text className="text-lg font-semibold text-gray-900">{value}</Text>
      </View>
    </View>
  );
}
