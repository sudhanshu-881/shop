import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Product, Supplier } from '../types';

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async askDukaanMitra(
    query: string,
    products: Product[],
    suppliers: Supplier[],
    shopType: string
  ): Promise<string> {
    try {
      const prompt = this.buildPrompt(query, products, suppliers, shopType);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to get response from AI assistant');
    }
  }

  private buildPrompt(
    query: string,
    products: Product[],
    suppliers: Supplier[],
    shopType: string
  ): string {
    const productSummary = this.summarizeProducts(products);
    const supplierSummary = this.summarizeSuppliers(suppliers);
    const lowStockProducts = products.filter(p => p.stock < p.lowStockThreshold);
    const expiringProducts = this.getExpiringProducts(products);

    return `You are Dukaan Mitra, a smart AI assistant for ${shopType} shop owners. You help them manage their inventory, understand their business, and make better decisions.

SHOP CONTEXT:
- Shop Type: ${shopType}
- Total Products: ${products.length}
- Total Suppliers: ${suppliers.length}

INVENTORY SUMMARY:
${productSummary}

SUPPLIERS SUMMARY:
${supplierSummary}

ALERTS:
- Low Stock Items: ${lowStockProducts.length} products need restocking
- Expiring Soon: ${expiringProducts.length} products expiring in next 7 days

USER QUERY: ${query}

INSTRUCTIONS:
1. Provide helpful, actionable advice based on the shop's data
2. Be conversational and friendly, like a knowledgeable shop assistant
3. Use specific examples from their inventory when relevant
4. Suggest concrete next steps
5. If asked about specific products, provide detailed information
6. For business advice, consider their shop type and current inventory
7. Always be encouraging and supportive
8. Use bullet points and formatting to make responses clear
9. If you don't have enough information, ask clarifying questions

Respond in a helpful, professional manner that a small business owner would appreciate.`;
  }

  private summarizeProducts(products: Product[]): string {
    if (products.length === 0) {
      return "No products in inventory yet.";
    }

    const categories = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalValue = products.reduce((sum, product) => sum + (product.stock * product.cost), 0);
    const lowStockCount = products.filter(p => p.stock < p.lowStockThreshold).length;

    return `
- Total Products: ${products.length}
- Total Inventory Value: ₹${totalValue.toFixed(2)}
- Categories: ${Object.entries(categories).map(([cat, count]) => `${cat} (${count})`).join(', ')}
- Low Stock Items: ${lowStockCount}
- Top Products by Stock Value: ${this.getTopProductsByValue(products).slice(0, 3).map(p => `${p.name} (₹${(p.stock * p.cost).toFixed(2)})`).join(', ')}`;
  }

  private summarizeSuppliers(suppliers: Supplier[]): string {
    if (suppliers.length === 0) {
      return "No suppliers added yet.";
    }

    const totalDues = suppliers.reduce((sum, supplier) => sum + supplier.balance, 0);
    const suppliersWithDues = suppliers.filter(s => s.balance > 0).length;

    return `
- Total Suppliers: ${suppliers.length}
- Total Outstanding Dues: ₹${totalDues.toFixed(2)}
- Suppliers with Outstanding Dues: ${suppliersWithDues}
- Top Suppliers by Dues: ${suppliers
      .filter(s => s.balance > 0)
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 3)
      .map(s => `${s.name} (₹${s.balance.toFixed(2)})`)
      .join(', ')}`;
  }

  private getExpiringProducts(products: Product[]): Product[] {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    return products.filter(product => {
      const expiryDate = new Date(product.expiryDate);
      return expiryDate >= today && expiryDate <= nextWeek;
    });
  }

  private getTopProductsByValue(products: Product[]): Product[] {
    return products
      .sort((a, b) => (b.stock * b.cost) - (a.stock * a.cost))
      .slice(0, 5);
  }
}

export default GeminiService;