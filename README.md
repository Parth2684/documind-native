# Documind

Documind is a privacy-focused native desktop application that transforms documents using AI-powered OCR and fully local Text-to-Speech. Extract text from images and PDFs using Google's Gemini models, or convert text into natural-sounding speech directly on your machine using the Kokoro speech model.

## Features

### 🔒 Secure PIN Authentication

* Local PIN-protected vault powered by `iota-stronghold`
* Sensitive data remains encrypted at rest
* No cloud account required

### 📄 AI-Powered OCR

* Extract text from PDFs and images
* Powered by Gemini models
* Multiple OCR modes optimized for:

  * Notes
  * Coding
  * Presentations
  * Documents
  * General text

### 🎙️ Local Text-to-Speech

* Powered entirely by the Kokoro ONNX model
* Runs locally on your machine
* No text is sent to external TTS services
* Adjustable playback speed
* Multiple high-quality voices

### 🔑 Secure API Key Management

* Store Gemini API keys securely
* Keys are encrypted inside Stronghold vaults
* Never stored in plaintext

### 📜 Activity History

* Track OCR and TTS operations
* View extracted text
* Open generated audio files
* Delete records individually

---

## 🛠️ Tech Stack
*   **Frontend:** React, TypeScript, Zustand, React Router DOM, Tailwind CSS, Vite
*   **Backend (Rust/Tauri):** Rust, Tauri, SQLx (SQLite), Tokio, IOTA Stronghold, tts-rs (custom TTS library), pdf2image, reqwest, blake3, sha2, serde, Kokoro ONNX Runtime
*   **Tooling:** Bun, ESLint

### AI Models

#### OCR

* Google Gemini API

#### Text-to-Speech

* Kokoro ONNX
* Fully local inference
* No Gemini usage for TTS

---

## Available Voices

Documind currently supports **27 Kokoro voices**.

### Female Voices

* af_heart
* af_alloy
* af_aoede
* af_bella
* af_jessica
* af_kore
* af_nicole
* af_nova
* af_river
* af_sarah
* af_sky
* bf_alice
* bf_emma
* bf_isabella
* bf_lily

### Male Voices

* am_adam
* am_echo
* am_eric
* am_fenrir
* am_liam
* am_michael
* am_onyx
* am_puck
* bm_daniel
* bm_fable
* bm_george
* bm_lewis

---

## Security

Documind prioritizes protecting your data and API keys.

### PIN-Protected Vault

On first launch, you create a PIN which protects an encrypted Stronghold vault stored locally.

### Encrypted API Storage

Gemini API keys are:

* Encrypted before storage
* Stored inside Stronghold snapshots
* Decrypted only when needed
* Never written to disk in plaintext

### Local-First Architecture

All application data is stored locally:

* SQLite database
* Stronghold vault
* OCR history
* TTS history
* Generated audio files

---

## Prerequisites

### Rust

Install Rust:

https://rustup.rs

### Bun

Install Bun:

https://bun.sh

---

## Installing TTS Dependencies

### Linux

#### Ubuntu / Debian

```bash
sudo apt update
sudo apt install espeak-ng
```

#### Arch Linux

```bash
sudo pacman -S espeak-ng
```

#### Fedora

```bash
sudo dnf install espeak-ng
```

#### OpenSUSE

```bash
sudo zypper install espeak-ng
```

### macOS

Using Homebrew:

```bash
brew install espeak-ng
```

### Windows

Install eSpeak NG using one of the following methods:

#### Winget

```powershell
winget install eSpeak-NG.eSpeak-NG
```

#### Chocolatey

```powershell
choco install espeak
```

Alternatively download the installer from the official eSpeak NG repository.

### Install Poppler

Documind uses `pdf2image` for PDF processing, which requires Poppler on Windows.

#### Winget

```powershell
winget install -e --id oschwartz10612.Poppler
```
---

## Downloading Kokoro Models

Documind requires a Kokoro model and voice embeddings file.

Download them from:

https://github.com/thewh1teagle/kokoro-onnx/releases

### Required Files

Place the files inside:

```text
src-tauri/models/
```

Example:

```text
src-tauri/
└── models/
    ├── kokoro-v1.0.onnx
    └── voices-v1.0.bin
```

### Important

The voice embeddings file must be named exactly:

```text
voices-v1.0.bin
```

If the file name differs, TTS will not work correctly.

---

## Installation

### Clone Repository

```bash
git clone https://github.com/Parth2684/documind-native.git
cd documind-native
```

### Install Dependencies

```bash
bun install
```

### Run Development Build

```bash
bun tauri dev
```

---

## Configuration

### Gemini API Key Setup

To use OCR features:

1. Create a Gemini API key from Google AI Studio.
2. Launch Documind.
3. Open **Manage Keys**.
4. Add a name and API key.
5. Save the key.

The key will be encrypted and stored inside your Stronghold vault.

---

## Building for Production

```bash
bun tauri build
```

Generated bundles will be located in:

```text
src-tauri/target/release/bundle/
```

---

## Privacy

Documind is designed with a privacy-first approach.

* OCR requests are sent only to Gemini when explicitly used.
* TTS runs entirely on-device using Kokoro.
* API keys remain encrypted locally.
* No user accounts required.
* No telemetry.
* No tracking.

---
