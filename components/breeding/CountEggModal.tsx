import { useCreateEggBatch, useUpdateEggBatch } from '@/hooks/useEggBatch';
import { Pond } from '@/lib/api/services/fetchPond';
import { useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
  allPonds?: Pond[]; // All ponds for edit mode
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

  // Use all ponds when editing, empty ponds when creating
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

  // Pre-fill pond data when in edit mode
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
        // Update existing egg batch
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
        // Create new egg batch
        await createEggBatch.mutateAsync({
          breedingProcessId: breedingId,
          quantity,
          pondId: currentPondId!,
        });
        Toast.show({ type: 'success', text1: 'Đã tạo lô trứng thành công!' });
      }
      queryClient.invalidateQueries({ queryKey: ['breedingProcesses'] });
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

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-4">
          <View
            className="w-11/12 rounded-2xl bg-white"
            style={{ maxHeight: '75%' }}
          >
            <View className="flex-row items-center justify-between border-b border-gray-100 p-4">
              <Text className="text-lg font-semibold">
                {isEditMode ? 'Chỉnh sửa lô trứng' : 'Đếm số lượng trứng'}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <X size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingVertical: 8,
              }}
            >
              <Text className="mb-2 text-sm text-gray-600">
                Chọn phương pháp đếm trứng phù hợp
              </Text>
              <ContextMenuField
                label="Phương pháp đếm"
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

              {countMethod === 'Đếm theo mẫu' ? (
                <View>
                  <Text className="mb-1 text-xs text-gray-500">
                    Tổng trọng lượng (g) <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={totalWeight}
                    onChangeText={(t) => {
                      setTotalWeight(normalizeDecimalInput(t));
                      if (totalWeightError) setTotalWeightError('');
                    }}
                    placeholder="VD: 500"
                    keyboardType="numeric"
                  />
                  {totalWeightError ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {totalWeightError}
                    </Text>
                  ) : null}

                  <Text className="mb-1 text-xs text-gray-500">
                    Trọng lượng mẫu (g) <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={sampleWeight}
                    onChangeText={(t) => {
                      setSampleWeight(normalizeDecimalInput(t));
                      if (sampleWeightError) setSampleWeightError('');
                    }}
                    placeholder="VD: 10"
                    keyboardType="numeric"
                  />
                  {sampleWeightError ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {sampleWeightError}
                    </Text>
                  ) : null}

                  <Text className="mb-1 text-xs text-gray-500">
                    Số lượng trong mẫu <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={sampleCount}
                    onChangeText={(t) => {
                      setSampleCount(t.replace(/[^0-9]/g, ''));
                      if (sampleCountError) setSampleCountError('');
                    }}
                    placeholder="VD: 150"
                    keyboardType="numeric"
                  />
                  {sampleCountError ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {sampleCountError}
                    </Text>
                  ) : null}

                  <ContextMenuField
                    label="Hồ"
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
                    <Text className="mb-2 text-sm text-red-500">
                      {pondError}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <View>
                  <Text className="mb-1 text-xs text-gray-500">
                    Tổng trọng lượng (g) <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={totalWeight}
                    onChangeText={(t) => {
                      setTotalWeight(normalizeDecimalInput(t));
                      if (totalWeightError) setTotalWeightError('');
                    }}
                    placeholder="VD: 500"
                    keyboardType="numeric"
                  />
                  {totalWeightError ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {totalWeightError}
                    </Text>
                  ) : null}

                  <Text className="mb-1 text-xs text-gray-500">
                    Trọng lượng trung bình 1 trứng (g){' '}
                    <Text className="text-red-500">*</Text>
                  </Text>
                  <TextInput
                    className="mb-2 rounded border border-gray-200 p-2"
                    value={avgWeight}
                    onChangeText={(t) => {
                      setAvgWeight(normalizeDecimalInput(t));
                      if (avgWeightError) setAvgWeightError('');
                    }}
                    placeholder="VD: 0.067"
                    keyboardType="numeric"
                  />
                  {avgWeightError ? (
                    <Text className="mb-2 text-sm text-red-500">
                      {avgWeightError}
                    </Text>
                  ) : null}

                  <ContextMenuField
                    label="Hồ"
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
                    <Text className="mb-2 text-sm text-red-500">
                      {pondError}
                    </Text>
                  ) : null}
                </View>
              )}
            </ScrollView>

            <View className="flex-row justify-between border-t border-gray-100 p-4">
              <TouchableOpacity
                className="rounded-lg border border-gray-200 px-4 py-2"
                onPress={handleClose}
              >
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-lg bg-primary px-4 py-2"
                onPress={handleSave}
              >
                <Text className="text-white">
                  {isEditMode ? 'Cập nhật' : 'Lưu kết quả'}
                </Text>
              </TouchableOpacity>
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
