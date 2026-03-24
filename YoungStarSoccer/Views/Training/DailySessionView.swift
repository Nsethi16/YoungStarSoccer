import SwiftUI

struct DailySessionView: View {
    @ObservedObject var trainingVM: TrainingViewModel
    let dayIndex: Int

    var body: some View {
        let day = trainingVM.currentPlan?.days[dayIndex]

        ScrollView {
            VStack(spacing: 16) {
                if let day = day {
                    ForEach(Array(day.drills.enumerated()), id: \.element.id) { drillIdx, plannedDrill in
                        if let drill = trainingVM.drill(for: plannedDrill.drillId) {
                            NavigationLink {
                                DrillDetailView(drill: drill)
                            } label: {
                                DrillRowCard(drill: drill, plannedDrill: plannedDrill, index: drillIdx + 1)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Today's Session")
    }
}

struct DrillRowCard: View {
    let drill: Drill
    let plannedDrill: PlannedDrill
    let index: Int

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(plannedDrill.isCompleted ? Color.green : Color.gray.opacity(0.2))
                    .frame(width: 40, height: 40)
                if plannedDrill.isCompleted {
                    Image(systemName: "checkmark")
                        .foregroundStyle(.white)
                        .bold()
                } else {
                    Text("\(index)")
                        .font(.headline)
                        .foregroundStyle(.primary)
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(drill.name)
                    .font(.headline)
                HStack {
                    Label(drill.category.rawValue, systemImage: "tag")
                    Label(drill.durationSeconds.durationString, systemImage: "clock")
                    if let reps = drill.reps {
                        Label("\(reps) reps", systemImage: "repeat")
                    }
                }
                .font(.caption)
                .foregroundStyle(.secondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .foregroundStyle(.secondary)
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
    }
}
