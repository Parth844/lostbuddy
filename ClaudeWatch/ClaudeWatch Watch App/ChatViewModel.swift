//
//  ChatViewModel.swift
//  ClaudeWatch Watch App
//
//  Owns the transcript and drives requests to Claude. All UI state mutations
//  happen on the main actor so SwiftUI updates cleanly while text streams in.
//

import Foundation
import SwiftUI

@MainActor
final class ChatViewModel: ObservableObject {
    @Published var messages: [ChatMessage] = []
    @Published var isResponding = false
    @Published var errorText: String?

    /// Selected model, persisted across launches.
    @AppStorage("selectedModel") var modelRaw: String = ClaudeModel.opus48.rawValue

    private var model: ClaudeModel { ClaudeModel(rawValue: modelRaw) ?? .opus48 }
    private var streamTask: Task<Void, Never>?

    var hasAPIKey: Bool { (KeychainHelper.loadAPIKey() ?? "").isEmpty == false }

    /// Send the user's prompt and stream Claude's reply into the transcript.
    func send(_ prompt: String) {
        let trimmed = prompt.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, !isResponding else { return }

        errorText = nil
        messages.append(ChatMessage(role: .user, text: trimmed))

        guard let apiKey = KeychainHelper.loadAPIKey(), !apiKey.isEmpty else {
            errorText = AnthropicError.missingAPIKey.errorDescription
            return
        }

        // Build the wire transcript from everything so far.
        let wire = messages.map {
            AnthropicClient.WireMessage(role: $0.role.rawValue, content: $0.text)
        }

        // Placeholder bubble the stream fills in.
        var reply = ChatMessage(role: .assistant, text: "", isStreaming: true)
        messages.append(reply)
        let replyIndex = messages.count - 1
        isResponding = true

        streamTask = Task {
            do {
                let stream = AnthropicClient.streamReply(
                    messages: wire,
                    model: model.rawValue,
                    apiKey: apiKey
                )
                for try await delta in stream {
                    reply.text += delta
                    if messages.indices.contains(replyIndex) {
                        messages[replyIndex].text = reply.text
                    }
                }
            } catch is CancellationError {
                // User stopped generation — keep whatever streamed so far.
            } catch {
                errorText = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
            }
            if messages.indices.contains(replyIndex) {
                messages[replyIndex].isStreaming = false
                // Drop an empty assistant bubble if nothing came back.
                if messages[replyIndex].text.isEmpty {
                    messages.remove(at: replyIndex)
                }
            }
            isResponding = false
        }
    }

    /// Stop an in-flight reply.
    func stop() {
        streamTask?.cancel()
        streamTask = nil
    }

    /// Clear the whole conversation.
    func reset() {
        stop()
        messages.removeAll()
        errorText = nil
    }
}
