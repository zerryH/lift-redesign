import ActivityKit
import SwiftUI
import WidgetKit

private extension Color {
    init(restHex: String) {
        let text = restHex.trimmingCharacters(in: CharacterSet(charactersIn: "#"))
        let value = UInt32(text, radix: 16) ?? 0x756BFF
        self.init(red: Double((value >> 16) & 255) / 255,
                  green: Double((value >> 8) & 255) / 255,
                  blue: Double(value & 255) / 255)
    }
}

struct RestGlassCard: View {
    let state: RestActivityAttributes.ContentState
    let isStale: Bool
    @Environment(\.accessibilityReduceTransparency) private var reduceTransparency

    private var content: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .center, spacing: 16) {
                VStack(alignment: .leading, spacing: 5) {
                    Label("Slat", systemImage: "timer")
                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                        .foregroundStyle(.secondary)
                    Text(isStale ? "Ready" : "Rest")
                        .font(.system(size: 17, weight: .medium, design: .rounded))
                        .lineLimit(1).minimumScaleFactor(0.8)
                }
                Spacer(minLength: 8)
                Text(timerInterval: state.interval, countsDown: true, showsHours: false)
                    .font(.system(size: 38, weight: .light, design: .rounded))
                    .monospacedDigit().lineLimit(1).minimumScaleFactor(0.7)
                    .frame(width: 130, alignment: .trailing)
                    .accessibilityLabel("Rest time remaining")
            }
            ProgressView(timerInterval: state.interval, countsDown: true) {
                EmptyView()
            } currentValueLabel: {
                EmptyView()
            }
            .progressViewStyle(.linear)
            .tint(Color(restHex: state.accentHex))
            .accessibilityLabel("Rest progress")
        }
        .padding(16)
    }

    @ViewBuilder var body: some View {
        if reduceTransparency {
            content.background(.background, in: RoundedRectangle(cornerRadius: 26))
        } else if #available(iOS 26.0, *) {
            content.glassEffect(.clear, in: RoundedRectangle(cornerRadius: 26))
        } else {
            content.background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 26))
        }
    }
}

struct SlatRestLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: RestActivityAttributes.self) { context in
            RestGlassCard(state: context.state, isStale: context.isStale)
                .activityBackgroundTint(.clear)
                .activitySystemActionForegroundColor(.primary)
                .widgetURL(URL(string: "slat://rest"))
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Label("Rest", systemImage: "timer").font(.headline)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(timerInterval: context.state.interval, countsDown: true, showsHours: false)
                        .monospacedDigit().frame(width: 100, alignment: .trailing)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    ProgressView(timerInterval: context.state.interval, countsDown: true) {
                        EmptyView()
                    } currentValueLabel: { EmptyView() }
                    .tint(Color(restHex: context.state.accentHex))
                }
            } compactLeading: {
                Image(systemName: "timer").foregroundStyle(Color(restHex: context.state.accentHex))
            } compactTrailing: {
                Text(timerInterval: context.state.interval, countsDown: true, showsHours: false)
                    .monospacedDigit().frame(width: 52)
            } minimal: {
                Image(systemName: "timer")
            }
            .widgetURL(URL(string: "slat://rest"))
            .keylineTint(Color(restHex: context.state.accentHex))
        }
    }
}

@main
struct SlatWidgetBundle: WidgetBundle {
    var body: some Widget { SlatRestLiveActivity() }
}
