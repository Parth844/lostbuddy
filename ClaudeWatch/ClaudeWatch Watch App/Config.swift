//
//  Config.swift
//  ClaudeWatch Watch App
//
//  Optional hardcoded configuration for quick personal testing.
//
//  ⚠️ SECURITY: a key placed here is baked into the app binary and committed
//  with the source. Use it only for a private test build, and never push a real
//  key to a public repo. The Settings screen (Keychain) is the safer path.
//

import Foundation

enum Config {
    /// Paste your Anthropic key here (looks like "sk-ant-...") to skip the
    /// Settings screen. Leave it as "" to use the key entered in Settings.
    static let hardcodedAPIKey = ""
}
