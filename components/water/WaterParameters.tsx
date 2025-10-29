import { ChevronDown, ChevronUp, Edit3, Save, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const [editingParameter, setEditingParameter] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

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

  const handleEditParameter = (parameterId: string, currentValue: string) => {
    setEditingParameter(parameterId);
    setEditValue(currentValue);
  };

  const handleSaveParameter = (parameterId: string) => {
    // TODO: Implement API call to update parameter
    console.log(
      `Updating parameter ${parameterId} to ${editValue} for pond ${pondId}`
    );
    Alert.alert('Thành công', 'Đã cập nhật thông số nước');
    setEditingParameter(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
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
                className="relative rounded-xl bg-gray-50 p-3"
              >
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-sm font-medium text-gray-700">
                    {parameter.name}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      handleEditParameter(parameter.id, parameter.value)
                    }
                    className="p-1"
                  >
                    <Edit3 size={14} color="#6b7280" />
                  </TouchableOpacity>
                </View>

                {editingParameter === parameter.id ? (
                  <View className="flex-row items-center space-x-2">
                    <TextInput
                      value={editValue}
                      onChangeText={setEditValue}
                      className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm"
                      keyboardType="numeric"
                      autoFocus
                    />
                    <TouchableOpacity
                      onPress={() => handleSaveParameter(parameter.id)}
                      className="p-1"
                    >
                      <Save size={14} color="#10b981" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCancelEdit}
                      className="p-1"
                    >
                      <X size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
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
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity className="mt-4 rounded-xl bg-blue-500 py-3">
            <Text className="text-center font-medium text-white">
              Đo thông số mới
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
