import { useRouter } from 'expo-router';
import { Calendar, Edit, Eye, Filter, Plus, Ruler, Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AddKoiModal, { KoiFormData } from '../../../components/AddKoiModal';

interface KoiData {
  id: string;
  name: string;
  code: string;
  breed: string;
  pond: string;
  weight: string;
  length: string;
  age: string;
}

export default function KoiManagementScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [searchRFID, setSearchRFID] = useState('');
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [showAddKoiModal, setShowAddKoiModal] = useState(false);
  
  // Filter states
  const [selectedBreeds, setSelectedBreeds] = useState<string[]>([]);
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [selectedWeights, setSelectedWeights] = useState<string[]>([]);
  const [selectedLengths, setSelectedLengths] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedPonds, setSelectedPonds] = useState<string[]>([]);

  // Toggle filter selection
  const toggleFilter = (value: string, selectedArray: string[], setterFunction: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (selectedArray.includes(value)) {
      setterFunction(selectedArray.filter(item => item !== value));
    } else {
      setterFunction([...selectedArray, value]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedBreeds([]);
    setSelectedAges([]);
    setSelectedWeights([]);
    setSelectedLengths([]);
    setSelectedTypes([]);
    setSelectedPonds([]);
  };

  const handleAddKoi = (koiData: KoiFormData) => {
    // TODO: Implement add koi to database/state
    console.log('Adding new koi:', koiData);
    // Here you would typically call an API or update state
    alert(`Đã thêm cá ${koiData.name} thành công!`);
  };

  const koiData: KoiData[] = [
    {
      id: '1',
      name: 'Sakura',
      code: 'KOI-001',
      breed: 'Kohaku',
      pond: 'Bể A',
      weight: '1.2kg',
      length: '35cm',
      age: '2 năm'
    },
    {
      id: '2',
      name: 'Yamato',
      code: 'KOI-002',
      breed: 'Sanke',
      pond: 'Bể B',
      weight: '1.8kg',
      length: '42cm',
      age: '3 năm'
    },
    {
      id: '3',
      name: 'Hikari',
      code: 'KOI-003',
      breed: 'Showa',
      pond: 'Bể C',
      weight: '0.8kg',
      length: '28cm',
      age: '1.5 năm'
    }
  ];

  return (
    <>
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="p-4">
          {/* RFID Search */}
          <View className="mb-4">
            <View className="bg-white border border-gray-200 rounded-2xl px-4 flex-row items-center">
              <Search size={20} color="#6b7280" />
              <TextInput
                className="flex-1 text-gray-900"
                placeholder="Tìm kiếm bằng RFID..."
                value={searchRFID}
                onChangeText={setSearchRFID}
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-xl font-bold text-gray-900">
              Hồ sơ cá Koi
            </Text>
            <View className="flex-row items-center">
              <TouchableOpacity 
                className="p-2 mr-2"
                onPress={() => setShowFilterSheet(true)}
              >
                <Filter size={20} color="#6b7280" />
              </TouchableOpacity>
              <TouchableOpacity 
                className="rounded-lg px-3 py-2"
                style={{ backgroundColor: '#0A3D62' }}
                onPress={() => setShowAddKoiModal(true)}
              >
                <Plus size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: insets.bottom + 30 }} showsVerticalScrollIndicator={false}>
          {koiData.map((koi) => (
            <View key={koi.id} className="bg-white rounded-2xl p-2 mb-4 shadow-sm">
              <View className="flex-row">
                {/* Fish Image Placeholder */}
                <View className="w-20 h-20 bg-gray-200 rounded-lg mr-4" />
                
                {/* Fish Info */}
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">{koi.name}</Text>
                  <Text className="text-sm text-gray-600 mb-2">{koi.code} • {koi.breed}</Text>
                  
                  <View className="flex-row items-center mb-2">
                    <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    <Text className="text-sm text-gray-600">{koi.pond}</Text>
                  </View>
                  
                  <View className="flex-row">
                    <View className="flex-row items-center mr-4">
                      <Image source={require('@/assets/images/weight-icon.png')} style={{ width: 14, height: 14 }} />
                      <Text className="text-sm text-gray-600 ml-1">{koi.weight}</Text>
                    </View>
                    <View className="flex-row items-center mr-4">
                      <Ruler size={14} color="#6b7280" />
                      <Text className="text-sm text-gray-600"> {koi.length}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Calendar size={14} color="#6b7280" />
                      <Text className="text-sm text-gray-600"> {koi.age}</Text>
                    </View>
                  </View>
                </View>
              </View>
              
              {/* Action Buttons */}
              <View className="flex-row mt-4 pt-1 border-t border-gray-100">
                <TouchableOpacity 
                  className="flex-1 flex-row items-center justify-center py-2 mr-2"
                  onPress={() => router.push(`/koi/${koi.id}`)}
                >
                  <Eye size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2 text-sm">Xem</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 flex-row items-center justify-center py-2 ml-2">
                  <Edit size={16} color="#6b7280" />
                  <Text className="text-gray-600 ml-2 text-sm">Sửa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>

      {/* Filter Sheet Modal - Outside SafeAreaView */}
      <Modal
        visible={showFilterSheet}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilterSheet(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-900">Bộ lọc</Text>
            <TouchableOpacity 
              className="p-1"
              onPress={() => setShowFilterSheet(false)}
            >
              <X size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 p-4">
            <View>
          {/* Bể cá */}
          <View className="mb-2">
            <Text className="text-base font-medium text-gray-900 mb-3">Bể cá</Text>
            <View className="flex-row flex-wrap">
              {['Bể A', 'Bể B', 'Bể C', 'Bể D', 'Bể E'].map((pond, index) => {
                const isSelected = selectedPonds.includes(pond);
                return (
                  <TouchableOpacity
                    key={index}
                    className={`border border-gray-200 rounded-lg px-3 py-2 mr-2 mb-2 ${
                      isSelected ? 'border-blue-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? '#0A3D62' : '#f3f4f6' 
                    }}
                    onPress={() => toggleFilter(pond, selectedPonds, setSelectedPonds)}
                  >
                    <Text className={isSelected ? "text-white" : "text-gray-700"}>{pond}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Giống */}
          <View className="mb-2">
            <Text className="text-base font-medium text-gray-900 mb-3">Giống</Text>
            <View className="flex-row flex-wrap">
              {['Kohaku', 'Sanke', 'Showa', 'Tancho', 'Chagoi'].map((breed, index) => {
                const isSelected = selectedBreeds.includes(breed);
                return (
                  <TouchableOpacity
                    key={index}
                    className={`border border-gray-200 rounded-lg px-3 py-2 mr-2 mb-2 ${
                      isSelected ? 'border-blue-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? '#0A3D62' : '#f3f4f6' 
                    }}
                    onPress={() => toggleFilter(breed, selectedBreeds, setSelectedBreeds)}
                  >
                    <Text className={isSelected ? "text-white" : "text-gray-700"}>{breed}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Tuổi */}
          <View className="mb-2">
            <Text className="text-base font-medium text-gray-900 mb-3">Tuổi</Text>
            <View className="flex-row flex-wrap">
              {['< 1 năm', '1-2 năm', '2-3 năm', '3-5 năm', '> 5 năm'].map((age, index) => {
                const isSelected = selectedAges.includes(age);
                return (
                  <TouchableOpacity
                    key={index}
                    className={`border border-gray-200 rounded-lg px-3 py-2 mr-2 mb-2 ${
                      isSelected ? 'border-blue-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? '#0A3D62' : '#f3f4f6' 
                    }}
                    onPress={() => toggleFilter(age, selectedAges, setSelectedAges)}
                  >
                    <Text className={isSelected ? "text-white" : "text-gray-700"}>{age}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Cân nặng */}
          <View className="mb-2">
            <Text className="text-base font-medium text-gray-900 mb-3">Cân nặng</Text>
            <View className="flex-row flex-wrap">
              {['< 0.5kg', '0.5-1kg', '1-2kg', '2-3kg', '> 3kg'].map((weight, index) => {
                const isSelected = selectedWeights.includes(weight);
                return (
                  <TouchableOpacity
                    key={index}
                    className={`border border-gray-200 rounded-lg px-3 py-2 mr-2 mb-2 ${
                      isSelected ? 'border-blue-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? '#0A3D62' : '#f3f4f6' 
                    }}
                    onPress={() => toggleFilter(weight, selectedWeights, setSelectedWeights)}
                  >
                    <View className="flex-row items-center">
                      <Image source={require('@/assets/images/weight-icon.png')} style={{ width: 14, height: 14 }} tintColor={isSelected ? '#fff' : '#6b7280'} />
                      <Text className={isSelected ? "text-white ml-1" : "text-gray-700 ml-1"}>{weight}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Chiều dài */}
          <View className="mb-2">
            <Text className="text-base font-medium text-gray-900 mb-3">Chiều dài</Text>
            <View className="flex-row flex-wrap">
              {['< 20cm', '20-30cm', '30-40cm', '40-50cm', '> 50cm'].map((length, index) => {
                const isSelected = selectedLengths.includes(length);
                return (
                  <TouchableOpacity
                    key={index}
                    className={`border border-gray-200 rounded-lg px-3 py-2 mr-2 mb-2 ${
                      isSelected ? 'border-blue-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? '#0A3D62' : '#f3f4f6' 
                    }}
                    onPress={() => toggleFilter(length, selectedLengths, setSelectedLengths)}
                  >
                    <View className="flex-row items-center">
                      <Ruler size={14} color={isSelected ? "white" : "#6b7280"} />
                      <Text className={isSelected ? "text-white ml-1" : "text-gray-700 ml-1"}>{length}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Loại */}
          <View className="mb-2">
            <Text className="text-base font-medium text-gray-900 mb-3">Loại</Text>
            <View className="flex-row flex-wrap">
              {['Show', 'High', 'Pond'].map((type, index) => {
                const isSelected = selectedTypes.includes(type);
                return (
                  <TouchableOpacity
                    key={index}
                    className={`border border-gray-200 rounded-lg px-3 py-2 mr-2 mb-2 ${
                      isSelected ? 'border-blue-500' : ''
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? '#0A3D62' : '#f3f4f6' 
                    }}
                    onPress={() => toggleFilter(type, selectedTypes, setSelectedTypes)}
                  >
                    <Text className={isSelected ? "text-white" : "text-gray-700"}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

            {/* Filter Actions */}
            <View className="flex-row pb-6 border-t border-gray-200">
              <TouchableOpacity 
                className="flex-1 bg-gray-100 rounded-lg py-3 mr-2 mt-2"
                onPress={() => {
                  resetFilters();
                }}
              >
                <Text className="text-center text-gray-900 font-medium">Đặt lại</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="flex-1 rounded-lg py-3 ml-2 mt-2"
                style={{ backgroundColor: '#0A3D62' }}
                onPress={() => setShowFilterSheet(false)}
              >
                <Text className="text-center text-white font-medium">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Add Koi Modal */}
      <AddKoiModal
        visible={showAddKoiModal}
        onClose={() => setShowAddKoiModal(false)}
        onSave={handleAddKoi}
      />
    </>
  );
}