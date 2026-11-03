
import { useEffect, useState } from "react";
import CurriculumComparison from "../components/CurriculumComparison";

import {
  ActivityIndicator,
  Linking,
  Pressable,
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

const technologies = [
  {
    name: "React Native",
    description: "Desenvolvimento de interfaces mobile."
  },
  {
    name: "Expo",
    description: "Plataforma para desenvolvimento e execução do aplicativo."
  },
  {
    name: "Expo Router",
    description: "Navegação entre as telas do aplicativo."
  },
  {
    name: "TypeScript",
    description: "Tipagem estática e organização do código."
  },
  {
    name: "Axios",
    description: "Comunicação entre o aplicativo e a API."
  },
  {
    name: "React Context",
    description: "Compartilhamento do perfil selecionado entre as telas."
  },
  {
    name: "StyleSheet",
    description: "Estilização dos componentes do aplicativo."
  },
  {
    name: "Express",
    description: "Desenvolvimento do backend REST."
  },
  {
    name: "PostgreSQL",
    description: "Armazenamento dos currículos e relacionamentos."
  },
  {
    name: "NeonDB",
    description: "Hospedagem do banco de dados PostgreSQL."
  },
  {
    name: "Vercel",
    description: "Publicação da API na nuvem."
  }
];

export default function AboutScreen() {
  const { selectedPersonId } = useProfile();

  const [curriculum, setCurriculum] =
    useState<Curriculum | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedPersonId === null) {
      setCurriculum(null);
      setLoading(false);
      return;
    }

    const personId = selectedPersonId;
    let active = true;

    async function loadCurriculum() {
      try {
        setLoading(true);
        setError("");

        const data = await getCurriculum(personId);

        if (active) {
          setCurriculum(data);
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);

        if (active) {
          setError("Não foi possível carregar o perfil.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCurriculum();

    return () => {
      active = false;
    };
  }, [selectedPersonId]);

  function openLink(url?: string | null) {
    if (!url) return;

    Linking.openURL(url).catch(console.error);
  }

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>
          Carregando informações...
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

  if (!curriculum) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>
          Selecione um currículo na tela Home.
        </Text>
      </View>
    );
  }

  const person = curriculum.person;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* CABEÇALHO */}

        <Text style={styles.brand}>CURRÍCULO DIGITAL</Text>

        <Text style={styles.title}>Sobre mim</Text>

        <Text style={styles.subtitle}>
          Conheça um pouco mais sobre minha trajetória.
        </Text>

        {/* PERFIL */}

        <View style={styles.profileCard}>
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

          <Text style={styles.name}>
            {person.full_name}
          </Text>

          <Text style={styles.role}>
            Desenvolvedor em formação
          </Text>

          <Text style={styles.bio}>
            {person.bio || "Biografia não cadastrada."}
          </Text>

          <Text style={styles.location}>
            {[person.city, person.state]
              .filter(Boolean)
              .join(" • ")}
          </Text>

          <View style={styles.links}>
            {person.github_url && (
              <Pressable
                style={styles.linkButton}
                onPress={() => openLink(person.github_url)}
              >
                <Text style={styles.linkText}>GitHub ↗</Text>
              </Pressable>
            )}

            {person.linkedin_url && (
              <Pressable
                style={styles.linkButton}
                onPress={() => openLink(person.linkedin_url)}
              >
                <Text style={styles.linkText}>LinkedIn ↗</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* HABILIDADES */}

        <Text style={styles.sectionTitle}>
          Minhas habilidades
        </Text>

        <Text style={styles.sectionDescription}>
          Tecnologias e conhecimentos cadastrados no meu currículo.
        </Text>

        <View style={styles.skillsContainer}>
          {curriculum.skills.map((skill) => (
            <View key={skill.id} style={styles.skillCard}>
              <Text style={styles.skillName}>
                {skill.name}
              </Text>

              <Text style={styles.skillLevel}>
                {skill.proficiency_level || "Nível não informado"}
              </Text>
            </View>
          ))}
        </View>

        {/* TECNOLOGIAS DO APLICATIVO */}

        <Text style={styles.sectionTitle}>
          Tecnologias utilizadas
        </Text>

        <Text style={styles.sectionDescription}>
          Ferramentas, bibliotecas e serviços utilizados na construção
          do Currículo Digital.
        </Text>

        {technologies.map((technology) => (
          <View
            key={technology.name}
            style={styles.technologyCard}
          >
            <View style={styles.technologyIcon}>
              <Text style={styles.iconText}>{"</>"}</Text>
            </View>

            <View style={styles.technologyInfo}>
              <Text style={styles.technologyName}>
                {technology.name}
              </Text>

              <Text style={styles.technologyDescription}>
                {technology.description}
              </Text>
            </View>
          </View>
        ))}

        {/* FUNCIONALIDADE EXTRA */}

        <Text style={styles.sectionTitle}>
          Funcionalidade extra
        </Text>

        <View style={styles.extraCard}>
          <View style={styles.extraIcon}>
            <Text style={styles.iconText}>⇄</Text>
          </View>

          <Text style={styles.extraTitle}>
            Alternância entre currículos
          </Text>

          <Text style={styles.extraDescription}>
            O aplicativo permite selecionar diferentes pessoas
            cadastradas no banco de dados e visualizar seus currículos
            completos. A seleção é compartilhada entre as telas
            utilizando React Context.
          </Text>
        </View>
        {/* BOTÃO PARA COMPARAR OS CURRÍCULOS */}

          <CurriculumComparison />

        {/* CERTIFICADOS */}

        <Text style={styles.sectionTitle}>
          Certificados
        </Text>

        {curriculum.certifications.length > 0 ? (
          curriculum.certifications.map((certificate) => (
            <View
              key={certificate.id}
              style={styles.certificateCard}
            >
              <Text style={styles.certificateName}>
                {certificate.name}
              </Text>

              <Text style={styles.certificateInstitution}>
                {certificate.institution || "Instituição não informada"}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            Nenhum certificado cadastrado.
          </Text>
        )}

        {/* RODAPÉ */}

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>
            CURRÍCULO DIGITAL
          </Text>

          <Text style={styles.footerText}>
            Desenvolvido com React Native e Expo.
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
    marginTop: 8,
    marginBottom: 25
  },

  profileCard: {
    backgroundColor: COLORS.card,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    alignItems: "center"
  },

  avatar: {
    width: 85,
    height: 85,
    borderRadius: 27,
    backgroundColor: COLORS.cardLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 17
  },

  avatarText: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: "900"
  },

  name: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center"
  },

  role: {
    color: COLORS.blue,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 7
  },

  bio: {
    color: "#B2BDCE",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 18
  },

  location: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 13
  },

  links: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20
  },

  linkButton: {
    backgroundColor: COLORS.cardLight,
    paddingHorizontal: 17,
    paddingVertical: 11,
    borderRadius: 10
  },

  linkText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: "800"
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 30,
    marginBottom: 9
  },

  sectionDescription: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 19,
    marginBottom: 16
  },

  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9
  },

  skillCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minWidth: "45%"
  },

  skillName: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "800"
  },

  skillLevel: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 5
  },

  technologyCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 10
  },

  technologyIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: COLORS.cardLight,
    alignItems: "center",
    justifyContent: "center"
  },

  iconText: {
    color: COLORS.primary,
    fontWeight: "900",
    fontSize: 16
  },

  technologyInfo: {
    flex: 1,
    marginLeft: 13
  },

  technologyName: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800"
  },

  technologyDescription: {
    color: COLORS.muted,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4
  },

  extraCard: {
    backgroundColor: COLORS.card,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 20
  },

  extraIcon: {
    width: 45,
    height: 45,
    backgroundColor: COLORS.cardLight,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center"
  },

  extraTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 17
  },

  extraDescription: {
    color: "#B2BDCE",
    fontSize: 12,
    lineHeight: 21,
    marginTop: 10
  },

  certificateCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10
  },

  certificateName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "800"
  },

  certificateInstitution: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 6
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 12
  },

  footer: {
    alignItems: "center",
    marginTop: 40
  },

  footerBrand: {
    color: COLORS.primary,
    fontSize: 11,
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

  errorText: {
    color: "#FF7777",
    fontSize: 13,
    textAlign: "center"
  }
});
