# ClaudeWatch — Claude for Apple Watch (SE 3)

A standalone **watchOS** app that chats with Claude (the Anthropic Messages API)
right from your wrist. Built in SwiftUI and tuned for the small Apple Watch SE
(3rd gen) screen.

**Features**
- 💬 Streaming chat with Claude (replies appear token-by-token)
- 🎙️ **Voice input** — dictation via the system text-entry screen
- 👑 **Digital Crown** — scroll the transcript, and turn the crown to cycle
  starter prompts
- 🔘 **Buttons** — prominent Dictate / Send / Stop controls; primary-action hand
  gesture where the watch supports it
- 🔐 API key stored in the **Keychain** (never in plain storage)
- ⚙️ Model picker (Opus 4.8 / Sonnet 4.6 / Haiku 4.5)

> Swift has no official Anthropic SDK, so the app calls
> `POST https://api.anthropic.com/v1/messages` directly over HTTPS and parses the
> Server-Sent Events stream. The default model is `claude-opus-4-8`.

---

## What's in this folder

```
ClaudeWatch/
├── README.md                          ← you are here
└── ClaudeWatch Watch App/
    ├── ClaudeWatchApp.swift           ← @main app entry
    ├── Models.swift                   ← ChatMessage, Role, ClaudeModel
    ├── KeychainHelper.swift           ← secure API-key storage
    ├── AnthropicClient.swift          ← HTTPS request + SSE streaming
    ├── ChatViewModel.swift            ← transcript state + request loop
    ├── ContentView.swift              ← main chat screen
    ├── InputBar.swift                 ← dictate / send / stop
    ├── SuggestionsView.swift          ← Digital Crown starter prompts
    └── SettingsView.swift             ← API key + model picker
```

These are **source files**, not a full `.xcodeproj`. You create the Xcode
project on your Mac (one time) and drop these files in — steps below.

---

## Requirements

- A Mac with **Xcode 15 or later** (Xcode 16+ recommended for watchOS 11)
- An **Anthropic API key** — create one at <https://console.anthropic.com/>
- For on-device runs: an Apple Watch SE (3rd gen) + its paired iPhone, and a
  free Apple ID for signing (a paid Apple Developer account is **not** required
  to run on your own device)

---

## Step-by-step: set up and run in Xcode

### 1. Create the watchOS project

1. Open **Xcode → File → New → Project…**
2. Choose the **watchOS** tab → **App** → **Next**.
3. Fill in:
   - **Product Name:** `ClaudeWatch`
   - **Interface:** SwiftUI
   - **Language:** Swift
   - Leave "Include Notification Scene" etc. unchecked.
4. **Next**, pick a folder, **Create**.

Xcode generates a target named **`ClaudeWatch Watch App`** with a starter
`ContentView.swift` and `ClaudeWatchApp.swift`.

### 2. Add the source files

1. In Finder, open this repo's `ClaudeWatch/ClaudeWatch Watch App/` folder.
2. **Delete** the placeholder `ContentView.swift` and `ClaudeWatchApp.swift`
   that Xcode generated (right-click → Delete → Move to Trash).
3. Drag **all 9 `.swift` files** from this folder into the
   `ClaudeWatch Watch App` group in Xcode's Project Navigator.
4. In the dialog that appears: ✅ **Copy items if needed**, and ✅ make sure the
   **`ClaudeWatch Watch App`** target is checked under "Add to targets".

> Tip: confirm each file shows the target membership in the File Inspector
> (right panel) → "Target Membership" → `ClaudeWatch Watch App` is ticked.

### 3. Allow outbound network access (App Transport Security)

The app calls `api.anthropic.com` over HTTPS — no ATS exception is needed
(Anthropic uses standard TLS). There is nothing to add to `Info.plist` for
networking, and dictation uses the **system** input screen, so **no microphone
or speech-recognition usage strings are required** either.

### 4. Set the deployment target

1. Select the **project** (blue icon) → the **`ClaudeWatch Watch App`** target →
   **General**.
2. Set **Minimum Deployments → watchOS** to **10.0** or later (11.x recommended;
   Apple Watch SE 3 ships with the latest watchOS).

### 5. Run in the Simulator

1. In the scheme/destination selector (top bar), pick a watch simulator, e.g.
   **Apple Watch SE (44mm)**.
2. Press **⌘R** (Run).
3. When the app launches, tap the **⚙︎ gear** → **Add key**, then dictate/type
   your `sk-ant-...` key (in the Simulator you can just type it).
4. Go back, tap **Dictate or type**, enter a question, and watch the reply
   stream in. Turn the crown to scroll.

> Simulator dictation: the watch Simulator can't use a real mic, so use the
> on-screen keyboard / paste. Dictation works on a physical watch.

### 6. Run on your Apple Watch SE 3 (device)

1. Plug the **paired iPhone** into the Mac (the watch is deployed through it).
2. **Signing & Capabilities** tab → check **Automatically manage signing** →
   pick your **Team** (your free Apple ID works).
   - If Xcode complains the bundle ID is taken, change it to something unique
     like `com.yourname.ClaudeWatch`.
3. In the destination selector choose your physical **Apple Watch SE**.
4. Press **⌘R**. First run: on the watch, go to
   **Settings → General → VPN & Device Management** and trust your developer
   certificate if prompted.
5. Launch **ClaudeWatch** on the watch, open **⚙︎ Settings**, and **dictate your
   API key** (raise wrist, tap *Add key*, tap the mic, speak — or paste it from
   the iPhone via Handoff). Then start chatting.

---

## Using the app

| Action | How |
|---|---|
| **Ask a question (voice)** | Tap **Dictate or type** → tap the **mic** → speak |
| **Ask a question (typed)** | Tap **Dictate or type** → use Scribble / keyboard |
| **Scroll the conversation** | **Turn the Digital Crown** |
| **Pick a starter prompt** | On the empty screen, **turn the crown** to cycle, tap to send |
| **Stop a reply mid-stream** | Tap the red **Stop** button |
| **New conversation** | Tap the **✎** (top-left) |
| **Change model / key** | Tap **⚙︎** (top-right) |

---

## Configuration notes

- **Model:** default `claude-opus-4-8`. Switch to **Haiku 4.5** in Settings for
  the fastest, lowest-cost replies on the watch.
- **Reply length:** capped at `max_tokens: 1024` for a tiny screen — adjust in
  `AnthropicClient.streamReply(...)`.
- **System prompt:** tells Claude to keep answers concise; edit the `system`
  default in `AnthropicClient.swift`.
- **API key security:** the key lives only in this watch's Keychain and is sent
  directly to `api.anthropic.com`. Calling the Anthropic API straight from a
  client embeds your key on the device — fine for a personal app, but for a
  shipping/multi-user app route requests through a backend you control instead.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `No API key. Add one in Settings.` | Open ⚙︎ → Add key. |
| `API error 401` | Key is wrong/revoked — re-enter it. |
| `API error 400` | Usually a model-id typo; the picker uses valid ids. |
| Reply never starts on device | Check the watch has network (Wi-Fi/LTE or via iPhone). |
| Build error "No such module" | Re-check each file's **Target Membership**. |
| Dictation does nothing in Simulator | Expected — use a real watch, or type. |
