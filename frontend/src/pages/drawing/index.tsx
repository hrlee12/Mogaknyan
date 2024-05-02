import { useEffect, useState } from 'react';
import { fabric } from 'fabric';

const Drawing = () => {
  const [canvas, setCanvas] = useState<fabric.Canvas | null>();

  useEffect(() => {
    const newCanvas = new fabric.Canvas('canvas', {
      width: 500,
      height: 500,
      isDrawingMode: true //드로잉모드 true로 안해주면 기본값 false
    });
    setCanvas(newCanvas);
    }, []);
  }

  return (
    <>
      <canvas id='canvas' />
    </>
  )
}
export default Drawing;