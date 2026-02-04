import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import {
  requestWidgetUpdateById,
  type WidgetConfigurationScreenProps,
} from "react-native-android-widget";
import { FillitGrassWidget } from "./FillitGrassWidget";
import {
  getSavedDateWidgetData,
  getWidgetDataForConfig,
  getYearWidgetData,
} from "./widget-task-handler";
import type { WidgetConfig } from "./widget-config";
import { widgetConfigKey } from "./widget-config";
import type { SavedDate } from "../types";
import { theme } from "../theme";

const SAVED_DATES_KEY = "saved_dates";

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

const MIN_VALID_WIDTH = 200;
function getFallbackWidth(): number {
  try {
    const w = Dimensions.get("window").width;
    return typeof w === "number" && w >= MIN_VALID_WIDTH ? w : 360;
  } catch {
    return 360;
  }
}

export function WidgetConfigurationScreen({
  widgetInfo,
  renderWidget,
  setResult,
}: WidgetConfigurationScreenProps) {
  const { width: windowWidth } = useWindowDimensions();
  const fallbackWidth = getFallbackWidth();
  const effectiveWidth =
    typeof windowWidth === "number" && windowWidth >= MIN_VALID_WIDTH
      ? windowWidth
      : fallbackWidth;
  const [layoutWidth, setLayoutWidth] = useState<number | null>(null);
  const [savedDates, setSavedDates] = useState<SavedDate[]>([]);
  const [loading, setLoading] = useState(true);

  const width = layoutWidth ?? effectiveWidth;

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(SAVED_DATES_KEY);
        const parsed = (raw ? JSON.parse(raw) : []) as Record<
          string,
          unknown
        >[];
        const migrated: SavedDate[] = parsed.map((item) => {
          const id = String(item.id ?? "");
          const title = String(item.title ?? "");
          const date = item.date as string | undefined;
          const baseDate = (item.baseDate as string) ?? date ?? "";
          const targetDate = (item.targetDate as string) ?? date ?? "";
          return { id, title, baseDate, targetDate };
        });
        setSavedDates(migrated);
      } catch {
        setSavedDates([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const finishWith = useCallback(
    async (config: WidgetConfig) => {
      await AsyncStorage.setItem(
        widgetConfigKey(widgetInfo.widgetId),
        JSON.stringify(config)
      );
      const data =
        config.mode === "year"
          ? getYearWidgetData()
          : getSavedDateWidgetData(
              config.title,
              config.baseDate,
              config.targetDate
            );
      renderWidget(
        <FillitGrassWidget
          title={data.title}
          baseDate={data.baseDate}
          targetDate={data.targetDate}
          filledUpTo={data.filledUpTo}
          totalDays={data.totalDays}
        />
      );
      await requestWidgetUpdateById({
        widgetName: "FillitGrass",
        widgetId: widgetInfo.widgetId,
        renderWidget: async (info) => {
          const widgetData = await getWidgetDataForConfig(info.widgetId);
          return (
            <FillitGrassWidget
              title={widgetData.title}
              baseDate={widgetData.baseDate}
              targetDate={widgetData.targetDate}
              filledUpTo={widgetData.filledUpTo}
              totalDays={widgetData.totalDays}
            />
          );
        },
      });
      setResult("ok");
    },
    [widgetInfo.widgetId, renderWidget, setResult]
  );

  const year = new Date().getFullYear();
  const yearTitle = `${year}년`;
  const yearSubtitle = `${year}년 1월 1일 ~ ${year}년 12월 31일`;

  const containerStyle = [styles.container, { width, maxWidth: width }];

  if (loading) {
    return (
      <View
        style={containerStyle}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          if (w >= MIN_VALID_WIDTH) setLayoutWidth(w);
        }}
      >
        <ActivityIndicator size="large" color={theme.grassFilled} />
      </View>
    );
  }

  return (
    <View
      style={containerStyle}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w >= MIN_VALID_WIDTH) setLayoutWidth(w);
      }}
    >
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
                {formatDate(item.baseDate)} ~ {formatDate(item.targetDate)}
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
