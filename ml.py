import torch
import torch.nn as nn
import numpy as np

class ScoreLSTM(nn.Module):
    def __init__(self, input_size=1, hidden_size=16, output_size=1, num_layers=1):
        super(ScoreLSTM, self).__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size).to(x.device)
        out, _ = self.lstm(x, (h0, c0))
        # Take the output of the last time step
        out = self.fc(out[:, -1, :])
        return out

def train_and_predict(scores: list[int]) -> float:
    """
    Given a list of scores (>= 30), train a quick LSTM model to predict the next score.
    Returns the predicted score.
    """
    if len(scores) < 30:
        return np.mean(scores)  # Fallback predict

    # Prepare data: use window of 5 days to predict 6th
    window_size = 5
    data_x = []
    data_y = []
    
    # Normalize data for better training (scores are 0-10)
    norm_scores = [s / 10.0 for s in scores]
    
    for i in range(len(norm_scores) - window_size):
        data_x.append(norm_scores[i:i+window_size])
        data_y.append(norm_scores[i+window_size])
        
    X = torch.tensor(data_x, dtype=torch.float32).unsqueeze(-1) # (N, window_size, 1)
    Y = torch.tensor(data_y, dtype=torch.float32).unsqueeze(-1) # (N, 1)
    
    model = ScoreLSTM()
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
    
    # Quick train
    epochs = 100
    for epoch in range(epochs):
        model.train()
        optimizer.zero_grad()
        outputs = model(X)
        loss = criterion(outputs, Y)
        loss.backward()
        optimizer.step()
        
    # Predict next
    model.eval()
    last_window = norm_scores[-window_size:]
    x_input = torch.tensor([last_window], dtype=torch.float32).unsqueeze(-1)
    with torch.no_grad():
        pred_norm = model(x_input).item()
        
    pred_score = pred_norm * 10.0
    # Ensure prediction is within valid range
    pred_score = max(0.0, min(10.0, pred_score))
    return pred_score
