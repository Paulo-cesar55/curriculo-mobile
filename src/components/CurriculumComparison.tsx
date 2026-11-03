
import React, { useState } from "react";

import {
  View,
  Text,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator
} from "react-native";

import {
  getPersons,
  getCurriculum
} from "../services/api";

import type { Curriculum } from "../services/api";

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

interface ComparisonData {
  paulo: Curriculum;
  lucas: Curriculum;
}

export default function CurriculumComparison() {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] =
    useState<ComparisonData | null>(null);
  const [error, setError] = useState("");

  // Buscar os dois currículos no backend
  async function loadComparison() {
    try {
      setLoading(true);
      setError("");

      const people = await getPersons();

      const paulo = people.find(
        (person) =>
          person.email === "paulo.curriculo@example.com"
      );

      const lucas = people.find(
        (person) =>
          person.email === "lucas.henrique@example.com"
      );

      if (!paulo || !lucas) {
        throw new Error("Os dois currículos não foram encontrados.");
      }

      const [pauloData, lucasData] = await Promise.all([
        getCurriculum(paulo.id),
        getCurriculum(lucas.id)
      ]);

      setComparison({
        paulo: pauloData,
        lucas: lucasData
      });

    } catch (err) {
      console.error("Erro ao comparar currículos:", err);

      setError(
        "Não foi possível carregar os currículos para comparação."
      );

    } finally {
      setLoading(false);
    }
  }

  // Abrir comparação
  async function handleOpen() {
    setVisible(true);

    if (!comparison) {
      await loadComparison();
    }
  }

  const pauloSkills = comparison?.paulo.skills || [];
  const lucasSkills = comparison?.lucas.skills || [];

  // Encontrar habilidades em comum
  const commonSkills = pauloSkills.filter((skill) =>
    lucasSkills.some(
      (other) =>
        other.name.toLowerCase() === skill.name.toLowerCase()
    )
  );

  const pauloExclusiveSkills = pauloSkills.filter((skill) =>
    !lucasSkills.some(
      (other) =>
        other.name.toLowerCase() === skill.name.toLowerCase()
    )
  );

  const lucasExclusiveSkills = lucasSkills.filter((skill) =>
    !pauloSkills.some(
      (other) =>
        other.name.toLowerCase() === skill.name.toLowerCase()
    )
  );

  const metrics = comparison
    ? [
        {
          label: "Formações",
          paulo: comparison.paulo.education.length,
          lucas: comparison.lucas.education.length
        },
        {
          label: "Experiências",
          paulo: comparison.paulo.experiences.length,
          lucas: comparison.lucas.experiences.length
        },
        {
          label: "Projetos",
          paulo: comparison.paulo.projects.length,
          lucas: comparison.lucas.projects.length
        },
        {
          label: "Habilidades",
          paulo: comparison.paulo.skills.length,
          lucas: comparison.lucas.skills.length
        },
        {
          label: "Certificados",
          paulo: comparison.paulo.certifications.length,
          lucas: comparison.lucas.certifications.length
        }
      ]
    : [];

  return (
    <>
      {/* BOTÃO NA TELA SOBRE */}

      <Pressable
        style={styles.openButton}
        onPress={handleOpen}
      >
        <View style={styles.openIcon}>
          <Text style={styles.openIconText}>⇄</Text>
        </View>

        <View style={styles.openInfo}>
          <Text style={styles.openTitle}>
            Comparar currículos
          </Text>

          <Text style={styles.openDescription}>
            Compare as competências de duas pessoas.
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Pressable>

      {/* MODAL DE COMPARAÇÃO */}

      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.brand}>
                CURRÍCULO DIGITAL
              </Text>

              <Text style={styles.modalTitle}>
                Comparação
              </Text>
            </View>

            <Pressable
              onPress={() => setVisible(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator
                size="large"
                color={COLORS.primary}
              />

              <Text style={styles.loadingText}>
                Comparando currículos...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.loading}>
              <Text style={styles.errorText}>{error}</Text>

              <Pressable
                style={styles.retryButton}
                onPress={loadComparison}
              >
                <Text style={styles.retryText}>
                  Tentar novamente
                </Text>
              </Pressable>
            </View>
          ) : comparison ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
            >
              <Text style={styles.subtitle}>
                Veja as diferenças e semelhanças entre os dois
                perfis cadastrados no sistema.
              </Text>

              {/* PERFIS */}

              <View style={styles.profiles}>
                <View style={styles.profileCard}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>P</Text>
                  </View>

                  <Text style={styles.profileName}>
                    {comparison.paulo.person.full_name}
                  </Text>

                  <Text style={styles.profileCaption}>
                    Currículo 1
                  </Text>
                </View>

                <View style={styles.profileCard}>
                  <View style={[styles.avatar, styles.lucasAvatar]}>
                    <Text style={styles.avatarText}>L</Text>
                  </View>

                  <Text style={styles.profileName}>
                    {comparison.lucas.person.full_name}
                  </Text>

                  <Text style={styles.profileCaption}>
                    Currículo 2 — fictício
                  </Text>
                </View>
              </View>

              {/* COMPARAÇÃO DE INDICADORES */}

              <Text style={styles.sectionTitle}>
                Comparação geral
              </Text>

              <View style={styles.metricsCard}>
                <View style={styles.metricHeader}>
                  <Text style={styles.metricLabel}>
                    INDICADOR
                  </Text>

                  <Text style={styles.metricPerson}>
                    Paulo
                  </Text>

                  <Text style={styles.metricPerson}>
                    Lucas
                  </Text>
                </View>

                {metrics.map((metric) => (
                  <View
                    key={metric.label}
                    style={styles.metricRow}
                  >
                    <Text style={styles.metricLabel}>
                      {metric.label}
                    </Text>

                    <Text style={styles.metricValue}>
                      {metric.paulo}
                    </Text>

                    <Text style={styles.metricValue}>
                      {metric.lucas}
                    </Text>
                  </View>
                ))}
              </View>

              {/* HABILIDADES EM COMUM */}

              <Text style={styles.sectionTitle}>
                Habilidades em comum
              </Text>

              <View style={styles.skillsCard}>
                <Text style={styles.skillsDescription}>
                  Tecnologias presentes nos dois currículos.
                </Text>

                <View style={styles.skillsContainer}>
                  {commonSkills.length > 0 ? (
                    commonSkills.map((skill) => (
                      <View
                        key={skill.id}
                        style={styles.commonBadge}
                      >
                        <Text style={styles.commonText}>
                          {skill.name}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>
                      Nenhuma habilidade em comum.
                    </Text>
                  )}
                </View>
              </View>

              {/* HABILIDADES EXCLUSIVAS */}

              <Text style={styles.sectionTitle}>
                Habilidades por perfil
              </Text>

              <View style={styles.skillsCard}>
                <Text style={styles.profileSkillTitle}>
                  Paulo
                </Text>

                <View style={styles.skillsContainer}>
                  {pauloExclusiveSkills.length > 0 ? (
                    pauloExclusiveSkills.map((skill) => (
                      <View
                        key={skill.id}
                        style={styles.skillBadge}
                      >
                        <Text style={styles.skillText}>
                          {skill.name}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>
                      Nenhuma habilidade exclusiva.
                    </Text>
                  )}
                </View>

                <Text style={styles.profileSkillTitle}>
                  Lucas
                </Text>

                <View style={styles.skillsContainer}>
                  {lucasExclusiveSkills.length > 0 ? (
                    lucasExclusiveSkills.map((skill) => (
                      <View
                        key={skill.id}
                        style={styles.lucasBadge}
                      >
                        <Text style={styles.commonText}>
                          {skill.name}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.emptyText}>
                      Nenhuma habilidade exclusiva.
                    </Text>
                  )}
                </View>
              </View>

              {/* RESUMO */}

              <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>
                  Resultado da comparação
                </Text>

                <Text style={styles.summaryText}>
                  Os dois perfis possuem {commonSkills.length}
                  {" "}habilidade(s) em comum. Paulo possui
                  {" "}{pauloExclusiveSkills.length}
                  {" "}habilidade(s) exclusivas e Lucas possui
                  {" "}{lucasExclusiveSkills.length}
                  {" "}habilidade(s) exclusivas.
                </Text>
              </View>

              <Text style={styles.footer}>
                COMPARAÇÃO GERADA A PARTIR DO NEONDB
              </Text>
            </ScrollView>
          ) : null}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  openButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 17,
    padding: 16,
    marginTop: 14
  },

  openIcon: {
    width: 45,
    height: 45,
    borderRadius: 13,
    backgroundColor: COLORS.cardLight,
    justifyContent: "center",
    alignItems: "center"
  },

  openIconText: {
    color: COLORS.primary,
    fontSize: 25,
    fontWeight: "900"
  },

  openInfo: {
    flex: 1,
    marginLeft: 13
  },

  openTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "900"
  },

  openDescription: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5
  },

  arrow: {
    color: COLORS.primary,
    fontSize: 27
  },

  modal: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: 55
  },

  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },

  brand: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2
  },

  modalTitle: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 6
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center"
  },

  closeText: {
    color: COLORS.white,
    fontSize: 17
  },

  content: {
    padding: 22,
    paddingBottom: 50
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 20,
    marginBottom: 22
  },

  profiles: {
    flexDirection: "row",
    gap: 12
  },

  profileCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center"
  },

  avatar: {
    width: 46,
    height: 46,
    backgroundColor: "#15352F",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 11
  },

  lucasAvatar: {
    backgroundColor: "#1D2C48"
  },

  avatarText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "900"
  },

  profileName: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center"
  },

  profileCaption: {
    color: COLORS.muted,
    fontSize: 9,
    marginTop: 6,
    textAlign: "center"
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 27,
    marginBottom: 14
  },

  metricsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15
  },

  metricHeader: {
    flexDirection: "row",
    paddingBottom: 13,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },

  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },

  metricLabel: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 11
  },

  metricPerson: {
    width: 55,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center"
  },

  metricValue: {
    width: 55,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center"
  },

  skillsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17
  },

  skillsDescription: {
    color: COLORS.muted,
    fontSize: 11,
    marginBottom: 15
  },

  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },

  commonBadge: {
    backgroundColor: "#15352F",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9
  },

  skillBadge: {
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9
  },

  lucasBadge: {
    backgroundColor: "#1D2C48",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 9
  },

  commonText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "800"
  },

  skillText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700"
  },

  profileSkillTitle: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 12,
    marginTop: 5
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 11
  },

  summaryCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 17,
    padding: 18,
    marginTop: 25
  },

  summaryTitle: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "900"
  },

  summaryText: {
    color: "#B2BDCE",
    fontSize: 12,
    lineHeight: 21,
    marginTop: 10
  },

  footer: {
    color: COLORS.muted,
    textAlign: "center",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginTop: 32
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30
  },

  loadingText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 15
  },

  errorText: {
    color: "#FF7777",
    textAlign: "center",
    fontSize: 13
  },

  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 18
  },

  retryText: {
    color: COLORS.background,
    fontWeight: "900",
    fontSize: 12
  }
});
