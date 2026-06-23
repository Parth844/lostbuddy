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

/// The OpenAI models offered in Settings. Defaults to GPT-4o mini for the
/// cheapest, snappiest replies on the watch.
enum ClaudeModel: String, CaseIterable, Identifiable {
    case gpt4oMini = "gpt-4o-mini"
    case gpt4o     = "gpt-4o"
    case gpt4Turbo = "gpt-4-turbo"

    var id: String { rawValue }

    /// Short label shown in the Settings picker.
    var displayName: String {
        switch self {
        case .gpt4oMini: return "GPT-4o mini"
        case .gpt4o:     return "GPT-4o"
        case .gpt4Turbo: return "GPT-4 Turbo"
        }
    }
}
