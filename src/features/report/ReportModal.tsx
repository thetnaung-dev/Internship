import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Check, X } from "lucide-react-native";
import { AlertDialog } from "@/shared/components/alert-dialog";
import { Button, ButtonText } from "@/shared/components/button/button";
import { Heading } from "@/shared/components/heading/heading";
import { insertReport, ReportReason } from "./report-service";

interface ReportModalProps {
  visible: boolean;
  propertyId?: string;
  wantedListingId?: string;
  onClose: () => void;
}

const REASONS: ReportReason[] = [
  "unrelated_to_real_estate",
  "spam",
  "scam",
  "inappropriate",
  "duplicate",
  "other",
];

export function ReportModal({
  visible,
  propertyId,
  wantedListingId,
  onClose,
}: ReportModalProps) {
  const { t, i18n } = useTranslation();
  const isBurmese = i18n.language === "mm" || i18n.language?.startsWith("my");

  const [selected, setSelected] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dialog, setDialog] = useState<{ title: string; message: string } | null>(null);

  const close = () => {
    if (submitting) return;
    setSelected(null);
    setDescription("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      await insertReport({
        propertyId,
        wantedListingId,
        reason: selected,
        description,
      });
      setSelected(null);
      setDescription("");
      onClose();
      setDialog({
        title: t("report.successTitle"),
        message: t("report.successMessage"),
      });
    } catch (err) {
      console.error("Report error:", err);
      setDialog({
        title: t("report.errorTitle"),
        message: t("report.errorMessage"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={close}
      >
        <TouchableWithoutFeedback onPress={close}>
          <View className="flex-1 justify-end bg-black/40">
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <TouchableWithoutFeedback>
                <View className="bg-white rounded-t-3xl pt-3 pb-8 max-h-[85%]">
                  <View className="w-10 h-1 bg-gray-300 rounded-full self-center mb-4" />
                  <View className="flex-row items-center justify-between px-5 pb-3 border-b border-slate-100">
                    <Heading className="text-lg font-rubik-bold">
                      {t("report.title")}
                    </Heading>
                    <TouchableOpacity onPress={close}>
                      <X size={20} color="#8C8E98" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView
                    className="max-h-[40vh]"
                    showsVerticalScrollIndicator={false}
                  >
                    <Text className="px-5 pt-4 pb-2 text-sm text-gray-500 font-rubik">
                      {t("report.subtitle")}
                    </Text>
                    {REASONS.map((reason) => {
                      const isSelected = selected === reason;
                      return (
                        <TouchableOpacity
                          key={reason}
                          onPress={() => setSelected(reason)}
                          className="flex-row items-center justify-between px-5 py-4 border-b border-slate-50 active:bg-primary-50"
                        >
                          <Text
                            className={`text-base ${
                              isSelected
                                ? "text-primary-300 font-rubik-bold"
                                : "text-black-200 font-rubik"
                            }`}
                          >
                            {t(`report.reasons.${reason}`)}
                          </Text>
                          {isSelected && <Check size={20} color="#22c55e" />}
                        </TouchableOpacity>
                      );
                    })}

                    <View className="px-5 pt-4">
                      <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder={t("report.descriptionPlaceholder")}
                        placeholderTextColor="#9CA3AF"
                        multiline
                        className="bg-primary-100 border border-primary-200 rounded-2xl px-4 py-3 text-sm text-black-300 font-rubik min-h-[90px]"
                        textAlignVertical="top"
                      />
                    </View>
                  </ScrollView>

                  <View className="flex-row gap-3 px-5 pt-4">
                    <Button
                      className="flex-1 bg-gray-100"
                      onPress={close}
                    >
                      <ButtonText className="text-gray-600">
                        {isBurmese ? "မလုပ်တော့ပါ" : "Cancel"}
                      </ButtonText>
                    </Button>
                    <Button
                      className="flex-1 bg-primary-300"
                      onPress={handleSubmit}
                    >
                      {submitting ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <ButtonText className="text-white">
                          {t("report.submit")}
                        </ButtonText>
                      )}
                    </Button>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <AlertDialog
        isOpen={!!dialog}
        onClose={() => setDialog(null)}
        useRNModal={true}
      >
        <AlertDialog.Backdrop />
        <AlertDialog.Content className="p-7 rounded-3xl bg-white w-5/6 items-center shadow-xl">
          <AlertDialog.Header>
            <Heading className="text-gray-900 font-rubik-bold text-lg">
              {dialog?.title || ""}
            </Heading>
          </AlertDialog.Header>
          <AlertDialog.Body className="pb-5">
            <Text className="text-center text-gray-500 font-rubik">
              {dialog?.message || ""}
            </Text>
          </AlertDialog.Body>
          <AlertDialog.Footer className="w-full">
            <Button className="flex-1 bg-primary-300" onPress={() => setDialog(null)}>
              <ButtonText className="text-white">
                {isBurmese ? "သေချာပါသည်" : "OK"}
              </ButtonText>
            </Button>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
}
