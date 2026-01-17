"use client"

import Header from "@/components/header";
import { useEffect, useState } from "react";
import './globals.css';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if(!mounted) return null;
  return (<div className="h-screen flex flex-col">
    <Header></Header>
    <div className="flex-1 bg-red-50 dark:bg-black">

    </div>
  </div>);
}