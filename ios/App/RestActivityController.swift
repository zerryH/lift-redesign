import ActivityKit
import Foundation
import UIKit

@MainActor
final class RestActivityController {
    var report: ((Bool, String?) -> Void)?
    private var revision = 0
    private var pending: Task<Void, Never>?

    func handle(_ message: [String: Any]) {
        guard message["version"] as? Int == 1, let action = message["action"] as? String else { return }
        if action == "status" { publish(); return }
        guard action == "sync" || action == "stop" else { return }
        revision += 1
        let current = revision, previous = pending
        pending = Task { @MainActor in
            await previous?.value
            guard current == revision else { return }
            if action == "stop" {
                for activity in Activity<RestActivityAttributes>.activities {
                    await activity.end(nil, dismissalPolicy: .immediate)
                }
                publish(); return
            }
            guard ActivityAuthorizationInfo().areActivitiesEnabled else {
                publish("Allow Live Activities for Slat in iPhone Settings."); return
            }
            guard let workoutID = message["workoutID"] as? String, !workoutID.isEmpty, workoutID.count <= 160,
                  let start = message["startedAt"] as? Double, let end = message["endAt"] as? Double,
                  start.isFinite, end.isFinite, start > 0, start < end,
                  end / 1000 > Date().timeIntervalSince1970,
                  end / 1000 - Date().timeIntervalSince1970 <= 86_400 else {
                publish("The rest deadline is invalid."); return
            }
            let rawAccent = message["accent"] as? String ?? "#756bff"
            let accent = rawAccent.range(of: "^#[0-9a-fA-F]{6}$", options: .regularExpression) != nil ? rawAccent : "#756bff"
            let state = RestActivityAttributes.ContentState(startedAt: Date(timeIntervalSince1970: start / 1000), endAt: Date(timeIntervalSince1970: end / 1000), accentHex: accent)
            let content = ActivityContent(state: state, staleDate: state.endAt)
            let activities = Activity<RestActivityAttributes>.activities
            for activity in activities where activity.attributes.workoutID != workoutID || activity.activityState != .active {
                await activity.end(nil, dismissalPolicy: .immediate)
            }
            guard current == revision else { return }
            if let activity = activities.first(where: { $0.attributes.workoutID == workoutID && $0.activityState == .active }) {
                await activity.update(content)
            } else {
                guard UIApplication.shared.applicationState == .active else {
                    publish("Open Slat to start the lock-screen timer."); return
                }
                do {
                    _ = try Activity.request(attributes: RestActivityAttributes(workoutID: workoutID), content: content, pushType: nil)
                } catch {
                    publish("The lock-screen timer could not start. Check Live Activities in iPhone Settings."); return
                }
            }
            publish()
        }
    }

    func publish(_ error: String? = nil) {
        report?(ActivityAuthorizationInfo().areActivitiesEnabled, error)
    }
}
