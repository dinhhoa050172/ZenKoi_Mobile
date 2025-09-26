import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MapPin,
  Minus,
  Plus
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface WaterParameter {
  id: string;
  name: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  range: string;
}

interface FishData {
  id: string;
  name: string;
  species: string;
  age: string;
  health: 'good' | 'fair' | 'poor';
}

export default function PondDetailScreen() {
  const { id } = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [showAddFishForm, setShowAddFishForm] = useState(false);
  const [showRemoveFishForm, setShowRemoveFishForm] = useState(false);
  const [showIncidentForm, setShowIncidentForm] = useState(false);
  const [editingParameter, setEditingParameter] = useState<string | null>(null);
  const [showAllFish, setShowAllFish] = useState(false);
  const [showIncidentTypeDropdown, setShowIncidentTypeDropdown] = useState(false);
  const [selectedIncidentType, setSelectedIncidentType] = useState('Cá chết');

  // Mock data for pond details
  const pondData = {
    id: '1',
    name: 'Hồ số 1',
    location: 'Khu vực A',
    volume: '5.000 L',
    fishCount: 25,
    lastCheck: '2025-09-24 07:30',
    status: 'warning' as const
  };

  const waterParameters: WaterParameter[] = [
    {
      id: '1',
      name: 'pH',
      value: '7.2',
      unit: '',
      status: 'normal',
      range: '6.5 - 8.5'
    },
    {
      id: '2',
      name: 'Nhiệt độ',
      value: '24.5',
      unit: '°C',
      status: 'normal',
      range: '18 - 28'
    },
    {
      id: '3',
      name: 'Oxy hòa tan',
      value: '6.8',
      unit: 'mg/L',
      status: 'normal',
      range: '5 - 12'
    },
    {
      id: '4',
      name: 'Ammonia',
      value: '0.8',
      unit: 'mg/L',
      status: 'warning',
      range: '0 - 0.5'
    },
    {
      id: '5',
      name: 'Nitrite',
      value: '0.25',
      unit: 'mg/L',
      status: 'warning',
      range: '0 - 0.2'
    },
    {
      id: '6',
      name: 'Nitrate',
      value: '20',
      unit: 'mg/L',
      status: 'normal',
      range: '0 - 40'
    }
  ];

  const fishData: FishData[] = [
    {
      id: '1',
      name: 'Koi Kohaku #001',
      species: 'Kohaku',
      age: '2 năm',
      health: 'good'
    },
    {
      id: '2',
      name: 'Koi Sanke #002',
      species: 'Sanke',
      age: '3 năm',
      health: 'good'
    },
    {
      id: '3',
      name: 'Koi Showa #003',
      species: 'Showa',
      age: '1.5 năm',
      health: 'fair'
    },
    {
      id: '4',
      name: 'Koi Taisho #004',
      species: 'Taisho Sanke',
      age: '2.5 năm',
      health: 'good'
    },
    {
      id: '5',
      name: 'Koi Chagoi #005',
      species: 'Chagoi',
      age: '4 năm',
      health: 'good'
    },
    {
      id: '6',
      name: 'Koi Bekko #006',
      species: 'Shiro Bekko',
      age: '1 năm',
      health: 'fair'
    },
    {
      id: '7',
      name: 'Koi Utsurimono #007',
      species: 'Ki Utsuri',
      age: '3.5 năm',
      health: 'poor'
    }
  ];

  const historyData = [
    {
      id: '1',
      action: 'Đo chất lượng nước',
      time: '2 giờ trước',
      details: 'pH: 7.2, Nhiệt độ: 24°C'
    },
    {
      id: '2',
      action: 'Cho ăn cá',
      time: '6 giờ trước',
      details: 'Thức ăn pellet 500g'
    }
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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

  const getFishHealthColor = (health: string) => {
    switch (health) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFishHealthText = (health: string) => {
    switch (health) {
      case 'good':
        return 'Tốt';
      case 'fair':
        return 'Khá';
      case 'poor':
        return 'Yếu';
      default:
        return 'Không rõ';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm border-b border-gray-200">
        <View className="flex-row items-center p-4">
          <TouchableOpacity 
            onPress={() => router.navigate('/(home)/water')}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3"
          >
            <ArrowLeft size={20} color="#6b7280" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            Quản lý hồ cá
          </Text>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: insets.bottom + 20 }} showsVerticalScrollIndicator={false}>
        <View className="p-4">
          {/* Pond Basic Info */}
          <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <View className="w-8 h-8 bg-red-100 rounded-full items-center justify-center mr-3">
                <MapPin size={16} color="#ef4444" />
              </View>
              <Text className="text-xl font-bold text-gray-900">{pondData.name}</Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <View className="flex-1 mr-2">
                <Text className="text-sm text-gray-500">Vị trí</Text>
                <Text className="font-medium text-gray-900">{pondData.location}</Text>
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-sm text-gray-500">Dung tích</Text>
                <Text className="font-medium text-gray-900">{pondData.volume}</Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-sm text-gray-500">Số lượng cá</Text>
                <Text className="font-medium text-gray-900">{pondData.fishCount} con</Text>
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-sm text-gray-500">Kiểm tra cuối</Text>
                <Text className="font-medium text-gray-900">{pondData.lastCheck}</Text>
              </View>
            </View>
          </View>

          {/* Expandable Sections */}
          
          {/* Water Parameters Section */}
          <View className="bg-white rounded-2xl mb-4 shadow-sm">
            <TouchableOpacity
              onPress={() => toggleSection('water')}
              className="flex-row items-center justify-between p-4"
            >
              <Text className="text-lg font-semibold text-gray-900">Thông số nước</Text>
              {expandedSection === 'water' ? (
                <ChevronUp size={20} color="#6b7280" />
              ) : (
                <ChevronDown size={20} color="#6b7280" />
              )}
            </TouchableOpacity>

            {expandedSection === 'water' && (
              <View className="border-t border-gray-100 p-4">
                {waterParameters.map((param, index) => (
                  <View key={param.id} className="mb-4 last:mb-0">
                    {/* Parameter Header */}
                    <View className="flex-row items-center justify-between my-2">
                      <View className="flex-row items-center">
                        <Text className="font-medium text-gray-900 mr-2">{param.name}</Text>
                        {param.status === 'normal' && (
                          <View className="bg-green-500 px-2 py-0.5 rounded">
                            <Text className="text-white text-xs font-medium">Tốt</Text>
                          </View>
                        )}
                        {param.status === 'warning' && (
                          <View className="bg-yellow-500 px-2 py-0.5 rounded">
                            <Text className="text-white text-xs font-medium">Cần theo dõi</Text>
                          </View>
                        )}
                        {param.status === 'critical' && (
                          <View className="bg-red-500 px-2 py-0.5 rounded">
                            <Text className="text-white text-xs font-medium">Nguy hiểm</Text>
                          </View>
                        )}
                      </View>
                      <TouchableOpacity 
                        className={`px-3 py-1 rounded-full ${editingParameter === param.id ? 'bg-red-500' : 'bg-gray-100'}`}
                        onPress={() => setEditingParameter(editingParameter === param.id ? null : param.id)}
                      >
                        <Text className={`text-sm ${editingParameter === param.id ? 'text-white' : 'text-gray-700'}`}>
                          {editingParameter === param.id ? 'Hủy' : 'Cập nhật'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Edit Form */}
                    {editingParameter === param.id && (
                      <View className="bg-gray-100 rounded-2xl p-3 mb-3">
                        <Text className="text-gray-700 font-medium mb-2">Giá trị mới</Text>
                        <View className="flex-row items-center">
                          <TextInput
                            placeholder={param.value}
                            defaultValue={param.value}
                            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 mr-2"
                            keyboardType="numeric"
                          />
                          <TouchableOpacity 
                            className="px-4 py-2 rounded-lg"
                            style={{ backgroundColor: '#0A3D62' }}
                          >
                            <Text className="text-white font-medium">Lưu</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Parameter Value */}
                    <View className="mb-2">
                      <Text className={`text-2xl font-bold ${getParameterStatusColor(param.status)} mb-2`}>
                        {param.value} {param.unit}
                      </Text>
                    </View>

                    {/* Min Max Value and Progress Bar */}
                    <View>
                      <View className="flex-row justify-between mb-1">
                        <Text className="text-sm text-gray-500">
                          Min: {param.range.split(' - ')[0]}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          Max: {param.range.split(' - ')[1]}
                        </Text>
                      </View>
                      <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <View 
                          className={`h-full rounded-full ${
                            param.status === 'normal' ? 'bg-green-500' : 
                            param.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, Math.max(0, 
                              (parseFloat(param.value) / parseFloat(param.range.split(' - ')[1])) * 100
                            ))}%` 
                          }}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Fish Management Section */}
          <View className="bg-white rounded-2xl mb-4 shadow-sm">
            <TouchableOpacity
              onPress={() => toggleSection('fish')}
              className="flex-row items-center justify-between p-4"
            >
              <Text className="text-lg font-semibold text-gray-900">Quản lý cá</Text>
              {expandedSection === 'fish' ? (
                <ChevronUp size={20} color="#6b7280" />
              ) : (
                <ChevronDown size={20} color="#6b7280" />
              )}
            </TouchableOpacity>

            {expandedSection === 'fish' && (
              <View className="border-t border-gray-100 p-4">
                {/* Action Buttons */}
                <View className="flex-row mb-6">
                  <TouchableOpacity 
                    className="flex-1 rounded-lg py-3 mr-2"
                    style={{ backgroundColor: '#0A3D62' }}
                    onPress={() => {
                      setShowAddFishForm(!showAddFishForm);
                      if (!showAddFishForm) setShowRemoveFishForm(false);
                    }}
                  >
                    <Text className="text-white text-center font-medium">Thêm cá vào hồ</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-1 rounded-lg py-3 ml-2"
                    style={{ backgroundColor: '#1e5f8a' }}
                    onPress={() => {
                      setShowRemoveFishForm(!showRemoveFishForm);
                      if (!showRemoveFishForm) setShowAddFishForm(false);
                    }}
                  >
                    <Text className="text-white text-center font-medium">Lấy cá ra khỏi hồ</Text>
                  </TouchableOpacity>
                </View>

                {/* Thêm cá vào hồ Form */}
                {showAddFishForm && (
                  <View className="mb-6 bg-gray-50 rounded-lg p-4">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Thêm cá vào hồ</Text>
                    
                    <View className="mb-4">
                      <Text className="text-gray-700 font-medium mb-2">Số lượng</Text>
                      <TextInput
                        placeholder="Nhập số lượng cá"
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                        keyboardType="numeric"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-700 font-medium mb-2">Giống cá</Text>
                      <TextInput
                        placeholder="VD: Kohaku, ..."
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-700 font-medium mb-2">Kích thước trung bình</Text>
                      <TextInput
                        placeholder="VD: 10 - 15cm"
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-700 font-medium mb-2">RFID (nếu có)</Text>
                      <TextInput
                        placeholder="VD: RF01321"
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-700 font-medium mb-2">Ghi chú</Text>
                      <TextInput
                        placeholder="Ghi chú thêm"
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>

                    <TouchableOpacity 
                      className="rounded-lg py-3 flex-row items-center justify-center"
                      style={{ backgroundColor: '#0A3D62' }}
                    >
                      <Plus size={16} color="white" />
                      <Text className="text-white font-medium ml-2">Thêm cá</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Lấy cá ra khỏi hồ Form */}
                {showRemoveFishForm && (
                  <View className="mb-6 bg-gray-50 rounded-lg p-4">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Lấy cá ra khỏi hồ</Text>
                    
                    <View className="mb-4">
                      <Text className="text-gray-700 font-medium mb-2">Số lượng</Text>
                      <TextInput
                        placeholder="Nhập số lượng cá"
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                        keyboardType="numeric"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-700 font-medium mb-2">RFID (nếu có)</Text>
                      <TextInput
                        placeholder="VD: RF01321"
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-700 font-medium mb-2">Lý do</Text>
                      <TextInput
                        placeholder="VD: Bán, chết, ..."
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                      />
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-700 font-medium mb-2">Ghi chú</Text>
                      <TextInput
                        placeholder="Ghi chú thêm"
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>

                    <TouchableOpacity 
                      className="rounded-lg py-3 flex-row items-center justify-center"
                      style={{ backgroundColor: '#1e5f8a' }}
                    >
                      <Minus size={16} color="white" />
                      <Text className="text-white font-medium ml-2">Lấy cá ra</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Fish List */}
                <View className="mt-6">
                  <Text className="text-lg font-semibold text-gray-900 mb-4">Danh sách cá trong hồ</Text>
                  
                  {fishData.slice(0, showAllFish ? fishData.length : 4).map((fish, index) => (
                    <View key={fish.id} className="bg-gray-50 rounded-lg p-4 mb-3">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="font-medium text-gray-900">{fish.name}</Text>
                        <View className={`px-2 py-1 rounded ${getFishHealthColor(fish.health)}`}>
                          <Text className="text-xs font-medium">{getFishHealthText(fish.health)}</Text>
                        </View>
                      </View>
                      
                      <View className="flex-row justify-between items-center">
                        <View>
                          <Text className="text-sm text-gray-600">Giống: {fish.species}</Text>
                          <Text className="text-sm text-gray-600">Tuổi: {fish.age}</Text>
                        </View>
                        <TouchableOpacity 
                          className="px-3 py-1 rounded"
                          style={{ backgroundColor: '#e0f2fe' }}
                        >
                          <Text className="text-sm" style={{ color: '#0A3D62' }}>Chi tiết</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {fishData.length > 4 && (
                    <TouchableOpacity 
                      className="border border-gray-200 rounded-lg py-3 mt-2"
                      onPress={() => setShowAllFish(!showAllFish)}
                    >
                      <Text className="text-center text-gray-600">
                        {showAllFish ? 'Thu gọn' : `Xem thêm (còn ${fishData.length - 4} con)`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>

          {/* History Section */}
          <View className="bg-white rounded-2xl mb-4 shadow-sm">
            <TouchableOpacity
              onPress={() => toggleSection('history')}
              className="flex-row items-center justify-between p-4"
            >
              <Text className="text-lg font-semibold text-gray-900">Lịch sử</Text>
              {expandedSection === 'history' ? (
                <ChevronUp size={20} color="#6b7280" />
              ) : (
                <ChevronDown size={20} color="#6b7280" />
              )}
            </TouchableOpacity>

            {expandedSection === 'history' && (
              <View className="border-t border-gray-100 p-4">
                {/* History Items */}
                <View className="py-3 border-b border-gray-50">
                  <View className="flex-row items-center mb-2">
                    <View className="w-3 h-3 bg-blue-500 rounded-full mr-3"></View>
                    <Text className="font-medium text-gray-900">Cập nhật pH</Text>
                  </View>
                  <Text className="text-sm text-gray-600 mb-1">pH được điều chỉnh từ 7.5 xuống 7.2</Text>
                  <Text className="text-xs text-gray-400">2025-09-24 07:30</Text>
                </View>

                <View className="py-3 border-b border-gray-50">
                  <View className="flex-row items-center mb-2">
                    <View className="w-3 h-3 bg-green-500 rounded-full mr-3"></View>
                    <Text className="font-medium text-gray-900">Cho cá ăn</Text>
                  </View>
                  <Text className="text-sm text-gray-600 mb-1">Cho cá ăn thức ăn viên cao cấp - 500g</Text>
                  <Text className="text-xs text-gray-400">2025-09-24 06:00</Text>
                </View>

                <View className="py-3 border-b border-gray-50">
                  <View className="flex-row items-center mb-2">
                    <View className="w-3 h-3 bg-orange-500 rounded-full mr-3"></View>
                    <Text className="font-medium text-gray-900">Vệ sinh hồ</Text>
                  </View>
                  <Text className="text-sm text-gray-600 mb-1">Làm sạch bộ lọc và thay 20% nước</Text>
                  <Text className="text-xs text-gray-400">2025-09-23 14:30</Text>
                </View>

                <View className="py-3 border-b border-gray-50">
                  <View className="flex-row items-center mb-2">
                    <View className="w-3 h-3 bg-gray-500 rounded-full mr-3"></View>
                    <Text className="font-medium text-gray-900">Bảo trì máy bơm</Text>
                  </View>
                  <Text className="text-sm text-gray-600 mb-1">Kiểm tra và vệ sinh máy bơm nước</Text>
                  <Text className="text-xs text-gray-400">2025-09-22 16:20</Text>
                </View>

                <TouchableOpacity className="mt-4 py-3 border border-gray-200 rounded-lg">
                  <Text className="text-center text-gray-600">Xem thêm lịch sử</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Care History Section */}
          <View className="bg-white rounded-2xl mb-4 shadow-sm">
            <TouchableOpacity
              onPress={() => toggleSection('care')}
              className="flex-row items-center justify-between p-4"
            >
              <Text className="text-lg font-semibold text-gray-900">Quản lý sự cố</Text>
              {expandedSection === 'care' ? (
                <ChevronUp size={20} color="#6b7280" />
              ) : (
                <ChevronDown size={20} color="#6b7280" />
              )}
            </TouchableOpacity>

            {expandedSection === 'care' && (
              <View className="border-t border-gray-100 p-4">
                {/* Add Incident Button */}
                <TouchableOpacity 
                  className="rounded-lg py-3 flex-row items-center justify-center mb-6"
                  style={{ backgroundColor: '#d32f2f' }}
                  onPress={() => setShowIncidentForm(!showIncidentForm)}
                >
                  <Plus size={16} color="white" />
                  <Text className="text-white font-medium ml-2">Thêm sự cố mới</Text>
                </TouchableOpacity>

                {/* Add Incident Form */}
                {showIncidentForm && (
                  <View className="mb-6 bg-gray-50 rounded-lg p-4">
                    <Text className="text-lg font-semibold text-gray-900 mb-4">Thêm sự cố mới</Text>
                    
                    <View className="mb-4">
                      <Text className="text-gray-700 font-medium mb-2">Loại sự cố</Text>
                      <TouchableOpacity 
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex-row items-center justify-between"
                        onPress={() => setShowIncidentTypeDropdown(!showIncidentTypeDropdown)}
                      >
                        <Text className="text-gray-900">{selectedIncidentType}</Text>
                        <ChevronDown size={20} color="#6b7280" />
                      </TouchableOpacity>
                      
                      {showIncidentTypeDropdown && (
                        <View className="bg-white border border-gray-200 rounded-lg mt-2 overflow-hidden">
                          {['Cá chết', 'Cá bệnh', 'Thiết bị hỏng', 'Khác'].map((type, index) => (
                            <TouchableOpacity
                              key={index}
                              className={`px-4 py-3 ${index < 3 ? 'border-b border-gray-100' : ''}`}
                              onPress={() => {
                                setSelectedIncidentType(type);
                                setShowIncidentTypeDropdown(false);
                              }}
                            >
                              <Text className="text-gray-900">{type}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>

                    <View className="mb-4">
                      <Text className="text-gray-700 font-medium mb-2">Số lượng</Text>
                      <TextInput
                        placeholder="VD: 2"
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                        keyboardType="numeric"
                      />
                    </View>

                    {(selectedIncidentType === 'Cá chết' || selectedIncidentType === 'Cá bệnh') && (
                      <View className="mb-4">
                        <Text className="text-gray-700 font-medium mb-2">RFID (nếu có)</Text>
                        <TextInput
                          placeholder="VD: RF01321"
                          className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                        />
                      </View>
                    )}

                    <View className="mb-4">
                      <Text className="text-gray-700 font-medium mb-2">Lý do</Text>
                      <TextInput
                        placeholder="Mô tả chi tiết lý do..."
                        className="bg-white border border-gray-200 rounded-lg px-4 py-3"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    </View>

                    <View className="flex-row">
                      <TouchableOpacity 
                        className="flex-1 bg-primary rounded-lg py-3 flex-row items-center justify-center mr-2"
                      >
                        <Plus size={16} color="white" />
                        <Text className="text-white font-medium ml-2">Thêm sự cố</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        className="flex-1 rounded-lg py-3 flex-row items-center justify-center ml-2 bg-white border border-gray-200"
                        onPress={() => setShowIncidentForm(false)}
                      >
                        <Text className="text-black font-medium">Hủy</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Incident History */}
                <View className="border-t border-gray-100 pt-4">
                  <Text className="text-lg font-semibold text-gray-900 mb-4">Lịch sử sự cố</Text>
                  
                  <View className="mb-4">
                    <View className="flex-row items-center mb-3">
                      <View className="w-3 h-3 bg-orange-500 rounded-full mr-3"></View>
                      <Text className="font-medium text-gray-900">Cá chết</Text>
                    </View>
                    <Text className="text-sm text-gray-600 mb-1">Số lượng: 1</Text>
                    <Text className="text-sm text-gray-600 mb-1">Lý do: Thiếu dinh dưỡng</Text>
                    <Text className="text-xs text-gray-400">2025-09-23 14:30</Text>
                  </View>

                  <View className="mb-4">
                    <View className="flex-row items-center mb-3">
                      <View className="w-3 h-3 bg-red-500 rounded-full mr-3"></View>
                      <Text className="font-medium text-gray-900">Hệ thống lọc hỏng</Text>
                    </View>
                    <Text className="text-sm text-gray-600 mb-1">Số lượng: 1</Text>
                    <Text className="text-sm text-gray-600 mb-1">Lý do: Máy bơm không hoạt động</Text>
                    <Text className="text-xs text-gray-400">2025-09-20 09:15</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}