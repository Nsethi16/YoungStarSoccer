import SwiftUI

struct WeeklyPlanView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var trainingVM = TrainingViewModel()
    @State private var selectedDay: Int?

    let dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    // Week at a glance
                    weekOverview

                    // Day details
                    if let plan = trainingVM.currentPlan {
                        ForEach(Array(plan.days.enumerated()), id: \.element.id) { index, day in
                            DayCard(day: day, dayName: dayNames[day.dayOfWeek],
                                    trainingVM: trainingVM, dayIndex: index)
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Training Plan")
            .task {
                if let profileId = authViewModel.childProfile?.id {
                    await trainingVM.loadTrainingPlan(childProfileId: profileId)
                }
            }
        }
    }

    private var weekOverview: some View {
        HStack(spacing: 4) {
            ForEach(0..<7, id: \.self) { day in
                let trainingDay = trainingVM.currentPlan?.days.first(where: { $0.dayOfWeek == day })
                VStack(spacing: 4) {
                    Text(String(dayNames[day].prefix(3)))
                        .font(.caption2.bold())
                    Circle()
                        .fill(dayColor(trainingDay))
                        .frame(width: 30, height: 30)
                        .overlay {
                            if trainingDay?.isCompleted == true {
                                Image(systemName: "checkmark")
                                    .font(.caption2.bold())
                                    .foregroundStyle(.white)
                            } else if day == Date().dayOfWeek {
                                Circle().stroke(Color.green, lineWidth: 2)
                            }
                        }
                }
                .frame(maxWidth: .infinity)
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
    }

    private func dayColor(_ day: TrainingDay?) -> Color {
        guard let day = day else { return .gray.opacity(0.2) }
        if day.isCompleted { return .green }
        switch day.type {
        case .restDay: return .blue.opacity(0.3)
        case .teamPractice: return .orange.opacity(0.3)
        case .offDay: return .purple.opacity(0.3)
        case .indoor: return .yellow.opacity(0.3)
        }
    }
}

struct DayCard: View {
    let day: TrainingDay
    let dayName: String
    @ObservedObject var trainingVM: TrainingViewModel
    let dayIndex: Int
    @State private var showDrillSwap = false
    @State private var swapDrillIndex: Int?

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(dayName)
                    .font(.headline)
                Spacer()
                Text(dayTypeLabel)
                    .font(.caption)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(dayTypeColor.opacity(0.2))
                    .cornerRadius(8)
                if day.isCompleted {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                }
            }

            if day.type == .restDay {
                Text("Rest and recover 😴")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(Array(day.drills.enumerated()), id: \.element.id) { drillIdx, plannedDrill in
                    if let drill = trainingVM.drill(for: plannedDrill.drillId) {
                        HStack {
                            Image(systemName: plannedDrill.isCompleted ? "checkmark.circle.fill" : "circle")
                                .foregroundStyle(plannedDrill.isCompleted ? .green : .gray)

                            VStack(alignment: .leading) {
                                Text(drill.name).font(.subheadline)
                                HStack {
                                    Text(drill.category.rawValue)
                                    Text("•")
                                    Text(drill.durationSeconds.durationString)
                                    if let reps = drill.reps {
                                        Text("•")
                                        Text("\(reps) reps")
                                    }
                                }
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            }

                            Spacer()

                            Button {
                                swapDrillIndex = drillIdx
                                showDrillSwap = true
                            } label: {
                                Image(systemName: "arrow.triangle.2.circlepath")
                                    .font(.caption)
                                    .foregroundStyle(.blue)
                            }
                        }
                        .padding(.vertical, 2)
                    }
                }
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
        .sheet(isPresented: $showDrillSwap) {
            DrillSwapSheet(trainingVM: trainingVM, dayIndex: dayIndex,
                          drillIndex: swapDrillIndex ?? 0)
        }
    }

    private var dayTypeLabel: String {
        switch day.type {
        case .restDay: return "Rest"
        case .teamPractice: return "Practice Day"
        case .offDay: return "Training Day"
        case .indoor: return "Indoor"
        }
    }

    private var dayTypeColor: Color {
        switch day.type {
        case .restDay: return .blue
        case .teamPractice: return .orange
        case .offDay: return .purple
        case .indoor: return .yellow
        }
    }
}

struct DrillSwapSheet: View {
    @ObservedObject var trainingVM: TrainingViewModel
    let dayIndex: Int
    let drillIndex: Int
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            List {
                ForEach(Drill.DrillCategory.allCases, id: \.self) { category in
                    Section(category.rawValue) {
                        ForEach(trainingVM.drills.filter { $0.category == category }) { drill in
                            Button {
                                if let drillId = drill.id {
                                    trainingVM.swapDrill(dayIndex: dayIndex, drillIndex: drillIndex, newDrillId: drillId)
                                }
                                dismiss()
                            } label: {
                                VStack(alignment: .leading) {
                                    Text(drill.name).font(.subheadline)
                                    HStack {
                                        Text(drill.durationSeconds.durationString)
                                        Text("•")
                                        Text(drill.difficulty.rawValue)
                                        if drill.isIndoor {
                                            Text("•")
                                            Text("🏠 Indoor")
                                        }
                                    }
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Swap Drill")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}
