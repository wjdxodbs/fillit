import { registerRootComponent } from "expo";
import {
  registerWidgetConfigurationScreen,
  registerWidgetTaskHandler,
} from "react-native-android-widget";
import App from "./App";
import { widgetTaskHandler } from "./src/widgets/widget-task-handler";
import { WidgetConfigurationScreen } from "./src/widgets/WidgetConfigurationScreen";

registerRootComponent(App);
registerWidgetTaskHandler(widgetTaskHandler);
registerWidgetConfigurationScreen(WidgetConfigurationScreen);
