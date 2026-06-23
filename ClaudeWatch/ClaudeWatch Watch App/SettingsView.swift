//
//  SettingsView.swift
//  ClaudeWatch Watch App
//
//  Lets the user store their Anthropic API key (saved in the Keychain) and pick
//  which Claude model to use. The key field uses the system text-entry UI, so
//  it can be dictated, scribbled, or pasted from the paired iPhone.
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var chat: ChatViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var keySaved = (KeychainHelper.loadAPIKey() ?? "").isEmpty == false

    var body: some View {
        NavigationStack {
            List {
                Section("API Key") {
                    HStack {
                        Image(systemName: keySaved ? "checkmark.seal.fill" : "exclamationmark.triangle.fill")
                            .foregroundStyle(keySaved ? .green : .orange)
                        Text(keySaved ? "Key saved" : "No key set")
                            .font(.footnote)
                    }

                    TextFieldLink(prompt: Text("sk-ant-...")) {
                        Label(keySaved ? "Replace key" : "Add key", systemImage: "key.fill")
                    } onSubmit: { text in
                        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
                        KeychainHelper.saveAPIKey(trimmed)
                        keySaved = !trimmed.isEmpty
                    }

                    if keySaved {
                        Button(role: .destructive) {
                            KeychainHelper.saveAPIKey(nil)
                            keySaved = false
                        } label: {
                            Label("Remove key", systemImage: "trash")
                        }
                    }
                }

                Section("Model") {
                    // The Picker is crown-scrollable on watchOS.
                    Picker("Model", selection: $chat.modelRaw) {
                        ForEach(ClaudeModel.allCases) { model in
                            Text(model.displayName).tag(model.rawValue)
                        }
                    }
                }

                Section {
                    Text("Your key is stored only on this watch (Keychain) and sent directly to api.anthropic.com.")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            .navigationTitle("Settings")
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

#Preview {
    SettingsView().environmentObject(ChatViewModel())
}
