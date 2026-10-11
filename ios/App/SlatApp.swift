import SwiftUI

extension Notification.Name {
    static let slatOpenRest = Notification.Name("SlatOpenRest")
}

@main
struct SlatApp: App {
    var body: some Scene {
        WindowGroup {
            SlatWebView()
                .ignoresSafeArea()
                .onOpenURL { url in
                    if url.scheme == "slat", url.host == "rest" {
                        NotificationCenter.default.post(name: .slatOpenRest, object: nil)
                    }
                }
        }
    }
}
