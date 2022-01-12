import React, { useEffect, useState, useRef, Suspense, useMemo } from "react";
import { Player, Ball } from "../../lhm-rl-module/interfaces";
import * as THREE from "three";
import { Canvas, Vector3, useLoader } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import "./Minimap.scss";

interface Props {
  players: Player[];
  ball: Ball;
}

const minX = -4092;
const maxX = 4092;
const maxY = 5872;
const minY = -5872;
const minZ = 0;
const maxZ = 2031;

const rotatorToRadian = ((Math.PI / 180) * 0.5) / 182.044449;

const MapPlane = (props: JSX.IntrinsicElements["mesh"]) => {
  const p = useTexture({
    map: "images/map.svg",
  });

  return (
    <mesh {...props}>
      <planeGeometry args={[10, 10 / 0.685246996]} />
      <meshStandardMaterial color="white" {...p} />
    </mesh>
  );
};

const BlueCar = (props: JSX.IntrinsicElements["mesh"]) => (
  <mesh {...props}>
    <boxGeometry args={[0.4, 0.4, 0.4]} />
    <meshStandardMaterial color="#007bef" />
  </mesh>
);

const OrangeCar = (props: JSX.IntrinsicElements["mesh"]) => (
  <mesh {...props}>
    <boxGeometry args={[0.4, 0.4, 0.4]} />
    <meshStandardMaterial color="#fb7b07" />
  </mesh>
);

const BallMesh = (props: JSX.IntrinsicElements["mesh"]) => (
  <mesh {...props}>
    <sphereGeometry args={[0.2, 12, 12]} />
    <meshStandardMaterial color="lightgrey" />
  </mesh>
);

const Minimap = (props: Props) => {
  const Car3D = ({
    player,
    modelSrc,
    ...props
  }: Partial<JSX.IntrinsicElements["primitive"]> & {
    player: Player;
    modelSrc: string;
  }) => {
    const { scene } = useLoader(GLTFLoader, modelSrc);
    const copiedScene = useMemo(() => scene.clone(), [scene]);

    return (
      <primitive
        key={player.name}
        object={copiedScene}
        position={mapPosition(player)}
        rotation={
          new THREE.Euler(
            player.location.roll * rotatorToRadian,
            player.location.pitch * rotatorToRadian,
            player.location.yaw * rotatorToRadian,
            "ZYX"
          )
        }
      />
    );
  };

  const mapPosition = (player: Player): Vector3 => {
    const result = [
      ((player.location.X - minX) / (minX - maxX)) * 10 + 5,
      ((player.location.Y - minY) / (minY - maxY)) * -10 - 5,
      ((player.location.Z - minZ) / (minZ - maxZ)) * -10,
      // -7,
    ] as Vector3;

    // console.log("mapPosition", result);

    return result;
  };

  const mapBall = (ball: Ball): Vector3 => {
    const result = [
      ((ball.location.x - minX) / (minX - maxX)) * -10 - 5,
      ((ball.location.y - minY) / (minY - maxY)) * -10 - 5,
      ((ball.location.z - minZ) / (minZ - maxZ)) * -10,
      // -7,
    ] as Vector3;

    return result;
  };

  return (
    <div className="minimap3d">
      <Canvas
        camera={{
          position: [0, -9, 10],
          near: 0.1,
          far: 1000,
          rotation: [(45 * Math.PI) / 180, 0, 0],
          lookAt: (vector) => [0, 0, 0],
        }}
      >
        <Suspense fallback={null}>
          <MapPlane position={[0, 0, 0]} />
        </Suspense>
        {props.players?.map((player, index) =>
          player.team === 1 ? (
            <Suspense fallback={null}>
              <Car3D
                key={index}
                player={player}
                modelSrc="models/blue_car.glb"
              />
            </Suspense>
          ) : (
            <Suspense fallback={null}>
              <Car3D
                key={index}
                player={player}
                modelSrc="models/orange_car.glb"
              />
            </Suspense>
          )
        )}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <BallMesh position={mapBall(props.ball)} />
      </Canvas>
    </div>
  );
};

export default Minimap;
