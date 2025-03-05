// EnhancedVoiceClient.tsx

import { AnimatePresence, motion } from 'framer-motion';
import {
  LiveKitRoom,
  useVoiceAssistant,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  AgentState,
  DisconnectButton,
  BarVisualizer,
} from '@livekit/components-react';
import { useCallback, useEffect, useState } from 'react';
import { MediaDeviceFailure } from 'livekit-client';
import { NoAgentNotification } from '../components/NoAgentNotification';
import { useKrispNoiseFilter } from '@livekit/components-react/krisp';
import { Button } from '../components/ui/button';
import {
  Card,
  CardContent
} from '../components/ui/card';
import { Mic, MicOff, Volume2, BrainCircuit, PhoneOff, Phone } from 'lucide-react';

export type ConnectionDetails = {
  serverUrl: string;
  roomName: string;
  participantName: string;
  participantToken: string;
};

export default function Page() {
  const [connectionDetails, updateConnectionDetails] = useState<
    ConnectionDetails | undefined
  >(undefined);
  const [agentState, setAgentState] = useState<AgentState>('disconnected');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const onConnectButtonClicked = useCallback(async () => {
    try {
      setIsConnecting(true);
      // Generate random room and participant names
      const participantIdentity = `user_${Math.floor(Math.random() * 10_000)}`;
      const roomName = `room_${Math.floor(Math.random() * 10_000)}`;

      // Get a token from our Elysia server using regular fetch API
      const token = await fetch(`http://localhost:3000/livekit/token/${roomName}/${participantIdentity}`).then(r => r.text());

      if (token) {
        // Create connection details
        updateConnectionDetails({
          serverUrl: import.meta.env.VITE_LIVEKIT_URL as string,
          roomName,
          participantName: participantIdentity,
          participantToken: token,
        });
      } else {
        console.error('Failed to get token');
      }
    } catch (error) {
      console.error('Error connecting to LiveKit:', error);
      alert('Failed to connect to LiveKit server. Please check your console for details.');
    } finally {
      setIsConnecting(false);
    }
  }, []);

  return (
    <main
      data-lk-theme="default"
      className="h-full flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800"
    >
      <Card className="max-w-3xl w-full mx-auto rounded-xl bg-slate-800/80 backdrop-blur-sm border border-slate-700 shadow-xl overflow-hidden">
        <CardContent className="p-6">
          <LiveKitRoom
            token={connectionDetails?.participantToken}
            serverUrl={connectionDetails?.serverUrl}
            connect={connectionDetails !== undefined}
            audio={true}
            video={false}
            onMediaDeviceFailure={onDeviceFailure}
            onDisconnected={() => {
              updateConnectionDetails(undefined);
            }}
            className="flex flex-col gap-6"
          >
            <div className="relative">
              <AgentStatusIndicator state={agentState} />
              <VoiceVisualizer onStateChange={setAgentState} />
            </div>

            <EnhancedControlBar
              onConnectButtonClicked={onConnectButtonClicked}
              agentState={agentState}
              isConnecting={isConnecting}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
            />

            <RoomAudioRenderer />
            <NoAgentNotification state={agentState} />
          </LiveKitRoom>
        </CardContent>
      </Card>
    </main>
  );
}

