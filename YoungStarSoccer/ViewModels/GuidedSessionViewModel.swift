import Foundation
import Combine

@MainActor
class GuidedSessionViewModel: ObservableObject {
    @Published var currentDrillIndex = 0
    @Published var timeRemaining = 0
    @Published var isResting = false
    @Published var isRunning = false
    @Published var isComplete = false
    @Published var isPaused = false
    @Published var drillResults: [DrillResult] = []

    var drills: [Drill] = []
    var plannedDrills: [PlannedDrill] = []
    private var timer: Timer?
    private let audioService = AudioService.shared

    var currentDrill: Drill? {
        guard currentDrillIndex < drills.count else { return nil }
        return drills[currentDrillIndex]
    }

    var progress: Double {
        guard !drills.isEmpty else { return 0 }
        return Double(currentDrillIndex) / Double(drills.count)
    }

    var totalDrills: Int { drills.count }

    func setup(drills: [Drill], plannedDrills: [PlannedDrill]) {
        self.drills = drills
        self.plannedDrills = plannedDrills
        self.drillResults = drills.map { drill in
            DrillResult(id: UUID().uuidString, drillId: drill.id ?? "", drillName: drill.name, completed: false)
        }
        currentDrillIndex = 0
        isComplete = false
        isRunning = false
    }

    func start() {
        guard let drill = currentDrill else { return }
        isRunning = true
        isPaused = false
        isResting = false
        timeRemaining = plannedDrills[safe: currentDrillIndex]?.customDurationSeconds ?? drill.durationSeconds
        audioService.announceNextDrill(drill.name)

        DispatchQueue.main.asyncAfter(deadline: .now() + 2) { [weak self] in
            self?.audioService.announceStart()
            self?.startTimer()
        }
    }

    func pause() {
        isPaused = true
        stopTimer()
    }

    func resume() {
        isPaused = false
        startTimer()
    }

    func skipDrill() {
        stopTimer()
        drillResults[currentDrillIndex].completed = false
        advanceToNext()
    }

    func completeDrill(measuredValue: Double? = nil) {
        stopTimer()
        drillResults[currentDrillIndex].completed = true
        drillResults[currentDrillIndex].measuredValue = measuredValue
        audioService.playSuccess()
        advanceToNext()
    }

    private func advanceToNext() {
        if currentDrillIndex + 1 < drills.count {
            // Rest period
            isResting = true
            timeRemaining = Constants.Training.restBetweenDrillsSeconds
            audioService.announceRest(seconds: Constants.Training.restBetweenDrillsSeconds)
            startTimer()
        } else {
            finishSession()
        }
    }

    private func startTimer() {
        stopTimer()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            Task { @MainActor in
                self?.tick()
            }
        }
    }

    private func stopTimer() {
        timer?.invalidate()
        timer = nil
    }

    private func tick() {
        guard timeRemaining > 0 else { return }
        timeRemaining -= 1

        // Audio cues at key moments
        if timeRemaining == 3 {
            audioService.playBeep()
        }

        if timeRemaining == 0 {
            stopTimer()
            if isResting {
                // Rest over, move to next drill
                isResting = false
                currentDrillIndex += 1
                if let drill = currentDrill {
                    timeRemaining = plannedDrills[safe: currentDrillIndex]?.customDurationSeconds ?? drill.durationSeconds
                    audioService.announceNextDrill(drill.name)
                    DispatchQueue.main.asyncAfter(deadline: .now() + 2) { [weak self] in
                        self?.audioService.announceStart()
                        self?.startTimer()
                    }
                }
            } else {
                // Drill time's up — auto-complete
                audioService.playBeep()
                drillResults[currentDrillIndex].completed = true
                advanceToNext()
            }
        }
    }

    private func finishSession() {
        isComplete = true
        isRunning = false
        audioService.announceComplete()
    }

    func cleanup() {
        stopTimer()
        audioService.stopSpeaking()
    }
}

// Safe array subscript
extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
