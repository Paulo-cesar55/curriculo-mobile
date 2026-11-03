
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot
} from "expo-router/ui";

import {
  View,
  Text,
  StyleSheet
} from "react-native";

const COLORS = {
  background: "#080D18",
  card: "#111A2B",
  primary: "#58E1C1",
  white: "#F4F7FC",
  muted: "#8995AA",
  border: "#243149"
};

export default function AppTabs() {
  return (
    <Tabs>
      {/* CONTEÚDO DAS TELAS */}
      <TabSlot style={styles.content} />

      {/* NAVEGAÇÃO */}
      <TabList style={styles.tabList}>

        <TabTrigger
          name="index"
          href="/"
          style={styles.tab}
        >
          <Text style={styles.tabText}>⌂ Home</Text>
        </TabTrigger>

        <TabTrigger
          name="about"
          href="/about"
          style={styles.tab}
        >
          <Text style={styles.tabText}>Sobre</Text>
        </TabTrigger>

        <TabTrigger
          name="education"
          href="/education"
          style={styles.tab}
        >
          <Text style={styles.tabText}>Acadêmica</Text>
        </TabTrigger>

        <TabTrigger
          name="experience"
          href="/experience"
          style={styles.tab}
        >
          <Text style={styles.tabText}>Profissional</Text>
        </TabTrigger>

        <TabTrigger
          name="projects"
          href="/projects"
          style={styles.tab}
        >
          <Text style={styles.tabText}>Projetos</Text>
        </TabTrigger>

      </TabList>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1
  },

  tabList: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 13,
    paddingHorizontal: 3
  },

  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10
  },

  tabText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center"
  }
});
