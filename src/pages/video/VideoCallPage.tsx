import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const VideoCallPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isInCall, setIsInCall] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, user]);

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

  // If not authenticated, show nothing (will redirect)
  if (!isAuthenticated && !user) {
    return null;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Call</h1>
          <p className="text-gray-600">Connect face-to-face with investors and entrepreneurs</p>
        </div>
        <Link to={user?.role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor'}>
  <Button variant="outline" leftIcon={<ArrowLeft size={18} />}>
    Back to Dashboard
  </Button>
</Link>
      </div>

      <Card>
        <CardBody>
          {!isInCall ? (
            <div className="text-center py-8 sm:py-12 md:py-16">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Video size={32} className="text-gray-400 sm:w-10 sm:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl font-medium mb-2">Ready to connect?</h3>
              <p className="text-gray-500 mb-6 text-sm sm:text-base">Start a video call to discuss opportunities</p>
              <Button onClick={startCall} leftIcon={<Video size={18} />} className="w-full sm:w-auto">
                Start Call
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Video container */}
              <div className="relative bg-gray-900 rounded-lg aspect-video flex items-center justify-center overflow-hidden">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {!videoEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                    <VideoOff size={48} className="text-gray-500" />
                  </div>
                )}
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-red-500 text-white px-2 py-1 rounded-lg text-xs sm:text-sm">
                  {isScreenSharing ? 'Screen Sharing' : 'Live Call'}
                </div>
              </div>

              {/* Call controls */}
              <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
                <button
                  onClick={toggleVideo}
                  className={`p-2 sm:p-3 rounded-full transition-colors ${
                    videoEnabled ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 text-white'
                  }`}
                >
                  {videoEnabled ? <Video size={18} className="sm:w-5 sm:h-5" /> : <VideoOff size={18} className="sm:w-5 sm:h-5" />}
                </button>
                
                <button
                  onClick={toggleAudio}
                  className={`p-2 sm:p-3 rounded-full transition-colors ${
                    audioEnabled ? 'bg-gray-200 hover:bg-gray-300' : 'bg-red-500 text-white'
                  }`}
                >
                  {audioEnabled ? <Mic size={18} className="sm:w-5 sm:h-5" /> : <MicOff size={18} className="sm:w-5 sm:h-5" />}
                </button>
                
                <button
                  onClick={toggleScreenShare}
                  className={`p-2 sm:p-3 rounded-full transition-colors ${
                    isScreenSharing ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                >
                  <Monitor size={18} className="sm:w-5 sm:h-5" />
                </button>
                
                <button
                  onClick={endCall}
                  className="p-2 sm:p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <PhoneOff size={18} className="sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};