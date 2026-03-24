import SwiftUI

struct BodyMapView: View {
    @Binding var sorenessAreas: [SorenessArea]

    let bodyParts: [(part: SorenessArea.BodyPart, x: CGFloat, y: CGFloat)] = [
        (.leftAnkle, 0.38, 0.92),
        (.rightAnkle, 0.62, 0.92),
        (.leftShin, 0.38, 0.78),
        (.rightShin, 0.62, 0.78),
        (.leftKnee, 0.38, 0.65),
        (.rightKnee, 0.62, 0.65),
        (.leftThigh, 0.38, 0.52),
        (.rightThigh, 0.62, 0.52),
        (.leftHip, 0.35, 0.40),
        (.rightHip, 0.65, 0.40),
        (.lowerBack, 0.50, 0.35),
        (.upperBack, 0.50, 0.22),
    ]

    var body: some View {
        ZStack {
            // Simple body outline
            Image(systemName: "figure.stand")
                .font(.system(size: 150))
                .foregroundStyle(.gray.opacity(0.2))

            // Soreness indicators
            ForEach(bodyParts, id: \.part) { item in
                let isSore = sorenessAreas.contains(where: { $0.bodyPart == item.part })
                let severity = sorenessAreas.first(where: { $0.bodyPart == item.part })?.severity ?? 0

                Circle()
                    .fill(isSore ? severityColor(severity) : Color.gray.opacity(0.15))
                    .frame(width: 30, height: 30)
                    .overlay {
                        if isSore {
                            Text("\(severity)")
                                .font(.caption2.bold())
                                .foregroundStyle(.white)
                        }
                    }
                    .position(x: item.x * 200, y: item.y * 200)
                    .onTapGesture {
                        toggleSoreness(item.part)
                    }
            }
        }
        .frame(width: 200, height: 200)
        .frame(maxWidth: .infinity)

        // Legend
        HStack(spacing: 16) {
            ForEach(1...3, id: \.self) { level in
                HStack(spacing: 4) {
                    Circle()
                        .fill(severityColor(level))
                        .frame(width: 12, height: 12)
                    Text(level == 1 ? "Mild" : level == 2 ? "Moderate" : "Severe")
                        .font(.caption2)
                }
            }
        }

        // Selected areas
        if !sorenessAreas.isEmpty {
            VStack(alignment: .leading, spacing: 4) {
                ForEach(sorenessAreas) { area in
                    HStack {
                        Text(area.bodyPart.rawValue)
                            .font(.caption)
                        Spacer()
                        Text(area.severity == 1 ? "Mild" : area.severity == 2 ? "Moderate" : "Severe")
                            .font(.caption)
                            .foregroundStyle(severityColor(area.severity))
                    }
                }
            }
        }
    }

    private func toggleSoreness(_ part: SorenessArea.BodyPart) {
        if let index = sorenessAreas.firstIndex(where: { $0.bodyPart == part }) {
            let current = sorenessAreas[index].severity
            if current < 3 {
                sorenessAreas[index].severity = current + 1
            } else {
                sorenessAreas.remove(at: index)
            }
        } else {
            sorenessAreas.append(SorenessArea(bodyPart: part, severity: 1))
        }
    }

    private func severityColor(_ severity: Int) -> Color {
        switch severity {
        case 1: return .yellow
        case 2: return .orange
        case 3: return .red
        default: return .gray
        }
    }
}
