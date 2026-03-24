import SwiftUI

struct GuidedSessionView: View {
    @ObservedObject var trainingVM: TrainingViewModel
    @ObservedObject var progressVM: ProgressViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var guidedVM = GuidedSessionViewModel()
    @Environment(\.dismiss) var dismiss
    @State private var showResultInput = false
    @State private var measuredValue = ""

    var body: some View {
        VStack(spacing: 0) {
            if guidedVM.isComplete {
                sessionCompleteView
            } else if !guidedVM.isRunning {
                sessionReadyView
            } else {
                activeSessionView
            }
        }
        .navigationBarBackButtonHidden(guidedVM.isRunning)
        .onAppear { setupSession() }
        .onDisappear { guidedVM.cleanup() }
    }

    // MARK: - Ready Screen
    private var sessionReadyView: some View {
        VStack(spacing: 30) {
            Spacer()

            Image(systemName: "figure.run")
                .font(.system(size: 80))
                .foregroundStyle(.green)

            Text("Ready to Train?")
                .font(.largeTitle.bold())

            Text("\(guidedVM.totalDrills) drills today")
                .font(.title3)
                .foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 8) {
                ForEach(guidedVM.drills, id: \.name) { drill in
                    Label(drill.name, systemImage: "circle.fill")
                        .font(.subheadline)
                }
            }
            .padding()

            Spacer()

            Button {
                guidedVM.start()
            } label: {
                Label("Start Session", systemImage: "play.fill")
                    .font(.title2.bold())
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(.green)
                    .cornerRadius(16)
            }
            .padding(.horizontal)
            .padding(.bottom, 30)
        }
    }

    // MARK: - Active Session
    private var activeSessionView: some View {
        VStack(spacing: 20) {
            // Progress bar
            ProgressView(value: guidedVM.progress)
                .tint(.green)
                .padding(.horizontal)

            Text("Drill \(guidedVM.currentDrillIndex + 1) of \(guidedVM.totalDrills)")
                .font(.caption)
                .foregroundStyle(.secondary)

            Spacer()

            if guidedVM.isResting {
                restView
            } else if let drill = guidedVM.currentDrill {
                drillActiveView(drill: drill)
            }

            Spacer()

            // Controls
            HStack(spacing: 20) {
                Button {
                    guidedVM.skipDrill()
                } label: {
                    Label("Skip", systemImage: "forward.fill")
                        .font(.headline)
                        .foregroundStyle(.orange)
                        .padding()
                        .background(.orange.opacity(0.1))
                        .cornerRadius(12)
                }

                if guidedVM.isPaused {
                    Button {
                        guidedVM.resume()
                    } label: {
                        Label("Resume", systemImage: "play.fill")
                            .font(.headline)
                            .foregroundStyle(.white)
                            .padding()
                            .background(.green)
                            .cornerRadius(12)
                    }
                } else {
                    Button {
                        guidedVM.pause()
                    } label: {
                        Label("Pause", systemImage: "pause.fill")
                            .font(.headline)
                            .foregroundStyle(.white)
                            .padding()
                            .background(.blue)
                            .cornerRadius(12)
                    }
                }

                Button {
                    if guidedVM.currentDrill?.measurableType != nil {
                        showResultInput = true
                    } else {
                        guidedVM.completeDrill()
                    }
                } label: {
                    Label("Done", systemImage: "checkmark")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .padding()
                        .background(.green)
                        .cornerRadius(12)
                }
            }
            .padding(.horizontal)
            .padding(.bottom, 20)
        }
        .alert("Log Your Result", isPresented: $showResultInput) {
            TextField("Enter value", text: $measuredValue)
                .keyboardType(.decimalPad)
            Button("Save") {
                if let value = Double(measuredValue) {
                    guidedVM.completeDrill(measuredValue: value)
                    if let drill = guidedVM.currentDrill, let profileId = authViewModel.childProfile?.id {
                        Task {
                            await progressVM.logResult(childProfileId: profileId, drill: drill, value: value)
                        }
                    }
                }
                measuredValue = ""
            }
            Button("Skip", role: .cancel) {
                guidedVM.completeDrill()
            }
        } message: {
            if let type = guidedVM.currentDrill?.measurableType {
                Text("Enter your \(type.rawValue)")
            }
        }
    }

    private func drillActiveView(drill: Drill) -> some View {
        VStack(spacing: 16) {
            Text(drill.name)
                .font(.title.bold())

            Text(drill.category.rawValue)
                .font(.subheadline)
                .foregroundStyle(.secondary)

            // Timer
            CountdownTimerView(timeRemaining: guidedVM.timeRemaining, isActive: !guidedVM.isPaused)

            // Instructions
            if let instruction = drill.instructions.first {
                Text(instruction)
                    .font(.body)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            if let reps = drill.reps {
                Text("\(reps) reps")
                    .font(.title3.bold())
                    .foregroundStyle(.green)
            }

            if let target = drill.timeTarget {
                Text("Target: \(target)")
                    .font(.caption)
                    .foregroundStyle(.blue)
            }
        }
    }

    private var restView: some View {
        VStack(spacing: 20) {
            Image(systemName: "cup.and.saucer.fill")
                .font(.system(size: 50))
                .foregroundStyle(.blue)

            Text("Rest")
                .font(.title.bold())

            CountdownTimerView(timeRemaining: guidedVM.timeRemaining, isActive: true)

            Text("Get ready for the next drill!")
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }

    // MARK: - Session Complete
    private var sessionCompleteView: some View {
        VStack(spacing: 24) {
            Spacer()

            Image(systemName: "star.fill")
                .font(.system(size: 80))
                .foregroundStyle(.yellow)

            Text("Amazing Work! 🎉")
                .font(.largeTitle.bold())

            let completed = guidedVM.drillResults.filter(\.completed).count
            Text("\(completed) of \(guidedVM.totalDrills) drills completed")
                .font(.title3)
                .foregroundStyle(.secondary)

            MotivationQuoteView(streak: authViewModel.childProfile?.currentStreak ?? 0)

            Spacer()

            Button {
                saveAndDismiss()
            } label: {
                Text("Finish")
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(.green)
                    .cornerRadius(12)
            }
            .padding(.horizontal)
            .padding(.bottom, 30)
        }
    }

    // MARK: - Helpers
    private func setupSession() {
        guard let session = trainingVM.todaySession else { return }
        let sessionDrills = session.drills.compactMap { planned in
            trainingVM.drill(for: planned.drillId)
        }
        guidedVM.setup(drills: sessionDrills, plannedDrills: session.drills)
    }

    private func saveAndDismiss() {
        if let profileId = authViewModel.childProfile?.id,
           let planId = trainingVM.currentPlan?.id {
            Task {
                await progressVM.saveSessionLog(
                    childProfileId: profileId,
                    trainingPlanId: planId,
                    dayOfWeek: Date().dayOfWeek,
                    drillResults: guidedVM.drillResults,
                    durationMinutes: 20
                )
            }
        }
        dismiss()
    }
}
