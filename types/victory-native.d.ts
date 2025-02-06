declare module 'victory-native' {
  import { ViewProps } from 'react-native';
  
  export interface VictoryStyleObject {
    data?: {
      fill?: string;
      stroke?: string;
      strokeWidth?: number;
      fillOpacity?: number;
    };
    labels?: {
      fill?: string;
      fontSize?: number;
    };
    axis?: {
      stroke?: string;
    };
    tickLabels?: {
      fill?: string;
      fontSize?: number;
    };
  }

  export interface VictoryAxisProps {
    dependentAxis?: boolean;
    tickFormat?: (tick: any) => string;
    style?: VictoryStyleObject;
  }

  export interface VictoryChartProps extends ViewProps {
    theme?: any;
    height?: number;
    padding?: {
      top?: number;
      bottom?: number;
      left?: number;
      right?: number;
    };
  }

  export interface VictoryLineProps {
    data?: Array<{ x: number; y: number }>;
    style?: VictoryStyleObject;
    animate?: {
      duration?: number;
      onLoad?: { duration: number };
    };
  }

  export const VictoryTheme: {
    material: any;
  };

  export class VictoryChart extends React.Component<VictoryChartProps> {}
  export class VictoryAxis extends React.Component<VictoryAxisProps> {}
  export class VictoryLine extends React.Component<VictoryLineProps> {}
}