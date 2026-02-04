const widgetConfig = {
  widgets: [
    {
      name: "FillitGrass",
      label: "잔디 (FillIt)",
      description: "1년 잔디 또는 목표일 잔디",
      minWidth: "360dp",
      minHeight: "110dp",
      targetCellWidth: 4,
      targetCellHeight: 2,
      resizeMode: "horizontal|vertical",
      updatePeriodMillis: 0,
      widgetFeatures: "reconfigurable",
    },
  ],
};

module.exports = {
  expo: {
    name: "FillIt",
    slug: "fillit",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/logo.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-logo.png",
      resizeMode: "contain",
      backgroundColor: "#000000",
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/logo.png",
        backgroundColor: "#000000",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.wjdxodbs.fillit",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "@react-native-community/datetimepicker",
      ["react-native-android-widget", widgetConfig],
      "./plugins/withFillitNative.js",
    ],
    extra: {
      eas: {
        projectId: "67b1c8a4-6096-4449-ab31-4d5284e065b9",
      },
    },
  },
};
