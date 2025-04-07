import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const CONVERSION_CONFIG = {
  length: {
    units: ["cm", "m", "km", "in", "ft"],
    factors: { cm: 0.01, m: 1, km: 1000, in: 0.0254, ft: 0.3048 },
  },
  volume: {
    units: ["mL", "L", "m³", "gal", "ft³"],
    factors: { mL: 0.001, L: 1, "m³": 1000, gal: 3.78541, "ft³": 28.3168 },
  },
  mass: {
    units: ["g", "kg", "lb", "oz", "ton"],
    factors: { g: 1, kg: 1000, lb: 453.592, oz: 28.3495, ton: 907185 },
  },
  temperature: {
    units: ["°C", "°F", "K"],
    convert: {
      "°C->°F": (v: number) => (v * 9) / 5 + 32,
      "°F->°C": (v: number) => ((v - 32) * 5) / 9,
      "°C->K": (v: number) => v + 273.15,
      "K->°C": (v: number) => v - 273.15,
    },
  },
  time: {
    units: ["sec", "min", "hr", "day", "week"],
    factors: { sec: 1, min: 60, hr: 3600, day: 86400, week: 604800 },
  },
  speed: {
    units: ["m/s", "km/h", "mph", "knot", "ft/s"],
    factors: {
      "m/s": 1,
      "km/h": 3.6,
      mph: 2.23694,
      knot: 1.94384,
      "ft/s": 3.28084,
    },
  },
};

const ConverterScreen: React.FC = () => {
  const [category, setCategory] =
    useState<keyof typeof CONVERSION_CONFIG>("length");
  const [fromUnit, setFromUnit] = useState("cm");
  const [toUnit, setToUnit] = useState("m");
  const [inputValue, setInputValue] = useState("");
  const [result, setResult] = useState("");

  const convert = () => {
    if (!inputValue) return;
    const value = parseFloat(inputValue);
    if (isNaN(value)) {
      Alert.alert("Error", "Please enter a valid number");
      return;
    }
    try {
      let converted: number;
      if (category === "temperature") {
        const key =
          `${fromUnit}->${toUnit}` as keyof typeof CONVERSION_CONFIG.temperature.convert;
        converted = CONVERSION_CONFIG.temperature.convert[key](value);
      } else {
        const fromFactor =
          CONVERSION_CONFIG[category].factors[
            fromUnit as keyof (typeof CONVERSION_CONFIG)[typeof category]["factors"]
          ];
        const toFactor =
          CONVERSION_CONFIG[category].factors[
            toUnit as keyof (typeof CONVERSION_CONFIG)[typeof category]["factors"]
          ];
        converted = (value * fromFactor) / toFactor;
      }
      setResult(converted.toFixed(2));
    } catch (error) {
      Alert.alert("Error", "Conversion failed. Check your inputs.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.converterCard}>
        {/* Conversion Type */}
        <Text style={styles.label}>Conversion Type</Text>
        <View style={styles.box}>
          <Picker
            selectedValue={category}
            onValueChange={(value) => {
              setCategory(value);
              setFromUnit(CONVERSION_CONFIG[value].units[0]);
              setToUnit(CONVERSION_CONFIG[value].units[1]);
            }}
            style={styles.picker}
          >
            {Object.keys(CONVERSION_CONFIG).map((key) => (
              <Picker.Item
                key={key}
                label={key.charAt(0).toUpperCase() + key.slice(1)}
                value={key}
              />
            ))}
          </Picker>
        </View>

        {/* From Unit */}
        <Text style={styles.label}>From Unit</Text>
        <View style={styles.box}>
          <Picker
            selectedValue={fromUnit}
            onValueChange={setFromUnit}
            style={styles.picker}
          >
            {CONVERSION_CONFIG[category].units.map((unit) => (
              <Picker.Item key={unit} label={unit} value={unit} />
            ))}
          </Picker>
        </View>

        {/* To Unit */}
        <Text style={styles.label}>To Unit</Text>
        <View style={styles.box}>
          <Picker
            selectedValue={toUnit}
            onValueChange={setToUnit}
            style={styles.picker}
          >
            {CONVERSION_CONFIG[category].units.map((unit) => (
              <Picker.Item key={unit} label={unit} value={unit} />
            ))}
          </Picker>
        </View>

        {/* Value to Convert */}
        <Text style={styles.label}>Value to Convert</Text>
        <View style={styles.box}>
          <TextInput
            style={styles.input}
            placeholder="Enter value"
            keyboardType="numeric"
            value={inputValue}
            onChangeText={setInputValue}
          />
        </View>

        {/* Convert Button */}
        <TouchableOpacity style={styles.button} onPress={convert}>
          <Text style={styles.buttonText}>Convert</Text>
        </TouchableOpacity>

        {/* Converted Value */}
        {result !== "" && (
          <>
            <Text style={styles.label}>Converted Value</Text>
            <View style={styles.box}>
              <Text style={styles.result}>{result}</Text>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f0f4f7",
  },
  converterCard: {
    backgroundColor: "#fff",
    borderColor: "#4a90e2",
    borderWidth: 2,
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  box: {
    borderWidth: 2,
    borderColor: "#4a90e2",
    borderRadius: 10,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  picker: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 0,
  },
  input: {
    width: "100%",
    padding: 15,
    fontSize: 18,
  },
  button: {
    backgroundColor: "#2196F3",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  result: {
    fontSize: 24,
    color: "#2196F3",
    fontWeight: "bold",
    padding: 15,
    textAlign: "center",
  },
});

export default ConverterScreen;