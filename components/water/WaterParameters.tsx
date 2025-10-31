import { ChevronDown, ChevronUp, Edit3 } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Toast from 'react-native-toast-message';

interface WaterParameter {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  range: string;
}

interface WaterParametersProps {
  pondId: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function WaterParameters({
  pondId,
  isExpanded,
  onToggle,
}: WaterParametersProps) {
  const [editingParameter, setEditingParameter] =
    useState<WaterParameter | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isNewMeasurementModalVisible, setIsNewMeasurementModalVisible] =
    useState(false);
  const [newValues, setNewValues] = useState<{ [key: string]: string }>({});

  // Mock data - replace with real API call later
  const waterParameters: WaterParameter[] = [
    {
      id: '1',
      name: 'pH',
      value: '7.2',
      unit: '',
      status: 'normal',
      range: '6.5 - 8.5',
    },
    {
      id: '2',
      name: 'Nhiệt độ',
      value: '24.5',
      unit: '°C',
      status: 'normal',
      range: '18 - 28',
    },
    {
      id: '3',
      name: 'Oxy hòa tan',
      value: '6.8',
      unit: 'mg/L',
      status: 'normal',
      range: '5 - 12',
    },
    {
      id: '4',
      name: 'Ammonia',
      value: '0.8',
      unit: 'mg/L',
      status: 'warning',
      range: '0 - 0.5',
    },
    {
      id: '5',
      name: 'Nitrite',
      value: '0.25',
      unit: 'mg/L',
      status: 'warning',
      range: '0 - 0.2',
    },
    {
      id: '6',
      name: 'Nitrate',
      value: '20',
      unit: 'mg/L',
      status: 'normal',
      range: '0 - 40',
    },
  ];

  const getParameterStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const handleEditParameter = (parameter: WaterParameter) => {
    setEditingParameter(parameter);
    setEditValue(parameter.value);
    setIsModalVisible(true);
  };

  const handleValueChange = (text: string) => {
    const filteredText = text.replace(/[^0-9.,]/g, '');

    const dotCount = (filteredText.match(/\./g) || []).length;
    const commaCount = (filteredText.match(/,/g) || []).length;

    if (dotCount + commaCount <= 1) {
      setEditValue(filteredText);
    }
  };

  const handleNewValueChange = (parameterId: string, text: string) => {
    const filteredText = text.replace(/[^0-9.,]/g, '');

    const dotCount = (filteredText.match(/\./g) || []).length;
    const commaCount = (filteredText.match(/,/g) || []).length;

    if (dotCount + commaCount <= 1) {
      setNewValues((prev) => ({
        ...prev,
        [parameterId]: filteredText,
      }));
    }
  };

  const handleOpenNewMeasurement = () => {
    // Initialize với giá trị hiện tại
    const initialValues: { [key: string]: string } = {};
    waterParameters.forEach((param) => {
      initialValues[param.id] = param.value;
    });
    setNewValues(initialValues);
    setIsNewMeasurementModalVisible(true);
  };

  const handleSaveNewMeasurement = () => {
    // TODO: Implement API call to save all new parameters
    console.log('Saving new measurements for pond', pondId, newValues);

    Toast.show({
      type: 'success',
      text1: 'Thành công',
      text2: 'Đã cập nhật tất cả thông số nước',
      position: 'top',
      visibilityTime: 3000,
    });

    setIsNewMeasurementModalVisible(false);
    setNewValues({});
  };

  const handleCancelNewMeasurement = () => {
    setIsNewMeasurementModalVisible(false);
    setNewValues({});
  };

