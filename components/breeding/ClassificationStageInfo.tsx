import { useGetClassificationRecordSummary } from '@/hooks/useClassificationRecord';
import { useGetClassificationStageByBreedingProcessId } from '@/hooks/useClassificationStage';
import { ClassificationStatus } from '@/lib/api/services/fetchClassificationStage';
import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface ClassificationStageInfoProps {
  breedingProcessId: number;
}

const getClassificationStatusText = (status: ClassificationStatus) => {
  const map = {
    [ClassificationStatus.PREPARING]: 'Đang chuẩn bị',
    [ClassificationStatus.STAGE1]: 'Giai đoạn 1',
    [ClassificationStatus.STAGE2]: 'Giai đoạn 2',
    [ClassificationStatus.STAGE3]: 'Giai đoạn 3',
    [ClassificationStatus.STAGE4]: 'Giai đoạn 4',
    [ClassificationStatus.SUCCESS]: 'Thành công',
  };
  return map[status] || status;
};

const getStatusColor = (status: ClassificationStatus) => {
  const map = {
    [ClassificationStatus.PREPARING]: '#3b82f6',
    [ClassificationStatus.STAGE1]: '#eab308',
    [ClassificationStatus.STAGE2]: '#f59e0b',
    [ClassificationStatus.STAGE3]: '#f97316',
    [ClassificationStatus.STAGE4]: '#ec4899',
    [ClassificationStatus.SUCCESS]: '#10b981',
  };
  return map[status] || '#6b7280';
};

export default function ClassificationStageInfo({
  breedingProcessId,
}: ClassificationStageInfoProps) {
  const classificationStageQuery = useGetClassificationStageByBreedingProcessId(
    breedingProcessId,
    !!breedingProcessId
  );

  const summaryQuery = useGetClassificationRecordSummary(
    classificationStageQuery.data?.id || 0,
    !!classificationStageQuery.data?.id
  );

  if (classificationStageQuery.isLoading) {
    return (
      <View className="rounded-2xl bg-white p-4 shadow-sm">
        <View className="flex-row items-center justify-center">
          <ActivityIndicator size="small" color="#6366f1" />
          <Text className="ml-2 text-sm text-gray-600">
            Đang tải thông tin...
          </Text>
        </View>
      </View>
    );
  }

  if (classificationStageQuery.error || !classificationStageQuery.data) {
    return (
      <View className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
        <Text className="text-center text-sm text-gray-600">
          Chưa có thông tin giai đoạn tuyển chọn
        </Text>
      </View>
    );
  }

  const stage = classificationStageQuery.data;
  const summary = summaryQuery.data;
  const statusColor = getStatusColor(stage.status);

  return (
    <View className="overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Header */}
      <View className="border-b border-gray-100 px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-semibold text-gray-900">
            Thông tin tuyển chọn
          </Text>
          <View
            className="rounded-full px-3 py-1"
            style={{ backgroundColor: statusColor + '20' }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: statusColor }}
            >
              {getClassificationStatusText(stage.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View className="p-4">
        {summaryQuery.isLoading ? (
          <View className="flex-row items-center justify-center py-2">
            <ActivityIndicator size="small" color="#6366f1" />
            <Text className="ml-2 text-sm text-gray-500">
              Đang tải thống kê...
            </Text>
          </View>
        ) : summary ? (
          <>
            {/* Current Fish Count */}
            <View className="mb-3  rounded-2xl bg-indigo-50 p-3">
              <Text className="mb-1 text-xs text-gray-600">Số cá hiện tại</Text>
              <Text className="text-2xl font-bold text-indigo-600">
                {summary.currentFish?.toLocaleString() || 0}
              </Text>
            </View>

            {/* Classification Breakdown */}
            <View className="flex-row flex-wrap gap-2">
              <StatBadge
                label="Show"
                value={summary.totalShowQualified ?? 0}
                color="#10b981"
              />
              <StatBadge
                label="High"
                value={summary.totalHighQualified ?? 0}
                color="#3b82f6"
              />
              <StatBadge
                label="Pond"
                value={summary.totalPondQualified ?? 0}
                color="#eab308"
              />
              <StatBadge
                label="Cull"
                value={summary.totalCullQualified ?? 0}
                color="#ef4444"
              />
            </View>
          </>
        ) : (
          <Text className="text-center text-sm text-gray-500">
            Chưa có dữ liệu thống kê
          </Text>
        )}

        {/* Notes */}
        {stage.notes && (
          <View className="mt-3  rounded-2xl bg-gray-50 p-3">
            <Text className="text-xs font-medium text-gray-600">Ghi chú</Text>
            <Text className="mt-1 text-sm text-gray-900">{stage.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const StatBadge = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => (
  <View className="min-w-[45%] flex-1  rounded-2xl border border-gray-200 bg-white p-3">
    <Text className="text-xs text-gray-600">{label}</Text>
    <Text className="text-lg font-bold" style={{ color }}>
      {value}
    </Text>
  </View>
);
