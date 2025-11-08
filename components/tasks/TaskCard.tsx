import PondSvg from '@/components/icons/PondSvg';
import {
  WorkSchedule,
  WorkScheduleStatus,
} from '@/lib/api/services/fetchWorkSchedule';
import { CheckCircle, Clock, MapPin } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface TaskCardProps {
  task: WorkSchedule;
  onPress: (task: WorkSchedule) => void;
}

export default function TaskCard({ task, onPress }: TaskCardProps) {
  const isCompleted = task.status === WorkScheduleStatus.COMPLETED;

  const getStatusInfo = () => {
    switch (task.status) {
      case WorkScheduleStatus.COMPLETED:
        return {
          textColor: 'text-green-800',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          tagBg: 'bg-green-100',
          tagText: 'text-green-800',
          iconColor: '#059669',
          label: 'Hoàn thành',
        };
      case WorkScheduleStatus.IN_PROGRESS:
        return {
          textColor: 'text-blue-800',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          tagBg: 'bg-blue-100',
          tagText: 'text-blue-800',
          iconColor: '#2563eb',
          label: 'Đang thực hiện',
        };
      case WorkScheduleStatus.CANCELLED:
        return {
          textColor: 'text-red-800',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          tagBg: 'bg-red-100',
          tagText: 'text-red-800',
          iconColor: '#dc2626',
          label: 'Đã hủy',
        };
      case WorkScheduleStatus.IN_COMPLETE:
        return {
          textColor: 'text-orange-800',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          tagBg: 'bg-orange-100',
          tagText: 'text-orange-800',
          iconColor: '#ea580c',
          label: 'Chưa hoàn thành',
        };
      default:
        return {
          textColor: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          tagBg: 'bg-gray-100',
          tagText: 'text-gray-700',
          iconColor: '#6b7280',
          label: 'Chờ thực hiện',
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <TouchableOpacity
      onPress={() => onPress(task)}
      className={`mb-3 rounded-xl p-4 ${statusInfo.bgColor} border ${statusInfo.borderColor} shadow-sm`}
    >
      {/* Status Tag - Top Right */}
      <View className="absolute right-3 top-3 z-10">
        <View className={`rounded-full px-3 py-1 ${statusInfo.tagBg}`}>
          <Text className={`text-xs font-bold ${statusInfo.tagText}`}>
            {statusInfo.label}
          </Text>
        </View>
      </View>

      <View className="mb-2 flex-row items-center justify-between pr-20">
        <Text className={`font-semibold ${statusInfo.textColor}`}>
          {task.taskTemplateName}
        </Text>
        {isCompleted && <CheckCircle size={20} color={statusInfo.iconColor} />}
      </View>

      {/* Pond Information */}
      {task.pondAssignments.length > 0 && (
        <View className="mb-1 flex-row items-center">
          <PondSvg size={14} color={statusInfo.iconColor} />
          <Text className={`ml-1 text-sm ${statusInfo.textColor}`}>
            {task.pondAssignments.map((pond) => pond.pondName).join(', ')}
          </Text>
        </View>
      )}

      {/* Task Description */}
      {task.taskTemplate?.description && (
        <Text className={`mb-2 text-sm ${statusInfo.textColor}`}>
          {task.taskTemplate.description}
        </Text>
      )}

      <View className="flex-row items-center justify-between">
        {/* Staff Assignment */}
        {task.staffAssignments.length > 0 && (
          <View className="flex-row items-center">
            <MapPin size={14} color={statusInfo.iconColor} />
            <Text className={`ml-1 text-sm ${statusInfo.textColor}`}>
              {task.staffAssignments.map((staff) => staff.staffName).join(', ')}
            </Text>
          </View>
        )}

        {/* Time */}
        <View className="flex-row items-center">
          <Clock size={14} color={statusInfo.iconColor} />
          <Text className={`ml-1 text-sm ${statusInfo.textColor}`}>
            {task.startTime} - {task.endTime}
          </Text>
        </View>
      </View>

      {/* Notes Preview */}
      {task.notes && (
        <Text
          className={`mt-2 text-xs italic ${statusInfo.textColor}`}
          numberOfLines={2}
        >
          Ghi chú: {task.notes}
        </Text>
      )}
    </TouchableOpacity>
  );
}
