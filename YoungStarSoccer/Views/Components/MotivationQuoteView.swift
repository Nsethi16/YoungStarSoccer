import SwiftUI

struct MotivationQuoteView: View {
    let streak: Int
    @State private var quote: String = ""

    var body: some View {
        if !quote.isEmpty {
            VStack(spacing: 8) {
                Text(quote)
                    .font(.subheadline.italic())
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
            }
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.green.opacity(0.05))
            .cornerRadius(12)
        }
    }

    init(streak: Int) {
        self.streak = streak

        let context: MotivationQuotes.QuoteContext
        let dayOfWeek = Calendar.current.component(.weekday, from: Date()) - 1
        if dayOfWeek == 0 {
            context = .restDay
        } else if streak == 0 {
            context = .missedDays
        } else {
            context = .general
        }
        _quote = State(initialValue: MotivationQuotes.quote(context: context))
    }
}
