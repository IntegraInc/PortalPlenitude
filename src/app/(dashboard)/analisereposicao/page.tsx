"use server";

import { getAllSuppliers } from "@/components/combobox/action";
import MainTable from "@/components/MainTable";

export default async function Dashboard() {
  const { responseJson } = await getAllSuppliers();
  return <MainTable filters={responseJson} />;
}
