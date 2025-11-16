import PondSvg from '@/components/icons/PondSvg';
import {
  WorkSchedule,
  WorkScheduleStatus,
} from '@/lib/api/services/fetchWorkSchedule';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, Clock, MapPin } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface TaskCardProps {
  task: WorkSchedule;
  onPress: (task: WorkSchedule) => void;
}

export default function TaskCard({ task, onPress }: TaskCardProps) {
  // const isCompleted = task.status === WorkScheduleStatus.COMPLETED;

  type StatusInfo = {
    textColor: string;
    bgColor: string;
    borderColor: string;
    gradient: [string, string];
    tagBg: string;
    tagText: string;
    iconColor: string;
    label: string;
    accentColor: string;
  };

  const getStatusInfo = (): StatusInfo => {
    switch (task.status) {
      case WorkScheduleStatus.COMPLETED:
        return {
          textColor: 'text-green-900',
          bgColor: 'bg-white',
          borderColor: 'border-green-200',
          gradient: ['#10b981', '#059669'],
          tagBg: 'bg-green-500',
          tagText: 'text-white',
          iconColor: '#059669',
          label: '✓ Hoàn thành',
          accentColor: '#10b981',
        };
      case WorkScheduleStatus.IN_PROGRESS:
        return {
          textColor: 'text-blue-900',
          bgColor: 'bg-white',
          borderColor: 'border-blue-200',
          gradient: ['#3b82f6', '#2563eb'],
          tagBg: 'bg-blue-500',
          tagText: 'text-white',
          iconColor: '#2563eb',
          label: '● Đang thực hiện',
          accentColor: '#3b82f6',
        };
      case WorkScheduleStatus.CANCELLED:
        return {
          textColor: 'text-red-900',
          bgColor: 'bg-white',
          borderColor: 'border-red-200',
          gradient: ['#ef4444', '#dc2626'],
          tagBg: 'bg-red-500',
          tagText: 'text-white',
          iconColor: '#dc2626',
          label: '✕ Đã hủy',
          accentColor: '#ef4444',
        };
      case WorkScheduleStatus.IN_COMPLETE:
        return {
          textColor: 'text-orange-900',
          bgColor: 'bg-white',
          borderColor: 'border-orange-200',
          gradient: ['#f97316', '#ea580c'],
          tagBg: 'bg-orange-500',
          tagText: 'text-white',
          iconColor: '#ea580c',
          label: '! Chưa hoàn thành',
          accentColor: '#f97316',
        };
      default:
        return {
          textColor: 'text-gray-800',
          bgColor: 'bg-white',
          borderColor: 'border-gray-300',
          gradient: ['#6b7280', '#4b5563'],
          tagBg: 'bg-gray-500',
          tagText: 'text-white',
          iconColor: '#6b7280',
          label: '○ Chờ thực hiện',
          accentColor: '#6b7280',
        };
    }
  };

  const statusInfo = getStatusInfo();

  const formatTime = (t?: string) => {
    if (!t) return '—';
    // Handle formats like "HH:mm:ss", "H:mm", or full datetime strings
    const m = String(t).match(/(\d{1,2}):(\d{2})/);
    if (m) {
      const hh = m[1].padStart(2, '0');
      const mm = m[2];
      return `${hh}:${mm}`;
    }
    return String(t);
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(task)}
      activeOpacity={0.7}
      className="mb-3"
    >
      <View
        className={`overflow-hidden rounded-2xl ${statusInfo.bgColor} border-2 ${statusInfo.borderColor} shadow-md`}
        style={{
          elevation: 3,
          shadowColor: statusInfo.accentColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }}
      >
        {/* Accent Bar */}
        <View
          className="h-1.5 w-full"
          style={{ backgroundColor: statusInfo.accentColor }}
        />

        <View className="p-4">
          {/* Header Row */}
          <View className="mb-3 flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text
                className={`mb-1 text-lg font-black leading-6 ${statusInfo.textColor}`}
              >
                {task.taskTemplateName}
              </Text>
              {task.taskTemplate?.description && (
                <Text
                  className={`text-base leading-5 ${statusInfo.textColor} opacity-70`}
                >
                  {task.taskTemplate.description}
                </Text>
              )}
            </View>

            {/* Status Badge */}
            <View
              className="overflow-hidden rounded-full"
              style={{ elevation: 2 }}
            >
              <LinearGradient
                colors={statusInfo.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="px-3 py-1.5"
              >
                <Text className="text-sm font-bold text-white">
                  {statusInfo.label}
                </Text>
              </LinearGradient>
            </View>
          </View>

          {/* Info Grid */}
          <View className="space-y-2.5">
            {/* Pond Information */}
            {task.pondAssignments.length > 0 && (
              <View className="flex-row items-center">
                <View
                  className="mr-3 h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: statusInfo.accentColor + '20' }}
                >
                  <PondSvg size={16} color={statusInfo.iconColor} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-sm font-semibold uppercase tracking-wide ${statusInfo.textColor} opacity-60`}
                  >
                    Hồ cá
                  </Text>
                  <Text
                    className={`text-base font-bold ${statusInfo.textColor}`}
                  >
                    {task.pondAssignments
                      .map((pond) => pond.pondName)
                      .join(', ')}
                  </Text>
                </View>
              </View>
            )}

            {/* Time and Staff Row */}
            <View className="flex-row items-center justify-between">
              {/* Time */}
              <View className="flex-1 flex-row items-center">
                <View
                  className="mr-3 h-8 w-8 items-center justify-center rounded-full"
                  style={{ backgroundColor: statusInfo.accentColor + '20' }}
                >
                  <Clock size={16} color={statusInfo.iconColor} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`text-sm font-semibold uppercase tracking-wide ${statusInfo.textColor} opacity-60`}
                  >
                    Thời gian
                  </Text>
                  <Text
                    className={`text-base font-bold ${statusInfo.textColor}`}
                  >
                    {formatTime(task.startTime)} - {formatTime(task.endTime)}
                  </Text>
                </View>
              </View>

              {/* Staff Assignment */}
              {task.staffAssignments.length > 0 && (
                <View className="flex-1 flex-row items-center">
                  <View
                    className="mr-3 h-8 w-8 items-center justify-center rounded-full"
                    style={{ backgroundColor: statusInfo.accentColor + '20' }}
                  >
                    <MapPin size={16} color={statusInfo.iconColor} />
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`text-sm font-semibold uppercase tracking-wide ${statusInfo.textColor} opacity-60`}
                    >
                      Nhân viên
                    </Text>
                    <Text
                      className={`text-base font-bold ${statusInfo.textColor}`}
                    >
                      {task.staffAssignments
                        .map((staff) => staff.staffName)
                        .join(', ')}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Notes Section */}
            {task.notes && (
              <View
                className="mt-2 rounded-xl border p-3"
                style={{
                  borderColor: statusInfo.accentColor + '40',
                  backgroundColor: statusInfo.accentColor + '08',
                }}
              >
                <Text
                  className={`text-sm font-semibold uppercase tracking-wide ${statusInfo.textColor} mb-1 opacity-60`}
                >
                  Ghi chú
                </Text>
                <Text className={`text-base leading-5 ${statusInfo.textColor}`}>
                  {task.notes}
                </Text>
              </View>
            )}
          </View>

          {/* Bottom Action Indicator */}
          <View
            className="mt-3 flex-row items-center justify-between border-t pt-3"
            style={{ borderColor: statusInfo.accentColor + '30' }}
          >
            <Text
              className={`text-sm font-bold ${statusInfo.textColor} opacity-60`}
            >
              Nhấn để xem chi tiết
            </Text>
            <ChevronRight size={16} color={statusInfo.iconColor} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
