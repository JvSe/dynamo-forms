import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  runOnUI,
  SharedValue,
  useAnimatedProps,
  useAnimatedReaction,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { G, Path, PathProps } from "react-native-svg";
import { svgPathProperties } from "svg-path-properties";
import { convertSvgToPngBase64 } from "./convert-svg-to-png-base64.js";

const AnimatedPath = Animated.createAnimatedComponent(Path);

const getPathLengthSafe = (path: string): number => {
  if (!path || typeof path !== "string" || path.trim().length < 2) return 0;
  try {
    return new svgPathProperties(path).getTotalLength();
  } catch {
    return 0;
  }
};

const PATH_PROPS: PathProps = {
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export interface DrawPadProps {
  strokeWidth?: number;
  stroke?: string;
  pathLength?: SharedValue<number>;
  playing?: SharedValue<boolean>;
  signed?: SharedValue<boolean>;
  onSubmit?: (base64: string) => void;
  outputFormat?: "svg" | "png";
}

export type DrawPadHandle = {
  erase: () => void;
  undo: () => void;
  play: () => void;
  stop: () => void;
  getDataUrl: () => Promise<string | null>;
};

const DrawPad = forwardRef<DrawPadHandle, DrawPadProps>(
  (
    {
      strokeWidth = 3.5,
      stroke = "grey",
      pathLength,
      playing,
      signed,
      onSubmit,
    },
    ref
  ) => {
    const [paths, setPaths] = useState<string[]>([]);
    const currentPath = useSharedValue<string>("");
    const progress = useSharedValue(1);
    const svgRef = useRef<Svg>(null);

    useEffect(() => {
      if (pathLength) {
        const totalLength = paths.reduce(
          (total, path) => total + getPathLengthSafe(path),
          0
        );
        runOnUI(() => {
          "worklet";
          pathLength.value = totalLength;
        })();
        setTimeout(async () => {
          const base64 = await handleGetDataUrl();
          if (base64) onSubmit?.(base64);
        }, 0);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paths, pathLength]);

    const animatedProps = useAnimatedProps(() => ({ d: currentPath.value }));

    const finishPath = () => {
      const pathValue = (currentPath.value ?? "").trim();
      if (!pathValue || !pathValue.startsWith("M")) {
        runOnUI(() => {
          "worklet";
          currentPath.value = "";
        })();
        return;
      }
      setPaths((prev) => {
        const updated = [...prev, pathValue];
        runOnUI(() => {
          "worklet";
          currentPath.value = "";
        })();
        return updated;
      });
    };

    const handleErase = () => {
      setPaths([]);
      runOnUI(() => {
        "worklet";
        currentPath.value = "";
      })();
    };

    const handleUndo = useCallback(() => {
      setPaths((prev) => {
        const next = [...prev];
        next.pop();
        return next;
      });
    }, []);

    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handlePlay = useCallback(() => {
      if (playing && pathLength && !playing.value) {
        const duration = pathLength.value * 2;
        runOnUI(() => {
          "worklet";
          playing.value = true;
        })();
        timeoutRef.current = setTimeout(() => {
          runOnUI(() => {
            "worklet";
            playing.value = false;
          })();
        }, duration);
      }
    }, [playing, pathLength]);

    const handleStop = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (playing) {
        runOnUI(() => {
          "worklet";
          playing.value = false;
        })();
      }
    }, [playing]);

    const handleGetDataUrl = useCallback(async (): Promise<string | null> => {
      if (paths.length === 0) return null;
      try {
        const base64 = await convertSvgToPngBase64(svgRef, paths);
        return `data:image/png;base64,${base64}`;
      } catch (error) {
        console.error("[DrawPad] Erro ao gerar data URL:", error);
        return null;
      }
    }, [paths]);

    useImperativeHandle(ref, () => ({
      erase: handleErase,
      undo: handleUndo,
      play: handlePlay,
      stop: handleStop,
      getDataUrl: handleGetDataUrl,
    }));

    const panGesture = Gesture.Pan()
      .minDistance(0)
      .onStart((e: { x: number; y: number }) => {
        currentPath.value = `M ${e.x} ${e.y}`;
      })
      .onUpdate((e: { x: number; y: number }) => {
        if (!currentPath.value || !currentPath.value.trim().startsWith("M")) {
          currentPath.value = `M ${e.x} ${e.y}`;
        } else {
          currentPath.value += ` L ${e.x} ${e.y}`;
        }
      })
      .onEnd(() => {
        runOnJS(finishPath)();
      });

    useAnimatedReaction(
      () => playing?.value ?? false,
      (isPlaying: boolean) => {
        if (!playing || !pathLength) return;
        const duration = pathLength.value * 2;
        const easingFn = Easing.bezier(0.4, 0, 0.5, 1);

        if (isPlaying) {
          progress.value = 0;
          progress.value = withTiming(1, { duration, easing: easingFn });
          return;
        }

        progress.value = withTiming(
          0,
          {
            duration:
              signed?.value || progress.value > 0.999
                ? 1
                : progress.value * duration,
            easing: easingFn,
          },
          () => {
            progress.value = 1;
          }
        );
      }
    );

    return (
      <GestureDetector gesture={panGesture}>
        <View style={{ flex: 1 }}>
          <Svg ref={svgRef} height="100%" width="100%">
            {paths.map((p, i) => {
              const prevLength = paths
                .slice(0, i)
                .reduce((total, prev) => total + getPathLengthSafe(prev), 0);
              return (
                <DrawPath
                  key={i}
                  path={p}
                  strokeWidth={strokeWidth}
                  stroke={stroke}
                  progress={progress}
                  prevLength={prevLength}
                  totalPathLength={pathLength}
                />
              );
            })}
            <AnimatedPath
              animatedProps={animatedProps}
              stroke={stroke}
              strokeWidth={strokeWidth}
              {...PATH_PROPS}
            />
          </Svg>
        </View>
      </GestureDetector>
    );
  }
);

DrawPad.displayName = "DrawPad";

const DrawPath = ({
  path,
  strokeWidth,
  stroke,
  progress,
  prevLength,
  totalPathLength,
}: {
  path: string;
  strokeWidth: number;
  stroke: string;
  prevLength?: number;
  progress?: SharedValue<number>;
  totalPathLength?: SharedValue<number>;
}) => {
  const length = getPathLengthSafe(path) + 1;

  const animatedProps = useAnimatedProps(() => {
    const prev = prevLength ?? 0;
    const total = totalPathLength?.value ?? 0;
    const safeTotal = total > 0 ? total : 1;

    const start = prev / safeTotal;
    const end = (prev + length) / safeTotal;
    const p = progress?.value ?? 1;

    const turn = interpolate(p, [start, end], [0, 1], Extrapolation.CLAMP);
    const opacity = p >= start ? 1 : 0;

    return {
      strokeDashoffset: interpolate(turn, [0, 1], [length, 0]) - 1,
      opacity,
    };
  });

  return (
    <G>
      <Path
        d={path}
        strokeWidth={strokeWidth}
        stroke={stroke}
        strokeOpacity={0.2}
        {...PATH_PROPS}
      />
      <AnimatedPath
        d={path}
        strokeWidth={strokeWidth}
        stroke={stroke}
        strokeDasharray={length}
        animatedProps={animatedProps}
        {...PATH_PROPS}
      />
    </G>
  );
};

export { DrawPad };
