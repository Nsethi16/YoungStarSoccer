import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @EnvironmentObject var appState: AppState
    @State private var step = 0
    @State private var childName = ""
    @State private var childAge = 8
    @State private var teamName = ""
    @State private var selectedPracticeDays: Set<Int> = [2, 4] // Tue, Thu default

    let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    let ageRange = 7...10

    var body: some View {
        VStack(spacing: 30) {
            // Progress indicator
            HStack(spacing: 8) {
                ForEach(0..<3) { i in
                    Capsule()
                        .fill(i <= step ? Color.green : Color.gray.opacity(0.3))
                        .frame(height: 4)
                }
            }
            .padding(.horizontal, 40)
            .padding(.top, 20)

            Spacer()

            switch step {
            case 0:
                playerInfoStep
            case 1:
                teamScheduleStep
            case 2:
                readyStep
            default:
                EmptyView()
            }

            Spacer()

            // Navigation buttons
            HStack {
                if step > 0 {
                    Button("Back") { withAnimation { step -= 1 } }
                        .foregroundStyle(.secondary)
                }
                Spacer()
                Button(step == 2 ? "Let's Go! ⚽" : "Next") {
                    if step == 2 {
                        createProfile()
                    } else {
                        withAnimation { step += 1 }
                    }
                }
                .font(.headline)
                .foregroundStyle(.white)
                .padding(.horizontal, 32)
                .padding(.vertical, 12)
                .background(canAdvance ? Color.green : Color.gray)
                .cornerRadius(12)
                .disabled(!canAdvance)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 30)
        }
    }

    private var canAdvance: Bool {
        switch step {
        case 0: return !childName.isEmpty
        case 1: return !selectedPracticeDays.isEmpty
        case 2: return true
        default: return false
        }
    }

    private var playerInfoStep: some View {
        VStack(spacing: 24) {
            Image(systemName: "figure.soccer")
                .font(.system(size: 60))
                .foregroundStyle(.green)

            Text("Who's the young star?")
                .font(.title2.bold())

            VStack(spacing: 16) {
                TextField("Player Name", text: $childName)
                    .textContentType(.name)
                    .padding()
                    .background(.ultraThinMaterial)
                    .cornerRadius(12)

                Picker("Age", selection: $childAge) {
                    ForEach(ageRange, id: \.self) { age in
                        Text("\(age) years old").tag(age)
                    }
                }
                .pickerStyle(.segmented)

                TextField("Team Name (optional)", text: $teamName)
                    .padding()
                    .background(.ultraThinMaterial)
                    .cornerRadius(12)
            }
            .padding(.horizontal)
        }
    }

    private var teamScheduleStep: some View {
        VStack(spacing: 24) {
            Image(systemName: "calendar")
                .font(.system(size: 60))
                .foregroundStyle(.green)

            Text("When does the team practice?")
                .font(.title2.bold())

            Text("We'll build training around these days")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 4), spacing: 12) {
                ForEach(0..<7, id: \.self) { day in
                    Button {
                        if day == 0 { return } // Can't practice on rest day
                        if selectedPracticeDays.contains(day) {
                            selectedPracticeDays.remove(day)
                        } else {
                            selectedPracticeDays.insert(day)
                        }
                    } label: {
                        VStack(spacing: 4) {
                            Text(dayNames[day])
                                .font(.headline)
                            if day == 0 {
                                Text("Rest")
                                    .font(.caption2)
                            } else if selectedPracticeDays.contains(day) {
                                Text("Practice")
                                    .font(.caption2)
                            } else {
                                Text("Training")
                                    .font(.caption2)
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(
                            day == 0 ? Color.gray.opacity(0.2) :
                            selectedPracticeDays.contains(day) ? Color.green.opacity(0.2) :
                            Color.blue.opacity(0.1)
                        )
                        .foregroundStyle(day == 0 ? .secondary : .primary)
                        .cornerRadius(10)
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(selectedPracticeDays.contains(day) ? Color.green : Color.clear, lineWidth: 2)
                        )
                    }
                    .disabled(day == 0)
                }
            }
            .padding(.horizontal)
        }
    }

    private var readyStep: some View {
        VStack(spacing: 24) {
            Image(systemName: "star.fill")
                .font(.system(size: 60))
                .foregroundStyle(.yellow)

            Text("All set, \(childName)!")
                .font(.title.bold())

            VStack(alignment: .leading, spacing: 12) {
                Label("Personalized weekly training plan", systemImage: "checkmark.circle.fill")
                Label("Guided sessions with audio coaching", systemImage: "checkmark.circle.fill")
                Label("Track progress and earn badges", systemImage: "checkmark.circle.fill")
                Label("Weather-smart indoor alternatives", systemImage: "checkmark.circle.fill")
            }
            .foregroundStyle(.green)
            .font(.body)
        }
    }

    private func createProfile() {
        Task {
            await authViewModel.createChildProfile(
                name: childName,
                age: childAge,
                teamName: teamName,
                practiceDays: Array(selectedPracticeDays).sorted()
            )
            appState.showOnboarding = false
        }
    }
}
