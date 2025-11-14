import React, { useState } from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';
import { useFocusedInputHandler } from 'react-native-keyboard-controller';

interface EnhancedInputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  inputClassName?: string;
  required?: boolean;
}

export default function EnhancedInputField({
  label,
  error,
  containerClassName = '',
  labelClassName = '',
  errorClassName = '',
  inputClassName = '',
  required = false,
  ...props
}: EnhancedInputFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  // Use keyboard controller for enhanced input handling
  useFocusedInputHandler({
    onChangeText: (e) => {
      console.log('Text changed:', e.text);
    },
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    props.onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    props.onBlur?.(e);
  };

  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && (
        <View className="mb-2 flex-row items-center">
          <Text
            className={`text-base font-medium text-gray-900 ${labelClassName}`}
          >
            {label}
          </Text>
          {required && <Text className="ml-1 text-red-500">*</Text>}
        </View>
      )}

      <TextInput
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`rounded-2xl border px-4 py-4 text-base text-gray-900 ${
          error
            ? 'border-red-300 bg-red-50'
            : isFocused
              ? 'border-blue-300 bg-blue-50'
              : 'border-gray-200 bg-gray-50'
        } ${inputClassName}`}
        placeholderTextColor="#9ca3af"
        autoCapitalize="sentences"
        autoCorrect={true}
        returnKeyType={props.multiline ? 'default' : 'next'}
        blurOnSubmit={!props.multiline}
      />

      {error && (
        <Text className={`mt-1 text-sm text-red-500 ${errorClassName}`}>
          {error}
        </Text>
      )}
    </View>
  );
}
