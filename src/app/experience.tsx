
import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl
} from "react-native";

import { getCurriculum } from "../services/api";
import type { Curriculum } from "../services/api";
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

function formatDate(
  date?: string | null,
  fallback = "Não informado"
) {
  if (!date) return fallback;

  const dateOnly = date.substring(0, 10);

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly);

  if (!match) return date;

  const [, year, month, day] = match;

  return `${day}/${month}/${year}`;
}

export default function ExperienceScreen() {
  const { selectedPersonId } = useProfile();

  const [curriculum, setCurriculum] =
    useState<Curriculum | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Buscar experiências da API
  useEffect(() => {
    let active = true;

    async function loadExperiences() {
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
        console.error(
          "Erro ao carregar experiências profissionais:",
          err
        );

        if (active) {
          setError(
            "Não foi possível carregar as experiências profissionais."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    loadExperiences();

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
          Carregando experiências...
        </Text>
      </View>
    );
  }

  // Nenhum perfil selecionado
  if (selectedPersonId === null) {
    return (
      <View style={styles.loading}>
        <Text style={styles.emptyTitle}>
          Nenhum currículo selecionado
        </Text>

        <Text style={styles.emptyDescription}>
          Acesse a Home e selecione uma pessoa para
          visualizar suas experiências profissionais.
        </Text>
      </View>
    );
  }

  // Tratamento de erro
  if (error) {
    return (
      <View style={styles.loading}>
        <Text style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  const experiences = curriculum?.experiences || [];

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
          Experiência profissional
        </Text>

        <Text style={styles.subtitle}>
          Minha trajetória profissional e experiências no mercado
          de trabalho.
        </Text>

        {/* RESUMO */}

        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <Text style={styles.summaryIconText}>
              ◆
            </Text>
          </View>

          <View style={styles.summaryInfo}>
            <Text style={styles.summaryNumber}>
              {experiences.length}
            </Text>

            <Text style={styles.summaryLabel}>
              {experiences.length === 1
                ? "Experiência cadastrada"
                : "Experiências cadastradas"}
            </Text>
          </View>
        </View>

        {/* HISTÓRICO PROFISSIONAL */}

        <Text style={styles.sectionTitle}>
          Histórico profissional
        </Text>

        {experiences.length > 0 ? (
          experiences.map((item: any, index: number) => (
            <View
              key={item.id}
              style={styles.timelineItem}
            >
              {/* LINHA DO TEMPO */}

              <View style={styles.timeline}>
                <View style={styles.timelineDot} />

                {index !== experiences.length - 1 && (
                  <View style={styles.timelineLine} />
                )}
              </View>

              {/* CARD DA EXPERIÊNCIA */}

              <View style={styles.experienceCard}>
                <View style={styles.cardTop}>
                  <View style={styles.companyIcon}>
                    <Text style={styles.companyIconText}>
                      {item.company?.charAt(0)?.toUpperCase() || "E"}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      item.is_current
                        ? styles.currentBadge
                        : styles.previousBadge
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {item.is_current
                        ? "ATUAL"
                        : "ANTERIOR"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.role}>
                  {item.role}
                </Text>

                <Text style={styles.company}>
                  {item.company}
                </Text>

                {item.employment_type && (
                  <Text style={styles.employmentType}>
                    {item.employment_type}
                  </Text>
                )}

                {/* PERÍODO */}

                <View style={styles.dateContainer}>
                  <Text style={styles.dateLabel}>
                    PERÍODO DE ATUAÇÃO
                  </Text>

                  <Text style={styles.dateValue}>
                    {formatDate(item.start_date)}
                    {"  —  "}
                    {item.is_current
                      ? "Atual"
                      : formatDate(item.end_date)}
                  </Text>
                </View>

                {/* LOCALIZAÇÃO */}

                {item.location && (
                  <View style={styles.locationContainer}>
                    <Text style={styles.locationIcon}>
                      📍
                    </Text>

                    <Text style={styles.locationText}>
                      {item.location}
                    </Text>
                  </View>
                )}

                {/* DESCRIÇÃO */}

                {item.description && (
                  <>
                    <Text style={styles.descriptionLabel}>
                      PRINCIPAIS ATIVIDADES
                    </Text>

                    <Text style={styles.description}>
                      {item.description}
                    </Text>
                  </>
                )}
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              💼
            </Text>

            <Text style={styles.emptyTitle}>
              Nenhuma experiência cadastrada
            </Text>

            <Text style={styles.emptyDescription}>
              As experiências profissionais desta pessoa
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
            Experiências que constroem uma carreira.
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
    fontSize: 27,
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
    fontSize: 22,
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

  experienceCard: {
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

  companyIcon: {
    width: 42,
    height: 42,
    backgroundColor: COLORS.cardLight,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center"
  },

  companyIconText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "900"
  },

  statusBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20
  },

  currentBadge: {
    backgroundColor: "#15352F"
  },

  previousBadge: {
    backgroundColor: "#1D2C48"
  },

  statusText: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900"
  },

  role: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 24
  },

  company: {
    color: COLORS.blue,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 8
  },

  employmentType: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 7
  },

  dateContainer: {
    backgroundColor: COLORS.cardLight,
    borderRadius: 11,
    padding: 12,
    marginTop: 19
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

  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14
  },

  locationIcon: {
    fontSize: 12,
    marginRight: 6
  },

  locationText: {
    color: COLORS.muted,
    fontSize: 11
  },

  descriptionLabel: {
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginTop: 19
  },

  description: {
    color: "#B2BDCE",
    fontSize: 12,
    lineHeight: 21,
    marginTop: 8
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
