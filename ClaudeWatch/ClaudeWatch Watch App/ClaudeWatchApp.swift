//
//  ClaudeWatchApp.swift
//  ClaudeWatch Watch App
//
//  Entry point for the standalone Apple Watch app that talks to the
//  Claude (Anthropic) Messages API. Optimized for Apple Watch SE (3rd gen).
//

import SwiftUI

@main
struct ClaudeWatch_Watch_AppApp: App {
    // A single shared chat session lives for the lifetime of the app.
    @StateObject private var chat = ChatViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(chat)
        }
    }
}
