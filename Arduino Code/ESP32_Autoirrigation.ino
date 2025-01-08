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
#define WIFI_SSID "Gha talaba"
#define WIFI_PASSWORD "12345678"

// Insert Firebase project API Key
#define API_KEY "add your API_KEY"

// Insert RTDB URLefine the RTDB URL */
#define DATABASE_URL "add your Database_URL"

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

const int humidite_sol_pin = 34;  // connecter sur GPIO 34 (Analog ADC1_CH6)

int humidite_sol_Val = 0;

const char* ntpServer = "pool.ntp.org";
const long gmtOffset_sec = 3600;  // ajuster pour notre timezone (GMT+1)
const int daylightOffset_sec = 3600;

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

  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback;  //see addons/TokenHelper.h

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
  // Le temps de prise des mesures
  String timestamp = getFormattedTimestamp();

  float lux;
  /* le capteur de luminosité n'est pas stable au debut et retourne une valeur de 0 se qui pourra causer des problems
    lors de l'affichage de la courbe de developement en fonction du temps, pour resoudre ce problem, on ne commence 
    à stocker les valeurs que lorsqu'elles sont supperieurent à zero.
  */
  int retryCount = 3;  // max des essaies
  while (retryCount > 0) {
    als.getALSLux(lux);
    if (lux > 0) break;  // accepter si la valeur est plus que 0
    delay(500);          // sinon laisser le capteur se stabiliser
    retryCount--;
  }
  float lux_percentage = map(lux, 0, 800, 0, 100);  // mettre la valeur en pourcentage
  if (lux_percentage > 100) lux_percentage = 100;   // maxer a 100%

  Serial.println("Timestamp = " + timestamp);
  Serial.print("Luminosity = ");
  Serial.print(lux_percentage);
  Serial.println(" %");


  humidite_sol_Val = analogRead(humidite_sol_pin);
  int humidite_sol_percentage = map(humidite_sol_Val, 0, 3000, 0, 100);  // mettre la valeur en pourcentage
  if (humidite_sol_percentage > 100) humidite_sol_percentage = 100;      // rendre le max à 100%
  if (humidite_sol_percentage < 0) humidite_sol_percentage = 0;          // et le min à 0%

  Serial.print("Soil Moisture = ");
  Serial.print(humidite_sol_percentage);
  Serial.println(" %");

  // affichage des valeur prise par le Dht 11
  float temperature;
  float humidity;
  temperature = dht.readTemperature();
  humidity = dht.readHumidity();

  Serial.println("Temperature = " + String(dht.readTemperature()) + " °C");
  Serial.println("Humidity = " + String(dht.readHumidity()) + " %");
  Serial.println("****************");

  // // envoie des donnees vers Firebase Realtime Database chaque 8 secondes
  if (Firebase.ready() && signupOK && (millis() - sendDataPrevMillis > 8000 || sendDataPrevMillis == 0)) {
    sendDataPrevMillis = millis();

    // creation de l'objet JSON
    FirebaseJson json;
    json.set("Luminosity", lux_percentage);
    json.set("Soil Moisture", humidite_sol_percentage);
    json.set("Temperature", temperature);
    json.set("Humidity", humidity);
    json.set("Timestamp", timestamp);

    if (Firebase.RTDB.pushJSON(&fbdo, "/SensorData", &json)) {
      Serial.println("Data sent successfully");
    } else {
      Serial.println("Error sending data: " + fbdo.errorReason());
    }
  }


  delay(2000);
}
