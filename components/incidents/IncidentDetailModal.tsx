import Loading from '@/components/Loading';
import { useGetIncidentById } from '@/hooks/useIncident';
import {
  IncidentSeverity,
  IncidentStatus,
} from '@/lib/api/services/fetchIncident';
import { KoiFish } from '@/lib/api/services/fetchKoiFish';
import { Pond } from '@/lib/api/services/fetchPond';
import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Fish,
  Plus,
  User,
  Waves,
  X,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import SelectAssetModal from './SelectAssetModal';

interface IncidentDetailModalProps {
  visible: boolean;
  onClose: () => void;
  incidentId: number | null;
}

export default function IncidentDetailModal({
  visible,
  onClose,
  incidentId,
}: IncidentDetailModalProps) {
  const [showSelectAsset, setShowSelectAsset] = useState(false);
  const [selectAssetType, setSelectAssetType] = useState<'koi' | 'pond'>('koi');

  const { data: incident, isLoading } = useGetIncidentById(
    incidentId || 0,
    visible && !!incidentId
  );

  const getSeverityInfo = (severity: IncidentSeverity) => {
    switch (severity) {
      case IncidentSeverity.Urgent:
        return { color: '#dc2626', label: 'Khẩn cấp', bgColor: 'bg-red-100' };
      case IncidentSeverity.High:
        return { color: '#ea580c', label: 'Cao', bgColor: 'bg-orange-100' };
      case IncidentSeverity.Medium:
        return {
          color: '#d97706',
          label: 'Trung bình',
          bgColor: 'bg-amber-100',
        };
      default:
        return { color: '#059669', label: 'Thấp', bgColor: 'bg-emerald-100' };
    }
  };

  const getStatusInfo = (status: IncidentStatus) => {
    switch (status) {
      case IncidentStatus.Resolved:
        return { color: '#059669', label: 'Đã giải quyết' };
      case IncidentStatus.Investigating:
        return { color: '#2563eb', label: 'Đang điều tra' };
      case IncidentStatus.Closed:
        return { color: '#6b7280', label: 'Đã đóng' };
      case IncidentStatus.Cancelled:
        return { color: '#dc2626', label: 'Đã hủy' };
      default:
        return { color: '#d97706', label: 'Đã báo cáo' };
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectAsset = (asset: KoiFish | Pond) => {
    // TODO: Implement add asset to incident
    console.log('Selected asset:', asset);
    setShowSelectAsset(false);
  };

  const handleAddKoi = () => {
    setSelectAssetType('koi');
    setShowSelectAsset(true);
  };

  const handleAddPond = () => {
    setSelectAssetType('pond');
    setShowSelectAsset(true);
  };

  if (!visible) {
    return null;
  }

  return (
    <>
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <View className="max-h-[95%] rounded-t-3xl bg-white">
            {/* Header */}
            <View className="flex-row items-center justify-between border-b border-gray-200 p-6">
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-900">
                  Chi tiết sự cố
                </Text>
                {incident && (
                  <Text className="text-sm text-gray-500">
                    ID: #{incident.id}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={onClose}
                className="rounded-full bg-gray-100 p-2"
              >
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View className="flex-1 items-center justify-center p-8">
                <Loading />
              </View>
            ) : incident ? (
              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
              >
                {/* Basic Info */}
                <View className="border-b border-gray-200 p-6">
                  <View className="mb-4 flex-row items-start justify-between">
                    <View className="flex-1 pr-4">
                      <Text className="mb-2 text-2xl font-bold text-gray-900">
                        {incident.incidentTitle}
                      </Text>
                      <Text className="text-base text-gray-600">
                        {incident.incidentTypeName}
                      </Text>
                    </View>

                    <View className="items-end space-y-2">
                      <View
                        className={`rounded-full px-3 py-1 ${getSeverityInfo(incident.severity).bgColor}`}
                      >
                        <Text
                          className="text-sm font-bold"
                          style={{
                            color: getSeverityInfo(incident.severity).color,
                          }}
                        >
                          {getSeverityInfo(incident.severity).label}
                        </Text>
                      </View>

                      <View className="flex-row items-center">
                        <View
                          className="mr-2 h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: getStatusInfo(incident.status)
                              .color,
                          }}
                        />
                        <Text
                          className="text-sm font-medium"
                          style={{
                            color: getStatusInfo(incident.status).color,
                          }}
                        >
                          {getStatusInfo(incident.status).label}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <Text className="leading-6 text-gray-700">
                    {incident.description}
                  </Text>
                </View>

                {/* Timeline Info */}
                <View className="border-b border-gray-200 p-6">
                  <Text className="mb-4 text-lg font-semibold text-gray-900">
                    Thông tin thời gian
                  </Text>

                  <View className="space-y-3">
                    <View className="flex-row items-center">
                      <Calendar size={18} color="#6b7280" />
                      <View className="ml-3">
                        <Text className="text-sm font-medium text-gray-900">
                          Thời gian xảy ra
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {formatDateTime(incident.occurredAt)}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center">
                      <Clock size={18} color="#6b7280" />
                      <View className="ml-3">
                        <Text className="text-sm font-medium text-gray-900">
                          Thời gian báo cáo
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {formatDateTime(incident.createdAt)}
                        </Text>
                      </View>
                    </View>

                    {incident.resolvedAt && (
                      <View className="flex-row items-center">
                        <CheckCircle size={18} color="#059669" />
                        <View className="ml-3">
                          <Text className="text-sm font-medium text-gray-900">
                            Thời gian giải quyết
                          </Text>
                          <Text className="text-sm text-gray-600">
                            {formatDateTime(incident.resolvedAt)}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Reporter & Resolver */}
                <View className="border-b border-gray-200 p-6">
                  <Text className="mb-4 text-lg font-semibold text-gray-900">
                    Người liên quan
                  </Text>

                  <View className="space-y-3">
                    <View className="flex-row items-center">
                      <User size={18} color="#6b7280" />
                      <View className="ml-3">
                        <Text className="text-sm font-medium text-gray-900">
                          Người báo cáo
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {incident.reportedByUserName}
                        </Text>
                      </View>
                    </View>

                    {incident.resolvedByUserName && (
                      <View className="flex-row items-center">
                        <CheckCircle size={18} color="#059669" />
                        <View className="ml-3">
                          <Text className="text-sm font-medium text-gray-900">
                            Người giải quyết
                          </Text>
                          <Text className="text-sm text-gray-600">
                            {incident.resolvedByUserName}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>

                {/* Affected Assets */}
                <View className="border-b border-gray-200 p-6">
                  <View className="mb-4 flex-row items-center justify-between">
                    <Text className="text-lg font-semibold text-gray-900">
                      Đối tượng bị ảnh hưởng
                    </Text>
                    <View className="flex-row space-x-2">
                      <TouchableOpacity
                        onPress={handleAddKoi}
                        className="flex-row items-center rounded-lg bg-blue-100 px-3 py-2"
                      >
                        <Plus size={16} color="#2563eb" />
                        <View className="ml-1">
                          <Fish size={16} color="#2563eb" />
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={handleAddPond}
                        className="flex-row items-center rounded-lg bg-emerald-100 px-3 py-2"
                      >
                        <Plus size={16} color="#059669" />
                        <View className="ml-1">
                          <Waves size={16} color="#059669" />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Koi Fish */}
                  {incident.koiIncidents.length > 0 && (
                    <View className="mb-4">
                      <Text className="mb-2 text-base font-medium text-blue-600">
                        Cá Koi ({incident.koiIncidents.length})
                      </Text>
                      {incident.koiIncidents.map((koiIncident) => (
                        <View
                          key={koiIncident.id}
                          className="mb-2 rounded-lg border border-blue-200 bg-blue-50 p-3"
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                              <Text className="font-medium text-gray-900">
                                Cá #{koiIncident.koiFishId}
                              </Text>
                              <Text className="text-sm text-gray-600">
                                Trạng thái: {koiIncident.affectedStatus}
                              </Text>
                              <Text className="text-sm text-gray-600">
                                Triệu chứng: {koiIncident.specificSymptoms}
                              </Text>
                            </View>
                            <View className="items-end">
                              {koiIncident.requiresTreatment && (
                                <View className="mb-1 rounded-full bg-orange-100 px-2 py-1">
                                  <Text className="text-xs font-medium text-orange-800">
                                    Cần điều trị
                                  </Text>
                                </View>
                              )}
                              {koiIncident.isIsolated && (
                                <View className="rounded-full bg-red-100 px-2 py-1">
                                  <Text className="text-xs font-medium text-red-800">
                                    Đã cách ly
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Ponds */}
                  {incident.pondIncidents.length > 0 && (
                    <View className="mb-4">
                      <Text className="mb-2 text-base font-medium text-emerald-600">
                        Ao nuôi ({incident.pondIncidents.length})
                      </Text>
                      {incident.pondIncidents.map((pondIncident) => (
                        <View
                          key={pondIncident.id}
                          className="mb-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3"
                        >
                          <View className="flex-row items-center justify-between">
                            <View className="flex-1">
                              <Text className="font-medium text-gray-900">
                                Ao #{pondIncident.pondId}
                              </Text>
                              <Text className="text-sm text-gray-600">
                                Thay đổi môi trường:{' '}
                                {pondIncident.environmentalChanges}
                              </Text>
                              {pondIncident.fishDiedCount > 0 && (
                                <Text className="text-sm text-red-600">
                                  Cá chết: {pondIncident.fishDiedCount}
                                </Text>
                              )}
                            </View>
                            <View>
                              {pondIncident.requiresWaterChange && (
                                <View className="rounded-full bg-blue-100 px-2 py-1">
                                  <Text className="text-xs font-medium text-blue-800">
                                    Cần thay nước
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {incident.koiIncidents.length === 0 &&
                    incident.pondIncidents.length === 0 && (
                      <View className="items-center py-8">
                        <View className="mb-4 rounded-full bg-gray-100 p-4">
                          <Eye size={32} color="#6b7280" />
                        </View>
                        <Text className="text-gray-500">
                          Chưa có đối tượng nào bị ảnh hưởng
                        </Text>
                        <Text className="text-center text-sm text-gray-400">
                          Nhấn nút + để thêm cá hoặc ao bị ảnh hưởng
                        </Text>
                      </View>
                    )}
                </View>

                {/* Resolution Notes */}
                {incident.resolutionNotes && (
                  <View className="p-6">
                    <Text className="mb-3 text-lg font-semibold text-gray-900">
                      Ghi chú giải quyết
                    </Text>
                    <View className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <Text className="leading-6 text-gray-700">
                        {incident.resolutionNotes}
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            ) : (
              <View className="flex-1 items-center justify-center p-8">
                <Text className="text-gray-500">Không tìm thấy sự cố</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <SelectAssetModal
        visible={showSelectAsset}
        onClose={() => setShowSelectAsset(false)}
        type={selectAssetType}
        onSelect={handleSelectAsset}
      />
    </>
  );
}
