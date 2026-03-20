import React, { useState } from "react";
import {
  ActivityIndicator,
  type LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { type WidgetConfigurationScreenProps } from "react-native-android-widget";
import type { SavedDate } from "../types";
import { useSavedDates } from "../hooks/useSavedDates";
import { formatDateRange } from "../utils/dateUtils";
import { darkTheme as theme } from "../theme";
import { useWidgetConfiguration } from "./useWidgetConfiguration";

const MIN_VALID_WIDTH = 200;

export function WidgetConfigurationScreen({
  widgetInfo,
  renderWidget,
  setResult,
}: WidgetConfigurationScreenProps) {
  const { width: windowWidth } = useWindowDimensions();
  const effectiveWidth = windowWidth >= MIN_VALID_WIDTH ? windowWidth : 360;
  const [layoutWidth, setLayoutWidth] = useState<number | null>(null);
  const { dates: savedDates, loading } = useSavedDates();
  const { finishWith } = useWidgetConfiguration({ widgetInfo, renderWidget, setResult });

  const width = layoutWidth ?? effectiveWidth;

  const handleLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w >= MIN_VALID_WIDTH) setLayoutWidth(w);
  };

  const year = new Date().getFullYear();
  const yearTitle = `${year}년`;
  const yearSubtitle = `${year}년 1월 1일 ~ ${year}년 12월 31일`;
  const containerStyle = [styles.container, { width, maxWidth: width }];

  if (loading) {
    return (
      <View style={containerStyle} onLayout={handleLayout}>
        <ActivityIndicator size="large" color={theme.grassFilled} />
      </View>
    );
  }

  return (
    <View style={containerStyle} onLayout={handleLayout}>
      <ScrollView
        style={[styles.scroll, { width }]}
        contentContainerStyle={[styles.scrollContent, { width: width - 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.header}>위젯에 표시할 항목을 선택하세요</Text>

        <TouchableOpacity
          style={styles.option}
          onPress={() => finishWith({ mode: "year" })}
          activeOpacity={0.7}
        >
          <Text style={styles.optionTitle}>{yearTitle}</Text>
          <Text style={styles.optionSubtitle}>{yearSubtitle}</Text>
          <Text style={styles.optionHint}>365일 (올해)</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>등록된 목표일</Text>
        {savedDates.length === 0 ? (
          <Text style={styles.empty}>등록된 날짜가 없습니다.</Text>
        ) : (
          savedDates.map((item: SavedDate) => (
            <TouchableOpacity
              key={item.id}
              style={styles.option}
              onPress={() =>
                finishWith({
                  mode: "date",
                  id: item.id,
                  title: item.title,
                  baseDate: item.baseDate,
                  targetDate: item.targetDate,
                })
              }
              activeOpacity={0.7}
            >
              <Text style={styles.optionTitle}>{item.title}</Text>
              <Text style={styles.optionSubtitle}>
                {formatDateRange(item.baseDate, item.targetDate)}
              </Text>
            </TouchableOpacity>
          ))
        )}

        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => setResult("cancel")}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.text,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  option: {
    backgroundColor: theme.backgroundSecondary,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: theme.border,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.text,
  },
  optionSubtitle: {
    fontSize: 13,
    color: theme.textSecondary,
    marginTop: 4,
  },
  optionHint: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  empty: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 8,
  },
  cancelBtn: {
    marginTop: 20,
    padding: 14,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    color: theme.textSecondary,
  },
});
