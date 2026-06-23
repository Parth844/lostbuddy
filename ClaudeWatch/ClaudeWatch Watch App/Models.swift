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

/// The Claude models offered in Settings. Defaults to the most capable Opus
/// tier; Haiku is offered for snappier, lower-cost replies on the watch.
enum ClaudeModel: String, CaseIterable, Identifiable {
    case opus48   = "claude-opus-4-8"
    case sonnet46 = "claude-sonnet-4-6"
    case haiku45  = "claude-haiku-4-5"

    var id: String { rawValue }

    /// Short label shown in the Settings picker.
    var displayName: String {
        switch self {
        case .opus48:   return "Opus 4.8"
        case .sonnet46: return "Sonnet 4.6"
        case .haiku45:  return "Haiku 4.5"
        }
    }
}
