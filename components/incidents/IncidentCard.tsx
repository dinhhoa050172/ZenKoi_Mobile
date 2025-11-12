import {
  Incident,
  IncidentSeverity,
  IncidentStatus,
} from '@/lib/api/services/fetchIncident';
import {
  AlertTriangle,
  Calendar,
  Clock,
  Fish,
  User,
  Waves,
} from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface IncidentCardProps {
  incident: Incident;
  onPress: (incident: Incident) => void;
}

export default function IncidentCard({ incident, onPress }: IncidentCardProps) {
  const getSeverityInfo = () => {
    switch (incident.severity) {
      case IncidentSeverity.Urgent:
        return {
          color: '#dc2626',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          tagBg: 'bg-red-100',
          tagText: 'text-red-800',
          label: 'Khẩn cấp',
        };
      case IncidentSeverity.High:
        return {
          color: '#ea580c',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          tagBg: 'bg-orange-100',
          tagText: 'text-orange-800',
          label: 'Cao',
        };
      case IncidentSeverity.Medium:
        return {
          color: '#d97706',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          tagBg: 'bg-amber-100',
          tagText: 'text-amber-800',
          label: 'Trung bình',
        };
      default:
        return {
          color: '#059669',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          tagBg: 'bg-emerald-100',
          tagText: 'text-emerald-800',
          label: 'Thấp',
        };
    }
  };

  const getStatusInfo = () => {
    switch (incident.status) {
      case IncidentStatus.Resolved:
        return {
          color: '#059669',
          label: 'Đã giải quyết',
        };
      case IncidentStatus.Investigating:
        return {
          color: '#2563eb',
          label: 'Đang điều tra',
        };
      case IncidentStatus.Closed:
        return {
          color: '#6b7280',
          label: 'Đã đóng',
        };
      case IncidentStatus.Cancelled:
        return {
          color: '#dc2626',
          label: 'Đã hủy',
        };
      default:
        return {
          color: '#d97706',
          label: 'Đã báo cáo',
        };
    }
  };

  const severityInfo = getSeverityInfo();
  const statusInfo = getStatusInfo();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(incident)}
      className={`mb-4 rounded-2xl border p-4 shadow-sm ${severityInfo.bgColor} ${severityInfo.borderColor}`}
      style={{
        shadowColor: severityInfo.color,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {/* Header with Title and Severity */}
      <View className="mb-3 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text
            className="mb-1 text-lg font-bold text-gray-900"
            numberOfLines={2}
          >
            {incident.incidentTitle}
          </Text>
          <Text className="text-sm font-medium text-gray-600">
            {incident.incidentTypeName}
          </Text>
        </View>
        <View className={`rounded-full px-3 py-1 ${severityInfo.tagBg}`}>
          <Text className={`text-xs font-bold ${severityInfo.tagText}`}>
            {severityInfo.label}
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text className="mb-3 text-sm text-gray-700" numberOfLines={2}>
        {incident.description}
      </Text>

      {/* Status and Reporter */}
      <View className="mb-3 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <AlertTriangle size={14} color={statusInfo.color} />
          <Text
            className="ml-1 text-sm font-medium"
            style={{ color: statusInfo.color }}
          >
            {statusInfo.label}
          </Text>
        </View>
        <View className="flex-row items-center">
          <User size={14} color="#6b7280" />
          <Text className="ml-1 text-sm text-gray-600">
            {incident.reportedByUserName}
          </Text>
        </View>
      </View>

      {/* Affected Items */}
      <View className="mb-3 flex-row items-center space-x-4">
        {incident.koiIncidents.length > 0 && (
          <View className="flex-row items-center">
            <Fish size={14} color="#2563eb" />
            <Text className="ml-1 text-sm text-blue-600">
              {incident.koiIncidents.length} cá
            </Text>
          </View>
        )}
        {incident.pondIncidents.length > 0 && (
          <View className="flex-row items-center">
            <Waves size={14} color="#059669" />
            <Text className="ml-1 text-sm text-emerald-600">
              {incident.pondIncidents.length} ao
            </Text>
          </View>
        )}
      </View>

      {/* Footer with Date and Time */}
      <View className="flex-row items-center justify-between border-t border-gray-200 pt-3">
        <View className="flex-row items-center">
          <Calendar size={14} color="#6b7280" />
          <Text className="ml-1 text-xs text-gray-500">
            {formatDate(incident.occurredAt)}
          </Text>
        </View>
        <View className="flex-row items-center">
          <Clock size={14} color="#6b7280" />
          <Text className="ml-1 text-xs text-gray-500">
            {formatTime(incident.occurredAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
