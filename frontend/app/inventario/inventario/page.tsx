import { Payment, columns, defaultColumnCell } from "@/components/table/columns"
import { DataTable } from "@/components/table/dataTable"
import { payments } from "@/components/table/tablaEditable"

async function getData(): Promise<Payment[]> {
    return payments
  }

export default async function inventarioPage(){
    const data = await getData()

    return(
        <div className="container mx-auto">
        <DataTable columns={columns} odata={data} defaultColumn={defaultColumnCell}/>
        </div>
    )
}