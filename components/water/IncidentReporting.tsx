import { useGetIncidents } from '@/hooks/useIncident';
import { Incident } from '@/lib/api/services/fetchIncident';
import { formatDate } from '@/lib/utils/formatDate';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

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
  const [showAll, setShowAll] = useState(false);

  const incidentsQuery = useGetIncidents(true, { PondId: pondId });
  const incidents = incidentsQuery.data?.data ?? [];

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
                <AlertTriangle size={40} color="#9ca3af" />
                <Text className="mt-2 text-base text-gray-500">
                  Hiện chưa có sự cố
                </Text>
              </View>
            ) : (
              <>
                {displayedIncidents.map((incident: Incident) => {
                  const rawSeverity = String(
                    incident.incidentType?.defaultSeverity ?? ''
                  ).toLowerCase();
                  const severityKey =
                    rawSeverity === 'urgent' ? 'high' : rawSeverity;
                  const colors = getSeverityColor(severityKey);

                  const incidentType =
                    incident.incidentType?.name ||
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
                        <Text
                          className={`text-base font-medium ${colors.text}`}
                        >
                          {incidentType}
                          {fishCount > 0 && ` (${fishCount} con)`}
                        </Text>
                        <Text className={`text-sm ${colors.subtext}`}>
                          {description}
                        </Text>
                      </View>
                      <Text className={`mt-1 text-sm ${colors.subtext}`}>
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
    </View>
  );
}
