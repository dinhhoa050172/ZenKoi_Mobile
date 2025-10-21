import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Edit, Eye, Ruler } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

interface FishData {
  id: string;
  code: string;
  breed: string;
  pond: string;
  weight: number;
  length: number;
  image?: string;
  age?: number;
}

export default function FishListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams(); // TODO: Use this id to fetch fish list for specific breeding cycle from API

  // Mock data cho danh sách cá
  const fishList: FishData[] = [
    {
      id: '1',
      code: 'KOI-001',
      breed: 'Kohaku',
      pond: 'Bể A',
      weight: 1.2,
      length: 35,
      age: 1.5,
    },
    {
      id: '2',
      code: 'KOI-002',
      breed: 'Kohaku',
      pond: 'Bể A',
      weight: 1.2,
      length: 35,
      age: 1.5,
    },
    {
      id: '3',
      code: 'KOI-003',
      breed: 'Kohaku',
      pond: 'Bể A',
      weight: 1.2,
      length: 35,
      age: 2.5,
    },
    {
      id: '4',
      code: 'KOI-004',
      breed: 'Sanke',
      pond: 'Bể B',
      weight: 1.5,
      length: 38,
      age: 2.0,
    },
    {
      id: '5',
      code: 'KOI-005',
      breed: 'Showa',
      pond: 'Bể B',
      weight: 1.8,
      length: 42,
      age: 3.0,
    },
    {
      id: '6',
      code: 'KOI-006',
      breed: 'Kohaku',
      pond: 'Bể A',
      weight: 1.3,
      length: 36,
      age: 1.0,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center border-b border-gray-200 bg-white p-4">
        <TouchableOpacity className="mr-3" onPress={() => router.back()}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="flex-1 text-lg font-semibold text-gray-900">
          Danh sách cá định danh
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4">
          {fishList.map((fish) => (
            <View
              key={fish.id}
              className="my-4 rounded-2xl bg-white p-2 shadow-sm"
            >
              <View className="flex-row">
                {/* Fish Image Placeholder */}
                <View className="mr-4 h-20 w-20 rounded-lg bg-gray-200" />

                {/* Fish Info */}
                <View className="flex-1">
                  <Text className="mb-1 text-lg font-bold text-gray-900">
                    Sakura
                  </Text>
                  <Text className="mb-2 text-sm text-gray-600">
                    {fish.code} • {fish.breed}
                  </Text>

                  <View className="mb-2 flex-row items-center">
                    <View className="mr-2 h-2 w-2 rounded-full bg-red-500" />
                    <Text className="text-sm text-gray-600">{fish.pond}</Text>
                  </View>

                  <View className="flex-row">
                    <View className="mr-4 flex-row items-center">
                      <Image
                        source={require('@/assets/images/weight-icon.png')}
                        style={{ width: 14, height: 14 }}
                      />
                      <Text className="ml-1 text-sm text-gray-600">
                        {fish.weight}kg
                      </Text>
                    </View>
                    <View className="mr-4 flex-row items-center">
                      <Ruler size={14} color="#6b7280" />
                      <Text className="text-sm text-gray-600">
                        {' '}
                        {fish.length}cm
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Calendar size={14} color="#6b7280" />
                      <Text className="ml-1 text-sm text-gray-600">
                        {fish.age} tuổi
                      </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="mt-2 flex-row border-t border-gray-200 pt-1">
                <TouchableOpacity
                  className="mr-2 flex-1 flex-row items-center justify-center border-r border-gray-200 py-2"
                  onPress={() => router.push(`/koi/${fish.id}`)}
                >
                  <Eye size={16} color="#6b7280" />
                  <Text className="ml-2 text-sm text-gray-600">Xem</Text>
                </TouchableOpacity>
                <TouchableOpacity className="ml-2 flex-1 flex-row items-center justify-center py-2">
                  <Edit size={16} color="#6b7280" />
                  <Text className="ml-2 text-sm text-gray-600">Sửa</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
