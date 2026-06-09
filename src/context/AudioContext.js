import { createContext, useContext  } from "react";

export const AudioContext = createContext(null);

export function useAudioContext(){
    return useContext(AudioContext);
}