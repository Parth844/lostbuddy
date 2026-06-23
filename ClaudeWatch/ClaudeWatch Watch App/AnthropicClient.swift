//
//  AnthropicClient.swift
//  ClaudeWatch Watch App
//
//  Talks directly to the Anthropic Messages API over HTTPS. Swift has no
//  official Anthropic SDK, so we hand-roll the request and parse the
//  Server-Sent Events (SSE) stream, surfacing text deltas as an async stream.
//
//  Endpoint:  POST https://api.anthropic.com/v1/messages
//  Docs:      https://platform.claude.com/docs/en/build-with-claude/streaming
//

import Foundation

enum AnthropicError: LocalizedError {
    case missingAPIKey
    case http(status: Int, body: String)
    case decoding

    var errorDescription: String? {
        switch self {
        case .missingAPIKey:
            return "No API key. Add one in Settings."
        case let .http(status, body):
            return "API error \(status): \(body)"
        case .decoding:
            return "Could not read the response."
        }
    }
}

struct AnthropicClient {
    /// The wire-format message the API expects (role + plain text content).
    struct WireMessage: Encodable {
        let role: String
        let content: String
    }

    /// Stream a completion for the given transcript. Yields text deltas as they
    /// arrive; finishes when the model stops. Throws on auth/HTTP/parse errors.
    static func streamReply(
        messages: [WireMessage],
        model: String,
        apiKey: String,
        maxTokens: Int = 1024,
        system: String = "You are Claude, a helpful assistant answering from an Apple Watch. Keep replies concise and easy to read on a tiny screen."
    ) -> AsyncThrowingStream<String, Error> {
        AsyncThrowingStream { continuation in
            let task = Task {
                do {
                    guard !apiKey.isEmpty else { throw AnthropicError.missingAPIKey }

                    var request = URLRequest(url: URL(string: "https://api.anthropic.com/v1/messages")!)
                    request.httpMethod = "POST"
                    request.setValue(apiKey, forHTTPHeaderField: "x-api-key")
                    request.setValue("2023-06-01", forHTTPHeaderField: "anthropic-version")
                    request.setValue("application/json", forHTTPHeaderField: "content-type")

                    let body: [String: Any] = [
                        "model": model,
                        "max_tokens": maxTokens,
                        "system": system,
                        "stream": true,
                        "messages": messages.map { ["role": $0.role, "content": $0.content] },
                    ]
                    request.httpBody = try JSONSerialization.data(withJSONObject: body)

                    let (bytes, response) = try await URLSession.shared.bytes(for: request)

                    guard let http = response as? HTTPURLResponse else {
                        throw AnthropicError.decoding
                    }
                    guard (200...299).contains(http.statusCode) else {
                        // Drain the body so we can show a useful error message.
                        var errBody = ""
                        for try await line in bytes.lines { errBody += line }
                        throw AnthropicError.http(status: http.statusCode, body: errBody)
                    }

                    // Parse the SSE stream line by line. We only care about the
                    // `data:` payloads carrying `content_block_delta` text.
                    for try await line in bytes.lines {
                        guard line.hasPrefix("data:") else { continue }
                        let payload = line.dropFirst(5).trimmingCharacters(in: .whitespaces)
                        if payload == "[DONE]" { break }
                        guard let data = payload.data(using: .utf8),
                              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
                        else { continue }

                        let type = json["type"] as? String
                        if type == "content_block_delta",
                           let delta = json["delta"] as? [String: Any],
                           let text = delta["text"] as? String {
                            continuation.yield(text)
                        } else if type == "message_stop" {
                            break
                        }
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }

            // If the consumer cancels (view disappears), cancel the network task.
            continuation.onTermination = { _ in task.cancel() }
        }
    }
}
