import { useGetClassificationRecords } from '@/hooks/useClassificationRecord';
import React from 'react';
import { Text, View } from 'react-native';

interface ClassificationRecordsListProps {
  classificationStageId: number;
}

export default function ClassificationRecordsList({
  classificationStageId,
}: ClassificationRecordsListProps) {
  const recordsQuery = useGetClassificationRecords(
    {
      classificationStageId,
      pageIndex: 1,
      pageSize: 100,
    },
    !!classificationStageId
  );

  if (recordsQuery.isLoading) {
    return (
      <View className="mt-3 rounded-lg border border-gray-100 bg-white p-3">
        <Text className="text-center text-sm text-gray-500">Đang tải...</Text>
      </View>
    );
  }

  const records = recordsQuery.data?.data ?? [];

  if (records.length === 0) {
    return (
      <View className="mt-3 rounded-lg border border-gray-100 bg-white p-3">
        <Text className="text-center text-sm text-gray-500">
          Chưa có bản ghi tuyển chọn
        </Text>
      </View>
    );
  }

  return (
    <View className="mt-3 rounded-lg border border-gray-100 bg-white p-3">
      {/* Table Header */}
      <View className="mb-1 flex-row rounded bg-gray-50 p-2">
        <Text className="flex-1 text-center text-xs font-medium text-gray-600">
          Lần
        </Text>
        <Text className="flex-1 text-center text-xs font-medium text-gray-600">
          Show
        </Text>
        <Text className="flex-1 text-center text-xs font-medium text-gray-600">
          High
        </Text>
        <Text className="flex-1 text-center text-xs font-medium text-gray-600">
          Pond
        </Text>
        <Text className="flex-1 text-center text-xs font-medium text-gray-600">
          Cull
        </Text>
      </View>

      {/* Table Rows */}
      {records.map((record, index) => (
        <View
          key={record.id}
          className="flex-row border-b border-gray-100 py-1"
        >
          <Text className="flex-1 text-center text-xs text-gray-900">
            {index + 1}
          </Text>
          <Text className="flex-1 text-center text-xs text-gray-900">
            {record.showQualifiedCount ?? 0}
          </Text>
          <Text className="flex-1 text-center text-xs text-gray-900">
            {record.highQualifiedCount ?? 0}
          </Text>
          <Text className="flex-1 text-center text-xs text-gray-900">
            {record.pondQualifiedCount ?? 0}
          </Text>
          <Text className="flex-1 text-center text-xs text-gray-900">
            {record.cullQualifiedCount ?? 0}
          </Text>
        </View>
      ))}
    </View>
  );
}

// Export hook để dùng ở parent component
export function useClassificationRecordsCount(
  classificationStageId: number,
  enabled: boolean
) {
  const recordsQuery = useGetClassificationRecords(
    {
      classificationStageId,
      pageIndex: 1,
      pageSize: 100,
    },
    enabled && !!classificationStageId
  );

  return {
    count: recordsQuery.data?.data?.length ?? 0,
    isLoading: recordsQuery.isLoading,
  };
}
