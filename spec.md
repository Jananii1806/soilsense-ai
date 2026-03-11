# SoilSense AI

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Feed-forward neural network (FFNN) implemented in TypeScript, running in-browser
- Neural network architecture: input layer (soil parameters) -> 2 hidden layers (ReLU activation) -> output layer (plant recommendation + cycles)
- Training dataset: hardcoded soil samples with known toxin levels and corresponding phytoremediation plants
- Training flow: network trains on dataset on app load, shows training progress and accuracy metrics
- Soil input form: user enters soil parameters (pH, heavy metals: Pb, Cd, As, Ni, Zn, Cr in ppm, organic matter %, nitrogen, phosphorus)
- Prediction engine: after training completes, user submits soil data and gets:
  - Recommended phytoremediation plant (e.g., Sunflower, Indian Mustard, Vetiver Grass, Willow, Hemp, Poplar, Pteris fern)
  - Estimated number of plantation cycles to fully remove toxins
  - Confidence score of the recommendation
  - Brief description of why this plant works for the detected toxin profile
- Training metrics dashboard: shows loss curve, accuracy per epoch, final test accuracy
- History log: stores past soil analyses in backend

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Implement NeuralNetwork class in TypeScript:
   - Configurable hidden layers (2 layers, 16-32 neurons each)
   - Sigmoid/ReLU activations
   - Backpropagation training with SGD
   - Forward pass for inference
2. Build training dataset: 150+ synthetic soil samples with toxin profiles mapped to plants
3. Normalize input features (min-max scaling)
4. Train/test split (80/20), compute accuracy
5. UI: training progress screen -> results dashboard -> soil input form -> prediction output
6. Backend: store soil analysis records (principal ID, inputs, recommendation, timestamp)
