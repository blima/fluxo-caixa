export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'fluxo-caixa-jwt-secret-2024',
  signOptions: { expiresIn: '24h' },
};
