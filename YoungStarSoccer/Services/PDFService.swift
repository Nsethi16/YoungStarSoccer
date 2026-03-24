import UIKit
import PDFKit

class PDFService {
    static let shared = PDFService()
    private init() {}

    func generateWeeklyReviewPDF(
        review: WeeklyReview,
        childName: String,
        progressRecords: [ProgressRecord],
        wellnessLogs: [WellnessLog]
    ) -> Data {
        let pageWidth: CGFloat = 612
        let pageHeight: CGFloat = 792
        let margin: CGFloat = 40

        let renderer = UIGraphicsPDFRenderer(bounds: CGRect(x: 0, y: 0, width: pageWidth, height: pageHeight))

        return renderer.pdfData { context in
            context.beginPage()
            var yPos: CGFloat = margin

            // Title
            let titleAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 24),
                .foregroundColor: UIColor.systemGreen
            ]
            let title = "⚽ Weekly Training Report"
            title.draw(at: CGPoint(x: margin, y: yPos), withAttributes: titleAttrs)
            yPos += 40

            // Player info
            let infoAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 14),
                .foregroundColor: UIColor.darkGray
            ]
            let dateFormatter = DateFormatter()
            dateFormatter.dateStyle = .medium
            let weekOf = dateFormatter.string(from: review.weekStartDate)
            "\(childName) — Week of \(weekOf)".draw(at: CGPoint(x: margin, y: yPos), withAttributes: infoAttrs)
            yPos += 30

            // Divider
            drawLine(context: context.cgContext, y: yPos, pageWidth: pageWidth, margin: margin)
            yPos += 15

            // Summary section
            let headerAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.boldSystemFont(ofSize: 16),
                .foregroundColor: UIColor.black
            ]
            let bodyAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.systemFont(ofSize: 12),
                .foregroundColor: UIColor.darkGray
            ]

            "Training Summary".draw(at: CGPoint(x: margin, y: yPos), withAttributes: headerAttrs)
            yPos += 25

            let summaryLines = [
                "Sessions Completed: \(review.sessionsCompleted) / \(review.totalSessions)",
                "Total Drills Completed: \(review.totalDrillsCompleted)",
                "Total Training Time: \(review.totalMinutesTrained) minutes",
                "Personal Records Set: \(review.personalRecordsSet)"
            ]

            for line in summaryLines {
                line.draw(at: CGPoint(x: margin + 10, y: yPos), withAttributes: bodyAttrs)
                yPos += 20
            }
            yPos += 10

            // Biggest improvement
            if let improvement = review.biggestImprovement {
                "🏆 Biggest Improvement".draw(at: CGPoint(x: margin, y: yPos), withAttributes: headerAttrs)
                yPos += 25
                improvement.draw(at: CGPoint(x: margin + 10, y: yPos), withAttributes: bodyAttrs)
                yPos += 30
            }

            // Wellness summary
            if !wellnessLogs.isEmpty {
                drawLine(context: context.cgContext, y: yPos, pageWidth: pageWidth, margin: margin)
                yPos += 15
                "Wellness Overview".draw(at: CGPoint(x: margin, y: yPos), withAttributes: headerAttrs)
                yPos += 25

                let avgSleep = wellnessLogs.map(\.sleepHours).reduce(0, +) / Double(wellnessLogs.count)
                let avgWater = wellnessLogs.map(\.waterGlasses).reduce(0, +) / wellnessLogs.count
                let avgEnergy = wellnessLogs.map(\.energyLevel).reduce(0, +) / wellnessLogs.count

                let wellnessLines = [
                    "Average Sleep: \(String(format: "%.1f", avgSleep)) hours",
                    "Average Water: \(avgWater) glasses/day",
                    "Average Energy: \(avgEnergy)/5"
                ]

                for line in wellnessLines {
                    line.draw(at: CGPoint(x: margin + 10, y: yPos), withAttributes: bodyAttrs)
                    yPos += 20
                }
                yPos += 10
            }

            // Goals
            if !review.goalsForNextWeek.isEmpty {
                drawLine(context: context.cgContext, y: yPos, pageWidth: pageWidth, margin: margin)
                yPos += 15
                "🎯 Goals for Next Week".draw(at: CGPoint(x: margin, y: yPos), withAttributes: headerAttrs)
                yPos += 25

                for (i, goal) in review.goalsForNextWeek.enumerated() {
                    "\(i + 1). \(goal)".draw(at: CGPoint(x: margin + 10, y: yPos), withAttributes: bodyAttrs)
                    yPos += 20
                }
                yPos += 10
            }

            // Reflection
            if let reflection = review.reflectionHard, !reflection.isEmpty {
                drawLine(context: context.cgContext, y: yPos, pageWidth: pageWidth, margin: margin)
                yPos += 15
                "💭 Reflection".draw(at: CGPoint(x: margin, y: yPos), withAttributes: headerAttrs)
                yPos += 25
                let rect = CGRect(x: margin + 10, y: yPos, width: pageWidth - 2 * margin - 10, height: 60)
                reflection.draw(in: rect, withAttributes: bodyAttrs)
                yPos += 70
            }

            // Footer
            drawLine(context: context.cgContext, y: pageHeight - 60, pageWidth: pageWidth, margin: margin)
            let footerAttrs: [NSAttributedString.Key: Any] = [
                .font: UIFont.italicSystemFont(ofSize: 10),
                .foregroundColor: UIColor.gray
            ]
            "Generated by Young Star Soccer".draw(
                at: CGPoint(x: margin, y: pageHeight - 45),
                withAttributes: footerAttrs
            )
        }
    }

    private func drawLine(context: CGContext, y: CGFloat, pageWidth: CGFloat, margin: CGFloat) {
        context.setStrokeColor(UIColor.lightGray.cgColor)
        context.setLineWidth(0.5)
        context.move(to: CGPoint(x: margin, y: y))
        context.addLine(to: CGPoint(x: pageWidth - margin, y: y))
        context.strokePath()
    }
}
