import { WordPressIcon, AndroidIcon } from "../components/atoms/icons";

export const getProjects = (t: (key: string) => string) => [
  {
    id: "systech",
    title: "SYSTECH UAM",
    category: "WordPress",
    shortDescription: t("projects.systech.shortDescription"),
    fullDescription: t("projects.systech.fullDescription"),
    image: "/Systech-UAM.png",
    url: "https://systech.uam.edu.ni/",
    technologies: ["WordPress", "PHP", "MySQL", "CSS"],
    icon: WordPressIcon,
  },
  {
    id: "pantano",
    title: "Hotel El Pantano",
    category: "WordPress",
    shortDescription: t("projects.pantano.shortDescription"),
    fullDescription: t("projects.pantano.fullDescription"),
    image: "/hotel-ElPantano.png",
    url: "https://www.hotel-el-pantano.org/",
    technologies: ["WordPress", "WooCommerce", "PHP", "SEO"],
    icon: WordPressIcon,
  },
  {
    id: "bolsa",
    title: t("projects.bolsa.title"),
    category: "Android",
    shortDescription: t("projects.bolsa.description"),
    fullDescription: null,
    image: "/Bolsa-De-TrabajoUAM.png",
    url: null,
    technologies: ["Android", "Java", "SQL Server", "Spring Boot"],
    icon: AndroidIcon,
  },
];
