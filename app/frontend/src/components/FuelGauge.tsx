export function FuelGauge() {
  // Mock burnout status for now
  const status = 'yellow'; // 'green', 'yellow', 'red'

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'green': return '#4caf50';
      case 'yellow': return '#ffeb3b';
      case 'red': return '#f44336';
      default: return '#ccc';
    }
  };

  const getMessage = (s: string) => {
    switch (s) {
      case 'green': return "You're doing great!";
      case 'yellow': return "Take a break soon.";
      case 'red': return "High burnout risk.";
      default: return "Status unknown";
    }
  };

  return (
    <div className="p-4 border rounded-lg text-center bg-card text-card-foreground shadow-sm">
      <h3 className="font-semibold mb-2 text-sm">Burnout Meter</h3>
      <div 
        className="w-10 h-10 rounded-full mx-auto mb-2 shadow-sm"
        style={{ 
          backgroundColor: getStatusColor(status),
        }} 
      />
      <p className="text-sm font-medium">{getMessage(status)}</p>
    </div>
  );
}
