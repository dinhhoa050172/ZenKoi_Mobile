import Loading from '@/components/Loading';
import { useGetIncidentById, useResolveIncident } from '@/hooks/useIncident';
import { useGetKoiFishById } from '@/hooks/useKoiFish';
import { useGetPondById } from '@/hooks/usePond';
import {
  IncidentSeverity,
  IncidentStatus,
  KoiIncident,
  PondIncident,
} from '@/lib/api/services/fetchIncident';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  Droplets,
  Edit,
  FileText,
  Fish,
  Heart,
  Settings,
  Shield,
  TrendingUp,
  User,
  Waves,
  XCircle,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Platform,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const incidentId = parseInt(id as string, 10);
  const [isResolving, setIsResolving] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const router = useRouter();
  const { data: incident, isLoading, refetch } = useGetIncidentById(incidentId);
  const resolveMutation = useResolveIncident();
  const incidentData = incident;

  useEffect(() => {
    if (incidentData) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [incidentData, fadeAnim, slideAnim]);

  const handleBack = () => {
    router.back();
  };

  const handleEdit = () => {
    router.push(`/incidents/edit?id=${incidentData?.id}`);
  };

  const handleResolveIncident = () => {
    if (!incidentData) return;

    Alert.alert(
      'Xác nhận giải quyết',
      'Bạn có chắc chắn muốn đánh dấu sự cố này là đã giải quyết?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          style: 'default',
          onPress: async () => {
            setIsResolving(true);
            try {
              await resolveMutation.mutateAsync({
                id: incidentData.id,
                resolution: { resolutionNotes: 'Đã giải quyết thành công' },
              });
              refetch();
            } catch (error) {
              console.error('Error resolving incident:', error);
            } finally {
              setIsResolving(false);
            }
          },
        },
      ]
    );
  };

  const getSeverityInfo = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.Urgent:
        return {
          icon: <AlertTriangle size={24} color="white" />,
          colors: ['#dc2626', '#b91c1c'] as const,
          bgColor: '#fef2f2',
          textColor: '#991b1b',
          label: 'Khẩn cấp',
        };
      case IncidentSeverity.High:
        return {
          icon: <AlertCircle size={24} color="white" />,
          colors: ['#ea580c', '#c2410c'] as const,
          bgColor: '#fff7ed',
          textColor: '#c2410c',
          label: 'Cao',
        };
      case IncidentSeverity.Medium:
        return {
          icon: <Activity size={24} color="white" />,
          colors: ['#d97706', '#b45309'] as const,
          bgColor: '#fffbeb',
          textColor: '#b45309',
          label: 'Trung bình',
        };
      default:
        return {
          icon: <Shield size={24} color="white" />,
          colors: ['#059669', '#047857'] as const,
          bgColor: '#f0fdf4',
          textColor: '#047857',
          label: 'Thấp',
        };
    }
  };

  const getStatusInfo = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.Resolved:
        return {
          icon: <CheckCircle size={20} color="#059669" />,
          color: '#059669',
          bgColor: '#f0fdf4',
          label: 'Đã giải quyết',
        };
      case IncidentStatus.Investigating:
        return {
          icon: <AlertCircle size={20} color="#2563eb" />,
          color: '#2563eb',
          bgColor: '#eff6ff',
          label: 'Đang điều tra',
        };
      case IncidentStatus.Closed:
        return {
          icon: <XCircle size={20} color="#6b7280" />,
          color: '#6b7280',
          bgColor: '#f9fafb',
          label: 'Đã đóng',
        };
      case IncidentStatus.Cancelled:
        return {
          icon: <XCircle size={20} color="#dc2626" />,
          color: '#dc2626',
          bgColor: '#fef2f2',
          label: 'Đã hủy',
        };
      default:
        return {
          icon: <AlertTriangle size={20} color="#d97706" />,
          color: '#d97706',
          bgColor: '#fffbeb',
          label: 'Đã báo cáo',
        };
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      time: date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 rounded-2xl bg-white p-8 shadow-lg">
          <Loading />
        </View>
      </SafeAreaView>
    );
  }

  if (!incidentData) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center rounded-2xl bg-white p-8 shadow-lg">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle size={32} color="#dc2626" />
            </View>
            <Text className="mb-2 text-xl font-bold text-gray-900">
              Không tìm thấy sự cố
            </Text>
            <Text className="mb-6 text-center text-base text-gray-500">
              Sự cố này có thể đã bị xóa hoặc không tồn tại
            </Text>
            <TouchableOpacity
              onPress={handleBack}
              className="rounded-2xl bg-blue-500 px-6 py-3"
            >
              <Text className="font-semibold text-white">Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const severityInfo = getSeverityInfo(incidentData.severity);
  const statusInfo = getStatusInfo(incidentData.status);
  const dateTime = formatDateTime(incidentData.occurredAt);

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={severityInfo.colors[0]}
      />
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#0f172a' }}>
        {/* Modern Header with Glassmorphism */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <LinearGradient
            colors={severityInfo.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="relative overflow-hidden"
            style={{
              paddingTop: Platform.OS === 'ios' ? 60 : 20,
              paddingBottom: 40,
              paddingHorizontal: 24,
              borderBottomLeftRadius: 32,
              borderBottomRightRadius: 32,
            }}
          >
            {/* Decorative Elements */}
            <View className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-white/10" />
            <View className="absolute -left-8 top-20 h-24 w-24 rounded-full bg-white/5" />

            {/* Header Navigation */}
            <View className="mb-8 flex-row items-center justify-between">
              <TouchableOpacity
                onPress={handleBack}
                className="flex-row items-center rounded-2xl bg-white/20 px-4 py-3 backdrop-blur-sm"
                activeOpacity={0.8}
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
              >
                <ChevronLeft size={20} color="white" />
                <Text className="ml-2 text-base font-semibold text-white">
                  Quay lại
                </Text>
              </TouchableOpacity>

              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={handleEdit}
                  className="rounded-2xl bg-white/20 p-3 backdrop-blur-sm"
                  activeOpacity={0.8}
                >
                  <Edit size={20} color="white" />
                </TouchableOpacity>

                <View className="rounded-2xl bg-white/30 px-4 py-3 backdrop-blur-sm">
                  <Text className="text-sm font-bold text-white">
                    #{incidentData.incidentTitle.split('-')[0]}
                  </Text>
                </View>
              </View>
            </View>

            {/* Incident Title & Type */}
            <View className="mb-6">
              <Text className="mb-2 text-3xl font-bold leading-tight text-white">
                {incidentData.incidentTitle}
              </Text>
              <View className="flex-row items-center">
                <View className="mr-3 rounded-full bg-white/20 px-3 py-1">
                  <Text className="text-sm font-medium text-white">
                    {incidentData.incidentTypeName}
                  </Text>
                </View>
                {severityInfo.icon}
                <Text className="ml-2 text-lg font-semibold text-white">
                  {severityInfo.label}
                </Text>
              </View>
            </View>

            {/* Status & DateTime Card */}
            <View className="flex-row space-x-4">
              <View className="flex-1 rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
                <View className="flex-row items-center">
                  {statusInfo.icon}
                  <Text className="ml-2 text-sm font-medium text-white">
                    Trạng thái
                  </Text>
                </View>
                <Text className="mt-1 text-base font-bold text-white">
                  {statusInfo.label}
                </Text>
              </View>

              <View className="flex-1 rounded-2xl bg-white/15 p-4 backdrop-blur-sm">
                <View className="flex-row items-center">
                  <Calendar size={16} color="white" />
                  <Text className="ml-2 text-sm font-medium text-white">
                    Xảy ra lúc
                  </Text>
                </View>
                <Text className="mt-1 text-base font-bold text-white">
                  {dateTime.time}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Main Content */}
        <Animated.ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          style={{ opacity: fadeAnim }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 120,
          }}
        >
          {/* Description Card */}
          {incidentData.description && (
            <View
              className="mb-6 overflow-hidden rounded-3xl bg-slate-800/90 backdrop-blur-xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 24,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={['rgba(100, 116, 139, 0.1)', 'transparent']}
                className="p-6"
              >
                <View className="mb-4 flex-row items-center">
                  <View className="rounded-2xl bg-blue-500/20 p-3">
                    <FileText size={20} color="#60a5fa" />
                  </View>
                  <Text className="ml-4 text-lg font-bold text-white">
                    Mô tả chi tiết
                  </Text>
                </View>
                <Text className="text-base leading-7 text-slate-300">
                  {incidentData.description}
                </Text>
              </LinearGradient>
            </View>
          )}

          {/* Timeline & Reporter Card */}
          <View
            className="mb-6 overflow-hidden rounded-3xl bg-slate-800/90 backdrop-blur-xl"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 24,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={['rgba(59, 130, 246, 0.1)', 'transparent']}
              className="p-6"
            >
              <View className="mb-6 flex-row items-center">
                <View className="rounded-2xl bg-purple-500/20 p-3">
                  <Clock size={20} color="#a78bfa" />
                </View>
                <Text className="ml-4 text-lg font-bold text-white">
                  Thông tin thời gian
                </Text>
              </View>

              <View className="mb-6 flex-1 gap-4">
                <View className="flex-row items-center justify-between gap-2 rounded-2xl bg-slate-700/50 p-4">
                  <View>
                    <Text className="text-sm font-medium text-slate-400">
                      Ngày xảy ra
                    </Text>
                    <Text className="text-base font-bold text-white">
                      {dateTime.date}
                    </Text>
                  </View>
                  <View className="rounded-2xl bg-blue-500/20 px-3 py-2">
                    <Text className="text-sm font-bold text-blue-400">
                      {dateTime.time}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center justify-between rounded-2xl bg-slate-700/50 p-4">
                  <View>
                    <Text className="text-sm font-medium text-slate-400">
                      Được báo cáo bởi
                    </Text>
                    <Text className="text-base font-bold text-white">
                      {incidentData.reportedByUserName}
                    </Text>
                  </View>
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                    <User size={20} color="white" />
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Affected Assets */}
          {(incidentData.koiIncidents.length > 0 ||
            incidentData.pondIncidents.length > 0) && (
            <View
              className="mb-6 overflow-hidden rounded-3xl bg-slate-800/90 backdrop-blur-xl"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 24,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={['rgba(34, 197, 94, 0.1)', 'transparent']}
                className="p-6"
              >
                <View className="mb-6 flex-row items-center">
                  <View className="rounded-2xl bg-emerald-500/20 p-3">
                    <Settings size={20} color="#34d399" />
                  </View>
                  <Text className="ml-4 text-lg font-bold text-white">
                    Tài sản bị ảnh hưởng
                  </Text>
                </View>

                {/* Affected Koi */}
                {incidentData.koiIncidents.length > 0 && (
                  <View className="mb-6">
                    <View className="mb-4 flex-row items-center">
                      <Fish size={20} color="#60a5fa" />
                      <Text className="ml-3 text-base font-bold text-blue-400">
                        Cá Koi bị ảnh hưởng ({incidentData.koiIncidents.length})
                      </Text>
                    </View>
                    <View className="flex-1 gap-4">
                      {incidentData.koiIncidents.map(
                        (koiIncident: KoiIncident, index: number) => (
                          <ModernKoiIncidentCard
                            key={index}
                            koiIncident={koiIncident}
                          />
                        )
                      )}
                    </View>
                  </View>
                )}

                {/* Affected Ponds */}
                {incidentData.pondIncidents.length > 0 && (
                  <View>
                    <View className="mb-4 flex-row items-center">
                      <Waves size={20} color="#34d399" />
                      <Text className="ml-3 text-base font-bold text-emerald-400">
                        Ao nuôi bị ảnh hưởng (
                        {incidentData.pondIncidents.length})
                      </Text>
                    </View>
                    <View className="flex-1 gap-4">
                      {incidentData.pondIncidents.map(
                        (pondIncident: PondIncident, index: number) => (
                          <ModernPondIncidentCard
                            key={index}
                            pondIncident={pondIncident}
                          />
                        )
                      )}
                    </View>
                  </View>
                )}
              </LinearGradient>
            </View>
          )}

          {/* Resolution Notes */}
          {incidentData.resolutionNotes && (
            <View
              className="mb-6 overflow-hidden rounded-3xl bg-slate-800/90 backdrop-blur-xl"
              style={{
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 24,
                elevation: 8,
              }}
            >
              <LinearGradient
                colors={['rgba(16, 185, 129, 0.2)', 'transparent']}
                className="p-6"
              >
                <View className="mb-4 flex-row items-center">
                  <View className="rounded-2xl bg-emerald-500/30 p-3">
                    <CheckCircle size={20} color="#10b981" />
                  </View>
                  <Text className="ml-4 text-lg font-bold text-emerald-400">
                    Ghi chú giải quyết
                  </Text>
                </View>
                <View className="rounded-2xl bg-emerald-500/10 p-4">
                  <Text className="text-base leading-7 text-emerald-300">
                    {incidentData.resolutionNotes}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          )}
        </Animated.ScrollView>

        {/* Modern Floating Action Buttons */}
        {incidentData.status !== IncidentStatus.Resolved &&
          incidentData.status !== IncidentStatus.Closed && (
            <Animated.View
              className="absolute bottom-8 left-6 right-6"
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              }}
            >
              <TouchableOpacity
                onPress={handleResolveIncident}
                disabled={isResolving}
                activeOpacity={0.9}
                style={{
                  shadowColor: '#10b981',
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.4,
                  shadowRadius: 20,
                  elevation: 12,
                }}
              >
                <LinearGradient
                  colors={['#10b981', '#059669', '#047857']}
                  className="overflow-hidden rounded-3xl"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View className="flex-row items-center justify-center px-8 py-5">
                    {isResolving ? (
                      <Activity size={24} color="white" />
                    ) : (
                      <CheckCircle size={24} color="white" />
                    )}
                    <Text className="ml-3 text-lg font-bold text-white">
                      {isResolving ? 'Đang xử lý...' : 'Đánh dấu đã giải quyết'}
                    </Text>
                  </View>
                  <View className="absolute inset-0 bg-white/10" />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
      </SafeAreaView>
    </>
  );
}

