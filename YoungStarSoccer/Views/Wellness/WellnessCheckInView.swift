import SwiftUI

struct WellnessCheckInView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var wellnessVM = WellnessViewModel()
    @State private var sleepHours: Double = 8
    @State private var waterGlasses: Int = 4
    @State private var energyLevel: Int = 3
    @State private var sorenessAreas: [SorenessArea] = []
    @State private var saved = false

    let energyEmojis = ["😴", "😕", "😐", "😊", "🔥"]

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Sleep
                VStack(alignment: .leading, spacing: 8) {
                    Text("😴 Sleep Last Night")
                        .font(.headline)
                    HStack {
                        Text("\(sleepHours.oneDecimal) hours")
                            .font(.title2.bold())
                            .foregroundStyle(sleepHours >= 8 ? .green : .orange)
                        Spacer()
                    }
                    Slider(value: $sleepHours, in: 4...12, step: 0.5)
                        .tint(.blue)
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(12)

                // Water
                VStack(alignment: .leading, spacing: 8) {
                    Text("💧 Water Today")
                        .font(.headline)
                    HStack {
                        Text("\(waterGlasses) glasses")
                            .font(.title2.bold())
                            .foregroundStyle(waterGlasses >= 6 ? .green : .orange)
                        Spacer()
                    }
                    HStack(spacing: 8) {
                        ForEach(1...10, id: \.self) { glass in
                            Image(systemName: glass <= waterGlasses ? "drop.fill" : "drop")
                                .foregroundStyle(glass <= waterGlasses ? .blue : .gray.opacity(0.3))
                                .onTapGesture { waterGlasses = glass }
                        }
                    }
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(12)

                // Energy
                VStack(alignment: .leading, spacing: 8) {
                    Text("⚡ Energy Level")
                        .font(.headline)
                    HStack(spacing: 16) {
                        ForEach(1...5, id: \.self) { level in
                            Button {
                                energyLevel = level
                            } label: {
                                VStack {
                                    Text(energyEmojis[level - 1])
                                        .font(.title)
                                    Text("\(level)")
                                        .font(.caption)
                                }
                                .padding(8)
                                .background(energyLevel == level ? Color.green.opacity(0.2) : Color.clear)
                                .cornerRadius(10)
                            }
                        }
                    }
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(12)

                // Body Map (Soreness)
                VStack(alignment: .leading, spacing: 8) {
                    Text("🦵 Any Soreness?")
                        .font(.headline)
                    Text("Tap areas that feel sore")
                        .font(.caption)
                        .foregroundStyle(.secondary)

                    BodyMapView(sorenessAreas: $sorenessAreas)
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(12)

                // Save
                Button {
                    saveCheckIn()
                } label: {
                    HStack {
                        Image(systemName: saved ? "checkmark.circle.fill" : "square.and.arrow.down")
                        Text(saved ? "Saved!" : "Save Check-in")
                    }
                    .font(.headline)
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(saved ? Color.green : Color.blue)
                    .cornerRadius(12)
                }
            }
            .padding()
        }
        .navigationTitle("Wellness Check-in")
        .task {
            if let profileId = authViewModel.childProfile?.id {
                await wellnessVM.loadWellnessData(childProfileId: profileId)
                if let log = wellnessVM.todayLog {
                    sleepHours = log.sleepHours
                    waterGlasses = log.waterGlasses
                    energyLevel = log.energyLevel
                    sorenessAreas = log.sorenessAreas
                }
            }
        }
    }

    private func saveCheckIn() {
        guard let profileId = authViewModel.childProfile?.id else { return }

        if wellnessVM.todayLog == nil {
            wellnessVM.todayLog = WellnessLog(childProfileId: profileId)
        }
        wellnessVM.todayLog?.sleepHours = sleepHours
        wellnessVM.todayLog?.waterGlasses = waterGlasses
        wellnessVM.todayLog?.energyLevel = energyLevel
        wellnessVM.todayLog?.sorenessAreas = sorenessAreas

        Task {
            await wellnessVM.saveTodayLog(childProfileId: profileId)
            saved = true
        }
    }
}
