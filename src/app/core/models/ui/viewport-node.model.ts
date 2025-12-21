export interface ViewportNode {
  id: string;

  x: number;            // left
  y: number;            // top
  width: number;        // card width
  height: number;       // card height
  visible: boolean;     // currently visible on screen (expanded + container)
}
