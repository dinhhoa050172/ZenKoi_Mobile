import { useCreateEggBatch, useUpdateEggBatch } from '@/hooks/useEggBatch';
import { Pond } from '@/lib/api/services/fetchPond';
import { useQueryClient } from '@tanstack/react-query';
import { Calculator, Droplet, Egg, Save, Scale, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';
import ContextMenuField from '../ContextMenuField';
import { CustomAlert } from '../CustomAlert';

interface EggBatchData {
  id: number;
  pondId: number;
  pondName?: string;
}

interface CountEggModalProps {
  visible: boolean;
  onClose: () => void;
  breedingId: number | null;
  emptyPonds: Pond[];
  onRefetchPonds: () => void;
  eggBatchData?: EggBatchData | null;
  allPonds?: Pond[];
  onRefetchAllPonds?: () => void;
}

export function CountEggModal({
  visible,
  onClose,
  breedingId,
  emptyPonds,
  onRefetchPonds,
  eggBatchData,
  allPonds,
  onRefetchAllPonds,
}: CountEggModalProps) {
  const queryClient = useQueryClient();
  const createEggBatch = useCreateEggBatch();
  const updateEggBatch = useUpdateEggBatch();

  const isEditMode = !!eggBatchData;
  const availablePonds = isEditMode ? (allPonds ?? []) : emptyPonds;
  const refetchPonds = isEditMode
    ? (onRefetchAllPonds ?? onRefetchPonds)
    : onRefetchPonds;

  const [countMethod, setCountMethod] = useState('Đếm theo mẫu');
  const [currentPondId, setCurrentPondId] = useState<number | null>(null);
  const [currentPondLabel, setCurrentPondLabel] = useState<string>('Chọn hồ');

  const [totalWeight, setTotalWeight] = useState('');
  const [sampleWeight, setSampleWeight] = useState('');
  const [sampleCount, setSampleCount] = useState('');
  const [avgWeight, setAvgWeight] = useState('');

  const [totalWeightError, setTotalWeightError] = useState('');
  const [sampleWeightError, setSampleWeightError] = useState('');
  const [sampleCountError, setSampleCountError] = useState('');
  const [avgWeightError, setAvgWeightError] = useState('');
  const [pondError, setPondError] = useState('');
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (eggBatchData && visible) {
      setCurrentPondId(eggBatchData.pondId);
      const pondLabel = eggBatchData.pondName
        ? `${eggBatchData.pondId}: ${eggBatchData.pondName}`
        : `${eggBatchData.pondId}`;
      setCurrentPondLabel(pondLabel);
    }
  }, [eggBatchData, visible]);

  const normalizeDecimalInput = (input: string) => {
    if (!input) return '';
    let s = input.replace(/[^0-9.,]/g, '');
    const firstDot = s.indexOf('.');
    const firstComma = s.indexOf(',');
    if (firstDot !== -1 && firstComma !== -1) {
      if (firstDot < firstComma) {
        s = s.replace(/,/g, '');
      } else {
        s = s.replace(/\./g, '');
      }
    }
    const partsDot = s.split('.');
    if (partsDot.length > 2) s = partsDot.slice(0, 2).join('.');
    const partsComma = s.split(',');
    if (partsComma.length > 2) s = partsComma.slice(0, 2).join(',');
    return s;
  };

  const resetModal = () => {
    setTotalWeight('');
    setSampleWeight('');
    setSampleCount('');
    setAvgWeight('');
    setCurrentPondId(null);
    setCurrentPondLabel('Chọn hồ');
    setCountMethod('Đếm theo mẫu');
    setTotalWeightError('');
    setSampleWeightError('');
    setSampleCountError('');
    setAvgWeightError('');
    setPondError('');
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleSave = async () => {
    setTotalWeightError('');
    setSampleWeightError('');
    setSampleCountError('');
    setAvgWeightError('');
    setPondError('');

    const total = parseFloat(String(totalWeight).replace(',', '.'));
    const errors: { [k: string]: string } = {};

    if (!isFinite(total) || total <= 0) {
      errors.total = 'Vui lòng nhập tổng trọng lượng hợp lệ';
    }

    let quantity = 0;
    if (countMethod === 'Đếm theo mẫu') {
      const sample = parseFloat(String(sampleWeight).replace(',', '.'));
      const count = parseInt(sampleCount, 10);
      if (!isFinite(sample) || sample <= 0) {
        errors.sampleWeight = 'Vui lòng nhập trọng lượng mẫu hợp lệ';
      }
      if (!Number.isInteger(count) || count <= 0) {
        errors.sampleCount = 'Vui lòng nhập số lượng mẫu hợp lệ';
      }
      if (!errors.sampleWeight && !errors.sampleCount && !errors.total) {
        const avgEggWeight = sample / count;
        quantity = Math.round(total / avgEggWeight);
      }
    } else {
      const avg = parseFloat(String(avgWeight).replace(',', '.'));
      if (!isFinite(avg) || avg <= 0) {
        errors.avg = 'Vui lòng nhập trọng lượng trung bình hợp lệ';
      }
      if (!errors.avg && !errors.total) {
        quantity = Math.round(total / avg);
      }
    }

    if (!breedingId) {
      setErrorMessage('Không tìm thấy chu kỳ sinh sản');
      setShowErrorAlert(true);
      return;
    }
    if (!currentPondId) {
      errors.pond = 'Vui lòng chọn hồ';
    }

    setTotalWeightError(errors.total ?? '');
    setSampleWeightError(errors.sampleWeight ?? '');
    setSampleCountError(errors.sampleCount ?? '');
    setAvgWeightError(errors.avg ?? '');
    setPondError(errors.pond ?? '');

    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      if (isEditMode && eggBatchData) {
        await updateEggBatch.mutateAsync({
          id: eggBatchData.id,
          data: {
            breedingProcessId: breedingId,
            quantity,
            pondId: currentPondId!,
          },
        });
        Toast.show({
          type: 'success',
          text1: 'Đã cập nhật lô trứng thành công!',
        });
      } else {
        await createEggBatch.mutateAsync({
          breedingProcessId: breedingId,
          quantity,
          pondId: currentPondId!,
        });
        Toast.show({ type: 'success', text1: 'Đã tạo lô trứng thành công!' });
      }
      queryClient.invalidateQueries({ queryKey: ['breedingProcesses'] });
      if (breedingId) {
        queryClient.invalidateQueries({
          queryKey: ['eggBatch', 'by-breeding-process', breedingId],
        });
      }
      handleClose();
    } catch (err: any) {
      setErrorMessage(
        err?.message ||
          (isEditMode
            ? 'Không thể cập nhật lô trứng'
            : 'Không thể tạo lô trứng')
      );
      setShowErrorAlert(true);
    }
  };

  const isLoading = createEggBatch.isPending || updateEggBatch.isPending;

  return (
    <>
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
            <View className="bg-amber-500 pb-6 pt-4">
              <View className="flex-row items-center justify-between px-5">
                <View className="h-10 w-10" />
                <View className="flex-1 items-center">
                  <View className="mb-2 h-12 w-12 items-center justify-center rounded-full bg-white/20">
                    <Egg size={24} color="white" />
                  </View>
                  <Text className="text-sm font-medium uppercase tracking-wide text-white/80">
                    {isEditMode ? 'Chỉnh sửa' : 'Đếm trứng'}
                  </Text>
                  <Text className="text-xl font-bold text-white">
                    {isEditMode ? 'Cập nhật lô trứng' : 'Đếm số lượng trứng'}
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
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 100,
              }}
              bottomOffset={20}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Method Selection */}
              <View className="mb-4">
                <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                  Phương pháp đếm
                </Text>
                <View className="rounded-2xl border border-gray-200 bg-white p-4">
                  <View className="flex-row items-start">
                    <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                      <Calculator size={18} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                      <ContextMenuField
                        label="Chọn phương pháp"
                        value={countMethod}
                        options={[
                          { label: 'Đếm theo mẫu', value: 'Đếm theo mẫu' },
                          {
                            label: 'Đếm theo trọng lượng',
                            value: 'Đếm theo trọng lượng',
                          },
                        ]}
                        onSelect={(v: string) => setCountMethod(v)}
                        placeholder="Chọn phương pháp đếm"
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Input Fields */}
              <View className="mb-4">
                <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                  Thông tin đo lường
                </Text>
                <View className="rounded-2xl border border-gray-200 bg-white p-4">
                  {countMethod === 'Đếm theo mẫu' ? (
                    <>
                      {/* Total Weight */}
                      <View className="mb-4 flex-row items-center">
                        <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-green-100">
                          <Scale size={18} color="#22c55e" />
                        </View>
                        <View className="flex-1">
                          <Text className="mb-1 text-base font-medium text-gray-600">
                            Tổng trọng lượng (g){' '}
                            <Text className="text-red-500">*</Text>
                          </Text>
                          <TextInput
                            className={`rounded-2xl border ${totalWeightError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} px-3 py-2 text-base font-medium text-gray-900`}
                            value={totalWeight}
                            onChangeText={(t) => {
                              setTotalWeight(normalizeDecimalInput(t));
                              if (totalWeightError) setTotalWeightError('');
                            }}
                            placeholder="VD: 500"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                          />
                          {totalWeightError ? (
                            <Text className="mt-1 text-xs text-red-500">
                              {totalWeightError}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {/* Sample Weight */}
                      <View className="mb-4 flex-row items-center">
                        <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-cyan-100">
                          <Scale size={18} color="#06b6d4" />
                        </View>
                        <View className="flex-1">
                          <Text className="mb-1 text-base font-medium text-gray-600">
                            Trọng lượng mẫu (g){' '}
                            <Text className="text-red-500">*</Text>
                          </Text>
                          <TextInput
                            className={`rounded-2xl border ${sampleWeightError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} px-3 py-2 text-base font-medium text-gray-900`}
                            value={sampleWeight}
                            onChangeText={(t) => {
                              setSampleWeight(normalizeDecimalInput(t));
                              if (sampleWeightError) setSampleWeightError('');
                            }}
                            placeholder="VD: 10"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                          />
                          {sampleWeightError ? (
                            <Text className="mt-1 text-xs text-red-500">
                              {sampleWeightError}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {/* Sample Count */}
                      <View className="flex-row items-center">
                        <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-amber-100">
                          <Egg size={18} color="#f59e0b" />
                        </View>
                        <View className="flex-1">
                          <Text className="mb-1 text-base font-medium text-gray-600">
                            Số lượng trong mẫu{' '}
                            <Text className="text-red-500">*</Text>
                          </Text>
                          <TextInput
                            className={`rounded-2xl border ${sampleCountError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} px-3 py-2 text-base font-medium text-gray-900`}
                            value={sampleCount}
                            onChangeText={(t) => {
                              setSampleCount(t.replace(/[^0-9]/g, ''));
                              if (sampleCountError) setSampleCountError('');
                            }}
                            placeholder="VD: 150"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                          />
                          {sampleCountError ? (
                            <Text className="mt-1 text-xs text-red-500">
                              {sampleCountError}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </>
                  ) : (
                    <>
                      {/* Total Weight */}
                      <View className="mb-4 flex-row items-center">
                        <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-green-100">
                          <Scale size={18} color="#22c55e" />
                        </View>
                        <View className="flex-1">
                          <Text className="mb-1 text-base font-medium text-gray-600">
                            Tổng trọng lượng (g){' '}
                            <Text className="text-red-500">*</Text>
                          </Text>
                          <TextInput
                            className={`rounded-2xl border ${totalWeightError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} px-3 py-2 text-base font-medium text-gray-900`}
                            value={totalWeight}
                            onChangeText={(t) => {
                              setTotalWeight(normalizeDecimalInput(t));
                              if (totalWeightError) setTotalWeightError('');
                            }}
                            placeholder="VD: 500"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                          />
                          {totalWeightError ? (
                            <Text className="mt-1 text-xs text-red-500">
                              {totalWeightError}
                            </Text>
                          ) : null}
                        </View>
                      </View>

                      {/* Average Weight */}
                      <View className="flex-row items-center">
                        <View className="mr-3 h-9 w-9 items-center justify-center rounded-full bg-purple-100">
                          <Egg size={18} color="#a855f7" />
                        </View>
                        <View className="flex-1">
                          <Text className="mb-1 text-base font-medium text-gray-600">
                            Trọng lượng trung bình 1 trứng (g){' '}
                            <Text className="text-red-500">*</Text>
                          </Text>
                          <TextInput
                            className={`rounded-2xl border ${avgWeightError ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'} px-3 py-2 text-base font-medium text-gray-900`}
                            value={avgWeight}
                            onChangeText={(t) => {
                              setAvgWeight(normalizeDecimalInput(t));
                              if (avgWeightError) setAvgWeightError('');
                            }}
                            placeholder="VD: 0.067"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                          />
                          {avgWeightError ? (
                            <Text className="mt-1 text-xs text-red-500">
                              {avgWeightError}
                            </Text>
                          ) : null}
                        </View>
                      </View>
                    </>
                  )}
                </View>
              </View>

              {/* Pond Selection */}
              <View className="mb-4">
                <Text className="mb-3 px-1 text-base font-semibold uppercase tracking-wide text-gray-500">
                  Chọn hồ nuôi
                </Text>
                <View className="rounded-2xl border border-gray-200 bg-white p-4">
                  <View className="flex-row items-start">
                    <View className="mr-3 mt-5 h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                      <Droplet size={18} color="#3b82f6" />
                    </View>
                    <View className="flex-1">
                      <ContextMenuField
                        label="Hồ *"
                        value={currentPondLabel}
                        options={availablePonds.map((p) => ({
                          label: `${p.id}: ${p.pondName ?? p.id}`,
                          value: `${p.id}: ${p.pondName ?? p.id}`,
                          meta: `Sức chứa tối đa: ${p.maxFishCount ?? '—'}`,
                        }))}
                        onSelect={(v: string) => {
                          const id = String(v).split(':')[0]?.trim();
                          setCurrentPondId(id ? Number(id) : null);
                          setCurrentPondLabel(String(v));
                          if (pondError) setPondError('');
                        }}
                        onPress={refetchPonds}
                        placeholder="Chọn hồ"
                      />
                      {pondError ? (
                        <Text className="mt-2 text-xs text-red-500">
                          {pondError}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              </View>
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
                    isLoading ? 'bg-gray-300' : 'bg-amber-500'
                  }`}
                  onPress={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text className="ml-2 text-base font-semibold text-white">
                        Đang lưu...
                      </Text>
                    </>
                  ) : (
                    <>
                      <Save size={20} color="white" />
                      <Text className="ml-2 text-base font-semibold text-white">
                        {isEditMode ? 'Cập nhật' : 'Lưu kết quả'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={showErrorAlert}
        title="Lỗi"
        message={errorMessage}
        type="danger"
        confirmText="Đóng"
        onCancel={() => setShowErrorAlert(false)}
        onConfirm={() => setShowErrorAlert(false)}
      />
    </>
  );
}
