import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from "react-native";
import Svg, { G, Line, Path, Text as SvgText, Rect } from "react-native-svg";
import { evaluate } from "mathjs";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Graph dimensions and margins
const GRAPH_MARGIN = 30;
const GRAPH_WIDTH = SCREEN_WIDTH - 40; // overall graph width with container margins
const GRAPH_HEIGHT = 300;

interface Range {
  min: string;
  max: string;
}

interface Domain {
  min: number;
  max: number;
}

interface DataPoint {
  x: number;
  y: number;
}

interface GraphProps {
  angleMode: "DEG" | "RAD";
}

const Graph: React.FC<GraphProps> = ({ angleMode }) => {
  // State variables for function input, ranges, and data points
  const [functionText, setFunctionText] = useState("");
  const [xRange, setXRange] = useState<Range>({ min: "", max: "" });
  const [yRange, setYRange] = useState<Range>({ min: "", max: "" });
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [xDomain, setXDomain] = useState<Domain | null>(null);
  const [yDomain, setYDomain] = useState<Domain | null>(null);

  // Function to parse and plot the function given the inputs
  const plotFunction = () => {
    if (!functionText.trim()) {
      Alert.alert("Error", "Please enter a function");
      return;
    }
    if (!xRange.min.trim() || !xRange.max.trim()) {
      Alert.alert("Error", "Please input both X-min and X-max");
      return;
    }
    const minX = parseFloat(xRange.min);
    const maxX = parseFloat(xRange.max);
    if (isNaN(minX) || isNaN(maxX) || minX >= maxX) {
      Alert.alert("Error", "Invalid X range values");
      return;
    }

    const steps = 200;
    const step = (maxX - minX) / steps;
    const scope: any = {};

    // Set up scope functions based on the angle mode
    if (angleMode === "DEG") {
      scope.sin = (x: number) => Math.sin((x * Math.PI) / 180);
      scope.cos = (x: number) => Math.cos((x * Math.PI) / 180);
      scope.tan = (x: number) => Math.tan((x * Math.PI) / 180);
    } else {
      scope.sin = Math.sin;
      scope.cos = Math.cos;
      scope.tan = Math.tan;
    }

    // Remove any leading "y=" from the expression
    let expr = functionText.trim();
    if (expr.toLowerCase().startsWith("y=")) {
      expr = expr.substring(2).trim();
    }

    let pts: DataPoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const xVal = minX + i * step;
      try {
        scope.x = xVal;
        const yVal = evaluate(expr, scope);
        if (typeof yVal === "number" && isFinite(yVal)) {
          pts.push({ x: xVal, y: yVal });
        }
      } catch (err) {
        // Skip the point if evaluation fails
      }
    }

    if (pts.length === 0) {
      Alert.alert("Error", "No plottable points found");
      return;
    }

    // Determine Y-domain: use user‑provided values if valid; otherwise, compute from data.
    let computedYMin = Math.min(...pts.map((p) => p.y));
    let computedYMax = Math.max(...pts.map((p) => p.y));
    if (yRange.min.trim() !== "" && yRange.max.trim() !== "") {
      const userYMin = parseFloat(yRange.min);
      const userYMax = parseFloat(yRange.max);
      if (!isNaN(userYMin) && !isNaN(userYMax) && userYMin < userYMax) {
        computedYMin = userYMin;
        computedYMax = userYMax;
      } else {
        Alert.alert("Error", "Invalid Y range values, using computed values.");
      }
    }

    setDataPoints(pts);
    setXDomain({ min: minX, max: maxX });
    setYDomain({ min: computedYMin, max: computedYMax });
  };

  const clearGraph = () => {
    setFunctionText("");
    setXRange({ min: "", max: "" });
    setYRange({ min: "", max: "" });
    setDataPoints([]);
    setXDomain(null);
    setYDomain(null);
  };

  // Scaling functions – map a data point (x or y) to pixel coordinates on the SVG canvas.
  const scaleX = (x: number): number => {
    if (!xDomain) return 0;
    return (
      ((x - xDomain.min) / (xDomain.max - xDomain.min)) *
        (GRAPH_WIDTH - 2 * GRAPH_MARGIN) +
      GRAPH_MARGIN
    );
  };

  const scaleY = (y: number): number => {
    if (!yDomain) return 0;
    // Invert the y-axis so higher numerical values appear at the top.
    return (
      GRAPH_HEIGHT -
      (((y - yDomain.min) / (yDomain.max - yDomain.min)) *
        (GRAPH_HEIGHT - 2 * GRAPH_MARGIN) +
        GRAPH_MARGIN)
    );
  };

  // Generate the SVG path data string for the graph curve.
  const generatePath = (): string => {
    if (dataPoints.length === 0 || !xDomain || !yDomain) return "";
    let d = "";
    dataPoints.forEach((pt, index) => {
      const x = scaleX(pt.x);
      const y = scaleY(pt.y);
      if (index === 0) {
        d += `M ${x} ${y}`;
      } else {
        d += ` L ${x} ${y}`;
      }
    });
    return d;
  };

  // Render grid lines (both vertical and horizontal) with tick labels.
  const renderGridLines = () => {
    if (!xDomain || !yDomain) return null;
    const elements = [];
    const numVertical = 5;
    const numHorizontal = 5;

    // Vertical grid lines and X-axis tick labels.
    for (let i = 0; i <= numVertical; i++) {
      const tickValue =
        xDomain.min + (i * (xDomain.max - xDomain.min)) / numVertical;
      const xPos = scaleX(tickValue);
      elements.push(
        <Line
          key={`v-grid-${i}`}
          x1={xPos}
          y1={GRAPH_MARGIN}
          x2={xPos}
          y2={GRAPH_HEIGHT - GRAPH_MARGIN}
          stroke="#ddd"
          strokeWidth="1"
        />
      );
      elements.push(
        <SvgText
          key={`v-label-${i}`}
          x={xPos}
          y={GRAPH_HEIGHT - 5}
          fontSize="10"
          fill="#555"
          textAnchor="middle"
        >
          {tickValue.toFixed(2)}
        </SvgText>
      );
    }

    // Horizontal grid lines and Y-axis tick labels.
    for (let i = 0; i <= numHorizontal; i++) {
      const tickValue =
        yDomain.min + (i * (yDomain.max - yDomain.min)) / numHorizontal;
      const yPos = scaleY(tickValue);
      elements.push(
        <Line
          key={`h-grid-${i}`}
          x1={GRAPH_MARGIN}
          y1={yPos}
          x2={GRAPH_WIDTH - GRAPH_MARGIN}
          y2={yPos}
          stroke="#ddd"
          strokeWidth="1"
        />
      );
      elements.push(
        <SvgText
          key={`h-label-${i}`}
          x={GRAPH_MARGIN - 5}
          y={yPos + 3}
          fontSize="10"
          fill="#555"
          textAnchor="end"
        >
          {tickValue.toFixed(2)}
        </SvgText>
      );
    }
    return elements;
  };

  // Render axes lines if zero is within the respective domains.
  const renderAxes = () => {
    if (!xDomain || !yDomain) return null;
    const elements = [];
    // Draw x-axis at y=0 if available.
    if (0 >= yDomain.min && 0 <= yDomain.max) {
      const yPos = scaleY(0);
      elements.push(
        <Line
          key="x-axis"
          x1={GRAPH_MARGIN}
          y1={yPos}
          x2={GRAPH_WIDTH - GRAPH_MARGIN}
          y2={yPos}
          stroke="#888"
          strokeWidth="2"
        />
      );
    }
    // Draw y-axis at x=0 if available.
    if (0 >= xDomain.min && 0 <= xDomain.max) {
      const xPos = scaleX(0);
      elements.push(
        <Line
          key="y-axis"
          x1={xPos}
          y1={GRAPH_MARGIN}
          x2={xPos}
          y2={GRAPH_HEIGHT - GRAPH_MARGIN}
          stroke="#888"
          strokeWidth="2"
        />
      );
    }
    return elements;
  };

  // Render the complete graph area with grid, axes, and the plotted curve.
  const renderGraph = () => {
    if (dataPoints.length > 0 && xDomain && yDomain) {
      return (
        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} style={styles.svg}>
          {/* Background */}
          <Rect
            x="0"
            y="0"
            width={GRAPH_WIDTH}
            height={GRAPH_HEIGHT}
            fill="#fff"
          />
          {/* Grid Lines */}
          <G>{renderGridLines()}</G>
          {/* Axes */}
          <G>{renderAxes()}</G>
          {/* Function Plot Path */}
          <Path
            d={generatePath()}
            stroke="#4A90E2"
            strokeWidth="2"
            fill="none"
          />
        </Svg>
      );
    }
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>Graph Preview</Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.container}>
        {/* Graph Display Area */}
        <View style={styles.graphContainer}>{renderGraph()}</View>

        {/* Control Inputs */}
        <View style={styles.controlsContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Function:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., x^2 + 3*sin(x) OR sin(x)"
              placeholderTextColor="#777"
              value={functionText}
              onChangeText={setFunctionText}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.rangeGroup}>
            <View style={styles.rangeInput}>
              <Text style={styles.label}>X‑min:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., -10"
                placeholderTextColor="#777"
                value={xRange.min}
                onChangeText={(text) =>
                  setXRange((prev) => ({ ...prev, min: text }))
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rangeInput}>
              <Text style={styles.label}>X‑max:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10"
                placeholderTextColor="#777"
                value={xRange.max}
                onChangeText={(text) =>
                  setXRange((prev) => ({ ...prev, max: text }))
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.rangeGroup}>
            <View style={styles.rangeInput}>
              <Text style={styles.label}>Y‑min (optional):</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., -10"
                placeholderTextColor="#777"
                value={yRange.min}
                onChangeText={(text) =>
                  setYRange((prev) => ({ ...prev, min: text }))
                }
                keyboardType="numeric"
              />
            </View>
            <View style={styles.rangeInput}>
              <Text style={styles.label}>Y‑max (optional):</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10"
                placeholderTextColor="#777"
                value={yRange.max}
                onChangeText={(text) =>
                  setYRange((prev) => ({ ...prev, max: text }))
                }
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.plotButton]}
              onPress={plotFunction}
            >
              <Text style={styles.buttonText}>Plot Function</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={clearGraph}
            >
              <Text style={styles.buttonText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    backgroundColor: "#F8F9FA",
    paddingVertical: 20,
  },
  container: {
    paddingHorizontal: 20,
  },
  graphContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    borderRadius: 12,
  },
  placeholderContainer: {
    width: GRAPH_WIDTH,
    height: GRAPH_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#eee",
    borderRadius: 12,
  },
  placeholderText: {
    color: "#555",
    fontSize: 16,
  },
  controlsContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: "#333",
  },
  rangeGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  rangeInput: {
    flex: 1,
    marginRight: 10,
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  plotButton: {
    backgroundColor: "#4A90E2",
  },
  clearButton: {
    backgroundColor: "#DC3545",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default Graph;
