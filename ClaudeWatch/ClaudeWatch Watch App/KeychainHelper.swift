//
//  KeychainHelper.swift
//  ClaudeWatch Watch App
//
//  Minimal Keychain wrapper for persisting the Anthropic API key. The key is
//  never written to UserDefaults so it survives in encrypted storage only.
//

import Foundation
import Security

enum KeychainHelper {
    private static let service = "com.example.ClaudeWatch"
    private static let account = "anthropic-api-key"

    /// Store (or overwrite) the API key. Pass `nil`/empty to delete it.
    static func saveAPIKey(_ key: String?) {
        // Always clear the previous value first to keep this idempotent.
        let deleteQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        SecItemDelete(deleteQuery as CFDictionary)

        guard let key, !key.isEmpty, let data = key.data(using: .utf8) else { return }

        let addQuery: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlock,
        ]
        SecItemAdd(addQuery as CFDictionary, nil)
    }

    /// Read the stored API key, or `nil` if none has been saved.
    static func loadAPIKey() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]
        var result: AnyObject?
        guard SecItemCopyMatching(query as CFDictionary, &result) == errSecSuccess,
              let data = result as? Data,
              let key = String(data: data, encoding: .utf8)
        else { return nil }
        return key
    }
}
