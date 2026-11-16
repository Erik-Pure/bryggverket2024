import { Permanent_Marker, Saira } from "next/font/google";

// The width axis gives the condensed cut used for display type.
export const saira = Saira({ subsets: ["latin"], axes: ["wdth"] });

export const permMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
});
