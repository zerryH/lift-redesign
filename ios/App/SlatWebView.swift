import Combine
import Foundation
import SwiftUI
import UIKit
import WebKit

struct SlatWebView: UIViewRepresentable {
    static let site = URL(string: "https://zerryh.github.io/lift-redesign/")!

    func makeCoordinator() -> Coordinator { Coordinator() }
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .default()
        config.userContentController.add(context.coordinator, name: "slatRestTimer")
        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = context.coordinator
        web.uiDelegate = context.coordinator
        web.scrollView.contentInsetAdjustmentBehavior = .never
        web.isOpaque = false
        web.backgroundColor = UIColor(red: 13/255, green: 9/255, blue: 21/255, alpha: 1)
        context.coordinator.attach(web)
        web.load(URLRequest(url: Self.site))
        return web
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {}
    static func dismantleUIView(_ uiView: WKWebView, coordinator: Coordinator) {
        uiView.configuration.userContentController.removeScriptMessageHandler(forName: "slatRestTimer")
    }

    @MainActor
    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler, WKDownloadDelegate {
        private weak var web: WKWebView?
        private let rest = RestActivityController()
        private var openRest: AnyCancellable?
        private var foreground: AnyCancellable?
        private var downloads: [ObjectIdentifier: URL] = [:]

        static func owns(_ url: URL?) -> Bool {
            guard let url, url.scheme == "https", url.host == "zerryh.github.io" else { return false }
            return url.path == "/lift-redesign" || url.path.hasPrefix("/lift-redesign/")
        }
        func attach(_ web: WKWebView) {
            self.web = web
            rest.report = { [weak self] allowed, error in
                let detail: [String: Any] = ["allowed": allowed, "error": error ?? ""]
                guard let bytes = try? JSONSerialization.data(withJSONObject: detail), let json = String(data: bytes, encoding: .utf8) else { return }
                self?.web?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('slat-native-rest-status',{detail:\(json)}));")
            }
            openRest = NotificationCenter.default.publisher(for: .slatOpenRest).sink { [weak self] _ in
                self?.web?.evaluateJavaScript("window.dispatchEvent(new Event('slat-native-rest-open'));")
            }
            foreground = NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification).sink { [weak self] _ in
                self?.web?.evaluateJavaScript("window.dispatchEvent(new Event('slat-native-rest-resume'));")
            }
        }
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            guard message.name == "slatRestTimer", message.frameInfo.isMainFrame,
                  Self.owns(message.frameInfo.request.url), let body = message.body as? [String: Any] else { return }
            rest.handle(body)
        }
        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { rest.publish() }
        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            if action.shouldPerformDownload, Self.owns(webView.url) { decisionHandler(.download); return }
            if Self.owns(action.request.url) { decisionHandler(.allow); return }
            decisionHandler(.cancel)
            if action.navigationType == .linkActivated, let url = action.request.url,
               ["https", "http", "mailto"].contains(url.scheme ?? "") { UIApplication.shared.open(url) }
        }
        func webView(_ webView: WKWebView, navigationAction: WKNavigationAction, didBecome download: WKDownload) { download.delegate = self }
        func webView(_ webView: WKWebView, navigationResponse: WKNavigationResponse, didBecome download: WKDownload) { download.delegate = self }
        func download(_ download: WKDownload, decideDestinationUsing response: URLResponse, suggestedFilename: String, completionHandler: @escaping (URL?) -> Void) {
            let directory = FileManager.default.temporaryDirectory.appendingPathComponent("Slat-export-" + UUID().uuidString)
            do {
                try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: true)
                let filename = URL(fileURLWithPath: suggestedFilename).lastPathComponent
                let destination = directory.appendingPathComponent(filename.isEmpty ? "slat-backup.json" : filename)
                downloads[ObjectIdentifier(download)] = destination
                completionHandler(destination)
            } catch { completionHandler(nil) }
        }
        func downloadDidFinish(_ download: WKDownload) {
            guard let file = downloads.removeValue(forKey: ObjectIdentifier(download)) else { return }
            let share = UIActivityViewController(activityItems: [file], applicationActivities: nil)
            share.completionWithItemsHandler = { _, _, _, _ in try? FileManager.default.removeItem(at: file.deletingLastPathComponent()) }
            web?.window?.rootViewController?.present(share, animated: true)
        }
        func download(_ download: WKDownload, didFailWithError error: Error, resumeData: Data?) {
            if let file = downloads.removeValue(forKey: ObjectIdentifier(download)) { try? FileManager.default.removeItem(at: file.deletingLastPathComponent()) }
        }
        func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
            if let url = action.request.url, ["https", "http", "mailto"].contains(url.scheme ?? "") {
                UIApplication.shared.open(url)
            }
            return nil
        }
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            guard (error as NSError).code != NSURLErrorCancelled else { return }
            let alert = UIAlertController(title: "Slat could not open", message: "Connect to the internet for the first launch, then try again.", preferredStyle: .alert)
            alert.addAction(UIAlertAction(title: "Retry", style: .default) { [weak webView] _ in webView?.load(URLRequest(url: SlatWebView.site)) })
            webView.window?.rootViewController?.present(alert, animated: true)
        }
    }
}
