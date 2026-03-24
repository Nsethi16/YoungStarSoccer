import SwiftUI
import Charts

struct ProgressOverviewView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var progressVM = ProgressViewModel()

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Summary cards
                    summarySection

                    // Personal Records
                    if !progressVM.personalRecords.isEmpty {
                        personalRecordsSection
                    }

                    // Charts by drill
                    chartsSection
                }
                .padding()
            }
            .navigationTitle("Progress")
            .task {
                if let profileId = authViewModel.childProfile?.id {
                    await progressVM.loadProgress(childProfileId: profileId)
                }
            }
        }
    }

    private var summarySection: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            StatCard(title: "Total Sessions", value: "\(progressVM.sessionLogs.count)",
                     subtitle: "completed", icon: "figure.run", color: .green)
            StatCard(title: "Personal Records", value: "\(progressVM.personalRecords.count)",
                     subtitle: "set", icon: "star.fill", color: .yellow)
        }
    }

    private var personalRecordsSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("🏆 Personal Records")
                .font(.headline)

            ForEach(Array(progressVM.personalRecords.values), id: \.drillId) { record in
                HStack {
                    VStack(alignment: .leading) {
                        Text(record.drillName)
                            .font(.subheadline.bold())
                        Text(record.measurableType.rawValue)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Text(formatValue(record.value, type: record.measurableType))
                        .font(.title3.bold())
                        .foregroundStyle(.green)
                    Text(record.date.shortDate)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(10)
            }
        }
    }

    private var chartsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("📈 Week-over-Week Trends")
                .font(.headline)

            ForEach(Array(progressVM.personalRecords.keys), id: \.self) { drillId in
                if let record = progressVM.personalRecords[drillId] {
                    let data = progressVM.weekOverWeekData(for: drillId)
                    if data.count >= 2 {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(record.drillName)
                                .font(.subheadline.bold())

                            Chart {
                                ForEach(data, id: \.week) { point in
                                    LineMark(
                                        x: .value("Week", point.week),
                                        y: .value("Value", point.value)
                                    )
                                    .foregroundStyle(.green)

                                    PointMark(
                                        x: .value("Week", point.week),
                                        y: .value("Value", point.value)
                                    )
                                    .foregroundStyle(.green)
                                }
                            }
                            .frame(height: 150)
                            .chartYAxisLabel(record.measurableType.rawValue)
                        }
                        .padding()
                        .background(.ultraThinMaterial)
                        .cornerRadius(12)
                    }
                }
            }

            if progressVM.personalRecords.isEmpty {
                VStack(spacing: 12) {
                    Image(systemName: "chart.line.uptrend.xyaxis")
                        .font(.largeTitle)
                        .foregroundStyle(.secondary)
                    Text("Complete measurable drills to see your progress charts!")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(40)
            }
        }
    }

    private func formatValue(_ value: Double, type: Drill.MeasurableType) -> String {
        switch type {
        case .sprintTime:
            return "\(value.oneDecimal)s"
        case .shotAccuracy:
            return "\(Int(value))/10"
        case .dribblingReps:
            return "\(Int(value)) reps"
        case .passingAccuracy:
            return "\(Int(value))/10"
        }
    }
}
