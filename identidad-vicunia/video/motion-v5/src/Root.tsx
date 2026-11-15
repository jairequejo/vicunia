import type {CalculateMetadataFunction} from 'remotion';
import {Composition} from 'remotion';
import {Edit} from './Edit';
import type {EditProps} from './types';

const defaultProps: EditProps = {
  canvas: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationInFrames: 450,
    background: '#10131a',
  },
  media: {},
  title: 'A reusable motion layer',
  subtitle: 'React layout, SVG animation, local media, and alpha output',
  accent: '#72E6C1',
  transparent: false,
};

const calculateMetadata: CalculateMetadataFunction<EditProps> = ({props}) => {
  return {
    width: props.canvas.width,
    height: props.canvas.height,
    fps: props.canvas.fps,
    durationInFrames: props.canvas.durationInFrames,
  };
};

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="VideoSinPrecio"
        component={() => <Edit noPrice />}
        durationInFrames={390}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="VideoEdit"
        component={Edit}
        durationInFrames={defaultProps.canvas.durationInFrames}
        fps={defaultProps.canvas.fps}
        width={defaultProps.canvas.width}
        height={defaultProps.canvas.height}
        defaultProps={defaultProps}
        calculateMetadata={calculateMetadata}
      />
      <Composition
        id="MotionOverlay"
        component={Edit}
        durationInFrames={defaultProps.canvas.durationInFrames}
        fps={defaultProps.canvas.fps}
        width={defaultProps.canvas.width}
        height={defaultProps.canvas.height}
        defaultProps={{...defaultProps, transparent: true}}
        calculateMetadata={calculateMetadata}
      />
    </>
  );
};
