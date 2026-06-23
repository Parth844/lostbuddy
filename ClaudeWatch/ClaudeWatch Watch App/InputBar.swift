//
//  InputBar.swift
//  ClaudeWatch Watch App
//
//  Bottom input row. Uses `TextFieldLink`, which presents the system watchOS
//  text-entry UI — that screen includes Dictation (voice), Scribble, and emoji,
//  so a single control covers both voice and typed input. While a reply streams
//  the same slot becomes a Stop button.
//

import SwiftUI

struct InputBar: View {
    @EnvironmentObject private var chat: ChatViewModel

    var body: some View {
        Group {
            if chat.isResponding {
                Button(role: .destructive) {
                    chat.stop()
                } label: {
                    Label("Stop", systemImage: "stop.fill")
                        .frame(maxWidth: .infinity)
                }
                .tint(.red)
            } else {
                TextFieldLink(prompt: Text("Ask Claude")) {
                    Label("Dictate or type", systemImage: "mic.fill")
                        .frame(maxWidth: .infinity)
                } onSubmit: { text in
                    chat.send(text)
                }
                .buttonStyle(.borderedProminent)
                // Where the watch supports it (double-tap gesture), make this
                // the primary action so a pinch fires dictation hands-free.
                .handGestureShortcut(.primaryAction)
            }
        }
        .padding(.horizontal, 4)
        .padding(.bottom, 2)
    }
}
