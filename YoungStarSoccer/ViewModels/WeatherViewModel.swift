import Foundation
import CoreLocation

@MainActor
class WeatherViewModel: ObservableObject {
    @Published var currentWeather: WeatherData?
    @Published var isLoading = false
    @Published var shouldSwitchToIndoor = false

    private let weatherService = WeatherService.shared
    private let locationManager = CLLocationManager()

    func checkWeather() async {
        isLoading = true
        defer { isLoading = false }

        // Default to a generic location if location services unavailable
        let lat = locationManager.location?.coordinate.latitude ?? 40.7128
        let lon = locationManager.location?.coordinate.longitude ?? -74.0060

        let weather = await weatherService.fetchWeatherSafe(latitude: lat, longitude: lon)
        currentWeather = weather
        shouldSwitchToIndoor = !weather.isSafeForOutdoor
    }
}
