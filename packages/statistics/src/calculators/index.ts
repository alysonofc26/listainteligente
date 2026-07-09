export class StatisticsCalculator {
  average(values: number[]): number {
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return this.round(sum / values.length);
  }

  percentage(value: number, total: number): number {
    if (total === 0) return 0;
    return this.round((value / total) * 100);
  }

  growth(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return this.round(((current - previous) / previous) * 100);
  }

  trend(values: number[]): "up" | "down" | "stable" {
    if (values.length < 2) return "stable";
    const recent = values.slice(-3);
    const avg = this.average(recent);
    const midPoint = this.average(values.slice(0, -3));
    if (midPoint === 0) return avg > 0 ? "up" : "stable";
    const change = this.growth(avg, midPoint);
    if (change > 5) return "up";
    if (change < -5) return "down";
    return "stable";
  }

  min(values: number[]): number {
    if (values.length === 0) return 0;
    return Math.min(...values);
  }

  max(values: number[]): number {
    if (values.length === 0) return 0;
    return Math.max(...values);
  }

  round(value: number, decimals: number = 2): number {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
  }
}

export const calc = new StatisticsCalculator();
