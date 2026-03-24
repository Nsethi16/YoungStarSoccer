import Foundation

struct WeatherData: Codable {
    var temperature: Double    // Fahrenheit
    var condition: WeatherCondition
    var description: String
    var isSafeForOutdoor: Bool

    enum WeatherCondition: String, Codable {
        case clear, clouds, rain, snow, thunderstorm, extreme, other

        var icon: String {
            switch self {
            case .clear: return "sun.max.fill"
            case .clouds: return "cloud.fill"
            case .rain: return "cloud.rain.fill"
            case .snow: return "cloud.snow.fill"
            case .thunderstorm: return "cloud.bolt.fill"
            case .extreme: return "exclamationmark.triangle.fill"
            case .other: return "cloud.fill"
            }
        }
    }
}

class WeatherService {
    static let shared = WeatherService()
    // Replace with your OpenWeatherMap API key
    private let apiKey = "YOUR_OPENWEATHERMAP_API_KEY"
    private init() {}

    func fetchWeather(latitude: Double, longitude: Double) async throws -> WeatherData {
        let url = URL(string: "https://api.openweathermap.org/data/2.5/weather?lat=\(latitude)&lon=\(longitude)&appid=\(apiKey)&units=imperial")!
        let (data, _) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(OpenWeatherResponse.self, from: data)
        return mapToWeatherData(response)
    }

    /// Fallback: returns safe outdoor weather if API key not configured
    func fetchWeatherSafe(latitude: Double, longitude: Double) async -> WeatherData {
        guard apiKey != "YOUR_OPENWEATHERMAP_API_KEY" else {
            return WeatherData(temperature: 72, condition: .clear,
                             description: "Weather check unavailable — configure API key",
                             isSafeForOutdoor: true)
        }
        do {
            return try await fetchWeather(latitude: latitude, longitude: longitude)
        } catch {
            return WeatherData(temperature: 72, condition: .clear,
                             description: "Unable to fetch weather",
                             isSafeForOutdoor: true)
        }
    }

    private func mapToWeatherData(_ response: OpenWeatherResponse) -> WeatherData {
        let main = response.weather.first?.main.lowercased() ?? "clear"
        let temp = response.main.temp

        let condition: WeatherData.WeatherCondition
        switch main {
        case "clear": condition = .clear
        case "clouds": condition = .clouds
        case "rain", "drizzle": condition = .rain
        case "snow": condition = .snow
        case "thunderstorm": condition = .thunderstorm
        default: condition = .other
        }

        let isSafe = condition != .thunderstorm
            && condition != .snow
            && temp > 32 && temp < 95
            && condition != .rain

        return WeatherData(
            temperature: temp,
            condition: condition,
            description: response.weather.first?.description.capitalized ?? "Unknown",
            isSafeForOutdoor: isSafe
        )
    }
}

// OpenWeatherMap API response models
struct OpenWeatherResponse: Codable {
    let weather: [WeatherItem]
    let main: MainWeather

    struct WeatherItem: Codable {
        let main: String
        let description: String
    }

    struct MainWeather: Codable {
        let temp: Double
        let humidity: Int
    }
}
