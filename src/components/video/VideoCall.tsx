import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Video, VideoOff, Mic, MicOff,  PhoneOff, Monitor } from 'lucide-react';

export const VideoCall: React.FC = () => {
  const [isInCall, setIsInCall] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setIsInCall(true);
    } catch (error) {
      console.error('Error accessing camera/microphone:', error);
      alert('Cannot access camera or microphone. Please check permissions.');
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    
    setIsInCall(false);
    setVideoEnabled(true);
    setAudioEnabled(true);
    setIsScreenSharing(false);
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoEnabled;
        setVideoEnabled(!videoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioEnabled;
        setAudioEnabled(!audioEnabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        if (localStreamRef.current) {
          const videoTrack = localStreamRef.current.getVideoTracks()[0];
          if (videoTrack) {
            localStreamRef.current.removeTrack(videoTrack);
            videoTrack.stop();
          }
          localStreamRef.current.addTrack(screenStream.getVideoTracks()[0]);
          
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
          }
          
          screenStream.getVideoTracks()[0].onended = () => {
            toggleScreenShare();
          };
        }
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing screen:', error);
      }
    } else {
      // Stop screen sharing and revert to camera
      if (localStreamRef.current) {
        const screenTrack = localStreamRef.current.getVideoTracks()[0];
        if (screenTrack) {
          localStreamRef.current.removeTrack(screenTrack);
          screenTrack.stop();
        }
        
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const cameraTrack = cameraStream.getVideoTracks()[0];
        localStreamRef.current.addTrack(cameraTrack);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
        }
      }
      setIsScreenSharing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-medium text-gray-900">Video Call</h2>
        <p className="text-sm text-gray-500">Connect face-to-face with investors and entrepreneurs</p>
      </CardHeader>
      <CardBody>
        {!isInCall ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Video size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Ready to connect?</h3>
            <p className="text-gray-500 mb-6">Start a video call to discuss opportunities</p>
            <Button onClick={startCall} leftIcon={<Video size={18} />}>
              Start Call
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Video container */}
            <div className="relative bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full rounded-lg object-cover"
              />
              {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 rounded-lg">
                  <VideoOff size={48} className="text-gray-500" />
                </div>
              )}
            </div>

            {/* Call controls */}
            <div className="flex justify-center gap-3">
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${
                  videoEnabled ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 text-white'
                } transition-colors`}
              >
                {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
              </button>
              
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full ${
                  audioEnabled ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 text-white'
                } transition-colors`}
              >
                {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
              </button>
              
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full ${
                  isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                } transition-colors`}
              >
                <Monitor size={20} />
              </button>
              
              <button
                onClick={endCall}
                className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};