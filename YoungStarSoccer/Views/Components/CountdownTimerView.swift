import SwiftUI

struct CountdownTimerView: View {
    let timeRemaining: Int
    let isActive: Bool

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.gray.opacity(0.2), lineWidth: 8)
                .frame(width: 120, height: 120)

            Circle()
                .trim(from: 0, to: isActive ? 1 : 0)
                .stroke(timerColor, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                .frame(width: 120, height: 120)
                .rotationEffect(.degrees(-90))
                .animation(.linear(duration: 1), value: timeRemaining)

            VStack(spacing: 4) {
                Text(timeRemaining.timerString)
                    .font(.system(size: 36, weight: .bold, design: .monospaced))
                    .foregroundStyle(timerColor)

                if timeRemaining <= 3 && timeRemaining > 0 {
                    Text("Get Ready!")
                        .font(.caption)
                        .foregroundStyle(.orange)
                }
            }
        }
    }

    private var timerColor: Color {
        if timeRemaining <= 3 { return .red }
        if timeRemaining <= 10 { return .orange }
        return .green
    }
}
