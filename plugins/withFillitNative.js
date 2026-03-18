const {
  withAndroidManifest,
  withMainApplication,
  withDangerousMod,
} = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

const PACKAGE_NAME = "com.wjdxodbs.fillit";
const SCHEDULE_BLOCK = `    try {
      MidnightWidgetUpdateReceiver.scheduleNextMidnight(this)
    } catch (e: Exception) {
      android.util.Log.e("MainApplication", "scheduleNextMidnight failed", e)
    }`;

/**
 * AndroidManifest에 위젯 자정 갱신용 권한과 BroadcastReceiver 추가
 */
function withFillitManifest(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    if (!manifest.manifest) return config;

    // 권한 추가 (없을 때만)
    const perms = manifest.manifest["uses-permission"] || [];
    const permNames = perms.map((p) => p.$["android:name"]);
    if (!permNames.includes("android.permission.SCHEDULE_EXACT_ALARM")) {
      perms.push({
        $: { "android:name": "android.permission.SCHEDULE_EXACT_ALARM" },
      });
    }
    if (!permNames.includes("android.permission.RECEIVE_BOOT_COMPLETED")) {
      perms.push({
        $: { "android:name": "android.permission.RECEIVE_BOOT_COMPLETED" },
      });
    }
    manifest.manifest["uses-permission"] = perms;

    // MainActivity에 fillit:// 딥링크 intent-filter 추가
    const application = manifest.manifest.application?.[0];
    if (application) {
      const activities = application.activity || [];
      const mainActivity = Array.isArray(activities)
        ? activities.find((a) => a.$?.["android:name"] === ".MainActivity")
        : null;
      if (mainActivity) {
        const filters = mainActivity["intent-filter"] || [];
        const hasDeepLink = filters.some((f) =>
          (f.data || []).some((d) => d.$?.["android:scheme"] === "fillit")
        );
        if (!hasDeepLink) {
          filters.push({
            action: [{ $: { "android:name": "android.intent.action.VIEW" } }],
            category: [
              { $: { "android:name": "android.intent.category.DEFAULT" } },
              { $: { "android:name": "android.intent.category.BROWSABLE" } },
            ],
            data: [{ $: { "android:scheme": "fillit" } }],
          });
          mainActivity["intent-filter"] = filters;
        }
      }
    }

    // application에 receiver 추가 (이미 있으면 스킵)
    const applications = manifest.manifest.application;
    if (Array.isArray(applications) && applications.length > 0) {
      const app = applications[0];
      const receivers = app.receiver || [];
      const hasOurs = receivers.some(
        (r) => r.$["android:name"] === ".MidnightWidgetUpdateReceiver"
      );
      if (!hasOurs) {
        const pkg = config.android?.package || PACKAGE_NAME;
        const midnightAction = `${pkg}.MIDNIGHT_WIDGET_UPDATE`;
        receivers.push({
          $: {
            "android:name": ".MidnightWidgetUpdateReceiver",
            "android:exported": "false",
          },
          "intent-filter": [
            {
              action: [{ $: { "android:name": midnightAction } }],
            },
            {
              action: [
                {
                  $: {
                    "android:name": "android.intent.action.BOOT_COMPLETED",
                  },
                },
              ],
            },
          ],
        });
        app.receiver = receivers;
      }
    }

    config.modResults = manifest;
    return config;
  });
}

/**
 * MainApplication.kt의 onCreate에 자정 알람 스케줄 호출 추가
 */
function withFillitMainApplication(config) {
  return withMainApplication(config, (config) => {
    let contents = config.modResults.contents;
    if (
      contents.includes("MidnightWidgetUpdateReceiver.scheduleNextMidnight")
    ) {
      return config;
    }
    // ApplicationLifecycleDispatcher.onApplicationCreate(this) 다음에 try-catch 블록 추가
    const marker = "ApplicationLifecycleDispatcher.onApplicationCreate(this)";
    const idx = contents.indexOf(marker);
    if (idx !== -1) {
      const endOfLine = contents.indexOf("\n", idx);
      const insertAt = endOfLine !== -1 ? endOfLine + 1 : idx + marker.length;
      contents =
        contents.slice(0, insertAt) +
        SCHEDULE_BLOCK +
        "\n" +
        contents.slice(insertAt);
    }
    config.modResults.contents = contents;
    return config;
  });
}

/**
 * MidnightWidgetUpdateReceiver.kt 파일을 android 패키지 경로에 복사
 */
function withFillitReceiverFile(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const platformRoot = config.modRequest.platformProjectRoot;
      const pkg = config.android?.package || PACKAGE_NAME;
      const packagePath = pkg.replace(/\./g, path.sep);
      const outDir = path.join(
        platformRoot,
        "app",
        "src",
        "main",
        "java",
        packagePath
      );
      const outPath = path.join(outDir, "MidnightWidgetUpdateReceiver.kt");
      const templatePath = path.join(
        projectRoot,
        "plugins",
        "templates",
        "MidnightWidgetUpdateReceiver.kt"
      );

      let template = fs.readFileSync(templatePath, "utf8");
      const packageDecl = pkg;
      template = template.replace(
        /package com\.wjdxodbs\.fillit/,
        `package ${packageDecl}`
      );
      template = template.replace(
        /com\.wjdxodbs\.fillit\.MIDNIGHT_WIDGET_UPDATE/g,
        `${packageDecl}.MIDNIGHT_WIDGET_UPDATE`
      );

      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outPath, template, "utf8");
      return config;
    },
  ]);
}

/**
 * prebuild 시 위젯 자정 갱신용 네이티브 설정을 유지하는 플러그인
 * - AndroidManifest: SCHEDULE_EXACT_ALARM, RECEIVE_BOOT_COMPLETED 권한 및 MidnightWidgetUpdateReceiver 등록
 * - MainApplication.kt: onCreate에 scheduleNextMidnight 호출 추가
 * - MidnightWidgetUpdateReceiver.kt: plugins/templates/ 에서 복사
 */
function withFillitNative(config) {
  config = withFillitManifest(config);
  config = withFillitMainApplication(config);
  config = withFillitReceiverFile(config);
  return config;
}

module.exports = withFillitNative;
