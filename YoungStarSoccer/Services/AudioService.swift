import AVFoundation

class AudioService {
    static let shared = AudioService()
    private var synthesizer = AVSpeechSynthesizer()
    private var audioPlayer: AVAudioPlayer?
    private init() {}

    func speak(_ text: String) {
        let utterance = AVSpeechUtterance(string: text)
        utterance.rate = 0.45
        utterance.pitchMultiplier = 1.1
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        synthesizer.speak(utterance)
    }

    func playBeep() {
        AudioServicesPlaySystemSound(1052) // tri-tone
    }

    func playSuccess() {
        AudioServicesPlaySystemSound(1025) // positive
    }

    func playCelebration() {
        AudioServicesPlaySystemSound(1335) // fanfare-like
    }

    func stopSpeaking() {
        synthesizer.stopSpeaking(at: .immediate)
    }

    func announceNextDrill(_ name: String) {
        speak("Next drill: \(name). Get ready!")
    }

    func announceRest(seconds: Int) {
        speak("Rest for \(seconds) seconds.")
    }

    func announceStart() {
        speak("Go!")
        playBeep()
    }

    func announceComplete() {
        speak("Great job! Session complete!")
        playSuccess()
    }

    func announcePersonalRecord() {
        speak("New personal record! Amazing!")
        playCelebration()
    }
}
