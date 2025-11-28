import { useGetIncidents } from '@/hooks/useIncident';
import { formatDate } from '@/lib/utils/formatDate';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import ContextMenuField from '../ContextMenuField';

interface IncidentReportingProps {
  pondId: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function IncidentReporting({
  pondId,
  isExpanded,
  onToggle,
}: IncidentReportingProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedIncidentType, setSelectedIncidentType] = useState('Cá chết');
  const [incidentDescription, setIncidentDescription] = useState('');
  const [fishCount, setFishCount] = useState('');
  const [showAll, setShowAll] = useState(false);

  const incidentsQuery = useGetIncidents(true, { PondId: pondId });
  const incidents = incidentsQuery.data?.data ?? [];

  const incidentTypeOptions = [
    { label: 'Cá chết', value: 'Cá chết' },
    { label: 'Cá bệnh', value: 'Cá bệnh' },
    { label: 'Chất lượng nước xấu', value: 'Chất lượng nước xấu' },
    { label: 'Thiết bị hỏng', value: 'Thiết bị hỏng' },
    { label: 'Khác', value: 'Khác' },
  ];

  // Use incidents from API (fetched via useGetIncidents)

  const handleSubmitIncident = () => {
    if (!incidentDescription.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Vui lòng nhập mô tả sự cố',
        position: 'top',
      });
      return;
    }

    // TODO: Implement API call to submit incident
    console.log(`Submitting incident for pond ${pondId}:`, {
      type: selectedIncidentType,
      description: incidentDescription,
      fishCount: fishCount ? parseInt(fishCount) : undefined,
    });

    Toast.show({
      type: 'success',
      text1: 'Thành công',
      text2: 'Đã báo cáo sự cố',
      position: 'top',
      visibilityTime: 3000,
    });

    // Reset form
    setIncidentDescription('');
    setFishCount('');
    setSelectedIncidentType('Cá chết');
    setIsModalVisible(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          border: 'border-red-200',
          bg: 'bg-red-50',
          text: 'text-red-800',
          subtext: 'text-red-700',
          icon: '#ef4444',
        };
      case 'medium':
        return {
          border: 'border-yellow-200',
          bg: 'bg-yellow-50',
          text: 'text-yellow-800',
          subtext: 'text-yellow-700',
          icon: '#f59e0b',
        };
      case 'low':
        return {
          border: 'border-blue-200',
          bg: 'bg-blue-50',
          text: 'text-blue-800',
          subtext: 'text-blue-700',
          icon: '#3b82f6',
        };
      default:
        return {
          border: 'border-gray-200',
          bg: 'bg-gray-50',
          text: 'text-gray-800',
          subtext: 'text-gray-700',
          icon: '#6b7280',
        };
    }
  };

  const displayedIncidents = showAll ? incidents : incidents.slice(0, 3);

  return (
    <View className="mb-4 rounded-2xl bg-white shadow-sm">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between p-4"
      >
        <Text className="text-lg font-semibold text-gray-900">
          Sự cố gần đây
        </Text>
        {isExpanded ? (
          <ChevronUp size={20} color="#6b7280" />
        ) : (
          <ChevronDown size={20} color="#6b7280" />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-4 pb-4">
          {/* New incident button removed - using API data instead */}

          {/* Recent Incidents */}
          <View className="mt-3">
            {incidentsQuery.isFetching ? (
              <View className="h-40 items-center justify-center">
                <ActivityIndicator size="small" color="#0A3D62" />
                <Text className="mt-2 text-sm text-gray-500">
                  Đang tải sự cố...
                </Text>
              </View>
            ) : incidentsQuery.isError ? (
              <View className="h-40 items-center justify-center">
                <Text className="text-sm text-red-600">
                  Không thể tải dữ liệu sự cố.
                </Text>
                <Text className="mt-1 text-xs text-gray-500">
                  {String((incidentsQuery.error as any)?.message ?? '')}
                </Text>
              </View>
            ) : incidents.length === 0 ? (
              <View className="h-40 items-center justify-center">
                <AlertTriangle size={36} color="#9ca3af" />
                <Text className="mt-2 text-sm text-gray-500">
                  Hiện chưa có sự cố
                </Text>
              </View>
            ) : (
              <>
                {displayedIncidents.map((incident: any) => {
                  const rawSeverity = String(
                    incident.severity ?? ''
                  ).toLowerCase();
                  const severityKey =
                    rawSeverity === 'urgent' ? 'high' : rawSeverity;
                  const colors = getSeverityColor(severityKey);

                  const incidentType =
                    incident.incidentTypeName ||
                    incident.incidentTitle ||
                    'Sự cố';
                  const description = incident.description || '-';
                  const fishCount = incident.koiIncidents
                    ? incident.koiIncidents.length
                    : 0;
                  const time = incident.occurredAt || incident.createdAt || '';

                  return (
                    <View
                      key={String(incident.id)}
                      className={`mb-3 flex-row items-start rounded-2xl border ${colors.border} ${colors.bg} p-3`}
                    >
                      <AlertTriangle
                        size={16}
                        color={colors.icon}
                        className="mr-2 mt-1"
                      />
                      <View className="ml-2 flex-1">
                        <Text className={`font-medium ${colors.text}`}>
                          {incidentType}
                          {fishCount > 0 && ` (${fishCount} con)`}
                        </Text>
                        <Text className={`text-sm ${colors.subtext}`}>
                          {description}
                        </Text>
                      </View>
                      <Text className={`mt-1 text-xs ${colors.subtext}`}>
                        {formatDate(time, 'HH:mm dd/MM/yyyy')}
                      </Text>
                    </View>
                  );
                })}

                {!showAll && incidents.length > 3 && (
                  <TouchableOpacity
                    onPress={() => setShowAll(true)}
                    className="py-2"
                  >
                    <Text className="text-center font-medium text-blue-500">
                      Xem tất cả sự cố
                    </Text>
                  </TouchableOpacity>
                )}

                {showAll && (
                  <TouchableOpacity
                    onPress={() => setShowAll(false)}
                    className="py-2"
                  >
                    <Text className="text-center font-medium text-blue-500">
                      Thu gọn
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      )}

      {/* Report Incident Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-4">
          <View
            className="w-full max-w-md rounded-2xl bg-white p-6"
            style={{ maxHeight: '80%' }}
          >
            <Text className="mb-4 text-xl font-bold text-gray-900">
              Báo cáo sự cố
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Incident Type */}
              <ContextMenuField
                label="Loại sự cố *"
                value={selectedIncidentType}
                options={incidentTypeOptions}
                onSelect={setSelectedIncidentType}
                placeholder="Chọn loại sự cố"
              />

              {/* Fish Count - only show for fish-related incidents */}
              {(selectedIncidentType === 'Cá chết' ||
                selectedIncidentType === 'Cá bệnh') && (
                <View className="mb-4">
                  <Text className="mb-2 font-medium text-gray-700">
                    Số lượng cá{' '}
                    {selectedIncidentType === 'Cá chết' ? 'chết' : 'bệnh'}
                  </Text>
                  <TextInput
                    placeholder="VD: 2"
                    value={fishCount}
                    onChangeText={setFishCount}
                    className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3"
                    keyboardType="numeric"
                  />
                </View>
              )}

              {/* Description */}
              <View className="mb-4">
                <Text className="mb-2 font-medium text-gray-700">
                  Mô tả chi tiết <Text className="text-red-500">*</Text>
                </Text>
                <TextInput
                  placeholder="Mô tả tình trạng, nguyên nhân có thể, các biện pháp đã thực hiện..."
                  value={incidentDescription}
                  onChangeText={setIncidentDescription}
                  className="rounded-lg border border-gray-300 bg-gray-50 px-4 py-3"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Action Buttons */}
            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setIsModalVisible(false);
                  setIncidentDescription('');
                  setFishCount('');
                }}
                className="flex-1 rounded-lg bg-gray-500 py-3"
              >
                <Text className="text-center font-medium text-white">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitIncident}
                className="flex-1 rounded-lg bg-red-500 py-3"
              >
                <Text className="text-center font-medium text-white">
                  Báo cáo
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
