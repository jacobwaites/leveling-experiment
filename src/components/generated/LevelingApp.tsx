import React, { useState, useEffect, useCallback } from 'react';
interface DeviceOrientation {
  beta: number; // X-axis rotation (-180 to 180)
  gamma: number; // Y-axis rotation (-90 to 90)
}

// @component: LevelingApp
export const LevelingApp = () => {
  const [orientation, setOrientation] = useState<DeviceOrientation>({
    beta: 0,
    gamma: 0
  });
  const [isLevel, setIsLevel] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [angle, setAngle] = useState(0);
  const LEVEL_THRESHOLD = 3; // degrees
  const CIRCLE_SIZE = 200; // pixels
  const MOVEMENT_SCALE = 8; // multiplier for movement sensitivity

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        setPermissionGranted(permission === 'granted');
      } catch (error) {
        console.error('Permission request failed:', error);
      }
    } else {
      setPermissionGranted(true);
    }
  }, []);
  const handleOrientationChange = useCallback((event: DeviceOrientationEvent) => {
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;
    setOrientation({
      beta,
      gamma
    });
    const totalAngle = Math.sqrt(beta * beta + gamma * gamma);
    setAngle(totalAngle);

    // Check if device is level - this should update every time
    const currentlyLevel = Math.abs(beta) < LEVEL_THRESHOLD && Math.abs(gamma) < LEVEL_THRESHOLD;
    setIsLevel(currentlyLevel);
  }, [LEVEL_THRESHOLD]);
  useEffect(() => {
    if (permissionGranted) {
      window.addEventListener('deviceorientation', handleOrientationChange);
      return () => window.removeEventListener('deviceorientation', handleOrientationChange);
    }
  }, [permissionGranted, handleOrientationChange]);
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);
  const circle1X = orientation.gamma * MOVEMENT_SCALE;
  const circle1Y = orientation.beta * MOVEMENT_SCALE;
  const circle2X = -orientation.gamma * MOVEMENT_SCALE;
  const circle2Y = -orientation.beta * MOVEMENT_SCALE;
  const displayAngle = isLevel ? 0 : Math.round(angle);

  // Calculate rotation angle for text to face down direction
  const textRotationRadians = Math.atan2(orientation.gamma, orientation.beta);
  const textRotationDegrees = -(textRotationRadians * (180 / Math.PI));

  // @return
  return <div className="fixed inset-0 w-full h-full overflow-hidden transition-colors duration-300" style={{
    backgroundColor: isLevel ? '#22c55e' : '#000000'
  }}>
      {!permissionGranted && <div className="absolute inset-0 flex items-center justify-center z-50">
          <button onClick={requestPermission} className="px-6 py-3 bg-white text-black rounded-lg font-medium text-lg font-inter">
            <span>Enable Device Orientation</span>
          </button>
        </div>}

      {/* First circle - no easing/smoothing */}
      <div className="absolute w-48 h-48 bg-white rounded-full" style={{
      left: '50%',
      top: '50%',
      marginLeft: -CIRCLE_SIZE / 2,
      marginTop: -CIRCLE_SIZE / 2,
      transform: `translate(${circle1X}px, ${circle1Y}px)`
    }} />

      {/* Second circle with difference blend mode - no easing/smoothing */}
      <div className="absolute w-48 h-48 bg-white rounded-full" style={{
      left: '50%',
      top: '50%',
      marginLeft: -CIRCLE_SIZE / 2,
      marginTop: -CIRCLE_SIZE / 2,
      mixBlendMode: 'difference',
      transform: `translate(${circle2X}px, ${circle2Y}px)`
    }} />

      {/* Text with difference blend mode for visibility */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center" style={{
        mixBlendMode: 'difference'
      }}>
          <span className="text-5xl font-light text-white font-inter" style={{
          letterSpacing: '-0.2rem',
          transform: `rotate(${textRotationDegrees}deg)`,
          display: 'inline-block'
        }}>
            {displayAngle}°
          </span>
        </div>
      </div>
    </div>;
};