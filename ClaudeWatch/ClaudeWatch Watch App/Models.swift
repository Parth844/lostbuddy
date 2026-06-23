//
//  Models.swift
//  ClaudeWatch Watch App
//
//  Plain data types for the chat transcript and the available models.
//

import Foundation

/// Who authored a given line of the transcript.
enum Role: String, Codable {
    case user
    case assistant
}

/// One message bubble in the transcript.
///
/// `id` is stable so SwiftUI can diff the list while a reply streams in.
struct ChatMessage: Identifiable, Equatable {
    let id = UUID()
    let role: Role
    var text: String
    /// True while the assistant reply is still streaming.
    var isStreaming: Bool = false
}

/// The NVIDIA-hosted models offered in Settings.
enum ClaudeModel: String, CaseIterable, Identifiable {
    case kimiK2  = "moonshotai/kimi-k2.6"
    case llama33 = "meta/llama-3.3-70b-instruct"

    var id: String { rawValue }

    /// Short label shown in the Settings picker.
    var displayName: String {
        switch self {
        case .kimiK2:  return "Kimi K2.6"
        case .llama33: return "Llama 3.3 70B"
        }
    }
}
