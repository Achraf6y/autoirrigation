#include "DHT.h"
#include <Wire.h>
#include "DFRobot_VEML7700.h"

#include <Arduino.h>
#if defined(ESP32)
#include <WiFi.h>
#include "time.h"
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#endif
#include <Firebase_ESP_Client.h>

//Provide the token generation process info.
#include "addons/TokenHelper.h"
//Provide the RTDB payload printing info and other helper functions.
#include "addons/RTDBHelper.h"

// Insert your network credentials
#define WIFI_SSID "WIFI_SSID"
#define WIFI_PASSWORD "WIFI_PASSWORD"

// Insert Firebase project API Key
#define API_KEY "APIKEY"

// Insert RTDB URLefine the RTDB URL */
#define DATABASE_URL "DATABASE_URL"

//Define Firebase Data object
FirebaseData fbdo;

FirebaseAuth auth;
FirebaseConfig config;

unsigned long sendDataPrevMillis = 0;
int count = 0;
bool signupOK = false;

#define DHTTYPE DHT11

DFRobot_VEML7700 als;

const int DHT11_pin = 32;

DHT dht(DHT11_pin, DHTTYPE);

const int humidite_sol_pin = 34;

int humidite_sol_Val = 0;

const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 3600;  // adjust to our timezone currently (GMT+1)
const int daylightOffset_sec = 3600;
const int pump_pin = 27; // GPIO pin for the pump relay

void setup() {
  dht.begin();
  Serial.begin(9600);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  // Initialize NTP
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  Serial.println("NTP initialized");

  // Wait for time to be set
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time from NTP. Retrying...");
    delay(2000);
  } else {
    Serial.println("Time synchronized successfully.");
  }

  /* Assign the api key (required) */
  config.api_key = API_KEY;

  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;

  /* Sign up */
  if (Firebase.signUp(&config, &auth, "", "")) {
    Serial.println("ok");
    signupOK = true;
  } else {
    Serial.printf("%s\n", config.signer.signupError.message.c_str());
  }

  config.token_status_callback = tokenStatusCallback;

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}


String getFormattedTimestamp() {
  struct tm timeinfo;
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time. Using default timestamp.");
    return "00:00:00-01/01/70";  // Default timestamp in case of failure
  }
  char timestamp[20];
  strftime(timestamp, sizeof(timestamp), "%H:%M:%S-%d/%m/%y", &timeinfo);
  return String(timestamp);
}

void loop() {
  // Retrieve timestamp
  String timestamp = getFormattedTimestamp();

  // Stabilize and validate light sensor readings
  float lux;
  int retryCount = 3; // Maximum number of retries for the light sensor
  while (retryCount > 0) {
    als.getALSLux(lux);
    if (lux > 0) break; // Accept the reading if it's non-zero
    delay(500);         // Allow the sensor to stabilize
    retryCount--;
  }
  float lux_percentage = map(lux, 0, 800, 0, 100);  // Convert lux to percentage
  lux_percentage = constrain(lux_percentage, 0, 100);

  Serial.println("Timestamp = " + timestamp);
  Serial.print("Luminosity = ");
  Serial.print(lux_percentage);
  Serial.println(" %");

  // Read soil moisture and determine needsWatering
  humidite_sol_Val = analogRead(humidite_sol_pin);
  int humidite_sol_percentage = map(humidite_sol_Val, 0, 3000, 0, 100);  // Convert soil moisture to percentage
  humidite_sol_percentage = constrain(humidite_sol_percentage, 0, 100);

  Serial.print("Soil Moisture = ");
  Serial.print(humidite_sol_percentage);
  Serial.println(" %");

  // Determine if watering is needed
  int needsWatering =  0;

  // Control the water pump based on soil moisture percentage
  if (humidite_sol_percentage < 30) {
    digitalWrite(pump_pin, HIGH); // Turn the pump on
    needsWatering =  1;
  } else if (humidite_sol_percentage > 58) {
    digitalWrite(pump_pin, LOW); // Turn the pump off
    needsWatering =  0;
  }

  // Display needsWatering status
  Serial.print("Needs Watering = ");
  Serial.println(needsWatering);

  // Read temperature and humidity
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();

  Serial.println("Temperature = " + String(temperature) + " °C");
  Serial.println("Humidity = " + String(humidity) + " %");
  Serial.println("****************");

  // Send data to Firebase every 4 seconds
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 4000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    // Create the JSON object
    FirebaseJson json;
    json.set("Luminosity", lux_percentage);
    json.set("Soil Moisture", humidite_sol_percentage);
    json.set("Temperature", temperature);
    json.set("Humidity", humidity);
    json.set("NeedsWatering", needsWatering);
    json.set("Timestamp", timestamp);

    // Push data to Firebase
    if (Firebase.RTDB.pushJSON(&fbdo, "/SensorData", &json)) {
      Serial.println("Data sent successfully");
    } else {
      Serial.println("Error sending data: " + fbdo.errorReason());
    }
  }

  delay(2000);
}

