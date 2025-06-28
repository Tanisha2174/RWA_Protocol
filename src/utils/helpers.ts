export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatPercentage = (value: number): string => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
};

export const getRiskColor = (riskScore: number): string => {
  if (riskScore <= 3) return 'text-green-400';
  if (riskScore <= 6) return 'text-yellow-400';
  return 'text-red-400';
};

export const getRiskBadgeColor = (riskScore: number): string => {
  if (riskScore <= 3) return 'bg-green-600/20 text-green-400';
  if (riskScore <= 6) return 'bg-yellow-600/20 text-yellow-400';
  return 'bg-red-600/20 text-red-400';
};

export const generateChartData = (days: number, startValue: number): Array<{time: string, price: number}> => {
  const data = [];
  let currentValue = startValue;
  
  for (let i = 0; i < days; i++) {
    const change = (Math.random() - 0.5) * 0.1; // ±5% daily change
    currentValue *= (1 + change);
    
    data.push({
      time: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      price: currentValue
    });
  }
  
  return data;
};

export const calculatePortfolioMetrics = (assets: any[]) => {
  const totalValue = assets.reduce((sum, asset) => sum + (asset.amount * asset.price), 0);
  const totalChange = assets.reduce((sum, asset) => sum + (asset.amount * asset.price * asset.change / 100), 0);
  const changePercent = (totalChange / totalValue) * 100;
  
  return {
    totalValue,
    totalChange,
    changePercent
  };
};