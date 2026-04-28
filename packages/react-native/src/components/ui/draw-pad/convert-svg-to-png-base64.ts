import Svg from "react-native-svg";

export const convertSvgToPngBase64 = (
  svgRef: React.RefObject<Svg>,
  paths: string[]
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!svgRef.current || paths.length === 0) {
      resolve("");
      return;
    }

    try {
      (svgRef.current as any).toDataURL(
        (dataUrl: string) => {
          resolve(dataUrl);
        },
        { format: "png", quality: 1.0, width: 1000, height: 1000 }
      );
    } catch (error) {
      console.error("[DrawPad] Erro ao converter SVG para PNG:", error);
      reject(error);
    }
  });
};
