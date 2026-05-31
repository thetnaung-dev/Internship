import React from "react";
import { Text, TouchableOpacity } from "react-native";

// Updated interface to support all the props you are passing
interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  className?: string;
  variant?: "solid" | "outline";
  action?: "primary" | "secondary";
  size?: "xs" | "sm" | "md" | "lg";
}

export function Button({ children, onPress, className }: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`bg-amber-500 rounded-xl px-5 py-2.5 items-center justify-center ${className || ""}`}
    >
      {children}
    </TouchableOpacity>
  );
}

export function ButtonText({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text className={`text-white font-semibold text-sm ${className || ""}`}>
      {children}
    </Text>
  );
}
