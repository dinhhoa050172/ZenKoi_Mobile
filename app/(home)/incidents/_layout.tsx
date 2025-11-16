// app/(home)/incidents/_layout.tsx (ĐÃ SỬA LỖI)
import { Stack } from 'expo-router';
import React from 'react';

export default function IncidentsLayout() {
  // Bằng cách này, Stack sẽ TỰ ĐỘNG
  // tìm tất cả các file trong thư mục (như typeCreate.tsx, index.tsx, v.v.)
  //
  // screenOptions sẽ áp dụng 'headerShown: false'
  // cho TẤT CẢ các màn hình con đó.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
  // Bạn không cần liệt kê <Stack.Screen> ở đây nữa
  // trừ khi bạn muốn tùy chỉnh tiêu đề (title) cho từng màn hình
}
