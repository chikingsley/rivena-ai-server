import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Inter } from "next/font/google";
import Head from "next/head";
import React, { useCallback, useState, useEffect, useRef } from "react";

import { PlaygroundConnect } from "@/components/PlaygroundConnect";
import Playground from "@/components/playground/Playground";
import { PlaygroundToast, ToastType } from "@/components/toast/PlaygroundToast";
import { ConfigProvider, useConfig } from "@/hooks/useConfig";
import { ConnectionMode, ConnectionProvider, useConnection } from "@/hooks/useConnection";
import { useMemo } from "react";
import { ToastProvider, useToast } from "@/components/toast/ToasterProvider";

const themeColors = [
  "cyan",
  "green",
  "amber",
  "blue",
  "violet",
  "rose",
  "pink",
  "teal",
];

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <ToastProvider>
      <ConfigProvider>
        <ConnectionProvider>
          <HomeInner />
        </ConnectionProvider>
      </ConfigProvider>
    </ToastProvider>
  );
}

export function HomeInner() {
  const { shouldConnect, wsUrl, token, mode, connect, disconnect } =
    useConnection();
  
  const {config} = useConfig();
  const { toastMessage, setToastMessage } = useToast();
  
  // Create a ref to track if we've already connected
  const didConnectRef = useRef(false);

  // Auto-connect when component mounts (only once)
  useEffect(() => {
    // Skip if we've already connected or are already in the process of connecting
    if (didConnectRef.current || shouldConnect) return;
    
    // Use a short timeout to ensure everything is initialized
    const timer = setTimeout(() => {
      if (!didConnectRef.current && !shouldConnect) {
        console.log("Auto-connecting with env mode");
        connect("env");
        didConnectRef.current = true; // Mark as connected
      }
    }, 200);
    
    return () => clearTimeout(timer);
  }, [shouldConnect, connect]); // Only re-run if shouldConnect or connect changes

  const handleConnect = useCallback(
    async (c: boolean, mode: ConnectionMode) => {
      c ? connect(mode) : disconnect();
    },
    [connect, disconnect]
  );

  // Always show the playground
  const showPG = true;
  
  // Handle AudioContext initialization
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  
  // Function to initialize AudioContext with user interaction
  const initializeAudioContext = useCallback(() => {
    // Create and resume AudioContext to handle the browser requirement
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (audioContext.state === 'suspended') {
      audioContext.resume().then(() => {
        console.log('AudioContext resumed successfully');
        setAudioContextInitialized(true);
      });
    } else {
      setAudioContextInitialized(true);
    }
  }, []);

  return (
    <>
      <Head>
        <title>{config.title}</title>
        <meta name="description" content={config.description} />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta
          property="og:image"
          content="https://livekit.io/images/og/agents-playground.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="relative flex flex-col justify-center px-4 items-center h-full w-full bg-black repeating-square-background">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              className="left-0 right-0 top-0 absolute z-10"
              initial={{ opacity: 0, translateY: -50 }}
              animate={{ opacity: 1, translateY: 0 }}
              exit={{ opacity: 0, translateY: -50 }}
            >
              <PlaygroundToast />
            </motion.div>
          )}
        </AnimatePresence>
        {!audioContextInitialized && shouldConnect ? (
          <div className="flex flex-col items-center justify-center p-8 text-white bg-black/30 backdrop-blur-sm rounded-lg border border-gray-800 shadow-xl">
            <h2 className="text-xl mb-4">Enable Audio</h2>
            <p className="mb-6 text-gray-400 text-sm">Browser security requires a user interaction before audio can be enabled.</p>
            <button 
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg shadow-lg"
              onClick={initializeAudioContext}
            >
              Click to Enable Audio
            </button>
          </div>
        ) : showPG ? (
          <LiveKitRoom
            className="flex flex-col h-full w-full"
            serverUrl={wsUrl}
            token={token}
            connect={shouldConnect}
            onError={(e) => {
              setToastMessage({ message: e.message, type: "error" });
              console.error(e);
            }}
          >
            <Playground
              themeColors={themeColors}
              onConnect={(c) => {
                const m = process.env.NEXT_PUBLIC_LIVEKIT_URL ? "env" : mode;
                handleConnect(c, m);
              }}
            />
            <RoomAudioRenderer />
          </LiveKitRoom>
        ) : (
          <PlaygroundConnect
            accentColor={themeColors[0]}
            onConnectClicked={(mode) => {
              handleConnect(true, mode);
            }}
          />
        )}
      </main>
    </>
  );
}