import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { evaluate } from "mathjs";
import { Picker } from "@react-native-picker/picker";

interface CalculatorProps {
  angleMode: "DEG" | "RAD";
  setAngleMode: (mode: "DEG" | "RAD") => void;
}

const CalculatorScreen: React.FC<CalculatorProps> = ({
  angleMode,
  setAngleMode,
}) => {
  const [display, setDisplay] = useState("0");
  const [advancedFunction, setAdvancedFunction] = useState("");

  // List of advanced functions with "Select Function" as the default option.
  const advancedFunctions = [
    { label: "Select Function", value: "" },
    { label: "sin", value: "sin(" },
    { label: "cos", value: "cos(" },
    { label: "tan", value: "tan(" },
    { label: "log", value: "log(" },
    { label: "ln", value: "ln(" },
    { label: "√", value: "sqrt(" },
    { label: "π", value: "pi" },
    { label: "^", value: "^" },
    { label: "e", value: "e" },
    { label: "!", value: "!" },
  ];

  const handleInput = (value: string) => {
    if (value === "AC") {
      setDisplay("0");
    } else if (value === "=") {
      try {
        const scope: any = {};
        // If DEG mode is enabled, override the trigonometric functions.
        if (angleMode === "DEG") {
          scope.sin = (x: number) => Math.sin((x * Math.PI) / 180);
          scope.cos = (x: number) => Math.cos((x * Math.PI) / 180);
          scope.tan = (x: number) => Math.tan((x * Math.PI) / 180);
        }
        const result = evaluate(display, scope);
        setDisplay(result.toString().slice(0, 12));
      } catch (error) {
        Alert.alert("Error", "Invalid mathematical expression");
      }
    } else {
      setDisplay((prev) => (prev === "0" ? value : prev + value).slice(0, 24));
    }
  };

  // Append the advanced function call to the display, then reset the picker.
  const handleAdvancedFunctionChange = (itemValue: string) => {
    if (itemValue !== "") {
      setDisplay((prev) => (prev === "0" ? itemValue : prev + itemValue));
      setAdvancedFunction("");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.screen}
      showsVerticalScrollIndicator={false}
    >
      {/* Main Display */}
      <View style={styles.displayContainer}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {display}
        </Text>
      </View>

      {/* Degree/Radian Toggle */}
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[styles.modeButton, angleMode === "DEG" && styles.activeMode]}
          onPress={() => setAngleMode("DEG")}
        >
          <Text style={[styles.modeText, styles.blackText]}>DEG</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, angleMode === "RAD" && styles.activeMode]}
          onPress={() => setAngleMode("RAD")}
        >
          <Text style={[styles.modeText, styles.blackText]}>RAD</Text>
        </TouchableOpacity>
      </View>

      {/* Advanced Functions Row */}
      <View style={styles.advancedContainer}>
        <Text style={styles.advancedLabel}>Advanced Functions:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={advancedFunction}
            style={styles.picker}
            onValueChange={(itemValue) =>
              handleAdvancedFunctionChange(itemValue)
            }
            mode="dropdown"
            itemStyle={styles.pickerItem}
          >
            {advancedFunctions.map((func) => (
              <Picker.Item
                key={func.label}
                label={func.label}
                value={func.value}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Calculator Buttons Grid */}
      <View style={styles.buttonGrid}>
        {[
          ["7", "8", "9", "/"],
          ["4", "5", "6", "*"],
          ["1", "2", "3", "-"],
          ["0", ".", "=", "+"],
          ["AC", "(", ")", "%"],
        ].map((row, i) => (
          <View
            key={i}
            style={[styles.buttonRow, i === 4 && { marginBottom: 0 }]}
          >
            {row.map((btn) => (
              <TouchableOpacity
                key={btn}
                style={[
                  styles.button,
                  btn === "AC" && styles.acButton,
                  btn === "=" && styles.equalsButton,
                  { height: 60 },
                ]}
                onPress={() => handleInput(btn)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    styles.blackText,
                    btn === "=" && styles.specialButtonText,
                  ]}
                >
                  {btn}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  displayContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#4a90e2",
    height: 100,
    justifyContent: "center",
  },
  displayText: {
    fontSize: 5000,
    fontWeight: "bold",
    textAlign: "right",
    color: "#333",
    flexShrink: 1,
    includeFontPadding: false,
  },
  modeContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  modeButton: {
    flex: 0.45,
    padding: 12,
    backgroundColor: "#e3f2fd",
    borderRadius: 8,
    alignItems: "center",
  },
  activeMode: {
    backgroundColor: "#2196F3",
  },
  modeText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  blackText: {
    color: "#000",
  },
  advancedContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  advancedLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 10,
  },
  pickerContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: "#4a90e2",
    borderRadius: 10,
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  picker: {
    height: 60,
    width: "100%",
  },
  pickerItem: {
    fontSize: 14,
    textAlign: "center",
  },
  buttonGrid: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    height: 60,
  },
  button: {
    width: "23%",
    height: "100%",
    backgroundColor: "#e3f2fd",
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    margin: 2,
  },
  acButton: {
    backgroundColor: "#ffcdd2",
  },
  equalsButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    fontSize: 24,
  },
  specialButtonText: {
    color: "white",
  },
});

export default CalculatorScreen;
