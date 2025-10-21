import { Request, Response } from 'express';
import GeminiService from '../services/geminiService';
import { Product, Supplier } from '../types';
import logger from '../utils/logger';

class AIController {
  private geminiService: GeminiService;

  constructor(apiKey: string) {
    this.geminiService = new GeminiService(apiKey);
  }

  // Ask Dukaan Mitra
  async askDukaanMitra(req: Request, res: Response): Promise<void> {
    try {
      const { query, products = [], suppliers = [], shopType = 'General Store' } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Query is required and must be a string'
        });
        return;
      }

      if (query.length > 1000) {
        res.status(400).json({
          success: false,
          error: 'Query is too long. Maximum 1000 characters allowed.'
        });
        return;
      }

      const response = await this.geminiService.askDukaanMitra(
        query,
        products as Product[],
        suppliers as Supplier[],
        shopType
      );

      logger.info(`AI query processed: ${query.substring(0, 50)}...`);
      
      res.json({
        success: true,
        data: {
          text: response
        }
      });
    } catch (error) {
      logger.error('AI controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process AI request'
      });
    }
  }

  // Health check for AI service
  async healthCheck(req: Request, res: Response): Promise<void> {
    try {
      // Test with a simple query
      const testResponse = await this.geminiService.askDukaanMitra(
        'Hello, are you working?',
        [],
        [],
        'Test Shop'
      );

      res.json({
        success: true,
        data: {
          status: 'healthy',
          response: testResponse.substring(0, 100) + '...'
        }
      });
    } catch (error) {
      logger.error('AI health check failed:', error);
      res.status(500).json({
        success: false,
        error: 'AI service is not available'
      });
    }
  }
}

export default AIController;