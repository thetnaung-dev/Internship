import { createAlertDialog } from "@gluestack-ui/alert-dialog";
import React, { forwardRef } from "react";
import { Pressable, View } from "react-native";

const AlertDialogRoot = forwardRef(
  ({ children, className, ...props }: any, ref) => (
    <View
      ref={ref}
      className={`flex-1 justify-center items-center ${className || ""}`}
      {...props}
    >
      {children}
    </View>
  ),
);

const AlertDialogContent = forwardRef(
  ({ children, className, ...props }: any, ref) => (
    <View ref={ref} className={className} {...props}>
      {children}
    </View>
  ),
);

const AlertDialogCloseButton = forwardRef(
  ({ children, className, ...props }: any, ref) => (
    <Pressable ref={ref} className={className} {...props}>
      {children}
    </Pressable>
  ),
);

const AlertDialogHeader = forwardRef(
  ({ children, className, ...props }: any, ref) => (
    <View ref={ref} className={className} {...props}>
      {children}
    </View>
  ),
);

const AlertDialogFooter = forwardRef(
  ({ children, className, ...props }: any, ref) => (
    <View ref={ref} className={className} {...props}>
      {children}
    </View>
  ),
);

const AlertDialogBody = forwardRef(
  ({ children, className, ...props }: any, ref) => (
    <View ref={ref} className={className} {...props}>
      {children}
    </View>
  ),
);

const AlertDialogBackdrop = forwardRef(
  ({ children, className, ...props }: any, ref) => (
    <View
      ref={ref}
      className={`absolute inset-0 bg-black/50 ${className || ""}`}
      {...props}
    >
      {children}
    </View>
  ),
);

const AnimatePresence = ({ children }: any) => children;

export const AlertDialog = createAlertDialog({
  Root: AlertDialogRoot,
  Content: AlertDialogContent,
  CloseButton: AlertDialogCloseButton,
  Header: AlertDialogHeader,
  Footer: AlertDialogFooter,
  Body: AlertDialogBody,
  Backdrop: AlertDialogBackdrop,
  AnimatePresence,
});
