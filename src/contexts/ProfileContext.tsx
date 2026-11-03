
import React, {
  createContext,
  useContext,
  useState,
  ReactNode
} from "react";

interface ProfileContextData {
  selectedPersonId: string | null;
  setSelectedPersonId: (id: string | null) => void;
}

const ProfileContext = createContext<ProfileContextData>(
  {} as ProfileContextData
);

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({
  children
}: ProfileProviderProps) {
  const [selectedPersonId, setSelectedPersonId] =
    useState<string | null>(null);

  return (
    <ProfileContext.Provider
      value={{
        selectedPersonId,
        setSelectedPersonId
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
