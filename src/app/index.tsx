
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";

import {
  getCurriculum,
  getPersons
} from "../services/api";

import type {
  Curriculum,
  Person
} from "../services/api";

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

export default function HomeScreen() {
  const [persons, setPersons] = useState<Person[]>([]);

  // Utiliza o contexto compartilhado entre as telas
  const {
    selectedPersonId: selectedId,
    setSelectedPersonId: setSelectedId
  } = useProfile();

  const [curriculum, setCurriculum] =
    useState<Curriculum | null>(null);

  const [loadingPeople, setLoadingPeople] = useState(true);
  const [loadingCurriculum, setLoadingCurriculum] = useState(false);

  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // =====================================
  // BUSCAR PESSOAS CADASTRADAS
  // =====================================

  useEffect(() => {
    let active = true;

    async function loadPeople() {
      try {
        setLoadingPeople(true);
        setError("");

        const data = await getPersons();

        const allowedEmails = [
          "paulo.curriculo@example.com",
          "lucas.henrique@example.com"
        ];

        const profiles = data.filter((person) =>
          allowedEmails.includes(person.email)
        );

        if (!active) return;

        setPersons(profiles);

        if (profiles.length > 0) {
          const selectedProfileStillExists = profiles.some(
            (person) => String(person.id) === selectedId
          );

          if (!selectedProfileStillExists) {
            setSelectedId(String(profiles[0].id));
          }
        } else {
          setSelectedId(null);
          setError("Nenhum currículo cadastrado.");
        }

      } catch (err) {
        console.error("Erro ao buscar pessoas:", err);

        if (active) {
          setPersons([]);
          setSelectedId(null);
          setError("Não foi possível conectar ao servidor.");
        }

      } finally {
        if (active) {
          setLoadingPeople(false);
        }
      }
    }

    loadPeople();

    return () => {
      active = false;
    };

  }, [refreshKey]);

  // =====================================
  // BUSCAR CURRÍCULO COMPLETO
  // =====================================

  useEffect(() => {
    if (selectedId === null) {
      setCurriculum(null);
      return;
    }

    // selectedId já foi verificado como não nulo
    const personId: string = selectedId;

    let active = true;

    async function loadCurriculum() {
      try {
        setLoadingCurriculum(true);
        setCurriculum(null);
        setError("");

        const data = await getCurriculum(personId);

        if (active) {
          setCurriculum(data);
        }

      } catch (err) {
        console.error("Erro ao buscar currículo:", err);

        if (active) {
          setError("Não foi possível carregar este currículo.");
        }

      } finally {
        if (active) {
          setLoadingCurriculum(false);
        }
      }
    }

    loadCurriculum();

    return () => {
      active = false;
    };

  }, [selectedId]);

  // =====================================
  // ABRIR LINKS EXTERNOS
  // =====================================

  function openLink(url?: string | null) {
    if (!url) return;

    Linking.openURL(url).catch((err) => {
      console.error("Erro ao abrir link:", err);
    });
  }

  // =====================================
  // TENTAR NOVAMENTE
  // =====================================

  function handleRetry() {
    setRefreshKey((current) => current + 1);
  }

  // =====================================
  // CARREGAMENTO INICIAL
  // =====================================

  if (loadingPeople) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Carregando portfólio...
        </Text>
      </View>
    );
  }

  // =====================================
  // TRATAMENTO DE ERROS
  // =====================================

  if (error && !curriculum && !loadingCurriculum) {
    return (
      <View style={styles.loading}>
        <Text style={styles.error}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={handleRetry}
        >
          <Text style={styles.retryText}>
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  }

  // =====================================
  // DADOS DO CURRÍCULO
  // =====================================

  const person = curriculum?.person;

  const featuredProjects =
    curriculum?.projects.filter(
      (project) => project.is_featured
    ) || [];

  const skills = curriculum?.skills || [];

  // =====================================
  // INTERFACE PRINCIPAL
  // =====================================

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* CABEÇALHO */}

        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>
              CURRÍCULO DIGITAL
            </Text>

            <Text style={styles.headerSubtitle}>
              Desenvolvedor • Portfólio
            </Text>
          </View>

          <View style={styles.status}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>
              ONLINE
            </Text>
          </View>
        </View>

        {/* SELEÇÃO DE PERFIL */}

        <Text style={styles.sectionLabel}>
          VISUALIZAR CURRÍCULO
        </Text>

        <View style={styles.profileSelector}>
          {persons.map((item) => {
            const active =
              String(item.id) === selectedId;

            return (
              <Pressable
                key={item.id}
                onPress={() =>
                  setSelectedId(String(item.id))
                }
                style={[
                  styles.profileButton,
                  active && styles.profileButtonActive
                ]}
              >
                <Text
                  style={[
                    styles.profileButtonText,
                    active && styles.profileButtonTextActive
                  ]}
                >
                  {item.full_name.split(" ")[0]}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* CARREGAMENTO DO CURRÍCULO */}

        {loadingCurriculum ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
            />

            <Text style={styles.loadingText}>
              Buscando informações...
            </Text>
          </View>

        ) : curriculum && person ? (

          <>

            {/* APRESENTAÇÃO */}

            <View style={styles.hero}>
              <View style={styles.heroTop}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {person.full_name
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((word) => word[0])
                      .join("")
                      .toUpperCase()}
                  </Text>
                </View>

                <View style={styles.availableBadge}>
                  <View style={styles.statusDot} />

                  <Text style={styles.availableText}>
                    PORTFÓLIO DIGITAL
                  </Text>
                </View>
              </View>

              <Text style={styles.greeting}>
                Olá, eu sou
              </Text>

              <Text style={styles.name}>
                {person.full_name}
              </Text>

              <Text style={styles.role}>
                Desenvolvedor em formação
              </Text>

              <Text style={styles.bio}>
                {person.bio ||
                  "Conheça minha trajetória acadêmica e meus projetos."}
              </Text>

              <Text style={styles.location}>
                {[person.city, person.state]
                  .filter(Boolean)
                  .join(" • ")}
              </Text>

              {/* LINKS DO PERFIL */}

              <View style={styles.heroActions}>
                {person.github_url && (
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() =>
                      openLink(person.github_url)
                    }
                  >
                    <Text style={styles.primaryButtonText}>
                      GitHub ↗
                    </Text>
                  </Pressable>
                )}

                {person.linkedin_url && (
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() =>
                      openLink(person.linkedin_url)
                    }
                  >
                    <Text style={styles.secondaryButtonText}>
                      LinkedIn ↗
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>

            {/* INDICADORES */}

            <Text style={styles.sectionTitle}>
              Visão geral
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {curriculum.education.length}
                </Text>

                <Text style={styles.statLabel}>
                  Formações
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {curriculum.experiences.length}
                </Text>

                <Text style={styles.statLabel}>
                  Experiências
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {curriculum.projects.length}
                </Text>

                <Text style={styles.statLabel}>
                  Projetos
                </Text>
              </View>
            </View>

            {/* TECNOLOGIAS */}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Tecnologias
              </Text>

              <Text style={styles.sectionCount}>
                {skills.length} habilidades
              </Text>
            </View>

            <View style={styles.skillsContainer}>
              {skills.map((skill) => (
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

            {/* PROJETOS EM DESTAQUE */}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Projetos em destaque
              </Text>

              <Text style={styles.sectionCount}>
                {featuredProjects.length} projetos
              </Text>
            </View>

            {featuredProjects.length > 0 ? (

              featuredProjects.map((project) => (
                <View
                  key={project.id}
                  style={styles.projectCard}
                >
                  <View style={styles.projectIcon}>
                    <Text style={styles.projectIconText}>
                      {"</>"}
                    </Text>
                  </View>

                  <Text style={styles.projectTitle}>
                    {project.title}
                  </Text>

                  <Text style={styles.projectDescription}>
                    {project.description || "Sem descrição disponível."}
                  </Text>

                  {project.repository_url && (
                    <Pressable
                      onPress={() =>
                        openLink(project.repository_url)
                      }
                      style={styles.projectLink}
                    >
                      <Text style={styles.projectLinkText}>
                        Ver repositório ↗
                      </Text>
                    </Pressable>
                  )}

                  {project.demo_url && (
                    <Pressable
                      onPress={() =>
                        openLink(project.demo_url)
                      }
                      style={styles.projectLink}
                    >
                      <Text style={styles.projectLinkText}>
                        Ver demonstração ↗
                      </Text>
                    </Pressable>
                  )}
                </View>
              ))

            ) : (

              <Text style={styles.emptyText}>
                Nenhum projeto em destaque cadastrado.
              </Text>

            )}

            {/* CERTIFICADOS */}

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Certificados
              </Text>

              <Text style={styles.sectionCount}>
                {curriculum.certifications.length}
              </Text>
            </View>

            {curriculum.certifications.map((certificate) => (
              <View
                key={certificate.id}
                style={styles.certificateCard}
              >
                <Text style={styles.projectTitle}>
                  {certificate.name}
                </Text>

                <Text style={styles.projectDescription}>
                  {certificate.institution || "Instituição não informada"}
                </Text>
              </View>
            ))}

            {/* RODAPÉ */}

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Desenvolvido com React Native + Expo
              </Text>

              <Text style={styles.footerBrand}>
                CURRÍCULO DIGITAL © 2026
              </Text>
            </View>

          </>

        ) : null}

      </ScrollView>
    </View>
  );
}

// =====================================
// ESTILIZAÇÃO
// =====================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },

  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 55,
    paddingBottom: 40
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32
  },

  brand: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2
  },

  headerSubtitle: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5
  },

  status: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#142A2B",
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 20
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    marginRight: 6
  },

  statusText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "800"
  },

  sectionLabel: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 12
  },

  profileSelector: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 25
  },

  profileButton: {
    paddingHorizontal: 19,
    paddingVertical: 11,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border
  },

  profileButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },

  profileButtonText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: "600"
  },

  profileButtonTextActive: {
    color: COLORS.background,
    fontWeight: "800"
  },

  hero: {
    backgroundColor: COLORS.card,
    borderRadius: 25,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border
  },

  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25
  },

  avatar: {
    width: 65,
    height: 65,
    backgroundColor: COLORS.cardLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center"
  },

  avatarText: {
    color: COLORS.primary,
    fontSize: 22,
    fontWeight: "900"
  },

  availableBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#142A2B",
    padding: 9,
    borderRadius: 20
  },

  availableText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "800"
  },

  greeting: {
    color: COLORS.muted,
    fontSize: 15
  },

  name: {
    color: COLORS.white,
    fontSize: 29,
    fontWeight: "900",
    marginTop: 6,
    lineHeight: 36
  },

  role: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 10
  },

  bio: {
    color: "#B2BDCE",
    fontSize: 14,
    lineHeight: 23,
    marginTop: 18
  },

  location: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 14
  },

  heroActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 23
  },

  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 11
  },

  primaryButtonText: {
    color: COLORS.background,
    fontWeight: "900",
    fontSize: 12
  },

  secondaryButton: {
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 11
  },

  secondaryButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 12
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "800",
    marginTop: 28,
    marginBottom: 15
  },

  statsContainer: {
    flexDirection: "row",
    gap: 11
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 17,
    padding: 16
  },

  statNumber: {
    color: COLORS.primary,
    fontSize: 27,
    fontWeight: "900"
  },

  statLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 6
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },

  sectionCount: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 28
  },

  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9
  },

  skillBadge: {
    backgroundColor: COLORS.card,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border
  },

  skillText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "700"
  },

  projectCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 19,
    marginBottom: 13
  },

  projectIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.cardLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14
  },

  projectIconText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "900"
  },

  projectTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800"
  },

  projectDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 20,
    marginTop: 9
  },

  projectCardUnused: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 19
  },

  projectLink: {
    marginTop: 17
  },

  projectLinkText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800"
  },

  certificateCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 13
  },

  footer: {
    alignItems: "center",
    paddingTop: 35
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 11
  },

  footerBrand: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 2,
    marginTop: 9
  },

  loading: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 30
  },

  loadingCard: {
    padding: 40,
    alignItems: "center"
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 15
  },

  error: {
    color: "#FF7777",
    fontSize: 14,
    textAlign: "center"
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 20
  },

  retryText: {
    color: COLORS.background,
    fontWeight: "800"
  }

});
