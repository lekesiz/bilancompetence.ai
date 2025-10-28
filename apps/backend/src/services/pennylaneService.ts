import axios, { AxiosInstance } from 'axios';

interface PennylaneConfig {
  apiKey: string;
  baseURL?: string;
}

interface CustomerInvoice {
  id?: string;
  invoice_number?: string;
  date: string;
  deadline: string;
  customer_id: string;
  line_items: InvoiceLineItem[];
  currency?: string;
  pdf_invoice_free_text?: string;
  pdf_invoice_subject?: string;
  special_mention?: string;
}

interface InvoiceLineItem {
  label: string;
  quantity: number;
  unit_price: number;
  vat_rate?: string;
  product_id?: string;
}

interface Customer {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  postal_code?: string;
  city?: string;
  country_alpha2?: string;
}

class PennylaneService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: PennylaneConfig) {
    this.apiKey = config.apiKey;
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.pennylane.com/api/v2',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // ============================================
  // CUSTOMER INVOICES (Factures clients)
  // ============================================

  /**
   * Create customer invoice
   */
  async createCustomerInvoice(invoice: CustomerInvoice): Promise<any> {
    try {
      const response = await this.client.post('/customer_invoices', invoice);
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get customer invoice by ID
   */
  async getCustomerInvoice(invoiceId: string): Promise<any> {
    try {
      const response = await this.client.get(`/customer_invoices/${invoiceId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * List customer invoices
   */
  async listCustomerInvoices(params?: {
    page?: number;
    per_page?: number;
    filter?: string;
  }): Promise<any> {
    try {
      const response = await this.client.get('/customer_invoices', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Update customer invoice
   */
  async updateCustomerInvoice(invoiceId: string, data: Partial<CustomerInvoice>): Promise<any> {
    try {
      const response = await this.client.put(`/customer_invoices/${invoiceId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Finalize customer invoice (mark as sent)
   */
  async finalizeCustomerInvoice(invoiceId: string): Promise<any> {
    try {
      const response = await this.client.put(`/customer_invoices/${invoiceId}/finalize`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get invoice PDF
   */
  async getInvoicePDF(invoiceId: string): Promise<Buffer> {
    try {
      const response = await this.client.get(`/customer_invoices/${invoiceId}/pdf`, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // ============================================
  // CUSTOMERS (Clients)
  // ============================================

  /**
   * Create customer
   */
  async createCustomer(customer: Customer): Promise<any> {
    try {
      const response = await this.client.post('/customers', customer);
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get customer by ID
   */
  async getCustomer(customerId: string): Promise<any> {
    try {
      const response = await this.client.get(`/customers/${customerId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * List customers
   */
  async listCustomers(params?: {
    page?: number;
    per_page?: number;
    filter?: string;
  }): Promise<any> {
    try {
      const response = await this.client.get('/customers', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Update customer
   */
  async updateCustomer(customerId: string, data: Partial<Customer>): Promise<any> {
    try {
      const response = await this.client.put(`/customers/${customerId}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // ============================================
  // PRODUCTS (Produits/Services)
  // ============================================

  /**
   * Create product
   */
  async createProduct(product: {
    label: string;
    unit_price?: number;
    vat_rate?: string;
    description?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post('/products', product);
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * List products
   */
  async listProducts(params?: { page?: number; per_page?: number }): Promise<any> {
    try {
      const response = await this.client.get('/products', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // ============================================
  // SUPPLIER INVOICES (Factures fournisseurs)
  // ============================================

  /**
   * Create supplier invoice
   */
  async createSupplierInvoice(invoice: {
    invoice_number: string;
    invoice_date: string;
    supplier_id: string;
    amount: number;
    currency?: string;
  }): Promise<any> {
    try {
      const response = await this.client.post('/supplier_invoices', invoice);
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * List supplier invoices
   */
  async listSupplierInvoices(params?: { page?: number; per_page?: number }): Promise<any> {
    try {
      const response = await this.client.get('/supplier_invoices', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // ============================================
  // ACCOUNTING ENTRIES (Écritures comptables)
  // ============================================

  /**
   * Create accounting entry
   */
  async createAccountingEntry(entry: {
    date: string;
    label: string;
    line_items: Array<{
      account_number: string;
      debit?: number;
      credit?: number;
      label: string;
    }>;
  }): Promise<any> {
    try {
      const response = await this.client.post('/accounting_entries', entry);
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // ============================================
  // BALANCE SHEET (Balance générale)
  // ============================================

  /**
   * Get balance sheet
   */
  async getBalanceSheet(params?: { start_date?: string; end_date?: string }): Promise<any> {
    try {
      const response = await this.client.get('/balance_sheet', { params });
      return response.data;
    } catch (error: any) {
      throw new Error(`Pennylane API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  /**
   * Create invoice for bilan de compétences
   */
  async createBilanInvoice(data: {
    customerName: string;
    customerEmail: string;
    bilanReference: string;
    amount: number;
    description?: string;
  }): Promise<any> {
    try {
      // First, create or get customer
      const customersResponse = await this.listCustomers({
        filter: `email:${data.customerEmail}`,
      });

      let customerId: string;
      if (customersResponse.invoices && customersResponse.invoices.length > 0) {
        customerId = customersResponse.invoices[0].id;
      } else {
        const newCustomer = await this.createCustomer({
          name: data.customerName,
          email: data.customerEmail,
        });
        customerId = newCustomer.id;
      }

      // Create invoice
      const invoice: CustomerInvoice = {
        date: new Date().toISOString().split('T')[0],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
        customer_id: customerId,
        line_items: [
          {
            label: data.description || `Bilan de Compétences - ${data.bilanReference}`,
            quantity: 1,
            unit_price: data.amount,
            vat_rate: '20.0', // TVA 20%
          },
        ],
        currency: 'EUR',
        pdf_invoice_subject: `Bilan de Compétences - ${data.bilanReference}`,
      };

      return await this.createCustomerInvoice(invoice);
    } catch (error: any) {
      throw new Error(`Failed to create bilan invoice: ${error.message}`);
    }
  }
}

// Export singleton instance
const pennylaneService = new PennylaneService({
  apiKey: process.env.PENNYLANE_API_KEY || 'XHTDMQAano9jHjNJ18Cny7vFJIdNfpumPKsZHQWPzZ8',
});

export default pennylaneService;
export { PennylaneService, type CustomerInvoice, type Customer };
