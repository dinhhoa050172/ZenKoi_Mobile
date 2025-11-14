import React from 'react';
import { Text, TextInput, View } from 'react-native';

type Props = {
  icon: React.ReactElement;
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'numeric';
  iconBg: string;
  multiline?: boolean;
  editable?: boolean;
  helper?: string;
};

export default function InputField({
  icon,
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  iconBg,
  multiline = false,
  editable = true,
  helper,
}: Props) {
  const handleChange = (text: string) => {
    if (keyboardType === 'numeric') {
      // Remove any character that is not a digit, dot or comma
      let filtered = text.replace(/[^0-9.,]/g, '');

      const firstDot = filtered.indexOf('.');
      const firstComma = filtered.indexOf(',');

      let sepIndex = -1;
      let sepChar = '';
      if (firstDot !== -1 && (firstComma === -1 || firstDot < firstComma)) {
        sepIndex = firstDot;
        sepChar = '.';
      } else if (firstComma !== -1) {
        sepIndex = firstComma;
        sepChar = ',';
      }

      if (sepIndex === -1) {
        filtered = filtered.replace(/[.,]/g, '');
        onChangeText(filtered);
        return;
      }

      const before = filtered.slice(0, sepIndex);
      const after = filtered.slice(sepIndex + 1).replace(/[.,]/g, '');
      const result = before + sepChar + after;
      onChangeText(result);
    } else {
      onChangeText(text);
    }
  };

  return (
    <View className="flex-row items-center">
      <View
        className={`h-9 w-9 rounded-full ${iconBg} mr-3 mt-5 items-center justify-center`}
      >
        {icon}
      </View>
      <View className="flex-1">
        <Text className="mb-1 text-base font-medium text-gray-600">
          {label}
        </Text>
        <TextInput
          value={value}
          onChangeText={handleChange}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          keyboardType={keyboardType}
          multiline={multiline}
          editable={editable}
          className={`rounded-2xl border border-gray-200 ${
            editable ? 'bg-gray-50' : 'bg-gray-100'
          } p-3 text-base font-medium text-gray-900`}
        />
        {helper ? (
          <Text className="mt-1 text-base text-gray-500">{helper}</Text>
        ) : null}
      </View>
    </View>
  );
}
