declare module 'react-native-chart-kit' {
  import { ViewStyle } from 'react-native';

  interface ChartConfig {
    backgroundColor?: string;
    backgroundGradientFrom?: string;
    backgroundGradientTo?: string;
    decimalPlaces?: number;
    color?: (opacity?: number) => string;
    labelColor?: (opacity?: number) => string;
    style?: ViewStyle;
    propsForDots?: {
      r?: string;
      strokeWidth?: string;
      stroke?: string;
    };
    propsForLabels?: {
      fontSize?: number;
    };
  }

  interface Dataset {
    data: number[];
    color?: string | ((opacity: number) => string);
    strokeWidth?: number;
  }

  interface LineChartData {
    labels: string[];
    datasets: Dataset[];
  }

  interface LineChartProps {
    data: LineChartData;
    width: number;
    height: number;
    yAxisLabel?: string;
    yAxisSuffix?: string;
    yAxisInterval?: number;
    chartConfig: ChartConfig;
    bezier?: boolean;
    style?: ViewStyle;
  }

  export class LineChart extends React.Component<LineChartProps> {}
}