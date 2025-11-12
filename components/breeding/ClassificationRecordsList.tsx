import { useGetClassificationRecords } from '@/hooks/useClassificationRecord';
import { Award, TrendingUp } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import FishSvg from '../icons/FishSvg';

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
      <View className="mt-4">
        <Text className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Lịch sử tuyển chọn
        </Text>
        <View className="items-center rounded-2xl border border-gray-200 bg-white p-8">
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text className="mt-3 text-sm text-gray-600">
            Đang tải dữ liệu...
          </Text>
        </View>
      </View>
    );
  }

  const records = recordsQuery.data?.data ?? [];

  if (records.length === 0) {
    return (
      <View className="mt-4">
        <Text className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Lịch sử tuyển chọn
        </Text>
        <View className="items-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-12">
          <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-gray-200">
            <FishSvg size={32} color="#9ca3af" />
          </View>
          <Text className="text-sm font-medium text-gray-500">
            Chưa có bản ghi tuyển chọn
          </Text>
          <Text className="mt-1 text-xs text-gray-400">
            Bản ghi sẽ xuất hiện khi bạn thực hiện tuyển chọn
          </Text>
        </View>
      </View>
    );
  }

  // Calculate totals
  const totals = records.reduce(
    (acc, record) => ({
      show: acc.show + (record.showQualifiedCount ?? 0),
      high: acc.high + (record.highQualifiedCount ?? 0),
      pond: acc.pond + (record.pondQualifiedCount ?? 0),
      cull: acc.cull + (record.cullQualifiedCount ?? 0),
    }),
    { show: 0, high: 0, pond: 0, cull: 0 }
  );

  return (
    <View className="mt-4">
      <Text className="mb-3 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
        Lịch sử tuyển chọn
      </Text>

      {/* Summary Cards */}
      <View className="mb-3 flex-row">
        <View className="mr-2 flex-1 rounded-2xl border border-purple-200 bg-purple-50 p-3">
          <View className="mb-1 flex-row items-center">
            <Award size={14} color="#a855f7" />
            <Text className="ml-1 text-xs font-medium text-purple-700">
              Show
            </Text>
          </View>
          <Text className="text-xl font-bold text-purple-900">
            {totals.show}
          </Text>
        </View>

        <View className="mx-1 flex-1 rounded-2xl border border-blue-200 bg-blue-50 p-3">
          <View className="mb-1 flex-row items-center">
            <TrendingUp size={14} color="#3b82f6" />
            <Text className="ml-1 text-xs font-medium text-blue-700">High</Text>
          </View>
          <Text className="text-xl font-bold text-blue-900">{totals.high}</Text>
        </View>

        <View className="ml-2 flex-1 rounded-2xl border border-green-200 bg-green-50 p-3">
          <View className="mb-1 flex-row items-center">
            <FishSvg size={14} color="#22c55e" />
            <Text className="ml-1 text-xs font-medium text-green-700">
              Pond
            </Text>
          </View>
          <Text className="text-xl font-bold text-green-900">
            {totals.pond}
          </Text>
        </View>
      </View>

      {/* Records Table */}
      <View className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {/* Table Header */}
        <View className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <View className="flex-row items-center">
            <View className="w-12">
              <Text className="ml-2 text-xs font-semibold text-gray-600">
                #
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-center text-xs font-semibold text-gray-600">
                Show
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-center text-xs font-semibold text-gray-600">
                High
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-center text-xs font-semibold text-gray-600">
                Pond
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-center text-xs font-semibold text-gray-600">
                Cull
              </Text>
            </View>
          </View>
        </View>

        {/* Table Rows */}
        <ScrollView style={{ maxHeight: 300 }}>
          {records.map((record, index) => (
            <View
              key={record.id}
              className={`flex-row items-center px-4 py-3 ${
                index < records.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <View className="w-12">
                <View className="h-6 w-6 items-center justify-center rounded-full bg-gray-100">
                  <Text className="text-xs font-semibold text-gray-700">
                    {index + 1}
                  </Text>
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-center text-sm font-medium text-purple-600">
                  {record.showQualifiedCount ?? 0}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-center text-sm font-medium text-blue-600">
                  {record.highQualifiedCount ?? 0}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-center text-sm font-medium text-green-600">
                  {record.pondQualifiedCount ?? 0}
                </Text>
              </View>
              <View className="flex-1">
                <View className="items-center">
                  {(record.cullQualifiedCount ?? 0) > 0 ? (
                    <View className="rounded-full bg-red-100 px-2 py-0.5">
                      <Text className="text-xs font-semibold text-red-700">
                        {record.cullQualifiedCount}
                      </Text>
                    </View>
                  ) : (
                    <View className="rounded-full bg-red-100 px-2 py-0.5">
                      <Text className="text-xs font-semibold text-red-700">
                        0
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Total Row */}
        <View className="border-t-2 border-gray-300 bg-gray-50 px-4 py-3">
          <View className="flex-row items-center">
            <View className="w-12">
              <Text className="text-sm font-bold text-gray-700">Tổng</Text>
            </View>
            <View className="flex-1">
              <Text className="text-center text-sm font-bold text-purple-700">
                {totals.show}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-center text-sm font-bold text-blue-700">
                {totals.high}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-center text-sm font-bold text-green-700">
                {totals.pond}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-center text-sm font-bold text-red-700">
                {totals.cull}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Info Note */}
      <View className="mt-3 rounded-2xl border border-blue-100 bg-blue-50 p-3">
        <Text className="text-base text-blue-700">
          <Text className="font-semibold">Tổng số lần tuyển chọn:</Text>{' '}
          {records.length} lần
        </Text>
      </View>
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
