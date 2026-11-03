
import { NativeTabs } from "expo-router/native-tabs";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/theme";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      tintColor="#58E1C1"
      labelStyle={{
        color: colors.text,
        selected: {
          color: "#58E1C1"
        }
      }}
    >
      {/* HOME */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>
          Home
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          sf="house.fill"
          md="home"
        />
      </NativeTabs.Trigger>

      {/* SOBRE */}
      <NativeTabs.Trigger name="about">
        <NativeTabs.Trigger.Label>
          Sobre
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          sf="person.fill"
          md="person"
        />
      </NativeTabs.Trigger>

      {/* EXPERIÊNCIA ACADÊMICA */}
      <NativeTabs.Trigger name="education">
        <NativeTabs.Trigger.Label>
          Acadêmica
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          sf="graduationcap.fill"
          md="school"
        />
      </NativeTabs.Trigger>

      {/* EXPERIÊNCIA PROFISSIONAL */}
      <NativeTabs.Trigger name="experience">
        <NativeTabs.Trigger.Label>
          Profissional
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          sf="briefcase.fill"
          md="work"
        />
      </NativeTabs.Trigger>

      {/* PROJETOS */}
      <NativeTabs.Trigger name="projects">
        <NativeTabs.Trigger.Label>
          Projetos
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          sf="folder.fill"
          md="folder"
        />
      </NativeTabs.Trigger>

    </NativeTabs>
  );
}
