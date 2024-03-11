import React, { useRef, useEffect } from "react";
const LongPressButton = ({ onLongPress, ...props }) => {
  const longPressRef = useRef();

  const handleTouchStart = () => {
    longPressRef.current = setInterval(() => {
      onLongPress();
    }, 200); // 长按500毫秒后触发
  };

  const handleTouchEnd = () => {
    clearTimeout(longPressRef.current);
  };

  useEffect(() => {
    return () => {
      clearTimeout(longPressRef.current);
    };
  }, []);

  return (
    <button
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      {...props}
    >
      {props.children}
    </button>
  );
};

export default LongPressButton;
