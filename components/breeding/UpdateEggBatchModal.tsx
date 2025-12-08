import { CustomAlert } from '@/components/CustomAlert';
import { useDebounce } from '@/hooks/useDebounce';
import { useGetEggBatchByBreedingProcessId } from '@/hooks/useEggBatch';
import { useCreateFryFish } from '@/hooks/useFryFish';
import {
  useCreateIncubationDailyRecord,
  useCreateIncubationDailyRecordV2,
  useGetIncubationDailyRecords,
  useGetIncubationDailyRecordSummaryByEggBatchId,
} from '@/hooks/useIncubationDailyRecord';
import { useGetPonds } from '@/hooks/usePond';
import { FryFishRequest } from '@/lib/api/services/fetchFryFish';
import { PondStatus } from '@/lib/api/services/fetchPond';
import { TypeOfPond } from '@/lib/api/services/fetchPondType';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Droplet,
  Egg,
  Info,
  Save,
  X,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import ContextMenuField from '../ContextMenuField';

interface UpdateEggBatchModalProps {
  visible: boolean;
  onClose: () => void;
  breedingId: number | null;
  pondTypeEnum?: TypeOfPond;
}

export function UpdateEggBatchModal({
  visible,
  onClose,
  breedingId,
  pondTypeEnum,
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

  const debouncedHatchedEggs = useDebounce(dailyHatchedEggs, 500);

  const clearInputs = () => {
    setDailyHealthyEggs('');
    setDailyHatchedEggs('');
    setDailySuccess(false);
    setDailyErrors({});
    setTransferPondId(null);
    setTransferPondLabel('Chọn hồ');
  };

  // Auto-set transfer to fry stage when all eggs hatch
  useEffect(() => {
    const hasExisting =
      (existingIncubationRecordsQuery.data?.data?.length ?? 0) > 0;
    if (hasExisting && incubationSummaryQuery.data && debouncedHatchedEggs) {
      const summary = incubationSummaryQuery.data;
      const totalEggs = eggBatchQuery.data?.quantity ?? 0;
      const remainingEggs =
        totalEggs -
        (summary.totalRottenEggs ?? 0) -
        (summary.totalHatchedEggs ?? 0);
      const hatched = parseInt(debouncedHatchedEggs, 10);
      if (hatched === remainingEggs && remainingEggs > 0) {
        setDailySuccess(true);
      }
    }
  }, [
    debouncedHatchedEggs,
    existingIncubationRecordsQuery.data?.data?.length,
    incubationSummaryQuery.data,
    eggBatchQuery.data,
  ]);

  // internal ponds: modal fetches empty ponds itself
  const internalPondsQuery = useGetPonds(
    { pageIndex: 1, pageSize: 200, status: PondStatus.EMPTY, pondTypeEnum },
    !!visible
  );
  const internalPondsList = internalPondsQuery.data?.data ?? [];

  const [errorAlert, setErrorAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info';
  }>({ visible: false, title: '', message: '', type: 'danger' });

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
          if (pondTypeEnum) await internalPondsQuery.refetch();
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
        errors.healthyEggs = 'Nhập số lượng trứng khỏe lớn hơn hoặc bằng 0';
      }
    }

    const hatched =
      dailyHatchedEggs.trim() === '' ? NaN : parseInt(dailyHatchedEggs, 10);
    if (!Number.isFinite(hatched) || hatched < 0) {
      errors.hatchedEggs = hasExistingRecords
        ? 'Số lượng trứng nở phải lớn hơn 0'
        : 'Nhập số lượng trứng nở lớn hơn hoặc bằng 0';
    }

    // Calculate remaining eggs for validation
    let remainingEggs = 0;
    if (hasExistingRecords && incubationSummaryQuery.data) {
      const summary = incubationSummaryQuery.data;
      const totalEggs = eggBatchQuery.data?.quantity ?? 0;
      remainingEggs =
        totalEggs -
        (summary.totalRottenEggs ?? 0) -
        (summary.totalHatchedEggs ?? 0);
    }

    // Additional validation for subsequent records
    if (hasExistingRecords) {
      if (hatched <= 0) {
        errors.hatchedEggs = 'Số lượng trứng nở phải lớn hơn 0';
      }
      if (hatched === remainingEggs) {
        // Force transfer to fry stage when all eggs have hatched
        setDailySuccess(true);
      }
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
        const fryFishData: FryFishRequest = {
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
      setErrorAlert({
        visible: true,
        title: 'Lỗi',
        message: err?.message || 'Không thể cập nhật',
        type: 'danger',
      });
    }
  };

  const isLoading =
    createIncubationMutation.status === 'pending' ||
    createIncubationMutationV2.status === 'pending';

  const hasExistingRecords =
    (existingIncubationRecordsQuery.data?.data?.length ?? 0) > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <View
          className="w-full max-w-lg flex-1 overflow-hidden rounded-3xl bg-white"
          style={{ maxHeight: '85%' }}
        >
          {/* Header */}
          <View className="bg-green-500 pb-6 pt-4">
            <View className="flex-row items-center justify-between px-5">
              <View className="h-10 w-10" />
              <View className="flex-1 items-center">
                <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-white/20">
                  <Egg size={24} color="white" />
                </View>
                <Text className="text-xs font-medium uppercase tracking-wide text-white/80">
                  Cập nhật
                </Text>
                <Text className="text-xl font-bold text-white">
                  Tình trạng ấp trứng
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/20"
                disabled={isLoading}
              >
                <X size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <KeyboardAwareScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 100,
            }}
            bottomOffset={20}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Egg Batch Info */}
            <View className="mb-4">
              <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                Thông tin lô trứng
              </Text>
              <View className="rounded-2xl border border-gray-200 bg-white p-4">
                {eggBatchQuery.isLoading ? (
                  <View className="flex-row items-center">
                    <ActivityIndicator size="small" color="#3b82f6" />
                    <Text className="ml-3 text-base font-semibold text-gray-600">
                      Đang tải lô trứng...
                    </Text>
                  </View>
                ) : eggBatchQuery.error ? (
                  <View className="flex-row items-center">
                    <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-red-100">
                      <AlertCircle size={16} color="#ef4444" />
                    </View>
                    <Text className="flex-1 text-base font-semibold text-red-600">
                      Không thể tải lô trứng
                    </Text>
                  </View>
                ) : eggBatchQuery.data ? (
                  <>
                    {hasExistingRecords ? (
                      incubationSummaryQuery.isLoading ? (
                        <View className="flex-row items-center">
                          <ActivityIndicator size="small" color="#3b82f6" />
                          <Text className="ml-3 text-base font-semibold text-gray-600">
                            Đang tải thông tin...
                          </Text>
                        </View>
                      ) : incubationSummaryQuery.data ? (
                        (() => {
                          const summary = incubationSummaryQuery.data;
                          const totalEggs = eggBatchQuery.data.quantity;
                          const remainingEggs =
                            totalEggs -
                            (summary.totalRottenEggs ?? 0) -
                            (summary.totalHatchedEggs ?? 0);
                          return (
                            <View className="flex-row items-center">
                              <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                                <Egg size={20} color="#f59e0b" />
                              </View>
                              <View className="flex-1">
                                <Text className="text-base font-semibold text-gray-600">
                                  Số trứng còn lại
                                </Text>
                                <Text className="text-xl font-bold text-gray-900">
                                  {remainingEggs} quả
                                </Text>
                              </View>
                            </View>
                          );
                        })()
                      ) : (
                        <Text className="text-sm text-gray-500">
                          Chưa có dữ liệu tóm tắt
                        </Text>
                      )
                    ) : (
                      <View className="flex-row items-center">
                        <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-green-100">
                          <Egg size={20} color="#22c55e" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-semibold text-gray-600">
                            Tổng số trứng
                          </Text>
                          <Text className="text-xl font-bold text-gray-900">
                            {eggBatchQuery.data.quantity} quả
                          </Text>
                        </View>
                      </View>
                    )}
                  </>
                ) : (
                  <Text className="text-base font-semibold text-gray-500">
                    Không tìm thấy lô trứng
                  </Text>
                )}
              </View>
            </View>

            {/* Status Info */}
            {existingIncubationRecordsQuery.isLoading ? (
              <View className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="#3b82f6" />
                  <Text className="ml-3 text-base font-medium text-blue-700">
                    Đang kiểm tra bản ghi...
                  </Text>
                </View>
              </View>
            ) : hasExistingRecords ? (
              <View className="mb-4 rounded-2xl border border-green-200 bg-green-50 p-4">
                <View className="flex-row items-start">
                  <View className="mr-3 mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle size={16} color="#22c55e" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-green-900">
                      Đã có{' '}
                      {existingIncubationRecordsQuery.data?.data?.length ?? 0}{' '}
                      bản ghi
                    </Text>
                    <Text className="mt-1 text-base text-green-700">
                      Chỉ cần nhập số trứng nở hôm nay
                    </Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <View className="flex-row items-start">
                  <View className="mr-3 mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                    <Info size={16} color="#f59e0b" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-amber-900">
                      Bản ghi đầu tiên
                    </Text>
                    <Text className="mt-1 text-base text-amber-700">
                      Vui lòng nhập cả số trứng khỏe và số trứng nở
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Input Fields */}
            <View className="mb-4">
              <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                Cập nhật số liệu
              </Text>
              <View className="rounded-2xl border border-gray-200 bg-white p-4">
                {!hasExistingRecords && (
                  <>
                    {/* Healthy Eggs */}
                    <View className="mb-4 flex-row items-center">
                      <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-green-100">
                        <Egg size={18} color="#22c55e" />
                      </View>
                      <View className="flex-1">
                        <Text className="mb-1 text-base font-medium text-gray-600">
                          Số trứng khỏe <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                          className={`rounded-2xl border ${dailyErrors.healthyEggs ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} px-3 py-2 text-base font-medium text-gray-900`}
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
                          placeholderTextColor="#9ca3af"
                          keyboardType="numeric"
                        />
                        {dailyErrors.healthyEggs ? (
                          <Text className="mt-1 text-sm text-red-500">
                            {dailyErrors.healthyEggs}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                  </>
                )}

                {/* Hatched Eggs */}
                <View className="flex-row items-center">
                  <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                    <Egg size={18} color="#3b82f6" />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-1 text-base font-medium text-gray-600">
                      Số trứng đã nở <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                      className={`rounded-2xl border ${dailyErrors.hatchedEggs ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} px-3 py-2 text-base font-medium text-gray-900`}
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
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                    />
                    {dailyErrors.hatchedEggs ? (
                      <Text className="mt-1 text-sm text-red-500">
                        {dailyErrors.hatchedEggs}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            </View>

            {/* Transfer to Fry Stage */}
            <View className="mb-4">
              <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                Chuyển giai đoạn
              </Text>
              <View className="rounded-2xl border border-gray-200 bg-white p-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center">
                    <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                      <ArrowRight size={18} color="#a855f7" />
                    </View>
                    <Text className="flex-1 text-base font-medium text-gray-700">
                      Chuyển sang nuôi cá bột
                    </Text>
                  </View>
                  <Switch
                    value={dailySuccess}
                    onValueChange={(v) => setDailySuccess(v)}
                    trackColor={{ true: '#a855f7', false: '#d1d5db' }}
                    thumbColor="#ffffff"
                  />
                </View>

                {dailySuccess && (
                  <View className="mt-4 flex-row items-start border-t border-gray-100 pt-4">
                    <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                      <Droplet size={18} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                      <ContextMenuField
                        label="Hồ nuôi cá bột *"
                        value={transferPondLabel}
                        options={internalPondsList.map((p) => ({
                          label: `${p.id}: ${p.pondName ?? p.id}`,
                          value: `${p.id}: ${p.pondName ?? p.id}`,
                          meta: `Sức chứa tối đa: ${p.maxFishCount ?? '—'}`,
                        }))}
                        onSelect={(v: string) => {
                          const id = String(v).split(':')[0]?.trim();
                          setTransferPondId(id ? Number(id) : null);
                          setTransferPondLabel(String(v));
                          if (dailyErrors.pond)
                            setDailyErrors((p) => ({ ...p, pond: undefined }));
                        }}
                        onPress={internalPondsQuery.refetch}
                        placeholder="Chọn hồ"
                      />
                      {dailyErrors.pond ? (
                        <Text className="mt-2 text-sm text-red-500">
                          {dailyErrors.pond}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                )}
              </View>
            </View>

            {dailyErrors.eggBatch ? (
              <View className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3">
                <Text className="text-sm text-red-600">
                  {dailyErrors.eggBatch}
                </Text>
              </View>
            ) : null}
          </KeyboardAwareScrollView>

          {/* Fixed Bottom Actions */}
          <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white px-5 py-4">
            <View className="flex-row">
              <TouchableOpacity
                className="mr-2 flex-1 rounded-2xl border-2 border-gray-200 bg-gray-50 py-4"
                onPress={handleClose}
                disabled={isLoading}
              >
                <Text className="text-center text-base font-semibold text-gray-700">
                  Hủy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className={`ml-2 flex-1 flex-row items-center justify-center rounded-2xl py-4 ${
                  isLoading ? 'bg-gray-300' : 'bg-green-500'
                }`}
                disabled={isLoading}
                onPress={handleSave}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text className="ml-2 text-base font-semibold text-white">
                      Đang lưu...
                    </Text>
                  </>
                ) : (
                  <>
                    <Save size={20} color="white" />
                    <Text className="ml-2 text-base font-semibold text-white">
                      Lưu
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
      <CustomAlert
        visible={errorAlert.visible}
        title={errorAlert.title}
        message={errorAlert.message}
        type={errorAlert.type}
        cancelText="Đóng"
        confirmText="OK"
        onCancel={() => setErrorAlert((s) => ({ ...s, visible: false }))}
        onConfirm={() => setErrorAlert((s) => ({ ...s, visible: false }))}
      />
    </Modal>
  );
}
