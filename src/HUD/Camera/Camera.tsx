import React, { useEffect, useState } from "react";
import { mediaStreams } from "./mediaStream";
import { v4 as uuidv4 } from "uuid";
import "./index.scss";
type Props = {
  steamid: string;
  visible: boolean;
};

const CameraView = ({ steamid, visible }: Props) => {
  const [uuid] = useState(uuidv4());
  const [forceHide, setForceHide] = useState(false);

  useEffect(() => {}, []);

  useEffect(() => {
    const mountStream = (stream: MediaStream) => {
      console.log("mounting video");
      const remoteVideo = document.getElementById(
        `remote-video-${steamid}-${uuid}`
      ) as HTMLVideoElement;
      if (!remoteVideo || !stream) {
        console.log("no video element");
      }
      if (!remoteVideo || !stream) return;

      remoteVideo.srcObject = stream;

      remoteVideo.play();
    };

    const mountExistingStream = () => {
      const currentStream = mediaStreams.players.find(
        (player) => player.steamid === steamid
      );
      if (
        !currentStream ||
        !currentStream.peerConnection ||
        !currentStream.peerConnection._remoteStreams
      )
        return;

      const stream = currentStream.peerConnection._remoteStreams[0];

      if (!stream) return;

      mountStream(stream);
    };

    const onStreamCreate = (stream: MediaStream) => {
      mountStream(stream);
    };

    const onStreamDestroy = () => {
      const remoteVideo = document.getElementById(
        `remote-video-${steamid}-${uuid}`
      ) as HTMLVideoElement;

      if (!remoteVideo) return;
      console.log("WTF", remoteVideo);
      remoteVideo.srcObject = null;
    };

    const onBlockedUpdate = (steamids: string[]) => {
      setForceHide(steamids.includes(steamid));
    };

    mediaStreams.onStreamCreate(onStreamCreate, steamid);
    mediaStreams.onStreamDestroy(onStreamDestroy, steamid);
    mediaStreams.onBlockedUpdate(onBlockedUpdate);

    mountExistingStream();

    return () => {
      mediaStreams.removeListener(onStreamCreate);
      mediaStreams.removeListener(onStreamDestroy);
      mediaStreams.removeListener(onBlockedUpdate);
    };
  }, [steamid]);

  return (
    <div className="cameras-container">
      <video
        className="video-call-preview"
        autoPlay
        muted
        id={`remote-video-${steamid}-${uuid}`}
        style={{ opacity: visible && !forceHide ? 1 : 0.001 }}
      ></video>
    </div>
  );
};

export default CameraView;
