# Fillit

연도 진행률을 GitHub 잔디처럼 보여주고, 목표일 설정별로 그 시점까지의 잔디를 확인할 수 있는 React Native(Expo) 앱입니다.

## 기능

- **홈**: 현재 연도 잔디 그리드 (1/1 ~ 오늘), 연도 진행률(%)
- **목표일 설정**: 제목 + 시작일/목표일로 등록, 목록에서 클릭 시 해당 구간 잔디·진행률 상세 화면
- 다크 테마

## 실행

```bash
npm install
npx expo start
```

Android/iOS 시뮬레이터 또는 Expo Go 앱으로 실행할 수 있습니다.

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

## 기술 스택

- Expo (React Native)
- React Navigation (Bottom Tabs + Native Stack)
- AsyncStorage (등록 날짜 저장)
