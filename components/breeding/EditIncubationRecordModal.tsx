import { CustomAlert } from '@/components/CustomAlert';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreateFryFish } from '@/hooks/useFryFish';
import {
  useGetIncubationDailyRecordSummaryByEggBatchId,
  useUpdateIncubationDailyRecord,
  useUpdateIncubationDailyRecordV2,
} from '@/hooks/useIncubationDailyRecord';
import { useGetPonds } from '@/hooks/usePond';
import { IncubationDailyReordBreeding } from '@/lib/api/services/fetchBreedingProcess';
import { FryFishRequest } from '@/lib/api/services/fetchFryFish';
import { PondStatus } from '@/lib/api/services/fetchPond';
import { TypeOfPond } from '@/lib/api/services/fetchPondType';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Edit3,
  Egg,
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

interface EditIncubationRecordModalProps {
  visible: boolean;
  onClose: () => void;
  record: IncubationDailyReordBreeding | null;
  isFirstRecord: boolean;
  breedingId: number | null;
  totalEggs: number;
  pondTypeEnum?: TypeOfPond;
}

export function EditIncubationRecordModal({
  visible,
  onClose,
  record,
  isFirstRecord,
  breedingId,
  totalEggs,
  pondTypeEnum,
}: EditIncubationRecordModalProps) {
  const [healthyEggs, setHealthyEggs] = useState('');
  const [hatchedEggs, setHatchedEggs] = useState('');
  const [success, setSuccess] = useState(false);
  const [transferPondId, setTransferPondId] = useState<number | null>(null);
  const [transferPondLabel, setTransferPondLabel] = useState<string>('Chọn hồ');
  const [errors, setErrors] = useState<{
    healthyEggs?: string;
    hatchedEggs?: string;
    pond?: string;
  }>({});

  // Error alert state
  const [errorAlert, setErrorAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
  }>({
    visible: false,
    title: '',
    message: '',
  });

  const queryClient = useQueryClient();

  const updateMutation = useUpdateIncubationDailyRecord();
  const updateMutationV2 = useUpdateIncubationDailyRecordV2();
  const createFryFish = useCreateFryFish();

  const debouncedHatchedEggs = useDebounce(hatchedEggs, 500);

  const summaryQuery = useGetIncubationDailyRecordSummaryByEggBatchId(
    record?.eggBatchId ?? 0,
    !!record?.eggBatchId
  );

  // internal ponds
  const internalPondsQuery = useGetPonds(
    { pageIndex: 1, pageSize: 200, status: PondStatus.EMPTY, pondTypeEnum },
    !!visible && !!breedingId
  );
  const internalPondsList = internalPondsQuery.data?.data ?? [];

  useEffect(() => {
    if (visible && record) {
      setHealthyEggs(record.healthyEggs?.toString() || '');
      setHatchedEggs(record.hatchedEggs?.toString() || '');
      setSuccess(record.success || false);
    }
  }, [visible, record]);

  // Auto-set transfer to fry stage when all eggs hatch
  useEffect(() => {
    if (!isFirstRecord && summaryQuery.data && debouncedHatchedEggs) {
      const summary = summaryQuery.data;
      const remainingEggs =
        totalEggs -
        (summary.totalRottenEggs ?? 0) -
        (summary.totalHatchedEggs ?? 0) +
        (record?.hatchedEggs ?? 0); // adjust for current record
      const hatched = parseInt(debouncedHatchedEggs, 10);
      if (hatched === remainingEggs && remainingEggs > 0) {
        setSuccess(true);
      }
    }
  }, [
    debouncedHatchedEggs,
    isFirstRecord,
    summaryQuery.data,
    record,
    totalEggs,
  ]);

  const clearInputs = () => {
    setHealthyEggs('');
    setHatchedEggs('');
    setSuccess(false);
    setTransferPondId(null);
    setTransferPondLabel('Chọn hồ');
    setErrors({});
  };

  const handleClose = () => {
    clearInputs();
    onClose();
  };

  const handleSave = async () => {
    if (!record) return;

    if (
      updateMutation.status === 'pending' ||
      updateMutationV2.status === 'pending'
    )
      return;

    setErrors({});

    const validationErrors: any = {};

    // For first record, healthyEggs is required
    if (isFirstRecord) {
      const healthy =
        healthyEggs.trim() === '' ? NaN : parseInt(healthyEggs, 10);
      if (!Number.isFinite(healthy) || healthy < 0) {
        validationErrors.healthyEggs =
          'Nhập số lượng trứng khỏe lớn hơn hoặc bằng 0';
      }
    }

    const hatched = hatchedEggs.trim() === '' ? NaN : parseInt(hatchedEggs, 10);
    if (!Number.isFinite(hatched) || hatched < 0) {
      validationErrors.hatchedEggs =
        'Nhập số lượng trứng nở lớn hơn hoặc bằng 0';
    }

    if (success && !transferPondId) {
      validationErrors.pond = 'Vui lòng chọn hồ nuôi cá bột';
    }

    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    try {
      if (isFirstRecord) {
        await updateMutation.mutateAsync({
          id: record.id,
          data: {
            healthyEggs: parseInt(healthyEggs, 10),
            hatchedEggs: parseInt(hatchedEggs, 10),
            success: success,
          },
        });
      } else {
        await updateMutationV2.mutateAsync({
          id: record.id,
          data: {
            hatchedEggs: parseInt(hatchedEggs, 10),
            success: success,
          },
        });
      }

      if (success && transferPondId && breedingId) {
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
          text1: 'Thành công',
          text2: 'Đã cập nhật bản ghi ấp trứng!',
        });
      }

      queryClient.invalidateQueries({ queryKey: ['breedingProcesses'] });
      queryClient.invalidateQueries({ queryKey: ['fryFish'] });
      queryClient.invalidateQueries({ queryKey: ['incubationDailyRecords'] });
      queryClient.invalidateQueries({ queryKey: ['incubationSummary'] });
      handleClose();
    } catch (err: any) {
      setErrorAlert({
        visible: true,
        title: 'Lỗi',
        message: err?.message || 'Không thể cập nhật bản ghi',
      });
    }
  };

  const isLoading =
    updateMutation.status === 'pending' ||
    updateMutationV2.status === 'pending' ||
    createFryFish.status === 'pending';

  // Format date for display
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center bg-black/50 px-4">
        <View
          className="w-full max-w-md flex-1 overflow-hidden rounded-3xl bg-white shadow-2xl"
          style={{ maxHeight: '85%' }}
        >
          {/* Header */}
          <View className="items-center border-b border-gray-100 px-6 py-4">
            <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <Edit3 size={24} color="#f97316" />
            </View>
            <Text className="text-xl font-bold text-gray-900">
              Chỉnh sửa bản ghi
            </Text>
            {record && (
              <Text className="mt-1 text-sm text-gray-500">
                Ngày: {formatDate(record.dayNumber)}
              </Text>
            )}
            <TouchableOpacity
              onPress={handleClose}
              className="absolute right-4 top-4 rounded-full bg-gray-100 p-2"
            >
              <X size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <KeyboardAwareScrollView
            className="flex-1"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingTop: 10,
              paddingBottom: 20,
            }}
            bottomOffset={20}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Info Card */}
            <View className="mb-4 overflow-hidden rounded-2xl border border-orange-200 bg-orange-50">
              <View className="flex-row items-center border-b border-orange-100 bg-orange-100 px-4 py-2">
                <Egg size={18} color="#f97316" />
                <Text className="ml-2 text-base font-semibold uppercase tracking-wide text-orange-700">
                  Thông tin hiện tại
                </Text>
              </View>
              <View className="p-4">
                {record && (
                  <View className="space-y-2">
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base text-gray-600">
                        {isFirstRecord ? 'Tổng trứng' : 'Trứng khỏe'}
                      </Text>
                      <Text className="text-base font-semibold text-gray-900">
                        {isFirstRecord
                          ? totalEggs.toLocaleString()
                          : (
                              totalEggs -
                              (summaryQuery.data?.totalRottenEggs ?? 0) -
                              (summaryQuery.data?.totalHatchedEggs ?? 0) +
                              (record.rottenEggs ?? 0) +
                              (record.hatchedEggs ?? 0)
                            ).toLocaleString()}{' '}
                        quả
                      </Text>
                    </View>
                    {isFirstRecord && (
                      <View className="flex-row items-center justify-between">
                        <Text className="text-base text-gray-600">
                          Trứng khỏe
                        </Text>
                        <Text className="text-base font-semibold text-gray-900">
                          {record.healthyEggs?.toLocaleString() || 0} quả
                        </Text>
                      </View>
                    )}
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base text-gray-600">
                        Trứng hỏng
                      </Text>
                      <Text className="text-base font-semibold text-red-600">
                        {record.rottenEggs?.toLocaleString() || 0} quả
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base text-gray-600">Đã nở</Text>
                      <Text className="text-base font-semibold text-green-600">
                        {record.hatchedEggs?.toLocaleString() || 0} quả
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Healthy Eggs Input (First Record Only) */}
            {isFirstRecord && (
              <View className="mb-4 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white">
                <View className="flex-row items-center bg-green-50 px-4 py-3">
                  <Check size={22} color="#16a34a" />
                  <View className="ml-2 flex-1">
                    <Text className="text-base font-semibold text-green-700">
                      Số trứng khỏe
                    </Text>
                    <Text className="text-base text-gray-500">
                      Bắt buộc nhập
                    </Text>
                  </View>
                </View>
                <View className="p-4">
                  <TextInput
                    className="rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base font-semibold text-gray-900"
                    value={healthyEggs}
                    onChangeText={(t) => {
                      setHealthyEggs(t.replace(/[^0-9]/g, ''));
                      if (errors.healthyEggs)
                        setErrors((prev) => ({
                          ...prev,
                          healthyEggs: undefined,
                        }));
                    }}
                    placeholder="Nhập số trứng khỏe (VD: 120)"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    style={errors.healthyEggs ? { borderColor: '#ef4444' } : {}}
                  />
                  {errors.healthyEggs ? (
                    <View className="mt-2 flex-row items-center">
                      <AlertCircle size={14} color="#ef4444" />
                      <Text className="ml-1 text-sm text-red-500">
                        {errors.healthyEggs}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            )}

            {/* Hatched Eggs Input */}
            <View className="overflow-hidden rounded-2xl border-2 border-gray-200 bg-white">
              <View className="flex-row items-center bg-blue-50 px-4 py-3">
                <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <Text className="text-lg">🐣</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-base font-semibold text-blue-700">
                    Số trứng đã nở
                  </Text>
                  <Text className="text-base text-gray-500">Bắt buộc nhập</Text>
                </View>
              </View>
              <View className="p-4">
                <TextInput
                  className="rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-base font-semibold text-gray-900"
                  value={hatchedEggs}
                  onChangeText={(t) => {
                    setHatchedEggs(t.replace(/[^0-9]/g, ''));
                    if (errors.hatchedEggs)
                      setErrors((prev) => ({
                        ...prev,
                        hatchedEggs: undefined,
                      }));
                  }}
                  placeholder="Nhập số trứng đã nở (VD: 100)"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  style={errors.hatchedEggs ? { borderColor: '#ef4444' } : {}}
                />
                {errors.hatchedEggs ? (
                  <View className="mt-2 flex-row items-center">
                    <AlertCircle size={14} color="#ef4444" />
                    <Text className="ml-1 text-sm text-red-500">
                      {errors.hatchedEggs}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Transfer to Fry Stage */}
            <View className="mt-4 overflow-hidden rounded-2xl border-2 border-gray-200 bg-white">
              <View className="flex-row items-center justify-between bg-purple-50 px-4 py-3">
                <View className="flex-1 flex-row items-center">
                  <ArrowRight size={22} color="#a855f7" />
                  <View className="ml-2 flex-1">
                    <Text className="text-base font-semibold text-purple-700">
                      Chuyển sang nuôi cá bột
                    </Text>
                    <Text className="text-sm text-purple-600">
                      Tự động khi nở hết trứng
                    </Text>
                  </View>
                </View>
                <Switch
                  value={success}
                  onValueChange={(v) => setSuccess(v)}
                  trackColor={{ true: '#a855f7', false: '#d1d5db' }}
                  thumbColor="#ffffff"
                />
              </View>

              {success && (
                <View className="border-t border-gray-100 p-4">
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
                      if (errors.pond)
                        setErrors((p) => ({ ...p, pond: undefined }));
                    }}
                    onPress={internalPondsQuery.refetch}
                    placeholder="Chọn hồ"
                  />
                  {errors.pond ? (
                    <Text className="mt-2 text-sm text-red-500">
                      {errors.pond}
                    </Text>
                  ) : null}
                </View>
              )}
            </View>

            {/* Help Text */}
            <View className="mt-4 rounded-2xl bg-gray-50 p-3">
              <Text className="text-base leading-5 text-gray-600">
                💡 <Text className="font-semibold">Lưu ý:</Text> Chỉ có thể
                chỉnh sửa bản ghi mới nhất. Hãy kiểm tra kỹ số liệu trước khi
                lưu.
              </Text>
            </View>
          </KeyboardAwareScrollView>

          {/* Footer Actions */}
          <View className="flex-row gap-3 border-t border-gray-100 p-4">
            <TouchableOpacity
              className="flex-1 items-center justify-center rounded-2xl border-2 border-gray-300 bg-white py-3"
              onPress={handleClose}
            >
              <Text className="font-semibold text-gray-700">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 items-center justify-center rounded-2xl py-3 ${isLoading ? 'bg-orange-400' : 'bg-orange-500'}`}
              disabled={isLoading}
              onPress={handleSave}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <View className="flex-row items-center">
                  <CheckCircle2 size={18} color="white" />
                  <Text className="ml-2 font-semibold text-white">
                    Lưu thay đổi
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <CustomAlert
        visible={errorAlert.visible}
        title={errorAlert.title}
        message={errorAlert.message}
        type="danger"
        cancelText="Đóng"
        confirmText="Đóng"
        onCancel={() => {
          setErrorAlert({
            visible: false,
            title: '',
            message: '',
          });
        }}
        onConfirm={() => {
          setErrorAlert({
            visible: false,
            title: '',
            message: '',
          });
        }}
      />
    </Modal>
  );
}
