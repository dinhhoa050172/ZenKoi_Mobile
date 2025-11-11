import Loading from '@/components/Loading';
import { useGetIncidentById, useResolveIncident } from '@/hooks/useIncident';
import { useGetKoiFishById } from '@/hooks/useKoiFish';
import { useGetPondById } from '@/hooks/usePond';
import {
  IncidentSeverity,
  IncidentStatus,
} from '@/lib/api/services/fetchIncident';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  Droplets,
  FileText,
  Fish,
  Heart,
  Settings,
  Shield,
  User,
  Waves,
  XCircle,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
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

  const { data: incident, isLoading, refetch } = useGetIncidentById(incidentId);
  const resolveMutation = useResolveIncident();

  const incidentData = incident;

  const handleBack = () => {
    router.back();
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
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View className="flex-1 items-center justify-center">
          <View className="rounded-2xl bg-white p-8 shadow-lg">
            <Loading />
            <Text className="mt-4 text-center text-lg font-medium text-gray-600">
              Đang tải chi tiết sự cố...
            </Text>
          </View>
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
              className="rounded-xl bg-blue-500 px-6 py-3"
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
      <SafeAreaView className="flex-1" style={{ backgroundColor: '#f8fafc' }}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={severityInfo.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pb-8 pt-4"
        >
          <View className="mb-6 flex-row items-center justify-between">
            <TouchableOpacity
              onPress={handleBack}
              className="flex-row items-center"
              activeOpacity={0.8}
            >
              <ChevronLeft size={24} color="white" />
              <Text className="ml-2 text-lg font-semibold text-white">
                Chi tiết sự cố
              </Text>
            </TouchableOpacity>

            <View className="rounded-full bg-white/20 px-4 py-2">
              <Text className="text-sm font-bold text-white">
                #{incidentData.id}
              </Text>
            </View>
          </View>

          {/* Severity and Status */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              {severityInfo.icon}
              <Text className="ml-3 text-xl font-bold text-white">
                {severityInfo.label}
              </Text>
            </View>

            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
            >
              <View className="flex-row items-center">
                {statusInfo.icon}
                <Text className="ml-2 text-sm font-semibold text-white">
                  {statusInfo.label}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {/* Main Info Card */}
          <View className="-mt-4 mb-6 rounded-2xl bg-white p-6 shadow-lg">
            <Text className="mb-3 text-2xl font-bold text-gray-900">
              {incidentData.incidentTitle}
            </Text>

            <View className="mb-4 rounded-xl bg-gray-50 p-4">
              <Text className="mb-1 text-sm font-medium text-gray-500">
                Loại sự cố
              </Text>
              <Text className="text-lg font-semibold text-gray-900">
                {incidentData.incidentTypeName}
              </Text>
            </View>

            {incidentData.description && (
              <View className="mb-4">
                <View className="mb-2 flex-row items-center">
                  <FileText size={18} color="#6b7280" />
                  <Text className="ml-2 text-base font-semibold text-gray-700">
                    Mô tả chi tiết
                  </Text>
                </View>
                <Text className="text-base leading-6 text-gray-600">
                  {incidentData.description}
                </Text>
              </View>
            )}

            {/* DateTime Info */}
            <View className="flex-row items-center justify-between rounded-xl bg-blue-50 p-4">
              <View className="flex-row items-center">
                <Calendar size={18} color="#2563eb" />
                <View className="ml-3">
                  <Text className="text-sm font-medium text-blue-600">
                    Ngày xảy ra
                  </Text>
                  <Text className="text-base font-semibold text-blue-900">
                    {dateTime.date}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center">
                <Clock size={18} color="#2563eb" />
                <View className="ml-3">
                  <Text className="text-sm font-medium text-blue-600">
                    Thời gian
                  </Text>
                  <Text className="text-base font-semibold text-blue-900">
                    {dateTime.time}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Reporter Info */}
          <View className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
            <View className="mb-4 flex-row items-center">
              <User size={20} color="#6b7280" />
              <Text className="ml-2 text-lg font-bold text-gray-900">
                Người báo cáo
              </Text>
            </View>

            <View className="flex-row items-center rounded-xl bg-gray-50 p-4">
              <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <User size={24} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">
                  {incidentData.reportedByUserName}
                </Text>
                <Text className="text-sm text-gray-500">
                  Báo cáo lúc {dateTime.time} • {dateTime.date}
                </Text>
              </View>
            </View>
          </View>

          {/* Affected Assets */}
          {(incidentData.koiIncidents.length > 0 ||
            incidentData.pondIncidents.length > 0) && (
            <View className="mb-6 rounded-2xl bg-white p-6 shadow-lg">
              <View className="mb-4 flex-row items-center">
                <Settings size={20} color="#6b7280" />
                <Text className="ml-2 text-lg font-bold text-gray-900">
                  Tài sản bị ảnh hưởng
                </Text>
              </View>

              {/* Affected Koi */}
              {incidentData.koiIncidents.length > 0 && (
                <View className="mb-4">
                  <View className="mb-3 flex-row items-center">
                    <Fish size={18} color="#2563eb" />
                    <Text className="ml-2 text-base font-semibold text-blue-900">
                      Cá Koi ({incidentData.koiIncidents.length})
                    </Text>
                  </View>
                  {incidentData.koiIncidents.map(
                    (koiIncident: any, index: number) => (
                      <KoiIncidentCard key={index} koiIncident={koiIncident} />
                    )
                  )}
                </View>
              )}

              {/* Affected Ponds */}
              {incidentData.pondIncidents.length > 0 && (
                <View>
                  <View className="mb-3 flex-row items-center">
                    <Waves size={18} color="#059669" />
                    <Text className="ml-2 text-base font-semibold text-emerald-900">
                      Ao nuôi ({incidentData.pondIncidents.length})
                    </Text>
                  </View>
                  {incidentData.pondIncidents.map(
                    (pondIncident: any, index: number) => (
                      <PondIncidentCard
                        key={index}
                        pondIncident={pondIncident}
                      />
                    )
                  )}
                </View>
              )}
            </View>
          )}

          {/* Resolution Notes */}
          {incidentData.resolutionNotes && (
            <View className="mb-6 rounded-2xl bg-green-50 p-6 shadow-lg">
              <View className="mb-4 flex-row items-center">
                <CheckCircle size={20} color="#059669" />
                <Text className="ml-2 text-lg font-bold text-green-900">
                  Ghi chú giải quyết
                </Text>
              </View>
              <Text className="text-base leading-6 text-green-800">
                {incidentData.resolutionNotes}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Action Button */}
        {incidentData.status !== IncidentStatus.Resolved &&
          incidentData.status !== IncidentStatus.Closed && (
            <View className="absolute bottom-6 left-6 right-6">
              <TouchableOpacity
                onPress={handleResolveIncident}
                disabled={isResolving}
                activeOpacity={0.8}
                style={{
                  shadowColor: '#059669',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.3,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <LinearGradient
                  colors={['#059669', '#047857']}
                  className="flex-row items-center justify-center rounded-2xl py-4"
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <CheckCircle size={24} color="white" />
                  <Text className="ml-3 text-lg font-bold text-white">
                    {isResolving ? 'Đang xử lý...' : 'Đánh dấu đã giải quyết'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
      </SafeAreaView>
    </>
  );
}

// Component for Koi Incident Card
function KoiIncidentCard({ koiIncident }: { koiIncident: any }) {
  const { data: koiData } = useGetKoiFishById(koiIncident.koiId, true);
  const koi = koiData;

  const getAffectedStatusInfo = (status: string) => {
    switch (status) {
      case 'Healthy':
        return {
          icon: <Heart size={16} color="#059669" />,
          color: '#059669',
          label: 'Khỏe mạnh',
        };
      case 'Sick':
        return {
          icon: <AlertTriangle size={16} color="#dc2626" />,
          color: '#dc2626',
          label: 'Bệnh',
        };
      case 'Dead':
        return {
          icon: <XCircle size={16} color="#991b1b" />,
          color: '#991b1b',
          label: 'Chết',
        };
      default:
        return {
          icon: <AlertCircle size={16} color="#d97706" />,
          color: '#d97706',
          label: 'Không rõ',
        };
    }
  };

  const statusInfo = getAffectedStatusInfo(koiIncident.affectedStatus);

  return (
    <View className="mb-3 rounded-xl bg-blue-50 p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {koi?.rfid || `Cá #${koiIncident.koiId}`}
          </Text>
          {koi?.variety && (
            <Text className="text-sm text-gray-600">
              {koi.variety.varietyName} •{' '}
              {koi.gender === 'Male' ? 'Đực' : 'Cái'}
            </Text>
          )}
        </View>

        <View className="flex-row items-center">
          {statusInfo.icon}
          <Text
            className="ml-1 text-sm font-medium"
            style={{ color: statusInfo.color }}
          >
            {statusInfo.label}
          </Text>
        </View>
      </View>
    </View>
  );
}

// Component for Pond Incident Card
function PondIncidentCard({ pondIncident }: { pondIncident: any }) {
  const { data: pondData } = useGetPondById(pondIncident.pondId, true);
  const pond = pondData;

  return (
    <View className="mb-3 rounded-xl bg-emerald-50 p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {pond?.pondName || `Ao #${pondIncident.pondId}`}
          </Text>
          {pond && (
            <View className="mt-1 flex-row items-center space-x-4">
              <View className="flex-row items-center">
                <Droplets size={14} color="#6b7280" />
                <Text className="ml-1 text-sm text-gray-600">
                  {pond.capacityLiters}L
                </Text>
              </View>
              <View className="flex-row items-center">
                <Settings size={14} color="#6b7280" />
                <Text className="ml-1 text-sm text-gray-600">
                  {pond.depthMeters}m
                </Text>
              </View>
            </View>
          )}
        </View>

        <View className="rounded-full bg-emerald-100 px-3 py-1">
          <Text className="text-xs font-medium text-emerald-800">
            Bị ảnh hưởng
          </Text>
        </View>
      </View>
    </View>
  );
}
