"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";
import Reglas from "./reglas";
import Auxiliar from "./auxiliar";

export default function DescuentosTabs() {
  const [tab, setTab] = useState("producto");

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Reglas de descuento</h1>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="producto">Producto</TabsTrigger>
          <TabsTrigger value="auxiliar">Descuento auxiliar</TabsTrigger>
        </TabsList>

        <TabsContent value="producto">
          <Reglas></Reglas>
        </TabsContent>

        <TabsContent value="auxiliar">
          <Auxiliar></Auxiliar>
        </TabsContent>
      </Tabs>
    </div>
  );
}
