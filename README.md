# 🌙 Nocturne Notes

A notes application built with React, TypeScript, Vite, and Capacitor, with support for Android devices.

## 📱 Android Quick Start

Choose the method you want to use.

| Goal | What you need |
|---|---|
| Build an APK | Node.js, Android SDK, Java JDK, and Gradle/Capacitor build setup |
| Open in Android Studio | Node.js, Android Studio, and Android SDK |
| Run on a real Android phone via USB | Android Studio/SDK, USB cable, and USB debugging enabled |

**First, clone the repository and install dependencies.** These steps are required for all three methods.

### 1. Clone the repository

Replace `YOUR_USERNAME` with your GitHub username and adjust the repository name if necessary.

```bash
git clone https://github.com/YOUR_USERNAME/nocturne-notes.git
cd nocturne-notes
```

### 2. Install dependencies

Install [Node.js LTS](https://nodejs.org/) first, then run:

```bash
npm install
```

### 3. Build the web application

```bash
npm run build
```

This creates the production web files in `dist/`.

---

## Option 1: Build an Android APK

Use this option when you want an APK file that can be installed on an Android phone.

### Requirements

- [Node.js](https://nodejs.org/)
- [Android Studio](https://developer.android.com/studio)
- Android SDK and the required SDK Build-Tools
- A compatible Java JDK (Android Studio includes a bundled JDK that can be selected for Gradle builds)

### Steps

**Step 1 — Build the web app**

```bash
npm run build
```

**Step 2 — Synchronize the web app with Android**

```bash
npx cap sync android
```

**Step 3 — Build the APK**

```bash
npx cap build android --androidreleasetype APK
```

The exact output path can vary by Capacitor/Gradle configuration. A common location for a release APK is:

```text
android/app/build/outputs/apk/release/
```

If the build fails because an Android SDK package is missing, open Android Studio and install the required SDK components from **Settings/Preferences → Languages & Frameworks → Android SDK**.

---

## Option 2: Open the Project in Android Studio

Use this option to inspect the native Android project, change Android-specific settings, or run the app using an emulator.

### Requirements

- Node.js and npm
- Android Studio
- Android SDK

### Steps

**Step 1 — Install dependencies**

```bash
npm install
```

**Step 2 — Build and sync**

```bash
npm run build
npx cap sync android
```

**Step 3 — Open Android Studio**

```bash
npx cap open android
```

Alternatively, open Android Studio and choose **Open**, then select the repository's `android/` directory.

Wait for Gradle sync to finish. Select an Android emulator or connected device and click **Run ▶**.

---

## Option 3: Run Directly on an Android Phone Using USB

Use this option to install and test the app directly on your physical Android phone.

### Requirements

- An Android phone
- A USB cable that supports data transfer
- Android Studio and the required Android SDK/platform tools
- USB debugging enabled on your phone

### Step 1 — Enable Developer Options

On your Android phone:

1. Open **Settings → About phone**.
2. Find **Build number**. On some devices, it may be under Software information.
3. Tap **Build number** seven times.
4. Enter your phone PIN if prompted.
5. Return to Settings and open **Developer options**.

The menu names can vary by manufacturer.

### Step 2 — Enable USB Debugging

In **Developer options**, turn on **USB debugging**.

Connect your phone to your Mac using the USB cable. Unlock the phone and accept the **Allow USB debugging** prompt when it appears. Only authorize computers you trust.

### Step 3 — Check the USB Connection

In your Mac Terminal, run:

```bash
adb devices
```

If `adb` is not found, install Android SDK Platform-Tools using Android Studio's SDK Manager and make sure the `platform-tools` directory is on your `PATH`.

Your phone should appear in the device list. If it shows `unauthorized`, unlock your phone and accept the debugging prompt.

### Step 4 — Build and Sync the App

From the repository root:

```bash
npm install
npm run build
npx cap sync android
```

### Step 5 — Open Android Studio and Run

```bash
npx cap open android
```

In Android Studio:

1. Wait for Gradle sync to complete.
2. Select your connected phone from the device selector.
3. Click **Run ▶**.
4. Wait for Android Studio to build, install, and launch the app on your phone.

You do not need to create an APK manually for this method; Android Studio can install and run the app directly.

### Alternative — Install a Built APK Using USB

If you have already built a debug APK, you can install it with:

```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

The file must exist at that path. If you built a release APK instead, use its actual path.

---

## 💻 Run the Web App Locally

To run Nocturne Notes in your browser:

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal, usually:

```text
http://localhost:5173
```

To stop the server, press `Ctrl + C`.

### Production Preview

```bash
npm run build
npm run preview
```

---

## 🛠 Tech Stack

- React
- TypeScript
- Vite
- Capacitor
- CSS

## 📁 Project Structure

```text
nocturne-notes/
├── android/              # Native Android project
├── src/                  # React application source
├── docs/                 # Documentation
├── dist/                 # Generated web build (not committed)
├── capacitor.config.ts   # Capacitor configuration
├── index.html            # HTML entry point
├── package.json          # Dependencies and scripts
├── package-lock.json     # Locked dependency versions
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── .gitignore
└── README.md
```

## 💾 Data Storage

The app currently stores notes locally using browser `localStorage`. Notes are not automatically synchronized between devices. Clearing application data or browser storage may remove locally saved notes.

Cloud synchronization would require a separately configured backend.

## 🤝 Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test the application.
5. Submit a pull request.

## 📄 License

No license has been specified yet. Please contact the repository owner before redistributing or reusing this project.

---

**Built with React, TypeScript, Vite, and Capacitor.**