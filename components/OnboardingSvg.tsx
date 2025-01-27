import React from 'react';
import { Image, Platform } from 'react-native';
import { SvgProps } from 'react-native-svg';

interface Props {
  svg: any;
  width: number;
  height: number;
}

export default function OnboardingSvg({ svg, width, height }: Props) {
  // For web, render the SVG directly
  if (Platform.OS === 'web') {
    const SvgComponent = svg.default || svg;
    return <SvgComponent width={width} height={height} />;
  }

  // For native platforms, use Image
  return (
    <Image
      source={svg}
      style={{
        width,
        height,
      }}
      resizeMode="contain"
    />
  );
}