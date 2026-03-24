import SwiftUI

struct StreakFlameView: View {
    let streak: Int

    var body: some View {
        ZStack {
            if streak >= Constants.Gamification.streakFlameThreshold {
                Image(systemName: "flame.fill")
                    .font(.system(size: 40))
                    .foregroundStyle(flameGradient)
                    .symbolEffect(.bounce, value: streak)
            } else {
                Image(systemName: "flame")
                    .font(.system(size: 40))
                    .foregroundStyle(.gray.opacity(0.3))
            }

            Text("\(streak)")
                .font(.caption2.bold())
                .foregroundStyle(.white)
                .offset(y: 2)
        }
    }

    private var flameGradient: some ShapeStyle {
        if streak >= 30 {
            return AnyShapeStyle(.linearGradient(
                colors: [.purple, .red, .orange],
                startPoint: .bottom, endPoint: .top))
        } else if streak >= 7 {
            return AnyShapeStyle(.linearGradient(
                colors: [.red, .orange, .yellow],
                startPoint: .bottom, endPoint: .top))
        } else {
            return AnyShapeStyle(.linearGradient(
                colors: [.orange, .yellow],
                startPoint: .bottom, endPoint: .top))
        }
    }
}
