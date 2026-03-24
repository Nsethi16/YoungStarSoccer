import SwiftUI

struct DrillEditorView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @StateObject private var trainingVM = TrainingViewModel()
    @State private var showCreateDrill = false

    var body: some View {
        List {
            ForEach(Drill.DrillCategory.allCases, id: \.self) { category in
                Section(category.rawValue) {
                    ForEach(trainingVM.drills.filter { $0.category == category }) { drill in
                        NavigationLink {
                            DrillDetailView(drill: drill)
                        } label: {
                            VStack(alignment: .leading) {
                                Text(drill.name).font(.subheadline.bold())
                                HStack {
                                    Text(drill.difficulty.rawValue)
                                    Text("•")
                                    Text(drill.durationSeconds.durationString)
                                    if drill.isIndoor { Text("• 🏠") }
                                    if drill.isCustom { Text("• Custom") }
                                }
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
            }
        }
        .navigationTitle("Manage Drills")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showCreateDrill = true
                } label: {
                    Image(systemName: "plus")
                }
            }
        }
        .sheet(isPresented: $showCreateDrill) {
            CreateDrillView(trainingVM: trainingVM)
        }
        .task {
            if let profileId = authViewModel.childProfile?.id {
                await trainingVM.loadTrainingPlan(childProfileId: profileId)
            }
        }
    }
}

struct CreateDrillView: View {
    @ObservedObject var trainingVM: TrainingViewModel
    @Environment(\.dismiss) var dismiss
    @State private var name = ""
    @State private var category: Drill.DrillCategory = .dribbling
    @State private var difficulty: Drill.DrillDifficulty = .beginner
    @State private var durationMinutes = 2
    @State private var reps = ""
    @State private var instructions = ""
    @State private var coachingTips = ""
    @State private var isIndoor = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Drill Info") {
                    TextField("Drill Name", text: $name)
                    Picker("Category", selection: $category) {
                        ForEach(Drill.DrillCategory.allCases, id: \.self) { cat in
                            Text(cat.rawValue).tag(cat)
                        }
                    }
                    Picker("Difficulty", selection: $difficulty) {
                        ForEach(Drill.DrillDifficulty.allCases, id: \.self) { diff in
                            Text(diff.rawValue).tag(diff)
                        }
                    }
                    Stepper("Duration: \(durationMinutes) min", value: $durationMinutes, in: 1...10)
                    TextField("Reps (optional)", text: $reps)
                        .keyboardType(.numberPad)
                    Toggle("Indoor-friendly", isOn: $isIndoor)
                }

                Section("Instructions (one per line)") {
                    TextEditor(text: $instructions)
                        .frame(minHeight: 100)
                }

                Section("Coaching Tips (one per line)") {
                    TextEditor(text: $coachingTips)
                        .frame(minHeight: 80)
                }
            }
            .navigationTitle("New Custom Drill")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveDrill()
                        dismiss()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }

    private func saveDrill() {
        let drill = Drill(
            name: name,
            category: category,
            difficulty: difficulty,
            durationSeconds: durationMinutes * 60,
            reps: Int(reps),
            instructions: instructions.components(separatedBy: "\n").filter { !$0.isEmpty },
            coachingTips: coachingTips.components(separatedBy: "\n").filter { !$0.isEmpty },
            timeTarget: nil,
            equipment: [],
            isIndoor: isIndoor,
            isCustom: true,
            measurableType: nil
        )
        Task {
            _ = try? await FirestoreService.shared.saveDrill(drill)
        }
    }
}
