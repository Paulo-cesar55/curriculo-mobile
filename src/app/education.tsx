
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";

import { useProfile } from "../contexts/ProfileContext";
import type { Curriculum } from "../services/api";
import { getCurriculum } from "../services/api";

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

function formatDate(
  date?: string | null,
  fallback = "Não informado"
) {
  if (!date) return fallback;

  // Aproveita somente os primeiros 10 caracteres
  const dateOnly = date.substring(0, 10);

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);

  if (!match) return date;

  const [, year, month, day] = match;

  return `${day}/${month}/${year}`;
}

function getStatus(status: string) {
  switch (status) {
    case "COMPLETED":
      return "Concluído";

    case "IN_PROGRESS":
      return "Em andamento";

    case "PAUSED":
      return "Trancado";

    default:
      return status;
  }
}

export default function EducationScreen() {
  const { selectedPersonId } = useProfile();

  const [curriculum, setCurriculum] =
    useState<Curriculum | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function loadEducation() {
    if (selectedPersonId === null) {
      setCurriculum(null);
      setLoading(false);
      return;
    }

    const personId = selectedPersonId;

    try {
      setError("");

      const data = await getCurriculum(personId);

      setCurriculum(data);
    } catch (err) {
      console.error("Erro ao carregar formação acadêmica:", err);
      setError("Não foi possível carregar as formações.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function load() {
      if (selectedPersonId === null) {
        setCurriculum(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getCurriculum(selectedPersonId);

        if (active) {
          setCurriculum(data);
        }
      } catch (err) {
        console.error(err);

        if (active) {
          setError("Não foi possível carregar as formações.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [selectedPersonId]);

  function handleRefresh() {
    setRefreshing(true);
    loadEducation();
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />

        <Text style={styles.loadingText}>
          Carregando formação acadêmica...
        </Text>
      </View>
    );
  }

  if (selectedPersonId === null) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>
          Nenhum currículo selecionado
        </Text>

        <Text style={styles.emptyDescription}>
          Acesse a Home e selecione uma pessoa para visualizar
          sua formação acadêmica.
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const formations = curriculum?.education || [];

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

        <Text style={styles.brand}>CURRÍCULO DIGITAL</Text>

        <Text style={styles.title}>
          Formação acadêmica
        </Text>

        <Text style={styles.subtitle}>
          Minha trajetória de aprendizado e desenvolvimento.
        </Text>

        {/* RESUMO */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Text style={styles.summaryIconText}>✦</Text>
          </View>

          <View style={styles.summaryInfo}>
            <Text style={styles.summaryNumber}>
              {formations.length}
            </Text>

            <Text style={styles.summaryLabel}>
              {formations.length === 1
                ? "Formação cadastrada"
                : "Formações cadastradas"}
            </Text>
          </View>
        </View>

        {/* LINHA DO TEMPO */}

        <Text style={styles.sectionTitle}>
          Histórico de formação
        </Text>

        {formations.length > 0 ? (
          formations.map((item, index) => (
            <View key={item.id} style={styles.timelineItem}>

              <View style={styles.timeline}>
                <View style={styles.timelineDot} />

                {index !== formations.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              <View style={styles.educationCard}>
                <View style={styles.cardTop}>
                  <View style={styles.educationIcon}>
                    <Text style={styles.educationIconText}>
                      ✦
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      item.status === "COMPLETED"
                        ? styles.completedBadge
                        : styles.progressBadge
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {getStatus(item.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.course}>
                  {item.course}
                </Text>

                <Text style={styles.institution}>
                  {item.institution}
                </Text>

                {item.degree_level && (
                  <Text style={styles.degree}>
                    {item.degree_level}
                  </Text>
                )}

                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>
                    PERÍODO
                  </Text>

                  <Text style={styles.dateValue}>
                    {formatDate(item.start_date)}
                    {"  —  "}
                    {formatDate(item.end_date)}
                  </Text>
                </View>

                {item.description && (
                  <Text style={styles.description}>
                    {item.description}
                  </Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🎓</Text>

            <Text style={styles.emptyTitle}>
              Nenhuma formação cadastrada
            </Text>

            <Text style={styles.emptyDescription}>
              As informações acadêmicas deste currículo
              aparecerão aqui quando forem cadastradas.
            </Text>
          </View>
        )}

        {/* RODAPÉ */}

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>
            CURRÍCULO DIGITAL
          </Text>

          <Text style={styles.footerText}>
            Educação e conhecimento em constante evolução.
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
    fontSize: 28,
    fontWeight: "900",
    marginTop: 12
  },

  subtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 21,
    marginTop: 8
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginTop: 27
  },

  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.cardLight,
    justifyContent: "center",
    alignItems: "center"
  },

  summaryIconText: {
    color: COLORS.primary,
    fontSize: 23,
    fontWeight: "900"
  },

  summaryInfo: {
    marginLeft: 15
  },

  summaryNumber: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "900"
  },

  summaryLabel: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 3
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 32,
    marginBottom: 22
  },

  timelineItem: {
    flexDirection: "row",
    marginBottom: 15
  },

  timeline: {
    width: 25,
    alignItems: "center"
  },

  timelineDot: {
    width: 13,
    height: 13,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.cardLight,
    marginTop: 20,
    zIndex: 1
  },

  timelineLine: {
    position: "absolute",
    top: 32,
    bottom: -15,
    width: 2,
    backgroundColor: COLORS.border
  },

  educationCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 19,
    padding: 18,
    marginLeft: 9
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17
  },

  educationIcon: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  educationIconText: {
    color: COLORS.primary,
    fontSize: 20
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20
  },

  completedBadge: {
    backgroundColor: "#15352F"
  },

  progressBadge: {
    backgroundColor: "#1D2C48"
  },

  statusText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "800"
  },

  course: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 24
  },

  institution: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 8
  },

  degree: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 7
  },

  dateContainer: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 11,
    padding: 12,
    marginTop: 18
  },

  dateLabel: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.3
  },

  dateValue: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 7
  },

  description: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 20,
    marginTop: 15
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
    fontSize: 35
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
    marginTop: 35
  },

  footerBrand: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2
  },

  footerText: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 8,
    textAlign: "center"
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

  errorText: {
    color: "#FF7777",
    fontSize: 13,
    textAlign: "center"
  }
});
