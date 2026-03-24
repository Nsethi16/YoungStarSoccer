import SwiftUI
import Charts

struct WellnessTrendsView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var wellnessVM = WellnessViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Alerts
                if !wellnessVM.alerts.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("⚠️ Alerts")
                            .font(.headline)
                            .foregroundStyle(.orange)

                        ForEach(wellnessVM.alerts) { alert in
                            HStack(alignment: .top, spacing: 8) {
                                Image(systemName: "exclamationmark.triangle.fill")
                                    .foregroundStyle(.orange)
                                VStack(alignment: .leading) {
                                    Text(alert.message).font(.subheadline.bold())
                                    Text(alert.recommendation).font(.caption).foregroundStyle(.secondary)
                                }
                            }
                            .padding()
                            .background(.orange.opacity(0.1))
                            .cornerRadius(10)
                        }
                    }
                }

                // Sleep chart
                if wellnessVM.recentLogs.count >= 2 {
                    chartSection(title: "😴 Sleep", data: wellnessVM.sleepTrend().map { ($0.date, $0.hours) },
                                targetLine: Constants.Wellness.minHealthySleepHours, unit: "hours", color: .blue)

                    // Energy chart
                    chartSection(title: "⚡ Energy", data: wellnessVM.energyTrend().map { ($0.date, Double($0.level)) },
                                targetLine: nil, unit: "/ 5", color: .green)

                    // Water chart
                    chartSection(title: "💧 Water", data: wellnessVM.waterTrend().map { ($0.date, Double($0.glasses)) },
                                targetLine: Double(Constants.Wellness.minHealthyWaterGlasses), unit: "glasses", color: .cyan)
                } else {
                    VStack(spacing: 12) {
                        Image(systemName: "chart.bar")
                            .font(.largeTitle)
                            .foregroundStyle(.secondary)
                        Text("Log wellness for 2+ days to see trends")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(40)
                }
            }
            .padding()
        }
        .navigationTitle("Wellness Trends")
        .task {
            if let profileId = authViewModel.childProfile?.id {
                await wellnessVM.loadWellnessData(childProfileId: profileId)
            }
        }
    }

    private func chartSection(title: String, data: [(String, Double)], targetLine: Double?, unit: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline)

            Chart {
                ForEach(data, id: \.0) { point in
                    BarMark(
                        x: .value("Date", point.0),
                        y: .value("Value", point.1)
                    )
                    .foregroundStyle(color.gradient)
                }

                if let target = targetLine {
                    RuleMark(y: .value("Target", target))
                        .foregroundStyle(.red.opacity(0.5))
                        .lineStyle(StrokeStyle(lineWidth: 1, dash: [5]))
                }
            }
            .frame(height: 150)
            .chartYAxisLabel(unit)
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
    }
}
