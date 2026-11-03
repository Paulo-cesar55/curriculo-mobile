
import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Linking,
  RefreshControl
} from "react-native";

import { getCurriculum } from "../services/api";
import type { Curriculum, Project } from "../services/api";
import { useProfile } from "../contexts/ProfileContext";

const COLORS = {
  background: "#080D18",
  card: "#111A2B",
  cardLight: "#18243A",
  primary: "#58E1C1",
  blue: "#5C91FF",
  white: "#F4F7FC",
  muted: "#8995AA",
  border: "#243149"
};

// Formatar datas do PostgreSQL
function formatDate(date?: string | null) {
  if (!date) return "Não informado";

  const dateOnly = date.substring(0, 10);

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);

  if (!match) return date;

  const [, year, month, day] = match;

  return `${day}/${month}/${year}`;
}

// Abrir links externos
function openLink(url?: string | null) {
  if (!url) return;

  Linking.openURL(url).catch((error) => {
    console.error("Erro ao abrir link:", error);
  });
}

// Card de projeto
function ProjectCard({ project }: { project: Project }) {
  return (
    <View style={styles.projectCard}>
      <View style={styles.cardTop}>
        <View style={styles.projectIcon}>
          <Text style={styles.projectIconText}>
            {"</>"}
          </Text>
        </View>

        {project.is_featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>
              ★ DESTAQUE
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.projectTitle}>
        {project.title}
      </Text>

      <Text style={styles.projectDescription}>
        {project.description || "Descrição não cadastrada."}
      </Text>

      {/* PERÍODO */}

      {(project.start_date || project.end_date) && (
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>
            PERÍODO DE DESENVOLVIMENTO
          </Text>

          <Text style={styles.dateValue}>
            {formatDate(project.start_date)}
            {"  —  "}
            {formatDate(project.end_date)}
          </Text>
        </View>
      )}

      {/* LINKS */}

      <View style={styles.linksContainer}>
        {project.repository_url && (
          <Pressable
            style={styles.repositoryButton}
            onPress={() => openLink(project.repository_url)}
          >
            <Text style={styles.repositoryText}>
              GitHub ↗
            </Text>
          </Pressable>
        )}

        {project.demo_url && (
          <Pressable
            style={styles.demoButton}
            onPress={() => openLink(project.demo_url)}
          >
            <Text style={styles.demoText}>
              Demonstração ↗
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default function ProjectsScreen() {
  const { selectedPersonId } = useProfile();

  const [curriculum, setCurriculum] =
    useState<Curriculum | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Buscar projetos do currículo selecionado
  useEffect(() => {
    let active = true;

    async function loadProjects() {
      if (selectedPersonId === null) {
        setCurriculum(null);
        setLoading(false);
        return;
      }

      const personId: string = selectedPersonId;

      try {
        setLoading(true);
        setError("");

        const data = await getCurriculum(personId);

        if (active) {
          setCurriculum(data);
        }
      } catch (err) {
        console.error("Erro ao carregar projetos:", err);

        if (active) {
          setError("Não foi possível carregar os projetos.");
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadProjects();

    return () => {
      active = false;
    };
  }, [selectedPersonId, refreshing]);

  function handleRefresh() {
    setRefreshing(true);
  }

  // Carregamento
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Carregando projetos...
        </Text>
      </View>
    );
  }

  // Perfil não selecionado
  if (selectedPersonId === null) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>
          Nenhum currículo selecionado
        </Text>

        <Text style={styles.emptyDescription}>
          Acesse a Home e selecione uma pessoa.
        </Text>
      </View>
    );
  }

  // Erro
  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  const projects = curriculum?.projects || [];

  const featuredProjects = projects.filter(
    (project) => project.is_featured
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* CABEÇALHO */}

        <Text style={styles.brand}>
          CURRÍCULO DIGITAL
        </Text>

        <Text style={styles.title}>
          Meus projetos
        </Text>

        <Text style={styles.subtitle}>
          Conheça os projetos que desenvolvi e as tecnologias
          utilizadas em cada um deles.
        </Text>

        {/* RESUMO */}

        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {projects.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Projetos
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {featuredProjects.length}
            </Text>

            <Text style={styles.summaryLabel}>
              Em destaque
            </Text>
          </View>
        </View>

        {/* PROJETOS EM DESTAQUE */}

        {featuredProjects.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Projetos em destaque
            </Text>

            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
              />
            ))}
          </>
        )}

        {/* TODOS OS PROJETOS */}

        <Text style={styles.sectionTitle}>
          Todos os projetos
        </Text>

        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              {"</>"}
            </Text>

            <Text style={styles.emptyTitle}>
              Nenhum projeto cadastrado
            </Text>

            <Text style={styles.emptyDescription}>
              Os projetos desta pessoa aparecerão aqui
              quando forem cadastrados no sistema.
            </Text>
          </View>
        )}

        {/* TECNOLOGIAS */}

        {curriculum && curriculum.skills.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Tecnologias do desenvolvedor
            </Text>

            <View style={styles.skillsContainer}>
              {curriculum.skills.map((skill) => (
                <View
                  key={skill.id}
                  style={styles.skillBadge}
                >
                  <Text style={styles.skillText}>
                    {skill.name}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* RODAPÉ */}

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>
            CURRÍCULO DIGITAL
          </Text>

          <Text style={styles.footerText}>
            Transformando ideias em projetos.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  content: {
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 40
  },

  brand: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 2
  },

  title: {
    color: COLORS.white,
    fontSize: 30,
    fontWeight: "900",
    marginTop: 12
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 8
  },

  summaryContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 25
  },

  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    padding: 18
  },

  summaryNumber: {
    color: COLORS.primary,
    fontSize: 27,
    fontWeight: "900"
  },

  summaryLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 5
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 32,
    marginBottom: 18
  },

  projectCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 19,
    marginBottom: 15
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18
  },

  projectIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center"
  },

  projectIconText: {
    color: COLORS.primary,
    fontSize: 17,
    fontWeight: "900"
  },

  featuredBadge: {
    backgroundColor: "#15352F",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20
  },

  featuredText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900"
  },

  projectTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 24
  },

  projectDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 21,
    marginTop: 10
  },

  dateContainer: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    padding: 13,
    marginTop: 17
  },

  dateLabel: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1
  },

  dateValue: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 7
  },

  linksContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18
  },

  repositoryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 10
  },

  repositoryText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: "900"
  },

  demoButton: {
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 10
  },

  demoText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "800"
  },

  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9
  },

  skillBadge: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10
  },

  skillText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700"
  },

  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 27,
    alignItems: "center"
  },

  emptyIcon: {
    color: COLORS.primary,
    fontSize: 30,
    fontWeight: "900"
  },

  emptyTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 15
  },

  emptyDescription: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 20,
    marginTop: 9
  },

  footer: {
    alignItems: "center",
    marginTop: 38
  },

  footerBrand: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 8
  },

  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 25
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 15
  },

  emptyDescriptionUnused: {
    color: COLORS.muted
  },

  emptyTitleUnused: {
    color: COLORS.white
  },

  errorText: {
    color: "#FF7777",
    fontSize: 13,
    textAlign: "center"
  }
});
