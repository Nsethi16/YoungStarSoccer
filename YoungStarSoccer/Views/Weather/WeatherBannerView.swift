import SwiftUI

struct WeatherBannerView: View {
    @ObservedObject var weatherVM: WeatherViewModel
    @ObservedObject var trainingVM: TrainingViewModel

    var body: some View {
        if let weather = weatherVM.currentWeather {
            HStack(spacing: 12) {
                Image(systemName: weather.condition.icon)
                    .font(.title)
                    .foregroundStyle(weather.isSafeForOutdoor ? .yellow : .red)

                VStack(alignment: .leading, spacing: 2) {
                    Text("\(Int(weather.temperature))°F — \(weather.description)")
                        .font(.subheadline.bold())

                    if !weather.isSafeForOutdoor {
                        Text("Outdoor conditions aren't great — indoor plan ready!")
                            .font(.caption)
                            .foregroundStyle(.red)
                    } else {
                        Text("Great conditions for training!")
                            .font(.caption)
                            .foregroundStyle(.green)
                    }
                }

                Spacer()

                if !weather.isSafeForOutdoor && !trainingVM.useIndoorPlan {
                    Button("Switch") {
                        trainingVM.switchToIndoorPlan()
                    }
                    .font(.caption.bold())
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(.orange)
                    .foregroundStyle(.white)
                    .cornerRadius(8)
                }
            }
            .padding()
            .background(
                (weather.isSafeForOutdoor ? Color.green : Color.orange).opacity(0.1)
            )
            .cornerRadius(12)
        } else if weatherVM.isLoading {
            HStack {
                ProgressView()
                Text("Checking weather...")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding()
        }
    }
}
