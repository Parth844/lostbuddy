//
//  SuggestionsView.swift
//  ClaudeWatch Watch App
//
//  Crown-driven starter prompts. Rotating the Digital Crown cycles through a
//  short list of suggestions; tapping the chip sends the highlighted one. This
//  demonstrates explicit `digitalCrownRotation` handling (the transcript itself
//  already scrolls with the crown natively).
//

import SwiftUI

struct SuggestionsView: View {
    @EnvironmentObject private var chat: ChatViewModel

    private let prompts = [
        "Summarize my day plan",
        "Give me a quick recipe idea",
        "Explain this like I'm five:",
        "Draft a short reply",
        "Tell me a fun fact",
    ]

    // Crown position as a continuous value; we round to an index.
    @State private var crown: Double = 0
    @FocusState private var focused: Bool

    private var index: Int {
        let count = prompts.count
        let i = Int(crown.rounded()) % count
        return i < 0 ? i + count : i
    }

    var body: some View {
        VStack(spacing: 6) {
            Text("Turn the crown")
                .font(.caption2)
                .foregroundStyle(.tertiary)

            Button {
                chat.send(prompts[index])
            } label: {
                Text(prompts[index])
                    .font(.footnote)
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .tint(.blue)
        }
        .focusable(true)
        .focused($focused)
        .digitalCrownRotation(
            $crown,
            from: 0,
            through: Double(prompts.count - 1),
            by: 1,
            sensitivity: .low,
            isContinuous: true,
            isHapticFeedbackEnabled: true
        )
        .onAppear { focused = true }
    }
}
