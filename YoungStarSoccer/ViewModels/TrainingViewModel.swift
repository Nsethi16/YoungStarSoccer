import Foundation

@MainActor
class TrainingViewModel: ObservableObject {
    @Published var currentPlan: TrainingPlan?
    @Published var todaySession: TrainingDay?
    @Published var drills: [Drill] = []
    @Published var isLoading = false
    @Published var useIndoorPlan = false

    private let firestoreService = FirestoreService.shared

    func loadTrainingPlan(childProfileId: String) async {
        isLoading = true
        defer { isLoading = false }

        do {
            drills = try await firestoreService.getDrills()
            if drills.isEmpty {
                try await firestoreService.seedDrillsIfNeeded()
                drills = try await firestoreService.getDrills()
            }

            if let plan = try await firestoreService.getCurrentTrainingPlan(childProfileId: childProfileId) {
                currentPlan = plan
            } else {
                // Generate a new plan for this week
                let plan = generateWeeklyPlan(childProfileId: childProfileId, practiceDays: [2, 4]) // default Tue/Thu
                let planId = try await firestoreService.saveTrainingPlan(plan)
                var saved = plan
                saved.id = planId
                currentPlan = saved
            }

            updateTodaySession()
        } catch {
            print("Error loading training plan: \(error)")
        }
    }

    func generateWeeklyPlan(childProfileId: String, practiceDays: [Int]) -> TrainingPlan {
        let weekStart = Date().startOfWeek
        var days: [TrainingDay] = []

        let outdoorDrills = drills.filter { !$0.isIndoor }
        let allDrillIds = drills.compactMap { $0.id }

        for dayOfWeek in 0..<7 {
            let type: TrainingDay.DayType
            let drillCount: Int

            if dayOfWeek == Constants.Training.restDayOfWeek {
                type = .restDay
                drillCount = 0
            } else if practiceDays.contains(dayOfWeek) {
                type = .teamPractice
                drillCount = Constants.Training.drillsPerPracticeDay
            } else {
                type = .offDay
                drillCount = Constants.Training.drillsPerOffDay
            }

            var plannedDrills: [PlannedDrill] = []
            if drillCount > 0 {
                // Pick a balanced mix of categories
                let categories: [Drill.DrillCategory] = [.speed, .shooting, .dribbling, .ballMastery, .passing]
                for i in 0..<drillCount {
                    let category = categories[i % categories.count]
                    let categoryDrills = drills.filter { $0.category == category && !$0.isIndoor }
                    let drill = categoryDrills.randomElement() ?? drills.randomElement()!
                    plannedDrills.append(PlannedDrill(drillId: drill.id ?? UUID().uuidString, order: i))
                }
            }

            days.append(TrainingDay(dayOfWeek: dayOfWeek, type: type,
                                    drills: plannedDrills, isCompleted: false))
        }

        return TrainingPlan(childProfileId: childProfileId, weekStartDate: weekStart, days: days)
    }

    func updateTodaySession() {
        let today = Date().dayOfWeek
        todaySession = currentPlan?.days.first(where: { $0.dayOfWeek == today })
    }

    func switchToIndoorPlan() {
        guard var plan = currentPlan, let todayIdx = plan.days.firstIndex(where: { $0.dayOfWeek == Date().dayOfWeek }) else { return }
        useIndoorPlan = true

        let indoorDrills = drills.filter { $0.isIndoor }
        let drillCount = plan.days[todayIdx].drills.count
        var newDrills: [PlannedDrill] = []

        for i in 0..<drillCount {
            let drill = indoorDrills[i % indoorDrills.count]
            newDrills.append(PlannedDrill(drillId: drill.id ?? UUID().uuidString, order: i))
        }

        plan.days[todayIdx].type = .indoor
        plan.days[todayIdx].drills = newDrills
        currentPlan = plan
        updateTodaySession()
    }

    func markDrillComplete(dayIndex: Int, drillIndex: Int) {
        guard var plan = currentPlan else { return }
        plan.days[dayIndex].drills[drillIndex].isCompleted = true
        plan.days[dayIndex].drills[drillIndex].completedAt = Date()

        let allDone = plan.days[dayIndex].drills.allSatisfy(\.isCompleted)
        if allDone {
            plan.days[dayIndex].isCompleted = true
            plan.days[dayIndex].completedAt = Date()
        }

        currentPlan = plan
        updateTodaySession()

        Task {
            _ = try? await firestoreService.saveTrainingPlan(plan)
        }
    }

    func swapDrill(dayIndex: Int, drillIndex: Int, newDrillId: String) {
        guard var plan = currentPlan else { return }
        plan.days[dayIndex].drills[drillIndex].drillId = newDrillId
        currentPlan = plan

        Task {
            _ = try? await firestoreService.saveTrainingPlan(plan)
        }
    }

    func reorderDrills(dayIndex: Int, from: IndexSet, to: Int) {
        guard var plan = currentPlan else { return }
        plan.days[dayIndex].drills.move(fromOffsets: from, toOffset: to)
        for i in plan.days[dayIndex].drills.indices {
            plan.days[dayIndex].drills[i].order = i
        }
        currentPlan = plan

        Task {
            _ = try? await firestoreService.saveTrainingPlan(plan)
        }
    }

    func drill(for id: String) -> Drill? {
        drills.first(where: { $0.id == id })
    }
}