// Enhanced agent status indicator with animations
function AgentStatusIndicator({ state }: { state: AgentState }) {
  if (state === 'disconnected' || state === 'connecting') return null;

  const getStatusDetails = () => {
    switch (state) {
    case 'speaking':
      return {
        text: 'AI is speaking',
        icon: <Volume2 className="h-4 w-4 mr-2" />,
        color: 'bg-green-500/90',
        ring: 'ring-green-500/30'
      };
    case 'listening':
      return {
        text: 'Listening...',
        icon: <Mic className="h-4 w-4 mr-2" />,
        color: 'bg-blue-500/90',
        ring: 'ring-blue-500/30'
      };
    case 'thinking':
      return {
        text: 'Processing...',
        icon: <BrainCircuit className="h-4 w-4 mr-2" />,
        color: 'bg-amber-500/90',
        ring: 'ring-amber-500/30'
      };
    default:
      return {
        text: 'Connected',
        icon: null,
        color: 'bg-slate-500/90',
        ring: 'ring-slate-500/30'
      };
    }
  };

  const { text, icon, color, ring } = getStatusDetails();

  return (
    <motion.div
      className="absolute top-4 left-0 right-0 flex justify-center z-10"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`${color} text-white text-sm px-4 py-1.5 rounded-full flex items-center shadow-md
        ring-2 ${ring} backdrop-blur-sm`}>
        {icon}
        <span>{text}</span>
        {state === 'speaking' && (
          <span className="relative ml-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Enhanced voice visualizer with better visibility
function VoiceVisualizer(props: {
  onStateChange: (state: AgentState) => void;
}) {
  const { state, audioTrack } = useVoiceAssistant();

  // Update parent component with state changes
  useEffect(() => {
    console.log('Voice assistant state changed:', state);
    props.onStateChange(state);
  }, [state, props.onStateChange]);

  // Get background and accent colors based on state
  const getColors = () => {
    switch (state) {
    case 'speaking':
      return { bg: 'from-green-950 to-slate-900', border: 'border-green-700/30' };
    case 'listening':
      return { bg: 'from-blue-950 to-slate-900', border: 'border-blue-700/30' };
    case 'thinking':
      return { bg: 'from-amber-950 to-slate-900', border: 'border-amber-700/30' };
    default:
      return { bg: 'from-slate-900 to-slate-950', border: 'border-slate-700/30' };
    }
  };

  const { bg, border } = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="w-full"
    >
      <Card className={`h-[320px] w-full bg-gradient-to-b ${bg} rounded-xl p-6 ${border} shadow-inner`}>
        <CardContent className="flex items-center justify-center h-full p-0">
          <div className="w-full h-full relative">
            <BarVisualizer
              state={state}
              barCount={5}
              trackRef={audioTrack}
              className="agent-visualizer"
              options={{ minHeight: 24 }}
            />
            {/* Status message that appears when no activity */}
            {state === 'ready' && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                <p>Ready for conversation</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Enhanced control bar with better buttons
function EnhancedControlBar(props: {
  onConnectButtonClicked: () => void;
  agentState: AgentState;
  isConnecting: boolean;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}) {
  const krisp = useKrispNoiseFilter();
  useEffect(() => {
    if (krisp) {
      krisp.setNoiseFilterEnabled(true);
    }
  }, [krisp]);

  // Toggle mute state
  const handleMuteToggle = useCallback(() => {
    props.setIsMuted(!props.isMuted);
    // Add actual microphone muting logic here
  }, [props]);

  return (
    <div className="flex justify-center items-center py-2">
      <AnimatePresence mode="wait">
        {props.agentState === 'disconnected' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Button
              size="lg"
              className="font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-full px-8 shadow-lg"
              onClick={props.onConnectButtonClicked}
              disabled={props.isConnecting}
            >
              {props.isConnecting ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="mr-2 h-5 w-5" />
                  Start Conversation
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {props.agentState !== 'disconnected' && props.agentState !== 'connecting' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-4"
          >
            {/* Mute/Unmute Button */}
            <Button
              variant={props.isMuted ? 'destructive' : 'secondary'}
              size="lg"
              className="h-12 w-12 rounded-full shadow-md"
              onClick={handleMuteToggle}
            >
              {props.isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>

            {/* Use the same style for VoiceAssistantControlBar */}
            <div className="flex items-center">
              <VoiceAssistantControlBar
                controls={{ leave: false }}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 h-12 rounded-full shadow-md px-6"
              />
            </div>

            {/* End Call Button - Fixed to avoid nested buttons */}
            <DisconnectButton>
              <div className="h-12 w-12 rounded-full shadow-md bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 cursor-pointer">
                <PhoneOff className="h-5 w-5" />
              </div>
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function onDeviceFailure(error?: MediaDeviceFailure) {
  console.error(error);
  alert(
    'Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab'
  );
}