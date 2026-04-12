import * as Icons from "../icons";
import { SVGProps, ReactElement } from "react";

type IconType = (props: SVGProps<SVGSVGElement>) => ReactElement;

interface SubMenuItem {
  title: string;
  url: string;
}

interface MenuItem {
  title: string;
  icon: IconType;
  url?: string;
  items?: SubMenuItem[];
}

interface NavSection {
  label: string;
  items: MenuItem[];
}

export const NAV_DATA: NavSection[] = [
  {
    label: "RESERVAS",
    items: [
      {
        title: "Reservar Espaço",
        url: "/reserva",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Minhas Reservas",
        url: "/minhas-reservas",
        icon: Icons.Table,
        items: [],
      },
      {
        title: "Agenda Geral",
        url: "/agenda-geral",
        icon: Icons.Calendar,
        items: [],
      },
    ],
  },
];
