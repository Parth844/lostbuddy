//
//  AnthropicClient.swift
//  ClaudeWatch Watch App
//
//  Talks directly to the OpenAI Chat Completions API over HTTPS and parses the
//  Server-Sent Events (SSE) stream, surfacing text deltas as an async stream.
//  (Type names kept as-is to minimize churn elsewhere in the project.)
//
//  Endpoint:  POST https://api.openai.com/v1/chat/completions
//  Docs:      https://platform.openai.com/docs/api-reference/chat/streaming
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
        system: String = "You are a helpful assistant answering from an Apple Watch. Keep replies concise and easy to read on a tiny screen."
    ) -> AsyncThrowingStream<String, Error> {
        AsyncThrowingStream { continuation in
            let task = Task {
                do {
                    guard !apiKey.isEmpty else { throw AnthropicError.missingAPIKey }

                    var request = URLRequest(url: URL(string: "https://api.openai.com/v1/chat/completions")!)
                    request.httpMethod = "POST"
                    request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
                    request.setValue("application/json", forHTTPHeaderField: "Content-Type")

                    // OpenAI carries the system prompt as the first message.
                    var wire: [[String: String]] = [["role": "system", "content": system]]
                    wire += messages.map { ["role": $0.role, "content": $0.content] }

                    let body: [String: Any] = [
                        "model": model,
                        "max_tokens": maxTokens,
                        "stream": true,
                        "messages": wire,
                    ]
                    request.httpBody = try JSONSerialization.data(withJSONObject: body)

                    let (bytes, response) = try await URLSession.shared.bytes(for: request)

                    guard let http = response as? HTTPURLResponse else {
                        throw AnthropicError.decoding
                    }
                    guard (200...299).contains(http.statusCode) else {
                        var errBody = ""
                        for try await line in bytes.lines { errBody += line }
                        throw AnthropicError.http(status: http.statusCode, body: errBody)
                    }

                    // Parse the SSE stream. OpenAI sends `data: {json}` lines and
                    // a final `data: [DONE]`. Text lives at choices[0].delta.content.
                    for try await line in bytes.lines {
                        guard line.hasPrefix("data:") else { continue }
                        let payload = line.dropFirst(5).trimmingCharacters(in: .whitespaces)
                        if payload == "[DONE]" { break }
                        guard let data = payload.data(using: .utf8),
                              let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
                              let choices = json["choices"] as? [[String: Any]],
                              let delta = choices.first?["delta"] as? [String: Any]
                        else { continue }

                        if let text = delta["content"] as? String, !text.isEmpty {
                            continuation.yield(text)
                        }
                    }
                    continuation.finish()
                } catch {
                    continuation.finish(throwing: error)
                }
            }

            continuation.onTermination = { _ in task.cancel() }
        }
    }
}
