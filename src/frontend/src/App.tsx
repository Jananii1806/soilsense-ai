import { Toaster } from "@/components/ui/sonner";
import { useCallback, useEffect, useState } from "react";
import Dashboard from "./components/Dashboard";
import TrainingScreen from "./components/TrainingScreen";
import {
  NeuralNetwork,
  type TrainingMetrics,
  type TrainingResult,
} from "./neural-network";
import { getDataset } from "./soil-dataset";

export interface AppState {
  phase: "training" | "ready";
  nn: NeuralNetwork | null;
  trainingResult: TrainingResult | null;
  currentMetrics: TrainingMetrics | null;
  progress: number; // 0-100
  stage: string;
}

export default function App() {
  const [state, setState] = useState<AppState>({
    phase: "training",
    nn: null,
    trainingResult: null,
    currentMetrics: null,
    progress: 0,
    stage: "Initializing neural network...",
  });

  const runTraining = useCallback(async () => {
    // Small delay for UX
    await new Promise((r) => setTimeout(r, 400));

    setState((s) => ({
      ...s,
      stage: "Generating soil dataset (150 samples)...",
      progress: 10,
    }));
    await new Promise((r) => setTimeout(r, 300));

    const { trainData, testData } = getDataset();

    setState((s) => ({
      ...s,
      stage: `Training on ${trainData.length} samples...`,
      progress: 20,
    }));
    await new Promise((r) => setTimeout(r, 100));

    const nn = new NeuralNetwork(10, 32, 16, 7);
    const epochs = 120;
    const metricsLog: TrainingMetrics[] = [];

    // Run training synchronously in chunks with async breaks for UI updates
    const CHUNK = 10;
    for (let epoch = 0; epoch < epochs; epoch += CHUNK) {
      const chunkEnd = Math.min(epoch + CHUNK, epochs);
      // Train a chunk
      const chunkTrainData = [...trainData];
      for (let e = epoch; e < chunkEnd; e++) {
        const shuffled = [...chunkTrainData].sort(() => Math.random() - 0.5);
        let totalLoss = 0;
        let correct = 0;
        for (const sample of shuffled) {
          const loss = nn.trainStep(sample.features, sample.label, 0.015);
          totalLoss += loss;
          const { classIndex } = nn.predict(sample.features);
          if (classIndex === sample.label) correct++;
        }
        const m: TrainingMetrics = {
          epoch: e + 1,
          loss: totalLoss / shuffled.length,
          accuracy: correct / shuffled.length,
        };
        metricsLog.push(m);
      }

      const pct = 20 + Math.round((chunkEnd / epochs) * 65);
      const lastM = metricsLog[metricsLog.length - 1];
      setState((s) => ({
        ...s,
        progress: pct,
        stage: `Epoch ${chunkEnd}/${epochs} — Loss: ${lastM.loss.toFixed(4)}, Acc: ${(lastM.accuracy * 100).toFixed(1)}%`,
        currentMetrics: lastM,
      }));
      await new Promise((r) => setTimeout(r, 0)); // yield to browser
    }

    setState((s) => ({
      ...s,
      stage: `Evaluating on ${testData.length} test samples...`,
      progress: 88,
    }));
    await new Promise((r) => setTimeout(r, 200));

    const trainAcc = nn.evaluate(trainData);
    const testAcc = nn.evaluate(testData);

    const result: TrainingResult = {
      trainAccuracy: trainAcc,
      testAccuracy: testAcc,
      epochs,
      metrics: metricsLog,
    };

    setState((s) => ({ ...s, stage: "Training complete!", progress: 100 }));
    await new Promise((r) => setTimeout(r, 600));

    setState({
      phase: "ready",
      nn,
      trainingResult: result,
      currentMetrics: metricsLog[metricsLog.length - 1],
      progress: 100,
      stage: "Training complete!",
    });
  }, []);

  useEffect(() => {
    runTraining();
  }, [runTraining]);

  return (
    <>
      {state.phase === "training" ? (
        <TrainingScreen
          progress={state.progress}
          stage={state.stage}
          currentMetrics={state.currentMetrics}
        />
      ) : (
        <Dashboard nn={state.nn!} trainingResult={state.trainingResult!} />
      )}
      <Toaster />
    </>
  );
}
