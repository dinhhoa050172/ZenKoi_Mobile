import { CustomAlert } from '@/components/CustomAlert';
import RecordDetailModal from '@/components/water/RecordDetailModal';
import {
  useDeleteWaterParameterRecord,
  useGetWaterParameterRecords,
} from '@/hooks/useWaterParameterRecord';
import type { WaterParameterRecord } from '@/lib/api/services/fetchWaterParameterRecord';
import { formatDateSmart } from '@/lib/utils/formatDate';
import { router } from 'expo-router';
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  Eye,
  Trash2,
} from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

const TRUNCATE_LENGTH = 100;

interface ActivityHistoryProps {
  pondId: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ActivityHistory({
  pondId,
  isExpanded,
  onToggle,
}: ActivityHistoryProps) {
  const [showAll, setShowAll] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<number | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<WaterParameterRecord | null>(null);

  const { data, isLoading, isError } = useGetWaterParameterRecords(
    { pondId, pageIndex: 1, pageSize: 10 },
    isExpanded
  );

  const records = useMemo(() => data?.data ?? [], [data]);
  const displayed = showAll ? records : records.slice(0, 4);

  const deleteMutation = useDeleteWaterParameterRecord();

  const handleConfirmDelete = async () => {
    if (!targetDeleteId) return;
    try {
      await deleteMutation.mutateAsync(targetDeleteId);
    } catch (err) {
      console.log('Delete error: ', err);
    } finally {
      setConfirmVisible(false);
      setTargetDeleteId(null);
    }
  };

  return (
    <View className="mb-4 rounded-2xl bg-white shadow-sm">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between p-4"
      >
        <Text className="text-lg font-semibold text-gray-900">
          Lịch sử hoạt động
        </Text>
        {isExpanded ? (
          <ChevronUp size={20} color="#6b7280" />
        ) : (
          <ChevronDown size={20} color="#6b7280" />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-4 pb-4">
          {/* (Create record button moved to WaterParameters) */}

          {isLoading && (
            <View className="py-6">
              <ActivityIndicator />
            </View>
          )}

          {isError ? (
            <Text className="py-4 text-center text-red-600">
              Không thể tải lịch sử hoạt động
            </Text>
          ) : !isLoading && records.length === 0 ? (
            <View className="py-6">
              <Text className="text-center text-gray-600">
                Chưa có bản ghi hoạt động
              </Text>
            </View>
          ) : null}

          <View className="space-y-3">
            {displayed.map((rec) => (
              <View key={String(rec.id)} className="mb-3 flex-row items-start">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Clock size={14} color="#3b82f6" />
                </View>

                <View className="flex-1">
                  <View className="flex-row items-start justify-between">
                    <Text className="font-medium text-gray-900">
                      Đo chất lượng nước
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {formatDateSmart(rec.recordedAt)}
                    </Text>
                  </View>

                  <View className="mt-2 flex-row items-center justify-between">
                    <Text className="text-sm text-gray-600">
                      pH: {rec.phLevel} · Nhiệt độ: {rec.temperatureCelsius}°C
                    </Text>

                    <View className="flex-row items-center">
                      <TouchableOpacity
                        onPress={() => {
                          setSelectedRecord(rec as WaterParameterRecord);
                          setDetailVisible(true);
                        }}
                        className="mr-3 rounded-lg bg-gray-100 p-2"
                        accessibilityLabel="Chi tiết bản ghi"
                      >
                        <Eye size={16} color="#0ea5e9" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          router.push(
                            `/water/edit-record?id=${rec.id}&redirect=pondDetail&redirectId=${pondId}`
                          )
                        }
                        className="mr-3 rounded-lg bg-gray-100 p-2"
                        accessibilityLabel="Sửa bản ghi"
                      >
                        <Edit size={16} color="#0ea5e9" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setTargetDeleteId(Number(rec.id));
                          setConfirmVisible(true);
                        }}
                        className="rounded-lg bg-gray-100 p-2"
                        accessibilityLabel="Xóa bản ghi"
                      >
                        <Trash2 size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {rec.notes ? (
                    <Text className="mt-2 text-sm text-gray-500">
                      {rec.notes.length > TRUNCATE_LENGTH
                        ? rec.notes.slice(0, TRUNCATE_LENGTH) + '...'
                        : rec.notes}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>

          {!showAll && records.length > 4 && (
            <TouchableOpacity
              onPress={() => setShowAll(true)}
              className="mt-4 py-2"
            >
              <Text className="text-center font-medium text-blue-500">
                Xem tất cả lịch sử
              </Text>
            </TouchableOpacity>
          )}

          {showAll && records.length > 4 && (
            <TouchableOpacity
              onPress={() => setShowAll(false)}
              className="mt-4 py-2"
            >
              <Text className="text-center font-medium text-blue-500">
                Thu gọn
              </Text>
            </TouchableOpacity>
          )}

          <CustomAlert
            visible={confirmVisible}
            title="Xóa bản ghi"
            message="Bạn có chắc muốn xóa bản ghi này? Hành động không thể hoàn tác."
            onCancel={() => {
              setConfirmVisible(false);
              setTargetDeleteId(null);
            }}
            onConfirm={handleConfirmDelete}
            cancelText="Hủy"
            confirmText="Xóa"
            type="danger"
          />

          <RecordDetailModal
            visible={detailVisible}
            record={selectedRecord}
            onClose={() => setDetailVisible(false)}
          />
        </View>
      )}
    </View>
  );
}
