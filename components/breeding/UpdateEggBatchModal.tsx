import { useGetEggBatchByBreedingProcessId } from '@/hooks/useEggBatch';
import { useCreateFryFish } from '@/hooks/useFryFish';
import {
  useCreateIncubationDailyRecord,
  useCreateIncubationDailyRecordV2,
  useGetIncubationDailyRecords,
  useGetIncubationDailyRecordSummaryByEggBatchId,
} from '@/hooks/useIncubationDailyRecord';
import { Pond } from '@/lib/api/services/fetchPond';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';
import ContextMenuField from '../ContextMenuField';

interface UpdateEggBatchModalProps {
  visible: boolean;
  onClose: () => void;
  breedingId: number | null;
  emptyPonds: Pond[];
  onRefetchPonds: () => void;
}

export function UpdateEggBatchModal({
  visible,
  onClose,
  breedingId,
  emptyPonds,
  onRefetchPonds,
}: UpdateEggBatchModalProps) {
  const queryClient = useQueryClient();

  const [dailyHealthyEggs, setDailyHealthyEggs] = useState('');
  const [dailyHatchedEggs, setDailyHatchedEggs] = useState('');
  const [dailySuccess, setDailySuccess] = useState(false);
  const [dailyErrors, setDailyErrors] = useState<{
    healthyEggs?: string;
    hatchedEggs?: string;
    eggBatch?: string;
    pond?: string;
  }>({});

  const [transferPondId, setTransferPondId] = useState<number | null>(null);
  const [transferPondLabel, setTransferPondLabel] = useState<string>('Chọn hồ');

  const eggBatchQuery = useGetEggBatchByBreedingProcessId(
    breedingId ?? 0,
    !!breedingId
  );

  const existingIncubationRecordsQuery = useGetIncubationDailyRecords(
    1,
    50,
    eggBatchQuery.data?.id,
    !!eggBatchQuery.data?.id
  );

  const incubationSummaryQuery = useGetIncubationDailyRecordSummaryByEggBatchId(
    eggBatchQuery.data?.id ?? 0,
    !!eggBatchQuery.data?.id
  );

  const createIncubationMutation = useCreateIncubationDailyRecord();
  const createIncubationMutationV2 = useCreateIncubationDailyRecordV2();
  const createFryFish = useCreateFryFish();

  const clearInputs = () => {
    setDailyHealthyEggs('');
    setDailyHatchedEggs('');
    setDailySuccess(false);
    setDailyErrors({});
    setTransferPondId(null);
    setTransferPondLabel('Chọn hồ');
  };

  const handleClose = () => {
    clearInputs();
    onClose();
  };

  useEffect(() => {
    if (visible && breedingId) {
      const fetchData = async () => {
        setTimeout(async () => {
          await eggBatchQuery.refetch();
          await existingIncubationRecordsQuery.refetch();
          await incubationSummaryQuery.refetch();
        }, 200);
      };
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, breedingId]);

  const handleSave = async () => {
    if (
      createIncubationMutation.status === 'pending' ||
      createIncubationMutationV2.status === 'pending'
    )
      return;

    setDailyErrors({});

    if (!breedingId) {
      Toast.show({
        type: 'error',
        text1: 'Không tìm thấy chu kỳ sinh sản',
      });
      return;
    }

    const eggBatch = eggBatchQuery.data;

    const errors: any = {};

    await existingIncubationRecordsQuery.refetch();

    if (existingIncubationRecordsQuery.isLoading) {
      Toast.show({
        type: 'error',
        text1: 'Đang tải dữ liệu, vui lòng thử lại',
      });
      return;
    }

    const hasExistingRecords =
      (existingIncubationRecordsQuery.data?.data?.length ?? 0) > 0;

    let healthy = 0;
    if (!hasExistingRecords) {
      healthy =
        dailyHealthyEggs.trim() === '' ? NaN : parseInt(dailyHealthyEggs, 10);
      if (!Number.isFinite(healthy) || healthy < 0) {
        errors.healthyEggs = 'Vui lòng nhập số lượng trứng khỏe hợp lệ';
      }
    }

    const hatched =
      dailyHatchedEggs.trim() === '' ? NaN : parseInt(dailyHatchedEggs, 10);
    if (!Number.isFinite(hatched) || hatched < 0) {
      errors.hatchedEggs = 'Vui lòng nhập số lượng trứng nở hợp lệ';
    }

    if (!eggBatch) {
      errors.eggBatch = 'Không tìm thấy lô trứng';
    }

    if (dailySuccess && !transferPondId) {
      errors.pond = 'Vui lòng chọn hồ nuôi cá bột';
    }

    setDailyErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (!hasExistingRecords) {
        await createIncubationMutation.mutateAsync({
          eggBatchId: eggBatch!.id,
          healthyEggs: healthy,
          hatchedEggs: hatched,
          success: dailySuccess,
        });
      } else {
        await createIncubationMutationV2.mutateAsync({
          eggBatchId: eggBatch!.id,
          hatchedEggs: hatched,
          success: dailySuccess,
        });
      }

      if (dailySuccess && transferPondId) {
        const fryFishData = {
          breedingProcessId: breedingId,
          pondId: transferPondId,
        };
        await createFryFish.mutateAsync(fryFishData);
        Toast.show({
          type: 'success',
          text1: 'Đã chuyển sang giai đoạn nuôi cá bột!',
        });
      } else {
        Toast.show({
          type: 'success',
          text1: 'Đã cập nhật bản ghi ấp trứng!',
        });
      }

      queryClient.invalidateQueries({ queryKey: ['breedingProcesses'] });
      queryClient.invalidateQueries({ queryKey: ['eggBatch'] });
      queryClient.invalidateQueries({ queryKey: ['incubationDailyRecords'] });
      queryClient.invalidateQueries({ queryKey: ['incubationSummary'] });
      handleClose();
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: err?.message || 'Không thể cập nhật',
      });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/40 p-4">
        <View
          className="w-11/12 rounded-2xl bg-white"
          style={{ maxHeight: '70%' }}
        >
          <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
            <Text className="text-lg font-semibold">
              Cập nhật tình trạng trứng
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            <Text className="mb-2 text-sm text-gray-600">Lô trứng:</Text>
            {eggBatchQuery.isLoading ? (
              <Text className="text-sm text-gray-500">
                Đang tải lô trứng...
              </Text>
            ) : eggBatchQuery.error ? (
              <Text className="text-sm text-red-500">
                Không thể tải lô trứng
              </Text>
            ) : eggBatchQuery.data ? (
              <View className="rounded bg-gray-50 p-3">
                {(existingIncubationRecordsQuery.data?.data?.length ?? 0) >
                0 ? (
                  incubationSummaryQuery.isLoading ? (
                    <Text className="text-sm text-gray-600">
                      Đang tải thông tin...
                    </Text>
                  ) : incubationSummaryQuery.error ? (
                    <Text className="text-sm text-red-500">
                      Lỗi tải dữ liệu tóm tắt
                    </Text>
                  ) : incubationSummaryQuery.data ? (
                    (() => {
                      const summary = incubationSummaryQuery.data;
                      const totalEggs = eggBatchQuery.data.quantity;
                      const remainingEggs =
                        totalEggs -
                        (summary.totalRottenEggs ?? 0) -
                        (summary.totalHatchedEggs ?? 0);
                      return (
                        <Text className="text-sm text-gray-600">
                          Số trứng còn lại:{' '}
                          <Text className="font-semibold">
                            {remainingEggs} quả
                          </Text>
                        </Text>
                      );
                    })()
                  ) : (
                    <Text className="text-sm text-gray-500">
                      Chưa có dữ liệu tóm tắt
                    </Text>
                  )
                ) : (
                  <Text className="text-sm text-gray-600">
                    Tổng số trứng:{' '}
                    <Text className="font-semibold">
                      {eggBatchQuery.data.quantity} quả
                    </Text>
                  </Text>
                )}
              </View>
            ) : (
              <Text className="text-sm text-gray-500">
                Không tìm thấy lô trứng
              </Text>
            )}

            {existingIncubationRecordsQuery.isLoading ? (
              <View className="mt-3 rounded bg-blue-50 p-3">
                <Text className="text-sm text-blue-700">
                  Đang kiểm tra bản ghi...
                </Text>
              </View>
            ) : (existingIncubationRecordsQuery.data?.data?.length ?? 0) > 0 ? (
              <View className="mt-3 rounded bg-green-50 p-3">
                <Text className="text-sm text-green-700">
                  Đã có {existingIncubationRecordsQuery.data?.data?.length ?? 0}{' '}
                  bản ghi ấp trứng. Chỉ cần nhập số trứng nở hôm nay.
                </Text>
              </View>
            ) : (
              <View className="mt-3 rounded bg-amber-50 p-3">
                <Text className="text-sm text-amber-700">
                  Đây là bản ghi đầu tiên. Vui lòng nhập cả số trứng khỏe và số
                  trứng nở.
                </Text>
              </View>
            )}

            {!existingIncubationRecordsQuery.isLoading &&
              (existingIncubationRecordsQuery.data?.data?.length ?? 0) ===
                0 && (
                <>
                  <Text className="mt-3 text-xs text-gray-500">
                    Số trứng khỏe <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="mb-1 rounded border border-gray-200 p-2"
                    value={dailyHealthyEggs}
                    onChangeText={(t) => {
                      setDailyHealthyEggs(t.replace(/[^0-9]/g, ''));
                      if (dailyErrors.healthyEggs)
                        setDailyErrors((prev) => ({
                          ...prev,
                          healthyEggs: undefined,
                        }));
                    }}
                    placeholder="VD: 120"
                    keyboardType="numeric"
                  />
                  {dailyErrors.healthyEggs ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {dailyErrors.healthyEggs}
                    </Text>
                  ) : null}
                </>
              )}

            <Text className="mt-3 text-xs text-gray-500">
              Số trứng đã nở <Text className="text-red-500">*</Text>
            </Text>
            <TextInput
              className="mb-1 rounded border border-gray-200 p-2"
              value={dailyHatchedEggs}
              onChangeText={(t) => {
                setDailyHatchedEggs(t.replace(/[^0-9]/g, ''));
                if (dailyErrors.hatchedEggs)
                  setDailyErrors((prev) => ({
                    ...prev,
                    hatchedEggs: undefined,
                  }));
              }}
              placeholder="VD: 100"
              keyboardType="numeric"
            />
            {dailyErrors.hatchedEggs ? (
              <Text className="text-sm text-red-500">
                {dailyErrors.hatchedEggs}
              </Text>
            ) : null}

            <View className="mt-3 flex-row items-center justify-between">
              <Text className="text-sm text-gray-700">
                Chuyển sang giai đoạn nuôi cá bột
              </Text>
              <Switch
                value={dailySuccess}
                onValueChange={(v) => setDailySuccess(v)}
                trackColor={{ true: '#10b981', false: '#d1d5db' }}
                thumbColor={dailySuccess ? '#ffffff' : '#ffffff'}
              />
            </View>

            {dailySuccess ? (
              <View>
                <ContextMenuField
                  label="Hồ nuôi cá bột"
                  value={transferPondLabel}
                  options={(emptyPonds ?? []).map((p) => ({
                    label: `${p.id}: ${p.pondName ?? p.id}`,
                    value: `${p.id}: ${p.pondName ?? p.id}`,
                  }))}
                  onSelect={(v: string) => {
                    const id = String(v).split(':')[0]?.trim();
                    setTransferPondId(id ? Number(id) : null);
                    setTransferPondLabel(String(v));
                    if (dailyErrors.pond)
                      setDailyErrors((p) => ({ ...p, pond: undefined }));
                  }}
                  onPress={onRefetchPonds}
                  placeholder="Chọn hồ"
                />
                {dailyErrors.pond ? (
                  <Text className="mb-2 text-sm text-red-500">
                    {dailyErrors.pond}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {dailyErrors.eggBatch ? (
              <Text className="mb-2 text-sm text-red-500">
                {dailyErrors.eggBatch}
              </Text>
            ) : null}
          </ScrollView>

          <View className="flex-row justify-between border-t border-gray-100 p-4">
            <TouchableOpacity
              className="rounded-lg border border-gray-200 px-4 py-2"
              onPress={handleClose}
            >
              <Text>Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`rounded-lg bg-primary px-4 py-2 ${createIncubationMutation.status === 'pending' || createIncubationMutationV2.status === 'pending' ? 'opacity-60' : ''}`}
              disabled={
                createIncubationMutation.status === 'pending' ||
                createIncubationMutationV2.status === 'pending'
              }
              onPress={handleSave}
            >
              {createIncubationMutation.status === 'pending' ||
              createIncubationMutationV2.status === 'pending' ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white">Lưu</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
