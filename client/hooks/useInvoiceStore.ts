import { useState, useCallback, useEffect } from "react";
import {
  getInvoices,
  addInvoice as supabaseAddInvoice,
  getInvoiceById as supabaseGetInvoiceById,
  deleteInvoice as supabaseDeleteInvoice,
  Invoice,
} from "@/lib/supabase-db";

export function useInvoiceStore() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const invoicesData = await getInvoices();
        setInvoices(invoicesData);
      } catch (error) {
        console.error("Error loading invoices:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const addInvoice = useCallback(
    async (invoice: Omit<Invoice, "id" | "invoiceNumber" | "createdAt">) => {
      try {
        const newInvoice = await supabaseAddInvoice(invoice);
        setInvoices((prevInvoices) => [newInvoice, ...prevInvoices]);
        return newInvoice;
      } catch (error) {
        console.error("Error adding invoice:", error);
        throw error;
      }
    },
    [],
  );

  const getInvoiceById = useCallback(async (id: string) => {
    try {
      const invoice = await supabaseGetInvoiceById(id);
      return invoice;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      throw error;
    }
  }, []);

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      await supabaseDeleteInvoice(id);
      setInvoices((prevInvoices) =>
        prevInvoices.filter((invoice) => invoice.id !== id),
      );
    } catch (error) {
      console.error("Error deleting invoice:", error);
      throw error;
    }
  }, []);

  return {
    invoices,
    isLoading,
    addInvoice,
    getInvoiceById,
    deleteInvoice,
  };
}
