"use client";

import Spline from "@splinetool/react-spline";

export default function SplineViewer({ url }: { url: string }) {
  return <Spline scene={url} />;
}
