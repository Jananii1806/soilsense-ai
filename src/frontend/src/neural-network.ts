// Feed-Forward Neural Network implementation in TypeScript
// Architecture: Input -> Hidden1 (ReLU) -> Hidden2 (ReLU) -> Output (Softmax)

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
}

export interface TrainingResult {
  trainAccuracy: number;
  testAccuracy: number;
  epochs: number;
  metrics: TrainingMetrics[];
}

function relu(x: number): number {
  return Math.max(0, x);
}

function reluDerivative(x: number): number {
  return x > 0 ? 1 : 0;
}

function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map((x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function randomGaussian(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function heInit(fanIn: number): number {
  return randomGaussian() * Math.sqrt(2.0 / fanIn);
}

type Matrix = number[][];
type Vector = number[];

function matMul(W: Matrix, x: Vector): Vector {
  return W.map((row) => row.reduce((sum, w, i) => sum + w * x[i], 0));
}

function addVec(a: Vector, b: Vector): Vector {
  return a.map((v, i) => v + b[i]);
}

function createMatrix(
  rows: number,
  cols: number,
  initFn: () => number,
): Matrix {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, initFn),
  );
}

function createVector(size: number, val = 0): Vector {
  return Array(size).fill(val);
}

export class NeuralNetwork {
  private W1: Matrix;
  private b1: Vector;
  private W2: Matrix;
  private b2: Vector;
  private W3: Matrix;
  private b3: Vector;

  constructor(
    private inputSize: number,
    private hidden1Size: number,
    private hidden2Size: number,
    private outputSize: number,
  ) {
    this.W1 = createMatrix(hidden1Size, inputSize, () => heInit(inputSize));
    this.b1 = createVector(hidden1Size);
    this.W2 = createMatrix(hidden2Size, hidden1Size, () => heInit(hidden1Size));
    this.b2 = createVector(hidden2Size);
    this.W3 = createMatrix(outputSize, hidden2Size, () => heInit(hidden2Size));
    this.b3 = createVector(outputSize);
  }

  forward(x: Vector): {
    a1: Vector;
    z1: Vector;
    a2: Vector;
    z2: Vector;
    a3: Vector;
  } {
    const z1 = addVec(matMul(this.W1, x), this.b1);
    const a1 = z1.map(relu);
    const z2 = addVec(matMul(this.W2, a1), this.b2);
    const a2 = z2.map(relu);
    const z3 = addVec(matMul(this.W3, a2), this.b3);
    const a3 = softmax(z3);
    return { a1, z1, a2, z2, a3 };
  }

  predict(x: Vector): { classIndex: number; probabilities: number[] } {
    const { a3 } = this.forward(x);
    const classIndex = a3.indexOf(Math.max(...a3));
    return { classIndex, probabilities: a3 };
  }

  private crossEntropyLoss(probs: Vector, label: number): number {
    return -Math.log(Math.max(probs[label], 1e-10));
  }

  trainStep(x: Vector, label: number, lr: number): number {
    const { a1, z1, a2, z2, a3 } = this.forward(x);

    // Output layer gradient (softmax + cross-entropy)
    const dL_dz3 = a3.map((p, i) => p - (i === label ? 1 : 0));

    // W3, b3 gradients
    for (let i = 0; i < this.outputSize; i++) {
      for (let j = 0; j < this.hidden2Size; j++) {
        this.W3[i][j] -= lr * dL_dz3[i] * a2[j];
      }
      this.b3[i] -= lr * dL_dz3[i];
    }

    // Backprop to hidden2
    const dL_da2 = createVector(this.hidden2Size);
    for (let j = 0; j < this.hidden2Size; j++) {
      for (let i = 0; i < this.outputSize; i++) {
        dL_da2[j] += this.W3[i][j] * dL_dz3[i];
      }
    }
    const dL_dz2 = dL_da2.map((g, j) => g * reluDerivative(z2[j]));

    // W2, b2 gradients
    for (let i = 0; i < this.hidden2Size; i++) {
      for (let j = 0; j < this.hidden1Size; j++) {
        this.W2[i][j] -= lr * dL_dz2[i] * a1[j];
      }
      this.b2[i] -= lr * dL_dz2[i];
    }

    // Backprop to hidden1
    const dL_da1 = createVector(this.hidden1Size);
    for (let j = 0; j < this.hidden1Size; j++) {
      for (let i = 0; i < this.hidden2Size; i++) {
        dL_da1[j] += this.W2[i][j] * dL_dz2[i];
      }
    }
    const dL_dz1 = dL_da1.map((g, j) => g * reluDerivative(z1[j]));

    // W1, b1 gradients
    for (let i = 0; i < this.hidden1Size; i++) {
      for (let j = 0; j < this.inputSize; j++) {
        this.W1[i][j] -= lr * dL_dz1[i] * x[j];
      }
      this.b1[i] -= lr * dL_dz1[i];
    }

    return this.crossEntropyLoss(a3, label);
  }

  train(
    trainData: Array<{ features: Vector; label: number }>,
    testData: Array<{ features: Vector; label: number }>,
    epochs: number,
    lr = 0.01,
    onProgress?: (metrics: TrainingMetrics) => void,
  ): TrainingResult {
    const metrics: TrainingMetrics[] = [];

    for (let epoch = 0; epoch < epochs; epoch++) {
      // Shuffle
      const shuffled = [...trainData].sort(() => Math.random() - 0.5);
      let totalLoss = 0;
      let correct = 0;

      for (const sample of shuffled) {
        const loss = this.trainStep(sample.features, sample.label, lr);
        totalLoss += loss;
        const { classIndex } = this.predict(sample.features);
        if (classIndex === sample.label) correct++;
      }

      const avgLoss = totalLoss / shuffled.length;
      const accuracy = correct / shuffled.length;

      const m: TrainingMetrics = { epoch: epoch + 1, loss: avgLoss, accuracy };
      metrics.push(m);
      if (onProgress) onProgress(m);
    }

    const trainAcc = this.evaluate(trainData);
    const testAcc = this.evaluate(testData);

    return {
      trainAccuracy: trainAcc,
      testAccuracy: testAcc,
      epochs,
      metrics,
    };
  }

  evaluate(data: Array<{ features: Vector; label: number }>): number {
    let correct = 0;
    for (const sample of data) {
      const { classIndex } = this.predict(sample.features);
      if (classIndex === sample.label) correct++;
    }
    return correct / data.length;
  }
}
