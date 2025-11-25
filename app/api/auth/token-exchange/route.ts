/**
 * Token Exchange API Route
 * POST /api/auth/token-exchange
 * 
 * Exchanges authorization code for access token using grant_type=authorization_code
 * This endpoint explicitly implements the OAuth 2.0 authorization code flow
 */

import { NextRequest, NextResponse } from 'next/server';
import { TokenExchangeController } from '@/backend/controllers/TokenExchange.controller';
import { withErrorHandling } from '@/backend/middleware/error.middleware';

const tokenExchangeController = new TokenExchangeController();

export const POST = withErrorHandling(async (request: NextRequest) => {
  return await tokenExchangeController.exchangeToken(request);
});

