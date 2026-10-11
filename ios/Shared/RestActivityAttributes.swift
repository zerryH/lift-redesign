import ActivityKit
import Foundation

struct RestActivityAttributes: ActivityAttributes {
    struct ContentState: Codable, Hashable {
        var startedAt: Date
        var endAt: Date
        var accentHex: String
        var interval: ClosedRange<Date> { min(startedAt, endAt)...endAt }
    }
    let workoutID: String
}
