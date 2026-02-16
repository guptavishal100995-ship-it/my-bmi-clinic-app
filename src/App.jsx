import { useState } from "react";
import jsPDF from "jspdf";
import logo from "./logo.png";
import sign from "./sign.png";

function Gauge({ bmi }) {
  const percent = Math.min((bmi / 40) * 100, 100);
  return (
    <div style={{ marginTop: 18 }}>
      <div style={{ position: "relative" }}>
        <div style={{
          position: "absolute",
          left: `calc(${percent}% - 6px)`,
          top: -12,
          fontSize: 18,
          fontWeight: "bold"
        }}>▼</div>

        <div style={{
          height: 14,
          borderRadius: 10,
          background: "linear-gradient(to right,#3b82f6,#22c55e,#f59e0b,#ef4444)"
        }} />
      </div>

      <div style={{
        fontSize: 11,
        marginTop: 6,
        display: "flex",
        justifyContent: "space-between",
        color: "#555"
      }}>
        <span>Under</span>
        <span>Normal</span>
        <span>High</span>
        <span>Risk</span>
      </div>
    </div>
  );
}

export default function App() {
  const [patient, setPatient] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState("");
  const [tips, setTips] = useState([]);

  const advice = {
    under: [
      "Your weight is below the healthy range.",
      "Increase protein and calorie intake.",
      "Add strength training weekly.",
      "Consult doctor if weakness continues."
    ],
    normal: [
      "Your BMI is within healthy range.",
      "Maintain balanced nutrition.",
      "Exercise at least 30 minutes daily.",
      "Continue your current lifestyle."
    ],
    over: [
      "Your weight is above ideal range.",
      "Reduce sugar and refined carbohydrates.",
      "Increase daily walking and activity.",
      "Control food portions."
    ],
    obese: [
      "BMI indicates obesity risk.",
      "Start structured diet modification.",
      "Begin gradual supervised exercise.",
      "Medical follow-up advised."
    ]
  };

  function toKg(v) {
    const n = parseFloat(v);
    if (!n) return null;
    return weightUnit === "lb" ? n * 0.453592 : n;
  }

  function toMeter(v) {
    if (heightUnit === "cm") return parseFloat(v) * 0.01;
    if (heightUnit === "m") return parseFloat(v);
    if (heightUnit === "in") return parseFloat(v) * 0.0254;
    if (heightUnit === "ftin") {
      const p = v.split(" ");
      const ft = parseFloat(p[0]) || 0;
      const inch = parseFloat(p[1]) || 0;
      return (ft * 12 + inch) * 0.0254;
    }
  }

  function calculate() {
    const kg = toKg(weight);
    const m = toMeter(height);
    if (!kg || !m) return;

    const val = (kg / (m * m)).toFixed(1);
    setBmi(val);

    if (val < 18.5) { setCategory("Underweight"); setTips(advice.under); }
    else if (val < 25) { setCategory("Normal"); setTips(advice.normal); }
    else if (val < 30) { setCategory("Overweight"); setTips(advice.over); }
    else { setCategory("Obese"); setTips(advice.obese); }
  }

  function downloadPDF() {
    if (!bmi) return;

    const doc = new jsPDF();
    const now = new Date();

    doc.addImage(logo, "PNG", 15, 10, 30, 30);
    doc.setFontSize(18);
    doc.text("BMI PRESCRIPTION REPORT", 60, 22);

    doc.setFontSize(11);
    doc.text(now.toLocaleString(), 150, 15);
    doc.line(15, 45, 195, 45);

    doc.text(`Patient: ${patient}`, 20, 60);
    doc.text(`Weight: ${weight} ${weightUnit}`, 20, 70);
    doc.text(`Height: ${height} ${heightUnit}`, 20, 80);

    doc.setFontSize(14);
    doc.text(`BMI: ${bmi}`, 20, 100);
    doc.text(`Category: ${category}`, 20, 110);

    doc.text("Advice:", 20, 130);
    let y = 140;
    tips.forEach(t => { doc.text("• " + t, 22, y); y += 8; });

    doc.addImage(sign, "PNG", 140, 210, 50, 20);
    doc.text("Dr. Vishal Gupta (MBBS, DNB)", 140, 235);

    doc.save("bmi-report.pdf");
  }

  const openAI = () => {
    window.open("https://chat.openai.com", "_blank");
  };

  const input = {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #ddd",
    width: "100%"
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg,#6d28d9,#9333ea)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center"
    }}>
      <div style={{
        background: "white",
        padding: 24,
        borderRadius: 18,
        width: 420,
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
      }}>

        <div style={{
          borderRadius: 16,
          padding: 18,
          marginBottom: 16,
          background: "linear-gradient(90deg,#6d28d9,#9333ea)",
          color: "white"
        }}>
          <div style={{
            fontSize: 26,
            fontWeight: "bold",
            letterSpacing: 1.5
          }}>
            "MY" BMI
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            Dr. Vishal Gupta (MBBS, DNB)
          </div>
        </div>

        <input style={input}
          placeholder="Patient name"
          value={patient}
          onChange={e => setPatient(e.target.value)}
        />

        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <input style={input}
            placeholder="Weight"
            value={weight}
            onChange={e => setWeight(e.target.value)}
          />
          <select style={{ ...input, width: 90 }}
            value={weightUnit}
            onChange={e => setWeightUnit(e.target.value)}>
            <option value="kg">kg</option>
            <option value="lb">lb</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
          <input style={input}
            placeholder="Height (5 11 for ft in)"
            value={height}
            onChange={e => setHeight(e.target.value)}
          />
          <select style={{ ...input, width: 110 }}
            value={heightUnit}
            onChange={e => setHeightUnit(e.target.value)}>
            <option value="cm">cm</option>
            <option value="m">meter</option>
            <option value="in">inch</option>
            <option value="ftin">ft+in</option>
          </select>
        </div>

        <button onClick={calculate}
          style={{
            width: "100%",
            padding: 12,
            marginTop: 12,
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: 12,
            fontWeight: "bold"
          }}>
          Calculate BMI
        </button>

        {bmi && (
          <>
            <div style={{
              marginTop: 16,
              padding: 14,
              borderRadius: 14,
              background: "#16a34a",
              color: "white",
              textAlign: "center"
            }}>
              <div>Your BMI</div>
              <div style={{ fontSize: 28, fontWeight: "bold" }}>{bmi}</div>
              <div>{category}</div>
            </div>

            <Gauge bmi={bmi} />

            <div style={{
              marginTop: 12,
              background: "#f3f4f6",
              padding: 12,
              borderRadius: 12
            }}>
              <b>Advice</b>
              <ul>{tips.map((t,i)=><li key={i}>{t}</li>)}</ul>
            </div>

            <button onClick={downloadPDF}
              style={{
                width: "100%",
                padding: 12,
                marginTop: 10,
                background: "#16a34a",
                color: "white",
                border: "none",
                borderRadius: 12
              }}>
              Download PDF Report
            </button>

            <button onClick={openAI}
              style={{
                width: "100%",
                padding: 12,
                marginTop: 8,
                background: "#0ea5e9",
                color: "white",
                border: "none",
                borderRadius: 12
              }}>
              Ask AI a Question
            </button>
          </>
        )}

      </div>
    </div>
  );
}