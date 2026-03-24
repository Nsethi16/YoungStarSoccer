import SwiftUI

struct DrillDetailView: View {
    let drill: Drill

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text(drill.category.rawValue)
                            .font(.caption.bold())
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(.green.opacity(0.2))
                            .cornerRadius(8)

                        Text(drill.difficulty.rawValue)
                            .font(.caption.bold())
                            .padding(.horizontal, 10)
                            .padding(.vertical, 4)
                            .background(.blue.opacity(0.2))
                            .cornerRadius(8)

                        if drill.isIndoor {
                            Text("🏠 Indoor")
                                .font(.caption.bold())
                                .padding(.horizontal, 10)
                                .padding(.vertical, 4)
                                .background(.orange.opacity(0.2))
                                .cornerRadius(8)
                        }
                    }

                    HStack(spacing: 20) {
                        Label(drill.durationSeconds.durationString, systemImage: "clock")
                        if let reps = drill.reps {
                            Label("\(reps) reps", systemImage: "repeat")
                        }
                        if let target = drill.timeTarget {
                            Label(target, systemImage: "target")
                        }
                    }
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                }

                // Equipment
                if !drill.equipment.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Equipment Needed")
                            .font(.headline)
                        ForEach(drill.equipment, id: \.self) { item in
                            Label(item, systemImage: "checkmark.circle")
                                .font(.subheadline)
                        }
                    }
                }

                Divider()

                // Instructions
                VStack(alignment: .leading, spacing: 12) {
                    Text("Step-by-Step Instructions")
                        .font(.headline)

                    ForEach(Array(drill.instructions.enumerated()), id: \.offset) { index, step in
                        HStack(alignment: .top, spacing: 12) {
                            ZStack {
                                Circle()
                                    .fill(.green)
                                    .frame(width: 28, height: 28)
                                Text("\(index + 1)")
                                    .font(.caption.bold())
                                    .foregroundStyle(.white)
                            }
                            Text(step)
                                .font(.body)
                        }
                    }
                }

                Divider()

                // Coaching Tips
                VStack(alignment: .leading, spacing: 12) {
                    Text("💡 Coaching Tips")
                        .font(.headline)

                    ForEach(drill.coachingTips, id: \.self) { tip in
                        HStack(alignment: .top, spacing: 8) {
                            Image(systemName: "lightbulb.fill")
                                .foregroundStyle(.yellow)
                                .font(.caption)
                            Text(tip)
                                .font(.subheadline)
                        }
                    }
                }

                if let measurable = drill.measurableType {
                    Divider()
                    HStack {
                        Image(systemName: "chart.line.uptrend.xyaxis")
                            .foregroundStyle(.blue)
                        Text("Tracks: \(measurable.rawValue)")
                            .font(.subheadline.bold())
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.blue.opacity(0.1))
                    .cornerRadius(10)
                }
            }
            .padding()
        }
        .navigationTitle(drill.name)
    }
}
