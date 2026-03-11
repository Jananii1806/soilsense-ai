import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import type { NeuralNetwork } from "../neural-network";
import {
  PLANT_CLASSES,
  PLANT_INFO,
  estimateRemediationCycles,
  normalizeFeatures,
} from "../soil-dataset";

interface Props {
  nn: NeuralNetwork;
}

interface SoilInputs {
  pH: string;
  leadPPM: string;
  cadmiumPPM: string;
  arsenicPPM: string;
  nickelPPM: string;
  zincPPM: string;
  chromiumPPM: string;
  organicMatterPercentage: string;
  nitrogenPPM: string;
  phosphorusPPM: string;
}

interface PredictionResult {
  plantName: string;
  plantIndex: number;
  confidence: number;
  probabilities: number[];
  cycles: number;
  elevatedToxins: string[];
}

function getElevatedToxins(inputs: SoilInputs): string[] {
  const elevated: string[] = [];
  if (Number(inputs.leadPPM) > 50) elevated.push(`Lead: ${inputs.leadPPM} ppm`);
  if (Number(inputs.cadmiumPPM) > 3)
    elevated.push(`Cadmium: ${inputs.cadmiumPPM} ppm`);
  if (Number(inputs.arsenicPPM) > 20)
    elevated.push(`Arsenic: ${inputs.arsenicPPM} ppm`);
  if (Number(inputs.nickelPPM) > 50)
    elevated.push(`Nickel: ${inputs.nickelPPM} ppm`);
  if (Number(inputs.zincPPM) > 150)
    elevated.push(`Zinc: ${inputs.zincPPM} ppm`);
  if (Number(inputs.chromiumPPM) > 50)
    elevated.push(`Chromium: ${inputs.chromiumPPM} ppm`);
  return elevated;
}

function getSeverityColor(elevated: string[]): string {
  if (elevated.length >= 4) return "bg-red-100 border-red-300 text-red-800";
  if (elevated.length >= 2)
    return "bg-orange-100 border-orange-300 text-orange-800";
  if (elevated.length >= 1)
    return "bg-yellow-100 border-yellow-300 text-yellow-800";
  return "bg-green-100 border-green-300 text-green-800";
}

function getSeverityLabel(elevated: string[]): string {
  if (elevated.length >= 4) return "Severe Contamination";
  if (elevated.length >= 2) return "High Contamination";
  if (elevated.length >= 1) return "Moderate Contamination";
  return "Low / Clean Soil";
}

