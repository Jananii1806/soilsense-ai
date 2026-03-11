import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainingResult } from "../neural-network";
import { PLANT_CLASSES, PLANT_INFO } from "../soil-dataset";

interface Props {
  trainingResult: TrainingResult;
}

export default function AboutTab({ trainingResult }: Props) {
  return (
    <div className="space-y-6">
      {/* What is Phytoremediation */}
      <Card>
        <CardHeader>
          <CardTitle>🌱 What is Phytoremediation?</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-muted-foreground">
          <p>
            Phytoremediation is the use of living plants to remove, degrade, or
            stabilize contaminants from soil and water. It is a low-cost,
            solar-powered, eco-friendly remediation technology that uses the
            natural processes of plants to clean up heavy metals, pesticides,
            and other toxins.
          </p>
          <p className="mt-3">
            Different plants specialize in accumulating different types of
            toxins. SoilSense AI uses a trained neural network to match your
            soil's toxin profile to the most effective phytoremediation plant.
          </p>
        </CardContent>
      </Card>

      {/* Plant Catalog */}
      <Card>
        <CardHeader>
          <CardTitle>🪴 Phytoremediation Plant Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLANT_CLASSES.map((name) => {
              const info = PLANT_INFO[name as keyof typeof PLANT_INFO];
              return (
                <div key={name} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{info.emoji}</span>
                    <h4 className="font-semibold">{name}</h4>
                  </div>
                  <Badge variant="secondary" className="text-xs mb-2">
                    {info.specialty}
                  </Badge>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {info.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Neural Network Architecture */}
      <Card>
        <CardHeader>
          <CardTitle>🧠 Neural Network Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center text-sm">
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Input Layer (10)
              </Badge>
              <span className="text-muted-foreground">→</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Hidden Layer 1 (32, ReLU)
              </Badge>
              <span className="text-muted-foreground">→</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Hidden Layer 2 (16, ReLU)
              </Badge>
              <span className="text-muted-foreground">→</span>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                Output Layer (7, Softmax)
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="text-center border rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">
                  {(trainingResult.trainAccuracy * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Train Accuracy
                </div>
              </div>
              <div className="text-center border rounded-lg p-4">
                <div className="text-2xl font-bold text-primary">
                  {(trainingResult.testAccuracy * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Test Accuracy
                </div>
              </div>
              <div className="text-center border rounded-lg p-4">
                <div className="text-2xl font-bold">
                  {trainingResult.epochs}
                </div>
                <div className="text-xs text-muted-foreground">Epochs</div>
              </div>
              <div className="text-center border rounded-lg p-4">
                <div className="text-2xl font-bold">150</div>
                <div className="text-xs text-muted-foreground">
                  Training Samples
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Input features:</strong> pH, Lead (Pb), Cadmium (Cd),
                Arsenic (As), Nickel (Ni), Zinc (Zn), Chromium (Cr), Organic
                Matter %, Nitrogen, Phosphorus
              </p>
              <p>
                <strong>Training algorithm:</strong> Stochastic gradient descent
                with backpropagation
              </p>
              <p>
                <strong>Weight initialization:</strong> He initialization for
                ReLU layers
              </p>
              <p>
                <strong>Loss function:</strong> Categorical cross-entropy
              </p>
              <p>
                <strong>Data split:</strong> 80% training / 20% test
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
