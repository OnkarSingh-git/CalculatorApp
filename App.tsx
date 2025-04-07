import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CalculatorScreen from "./components/Calculator";
import GraphScreen from "./components/Graph";
import ConverterScreen from "./components/Converter";

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<"calc" | "graph" | "convert">("calc");
  const [angleMode, setAngleMode] = useState<"DEG" | "RAD">("DEG");

  return (
    <SafeAreaView style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calculator</Text>
      </View>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentScreen === "calc" && styles.activeNav,
          ]}
          onPress={() => setCurrentScreen("calc")}
        >
          <Text style={styles.navText}>Calculator</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            currentScreen === "graph" && styles.activeNav,
          ]}
          onPress={() => setCurrentScreen("graph")}
        >
          <Text style={styles.navText}>Graphs</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.navButton,
            { borderRightWidth: 0 },
            currentScreen === "convert" && styles.activeNav,
          ]}
          onPress={() => setCurrentScreen("convert")}
        >
          <Text style={styles.navText}>Converter</Text>
        </TouchableOpacity>
      </View>

      {/* Render Screens */}
      {currentScreen === "calc" && (
        <CalculatorScreen angleMode={angleMode} setAngleMode={setAngleMode} />
      )}
      {currentScreen === "graph" && <GraphScreen angleMode={angleMode} />}
      {currentScreen === "convert" && <ConverterScreen />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ece9e6",
  },
  header: {
    backgroundColor: "#4a90e2",
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  navBar: {
    flexDirection: "row",
    backgroundColor: "#357ab8",
    justifyContent: "space-around",
  },
  navButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.2)",
  },
  activeNav: {
    borderBottomWidth: 3,
    borderBottomColor: "#FFC107",
  },
  navText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default App;