  const handleSaveParameter = () => {
    if (!editingParameter) return;

    // TODO: Implement API call to update parameter
    console.log(
      `Updating parameter ${editingParameter.id} to ${editValue} for pond ${pondId}`
    );

    Toast.show({
      type: 'success',
      text1: 'Thành công',
      text2: 'Đã cập nhật thông số nước',
      position: 'top',
      visibilityTime: 3000,
    });

    setIsModalVisible(false);
    setEditingParameter(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setIsModalVisible(false);
    setEditingParameter(null);
    setEditValue('');
  };

  return (
    <View className="mb-4 rounded-2xl bg-white shadow-sm">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between p-4"
      >
        <Text className="text-lg font-semibold text-gray-900">
          Thông số nước
        </Text>
        {isExpanded ? (
          <ChevronUp size={20} color="#6b7280" />
        ) : (
          <ChevronDown size={20} color="#6b7280" />
        )}
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-4 pb-4">
          <View className="grid grid-cols-2 gap-3">
            {waterParameters.map((parameter) => (
              <View
                key={parameter.id}
                className="relative rounded-2xl bg-gray-50 p-3"
              >
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-sm font-medium text-gray-700">
                    {parameter.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleEditParameter(parameter)}
                    className="p-1"
                  >
                    <Edit3 size={14} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                <View>
                  <Text
                    className={`text-lg font-bold ${getParameterStatusColor(parameter.status)}`}
                  >
                    {parameter.value} {parameter.unit}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    Bình thường: {parameter.range}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={handleOpenNewMeasurement}
            className="mt-4 rounded-2xl bg-blue-500 py-3"
          >
            <Text className="text-center font-medium text-white">
              Đo thông số mới
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Modal */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-4">
          <View className="w-full max-w-md rounded-2xl bg-white p-6">
            <Text className="mb-4 text-xl font-bold text-gray-900">
              Chỉnh sửa thông số
            </Text>

            {editingParameter && (
              <>
                <Text className="mb-2 text-sm font-medium text-gray-700">
                  {editingParameter.name}
                </Text>
                <Text className="mb-2 text-xs text-gray-500">
                  Khoảng bình thường: {editingParameter.range}{' '}
                  {editingParameter.unit}
                </Text>
                <TextInput
                  value={editValue}
                  onChangeText={handleValueChange}
                  className="mb-4 rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
                  keyboardType="decimal-pad"
                  placeholder={`Nhập giá trị ${editingParameter.unit}`}
                  autoFocus
                />

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleCancelEdit}
                    className="flex-1 rounded-lg bg-red-500 py-3"
                  >
                    <Text className="text-center font-medium text-white">
                      Hủy
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSaveParameter}
                    className="flex-1 rounded-lg bg-primary py-3"
                  >
                    <Text className="text-center font-medium text-white">
                      Lưu
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* New Measurement Modal */}
      <Modal
        visible={isNewMeasurementModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelNewMeasurement}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-4">
          <View
            className="w-full max-w-md rounded-2xl bg-white p-6"
            style={{ maxHeight: '80%' }}
          >
            <Text className="mb-4 text-xl font-bold text-gray-900">
              Đo thông số mới
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {waterParameters.map((parameter) => (
                <View key={parameter.id} className="mb-4">
                  <Text className="mb-1 text-sm font-medium text-gray-700">
                    {parameter.name}
                  </Text>
                  <Text className="mb-2 text-xs text-gray-500">
                    Khoảng bình thường: {parameter.range} {parameter.unit}
                  </Text>
                  <TextInput
                    value={newValues[parameter.id] || ''}
                    onChangeText={(text) =>
                      handleNewValueChange(parameter.id, text)
                    }
                    className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
                    keyboardType="decimal-pad"
                    placeholder={`Nhập ${parameter.name.toLowerCase()} ${parameter.unit}`}
                  />
                </View>
              ))}
            </ScrollView>

            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={handleCancelNewMeasurement}
                className="flex-1 rounded-lg bg-red-500 py-3"
              >
                <Text className="text-center font-medium text-white">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveNewMeasurement}
                className="flex-1 rounded-lg bg-primary py-3"
              >
                <Text className="text-center font-medium text-white">
                  Lưu tất cả
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
