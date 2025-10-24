import { Router, Request, Response } from 'express';
import pennylaneService from '../services/pennylaneService';

const router = Router();

// ============================================
// CUSTOMER INVOICES
// ============================================

/**
 * POST /api/pennylane/invoices
 * Create customer invoice
 */
router.post('/invoices', async (req: Request, res: Response) => {
  try {
    const invoice = await pennylaneService.createCustomerInvoice(req.body);
    res.json({ success: true, data: invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pennylane/invoices/:id
 * Get customer invoice by ID
 */
router.get('/invoices/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await pennylaneService.getCustomerInvoice(id);
    res.json({ success: true, data: invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pennylane/invoices
 * List customer invoices
 */
router.get('/invoices', async (req: Request, res: Response) => {
  try {
    const { page, per_page, filter } = req.query;
    const invoices = await pennylaneService.listCustomerInvoices({
      page: page ? parseInt(page as string) : undefined,
      per_page: per_page ? parseInt(per_page as string) : undefined,
      filter: filter as string,
    });
    res.json({ success: true, data: invoices });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/pennylane/invoices/:id
 * Update customer invoice
 */
router.put('/invoices/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await pennylaneService.updateCustomerInvoice(id, req.body);
    res.json({ success: true, data: invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/pennylane/invoices/:id/finalize
 * Finalize customer invoice
 */
router.put('/invoices/:id/finalize', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const invoice = await pennylaneService.finalizeCustomerInvoice(id);
    res.json({ success: true, data: invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pennylane/invoices/:id/pdf
 * Get invoice PDF
 */
router.get('/invoices/:id/pdf', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const pdf = await pennylaneService.getInvoicePDF(id);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${id}.pdf"`);
    res.send(pdf);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// CUSTOMERS
// ============================================

/**
 * POST /api/pennylane/customers
 * Create customer
 */
router.post('/customers', async (req: Request, res: Response) => {
  try {
    const customer = await pennylaneService.createCustomer(req.body);
    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pennylane/customers/:id
 * Get customer by ID
 */
router.get('/customers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await pennylaneService.getCustomer(id);
    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pennylane/customers
 * List customers
 */
router.get('/customers', async (req: Request, res: Response) => {
  try {
    const { page, per_page, filter } = req.query;
    const customers = await pennylaneService.listCustomers({
      page: page ? parseInt(page as string) : undefined,
      per_page: per_page ? parseInt(per_page as string) : undefined,
      filter: filter as string,
    });
    res.json({ success: true, data: customers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/pennylane/customers/:id
 * Update customer
 */
router.put('/customers/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const customer = await pennylaneService.updateCustomer(id, req.body);
    res.json({ success: true, data: customer });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// PRODUCTS
// ============================================

/**
 * POST /api/pennylane/products
 * Create product
 */
router.post('/products', async (req: Request, res: Response) => {
  try {
    const product = await pennylaneService.createProduct(req.body);
    res.json({ success: true, data: product });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pennylane/products
 * List products
 */
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { page, per_page } = req.query;
    const products = await pennylaneService.listProducts({
      page: page ? parseInt(page as string) : undefined,
      per_page: per_page ? parseInt(per_page as string) : undefined,
    });
    res.json({ success: true, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SUPPLIER INVOICES
// ============================================

/**
 * POST /api/pennylane/supplier-invoices
 * Create supplier invoice
 */
router.post('/supplier-invoices', async (req: Request, res: Response) => {
  try {
    const invoice = await pennylaneService.createSupplierInvoice(req.body);
    res.json({ success: true, data: invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/pennylane/supplier-invoices
 * List supplier invoices
 */
router.get('/supplier-invoices', async (req: Request, res: Response) => {
  try {
    const { page, per_page } = req.query;
    const invoices = await pennylaneService.listSupplierInvoices({
      page: page ? parseInt(page as string) : undefined,
      per_page: per_page ? parseInt(per_page as string) : undefined,
    });
    res.json({ success: true, data: invoices });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ACCOUNTING ENTRIES
// ============================================

/**
 * POST /api/pennylane/accounting-entries
 * Create accounting entry
 */
router.post('/accounting-entries', async (req: Request, res: Response) => {
  try {
    const entry = await pennylaneService.createAccountingEntry(req.body);
    res.json({ success: true, data: entry });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// BALANCE SHEET
// ============================================

/**
 * GET /api/pennylane/balance-sheet
 * Get balance sheet
 */
router.get('/balance-sheet', async (req: Request, res: Response) => {
  try {
    const { start_date, end_date } = req.query;
    const balance = await pennylaneService.getBalanceSheet({
      start_date: start_date as string,
      end_date: end_date as string,
    });
    res.json({ success: true, data: balance });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// BILAN-SPECIFIC OPERATIONS
// ============================================

/**
 * POST /api/pennylane/bilan/create-invoice
 * Create invoice for bilan de compétences
 */
router.post('/bilan/create-invoice', async (req: Request, res: Response) => {
  try {
    const { customerName, customerEmail, bilanReference, amount, description } = req.body;
    
    if (!customerName || !customerEmail || !bilanReference || !amount) {
      return res.status(400).json({
        success: false,
        error: 'customerName, customerEmail, bilanReference, and amount are required',
      });
    }

    const invoice = await pennylaneService.createBilanInvoice({
      customerName,
      customerEmail,
      bilanReference,
      amount,
      description,
    });

    res.json({ success: true, data: invoice });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

