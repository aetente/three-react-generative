"use client"

import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect } from "react";

const FirstPersonControlsComponent = () => {
  const threeContext = useThreeContext();


  useEffect(() => {
    if (threeContext?.startedScene &&threeContext?.scene && threeContext?.renderer?.domElement && threeContext?.addControls && threeContext?.camera && !threeContext?.controls && threeContext?.clock) {
      const controls = new FirstPersonControls(threeContext?.camera, threeContext?.renderer.domElement);
      controls.movementSpeed = 5; // How fast the camera moves
      controls.lookSpeed = 0.1;  // How fast the camera rotates with mouse movement
      controls.noFly = false;      // If true, disables movement along the y-axis
      controls.constrainVertical = true; // Limits vertical look angle
      controls.verticalMin = 0.5;  // Lower limit for vertical look (radians)
      controls.verticalMax = 2.5;  // Upper limit for vertical look (radians)
      controls.lon = -90;          // Initial horizontal look angle (degrees)
      controls.lat = 0; // Initial vertical look angle (degrees)
      threeContext?.addControls(controls);
      
      threeContext?.addFrameFunction(async (delta?: number) => {
        controls.update(delta);
      });
    }
  }, [threeContext?.scene, threeContext?.camera, threeContext?.renderer?.domElement, threeContext?.startedScene])
  return <></>
}

export default FirstPersonControlsComponent