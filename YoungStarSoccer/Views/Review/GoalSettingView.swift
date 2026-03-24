import SwiftUI

struct GoalSettingView: View {
    @Binding var goals: [String]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("🎯 Goals for Next Week")
                .font(.headline)
            Text("Set 1–3 goals to focus on")
                .font(.caption)
                .foregroundStyle(.secondary)

            ForEach(0..<3, id: \.self) { index in
                HStack {
                    Text("\(index + 1).")
                        .font(.subheadline.bold())
                        .foregroundStyle(.green)
                        .frame(width: 24)
                    TextField("Goal \(index + 1)", text: $goals[index])
                        .textFieldStyle(.roundedBorder)
                }
            }
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(12)
    }
}