// Modern Koi Incident Card Component
function ModernKoiIncidentCard({ koiIncident }: { koiIncident: KoiIncident }) {
  const { data: koi } = useGetKoiFishById(koiIncident.koiFishId, true);

  const getAffectedStatusInfo = (status: string) => {
    switch (status) {
      case 'Healthy':
        return {
          icon: <Heart size={18} color="#10b981" />,
          color: '#10b981',
          bgColor: 'rgba(16, 185, 129, 0.2)',
          label: 'Khỏe mạnh',
        };
      case 'Warning':
        return {
          icon: <AlertTriangle size={18} color="#f59e0b" />,
          color: '#f59e0b',
          bgColor: 'rgba(245, 158, 11, 0.2)',
          label: 'Cảnh báo',
        };
      case 'Sick':
        return {
          icon: <AlertTriangle size={18} color="#ef4444" />,
          color: '#ef4444',
          bgColor: 'rgba(239, 68, 68, 0.2)',
          label: 'Bệnh',
        };
      case 'Dead':
        return {
          icon: <XCircle size={18} color="#991b1b" />,
          color: '#991b1b',
          bgColor: 'rgba(153, 27, 27, 0.2)',
          label: 'Chết',
        };
      default:
        return {
          icon: <AlertCircle size={18} color="#6b7280" />,
          color: '#6b7280',
          bgColor: 'rgba(107, 114, 128, 0.2)',
          label: 'Không rõ',
        };
    }
  };

  const statusInfo = getAffectedStatusInfo(koiIncident.affectedStatus);

  return (
    <View className="overflow-hidden rounded-2xl bg-slate-700/50 backdrop-blur-sm">
      <LinearGradient
        colors={['rgba(59, 130, 246, 0.1)', 'transparent']}
        className="p-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="mb-2 flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-600">
                <Fish size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-white">
                  {koi?.rfid || `Cá #${koiIncident.koiFishId}`}
                </Text>
                {koi?.variety && (
                  <Text className="text-sm text-slate-300">
                    {koi.variety.varietyName} •{' '}
                    {koi.gender === 'Male' ? 'Đực' : 'Cái'}
                  </Text>
                )}
              </View>
              <View
                className="rounded-2xl px-3 py-2"
                style={{ backgroundColor: statusInfo.bgColor }}
              >
                <View className="flex-row items-center">
                  {statusInfo.icon}
                  <Text
                    className="ml-2 text-sm font-bold"
                    style={{ color: statusInfo.color }}
                  >
                    {statusInfo.label}
                  </Text>
                </View>
              </View>
            </View>

            {/* Symptoms & Treatment */}
            {koiIncident.specificSymptoms && (
              <View className="mb-2 rounded-2xl bg-slate-600/30 p-3">
                <Text className="mb-1 text-xs font-medium text-slate-400">
                  Triệu chứng
                </Text>
                <Text className="text-sm text-slate-200 ">
                  {koiIncident.specificSymptoms}
                </Text>
              </View>
            )}

            {koiIncident.requiresTreatment && (
              <View className="mb-2 flex-row items-center space-x-2">
                <View className="rounded-full bg-red-500/20 px-2 py-1">
                  <Text className="text-xs font-medium text-red-400">
                    Cần điều trị
                  </Text>
                </View>
                {koiIncident.isIsolated && (
                  <View className="rounded-full bg-yellow-500/20 px-2 py-1">
                    <Text className="text-xs font-medium text-yellow-400">
                      Đã cách ly
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

// Modern Pond Incident Card Component
function ModernPondIncidentCard({
  pondIncident,
}: {
  pondIncident: PondIncident;
}) {
  const { data: pond } = useGetPondById(pondIncident.pondId, true);

  return (
    <View className="overflow-hidden rounded-2xl bg-slate-700/50 backdrop-blur-sm">
      <LinearGradient
        colors={['rgba(34, 197, 94, 0.1)', 'transparent']}
        className="p-4"
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <View className="mb-3 flex-row items-center">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600">
                <Waves size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-white">
                  {pond?.pondName || `Ao #${pondIncident.pondId}`}
                </Text>
                {pond && (
                  <View className="mt-1 flex-row items-center space-x-3">
                    <View className="flex-row items-center">
                      <Droplets size={12} color="#64748b" />
                      <Text className="ml-1 text-xs text-slate-400">
                        {pond.capacityLiters}L
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <TrendingUp size={12} color="#64748b" />
                      <Text className="ml-1 text-xs text-slate-400">
                        {pond.depthMeters}m sâu
                      </Text>
                    </View>
                  </View>
                )}
              </View>
              <View className="rounded-2xl bg-emerald-500/20 px-3 py-2">
                <Text className="text-xs font-bold text-emerald-400">
                  Bị ảnh hưởng
                </Text>
              </View>
            </View>

            {/* Environmental Changes */}
            {pondIncident.environmentalChanges && (
              <View className="mb-2 rounded-2xl bg-slate-600/30 p-3">
                <Text className="mb-1 text-xs font-medium text-slate-400">
                  Thay đổi môi trường
                </Text>
                <Text className="text-sm text-slate-200">
                  {pondIncident.environmentalChanges}
                </Text>
              </View>
            )}

            {/* Actions & Status */}
            <View className="flex-row items-center space-x-2">
              {pondIncident.requiresWaterChange && (
                <View className="rounded-full bg-blue-500/20 px-2 py-1">
                  <Text className="text-xs font-medium text-blue-400">
                    Cần thay nước
                  </Text>
                </View>
              )}
              {pondIncident.fishDiedCount > 0 && (
                <View className="rounded-full bg-red-500/20 px-2 py-1">
                  <Text className="text-xs font-medium text-red-400">
                    {pondIncident.fishDiedCount} cá chết
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
