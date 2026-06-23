//
//  ContentView.swift
//  ClaudeWatch Watch App
//
//  Main chat screen. The transcript scrolls with the Digital Crown (native on
//  any ScrollView) and auto-follows the streaming reply. The input row offers
//  voice dictation and a send button.
//

import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var chat: ChatViewModel
    @State private var showSettings = false

    var body: some View {
        NavigationStack {
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 8) {
                        if chat.messages.isEmpty {
                            EmptyStateView()
                        }

                        ForEach(chat.messages) { message in
                            MessageBubble(message: message)
                                .id(message.id)
                        }

                        if let error = chat.errorText {
                            Text(error)
                                .font(.footnote)
                                .foregroundStyle(.red)
                                .padding(8)
                                .frame(maxWidth: .infinity, alignment: .leading)
                                .background(.red.opacity(0.15), in: RoundedRectangle(cornerRadius: 10))
                        }

                        // Anchor we scroll to as new text streams in.
                        Color.clear.frame(height: 1).id("BOTTOM")
                    }
                    .padding(.horizontal, 2)
                }
                // The Digital Crown scrolls this ScrollView natively; we just
                // keep the view pinned to the latest content.
                .onChange(of: chat.messages.last?.text) { _, _ in
                    withAnimation { proxy.scrollTo("BOTTOM", anchor: .bottom) }
                }
                .onChange(of: chat.messages.count) { _, _ in
                    withAnimation { proxy.scrollTo("BOTTOM", anchor: .bottom) }
                }
            }
            .navigationTitle("Claude")
            .navigationBarTitleDisplayMode(.inline)
            .safeAreaInset(edge: .bottom) {
                InputBar()
            }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showSettings = true
                    } label: {
                        Image(systemName: "gearshape")
                    }
                }
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        chat.reset()
                    } label: {
                        Image(systemName: "square.and.pencil")
                    }
                    .disabled(chat.messages.isEmpty)
                }
            }
            .sheet(isPresented: $showSettings) {
                SettingsView()
            }
        }
    }
}

// MARK: - Transcript pieces

private struct MessageBubble: View {
    let message: ChatMessage

    private var isUser: Bool { message.role == .user }

    var body: some View {
        VStack(alignment: isUser ? .trailing : .leading, spacing: 2) {
            Text(message.text.isEmpty && message.isStreaming ? "…" : message.text)
                .font(.body)
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(
                    isUser ? Color.blue.opacity(0.85) : Color.gray.opacity(0.30),
                    in: RoundedRectangle(cornerRadius: 14)
                )
                .foregroundStyle(isUser ? .white : .primary)
        }
        .frame(maxWidth: .infinity, alignment: isUser ? .trailing : .leading)
    }
}

private struct EmptyStateView: View {
    var body: some View {
        VStack(spacing: 6) {
            Image(systemName: "sparkles")
                .font(.title3)
                .foregroundStyle(.blue)
            Text("Ask Claude anything")
                .font(.footnote)
                .foregroundStyle(.secondary)
            Text("Tap the mic to dictate")
                .font(.caption2)
                .foregroundStyle(.tertiary)

            SuggestionsView()
                .padding(.top, 6)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 12)
    }
}

#Preview {
    ContentView().environmentObject(ChatViewModel())
}