export default function SoilForm({ nn }: Props) {
  const { identity, login } = useInternetIdentity();
  const { actor } = useActor();

  const [inputs, setInputs] = useState<SoilInputs>({
    pH: "6.5",
    leadPPM: "80",
    cadmiumPPM: "5",
    arsenicPPM: "20",
    nickelPPM: "40",
    zincPPM: "200",
    chromiumPPM: "30",
    organicMatterPercentage: "3",
    nitrogenPPM: "50",
    phosphorusPPM: "40",
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [saving, setSaving] = useState(false);

  const handleChange =
    (field: keyof SoilInputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputs((prev) => ({ ...prev, [field]: e.target.value }));
      setResult(null);
    };

  const handleAnalyze = () => {
    const rawFeatures = [
      Number(inputs.pH),
      Number(inputs.leadPPM),
      Number(inputs.cadmiumPPM),
      Number(inputs.arsenicPPM),
      Number(inputs.nickelPPM),
      Number(inputs.zincPPM),
      Number(inputs.chromiumPPM),
      Number(inputs.organicMatterPercentage),
      Number(inputs.nitrogenPPM),
      Number(inputs.phosphorusPPM),
    ];

    const normalized = normalizeFeatures(rawFeatures);
    const { classIndex, probabilities } = nn.predict(normalized);
    const plantName = PLANT_CLASSES[classIndex];
    const cycles = estimateRemediationCycles(classIndex, rawFeatures);
    const elevated = getElevatedToxins(inputs);

    setResult({
      plantName,
      plantIndex: classIndex,
      confidence: probabilities[classIndex],
      probabilities,
      cycles,
      elevatedToxins: elevated,
    });
  };

  const handleSave = async () => {
    if (!result) return;
    if (!identity) {
      login();
      return;
    }
    if (!actor) return;
    setSaving(true);
    try {
      await actor.saveAnalysis(
        {
          pH: Number(inputs.pH),
          leadPPM: Number(inputs.leadPPM),
          cadmiumPPM: Number(inputs.cadmiumPPM),
          arsenicPPM: Number(inputs.arsenicPPM),
          nickelPPM: Number(inputs.nickelPPM),
          zincPPM: Number(inputs.zincPPM),
          chromiumPPM: Number(inputs.chromiumPPM),
          organicMatterPercentage: Number(inputs.organicMatterPercentage),
          nitrogenPPM: Number(inputs.nitrogenPPM),
          phosphorusPPM: Number(inputs.phosphorusPPM),
        },
        result.plantName,
        BigInt(result.cycles),
        result.confidence,
      );
      toast.success("Analysis saved to your history!");
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setInputs({
      pH: "6.5",
      leadPPM: "0",
      cadmiumPPM: "0",
      arsenicPPM: "0",
      nickelPPM: "0",
      zincPPM: "0",
      chromiumPPM: "0",
      organicMatterPercentage: "3",
      nitrogenPPM: "50",
      phosphorusPPM: "40",
    });
    setResult(null);
  };

  const plantInfo = result
    ? PLANT_INFO[result.plantName as keyof typeof PLANT_INFO]
    : null;

  const fieldConfig = [
    {
      key: "pH" as const,
      label: "Soil pH",
      unit: "(0–14)",
      placeholder: "6.5",
      hint: "Acidity/alkalinity",
    },
    {
      key: "leadPPM" as const,
      label: "Lead (Pb)",
      unit: "ppm",
      placeholder: "0",
      hint: "Heavy metal",
    },
    {
      key: "cadmiumPPM" as const,
      label: "Cadmium (Cd)",
      unit: "ppm",
      placeholder: "0",
      hint: "Toxic metal",
    },
    {
      key: "arsenicPPM" as const,
      label: "Arsenic (As)",
      unit: "ppm",
      placeholder: "0",
      hint: "Metalloid toxin",
    },
    {
      key: "nickelPPM" as const,
      label: "Nickel (Ni)",
      unit: "ppm",
      placeholder: "0",
      hint: "Heavy metal",
    },
    {
      key: "zincPPM" as const,
      label: "Zinc (Zn)",
      unit: "ppm",
      placeholder: "0",
      hint: "Heavy metal",
    },
    {
      key: "chromiumPPM" as const,
      label: "Chromium (Cr)",
      unit: "ppm",
      placeholder: "0",
      hint: "Heavy metal",
    },
    {
      key: "organicMatterPercentage" as const,
      label: "Organic Matter",
      unit: "%",
      placeholder: "3",
      hint: "Soil quality indicator",
    },
    {
      key: "nitrogenPPM" as const,
      label: "Nitrogen (N)",
      unit: "ppm",
      placeholder: "50",
      hint: "Nutrient level",
    },
    {
      key: "phosphorusPPM" as const,
      label: "Phosphorus (P)",
      unit: "ppm",
      placeholder: "40",
      hint: "Nutrient level",
    },
  ];

  const ocidMap: Record<string, string> = {
    pH: "soil.ph_input",
    leadPPM: "soil.lead_input",
    cadmiumPPM: "soil.cadmium_input",
    arsenicPPM: "soil.arsenic_input",
    nickelPPM: "soil.nickel_input",
    zincPPM: "soil.zinc_input",
    chromiumPPM: "soil.chromium_input",
    organicMatterPercentage: "soil.organic_input",
    nitrogenPPM: "soil.nitrogen_input",
    phosphorusPPM: "soil.phosphorus_input",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>🪧 Enter Soil Test Data</CardTitle>
          <CardDescription>
            Input your laboratory soil analysis results to get a
            phytoremediation recommendation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {fieldConfig.map(({ key, label, unit, placeholder }) => (
              <div key={key}>
                <Label htmlFor={key} className="text-xs font-medium">
                  {label} <span className="text-muted-foreground">{unit}</span>
                </Label>
                <Input
                  id={key}
                  type="number"
                  step="any"
                  min="0"
                  placeholder={placeholder}
                  value={inputs[key]}
                  onChange={handleChange(key)}
                  data-ocid={ocidMap[key]}
                  className="mt-1"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleAnalyze}
              data-ocid="soil.submit_button"
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Analyze Soil
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              data-ocid="soil.reset_button"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div>
        {!result ? (
          <Card className="h-full flex flex-col items-center justify-center text-center p-10">
            <span className="text-5xl mb-4">🔬</span>
            <h3 className="text-lg font-semibold text-muted-foreground">
              Awaiting Soil Data
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Fill in your soil parameters and click &ldquo;Analyze Soil&rdquo;
              to get your phytoremediation recommendation.
            </p>
          </Card>
        ) : (
          <div className="space-y-4" data-ocid="result.card">
            {/* Severity */}
            <div
              className={`rounded-lg border px-4 py-3 text-sm font-medium ${getSeverityColor(result.elevatedToxins)}`}
            >
              Soil Health: {getSeverityLabel(result.elevatedToxins)}
              {result.elevatedToxins.length > 0 && (
                <div className="mt-1 text-xs font-normal">
                  Elevated: {result.elevatedToxins.join(", ")}
                </div>
              )}
            </div>

            {/* Recommendation */}
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="text-5xl">{plantInfo?.emoji}</div>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      Recommended Plant
                    </div>
                    <h2 className="text-2xl font-bold text-foreground">
                      {result.plantName}
                    </h2>
                    <div className="text-xs text-muted-foreground mt-1">
                      {plantInfo?.specialty}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {result.cycles}
                    </div>
                    <div className="text-xs text-muted-foreground">cycles</div>
                    <div className="text-xs text-muted-foreground">needed</div>
                  </div>
                </div>

                {/* Confidence */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">AI Confidence</span>
                    <span className="font-medium">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={result.confidence * 100} className="h-2" />
                </div>

                {/* Description */}
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {plantInfo?.description}
                </p>
              </CardContent>
            </Card>

            {/* All probabilities */}
            <Card>
              <CardContent className="pt-4">
                <div className="text-xs font-medium text-muted-foreground mb-3">
                  All Plant Probabilities
                </div>
                <div className="space-y-2">
                  {PLANT_CLASSES.map((name, i) => (
                    <div key={name} className="flex items-center gap-2">
                      <div className="w-28 text-xs truncate font-medium">
                        {PLANT_INFO[name as keyof typeof PLANT_INFO].emoji}{" "}
                        {name}
                      </div>
                      <div className="flex-1">
                        <Progress
                          value={result.probabilities[i] * 100}
                          className={`h-1.5 ${i === result.plantIndex ? "" : "opacity-50"}`}
                        />
                      </div>
                      <div className="text-xs w-10 text-right">
                        {(result.probabilities[i] * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={saving}
                data-ocid="result.save_button"
                className="flex-1"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {saving
                  ? "Saving..."
                  : identity
                    ? "Save Analysis"
                    : "Login to Save"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setResult(null)}
                data-ocid="result.primary_button"
              >
                Analyze Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
