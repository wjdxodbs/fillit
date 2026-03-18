# Fillit

연도 진행률을 GitHub 잔디처럼 보여주고, 목표일 설정별로 그 시점까지의 잔디를 확인할 수 있는 React Native(Expo) 앱입니다.

## 기능

- **홈**: 현재 연도 잔디 그리드 (1/1 ~ 오늘), 연도 진행률(%)
- **목표일 설정**: 제목 + 시작일/목표일로 등록·수정·삭제, 목록에서 클릭 시 해당 구간 잔디·진행률 상세 화면
- **Android 홈 화면 위젯**: 연도 또는 목표 진행률을 홈 화면에 표시, 자정(KST)마다 자동 갱신, 위젯 클릭 시 앱으로 이동
- 다크 테마

## 실행

> Expo Go에서는 위젯·알림 기능이 동작하지 않습니다. Development Build를 사용하세요.

```bash
npm install
npm run android   # Android (네이티브 빌드 필요)
npm run ios       # iOS
```

## APK 빌드 (설치용 apk 파일 만들기)

**1. EAS CLI 설치 및 로그인**

- [Expo 계정](https://expo.dev/signup)이 없으면 가입합니다.
- 터미널에서:

```bash
npm install -g eas-cli
eas login
```

**2. 프로젝트에 EAS 설정**

- 최초 한 번만 실행:

```bash
eas build:configure
```

- 이미 `eas.json`이 있으면 생략해도 됩니다.

**3. Android APK 빌드**

```bash
npm run build:apk
```

또는:

```bash
eas build --platform android --profile preview
```

- 빌드는 Expo 클라우드에서 진행됩니다.
- 완료되면 터미널에 APK 다운로드 링크가 나옵니다. 브라우저에서 링크로 들어가 APK를 받으면 됩니다.
- 받은 APK를 Android 기기에 복사해 설치할 수 있습니다.

**참고**

- `preview` 프로필은 **APK**를 만듭니다 (기기/에뮬레이터 직접 설치용).
- Play Store에 올릴 때는 `eas build --platform android --profile production`으로 **AAB**를 빌드합니다.
- 네이티브 플러그인(`plugins/withFillitNative.js`) 수정 후에는 `npx expo prebuild --platform android`를 실행해야 합니다.

## 기술 스택

- Expo (React Native)
- React Navigation (Bottom Tabs + Native Stack)
- AsyncStorage (목표 데이터 저장)
- react-native-android-widget (홈 화면 위젯)
- expo-notifications (알림)
