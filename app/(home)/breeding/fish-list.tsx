import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Calendar, Edit, Eye, Ruler } from "lucide-react-native";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

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
  const { from, breedingId } = useLocalSearchParams();

  // Mock data cho danh sách cá
  const fishList: FishData[] = [
    {
      id: "1",
      code: "KOI-001",
      breed: "Kohaku",
      pond: "Bể A",
      weight: 1.2,
      length: 35,
      age: 1.5,
    },
    {
      id: "2",
      code: "KOI-002",
      breed: "Kohaku",
      pond: "Bể A",
      weight: 1.2,
      length: 35,
      age: 1.5,
    },
    {
      id: "3",
      code: "KOI-003",
      breed: "Kohaku",
      pond: "Bể A",
      weight: 1.2,
      length: 35,
      age: 2.5,
    },
    {
      id: "4",
      code: "KOI-004",
      breed: "Sanke",
      pond: "Bể B",
      weight: 1.5,
      length: 38,
      age: 2.0,
    },
    {
      id: "5",
      code: "KOI-005",
      breed: "Showa",
      pond: "Bể B",
      weight: 1.8,
      length: 42,
      age: 3.0,
    },
    {
      id: "6",
      code: "KOI-006",
      breed: "Kohaku",
      pond: "Bể A",
      weight: 1.3,
      length: 36,
      age: 1.0,
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row items-center p-4 bg-white border-b border-gray-200">
        <TouchableOpacity className="mr-3" onPress={() => {
          // Navigate back based on source
          if (from === 'breeding-detail' && breedingId) {
            router.push(`/breeding/${breedingId}`);
          } else if (router.canGoBack()) {
            router.back();
          } else {
            // Fallback to breeding main page
            router.push('/breeding');
          }
        }}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-gray-900 flex-1">
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
              className="bg-white rounded-2xl p-2 my-4 shadow-sm"
            >
              <View className="flex-row">
                {/* Fish Image Placeholder */}
                <View className="w-20 h-20 bg-gray-200 rounded-lg mr-4" />

                {/* Fish Info */}
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 mb-1">
                    Sakura
                  </Text>
                  <Text className="text-sm text-gray-600 mb-2">
                    {fish.code} • {fish.breed}
                  </Text>

                  <View className="flex-row items-center mb-2">
                    <View className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    <Text className="text-sm text-gray-600">{fish.pond}</Text>
                  </View>

                  <View className="flex-row">
                    <View className="flex-row items-center mr-4">
                      <Image
                        source={require("@/assets/images/weight-icon.png")}
                        style={{ width: 14, height: 14 }}
                      />
                      <Text className="text-sm text-gray-600 ml-1">
                        {fish.weight}kg
                      </Text>
                    </View>
                    <View className="flex-row items-center mr-4">
                      <Ruler size={14} color="#6b7280" />
                      <Text className="text-sm text-gray-600">
                        {" "}
                        {fish.length}cm
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                        <Calendar size={14} color="#6b7280" />
                        <Text className="text-sm text-gray-600 ml-1">
                            {fish.age} tuổi
                        </Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Buttons */}
              <View className="flex-row mt-2 pt-1 border-t border-gray-200">
                <TouchableOpacity 
                  className="flex-1 flex-row items-center justify-center py-2 mr-2 border-r border-gray-200" 
                  onPress={() => router.push(`/koi/${fish.id}?from=breeding-fish-list&breedingId=${breedingId || '1'}`)}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
