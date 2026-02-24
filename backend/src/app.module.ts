import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrigensModule } from './origens/origens.module';
import { DestinosModule } from './destinos/destinos.module';
import { EtiquetasModule } from './etiquetas/etiquetas.module';
import { TiposPagamentoModule } from './tipos-pagamento/tipos-pagamento.module';
import { LancamentosModule } from './lancamentos/lancamentos.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || undefined,
      host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'localhost'),
      port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DATABASE_URL ? undefined : (process.env.DB_USER || 'postgres'),
      password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASS || 'postgres'),
      database: process.env.DATABASE_URL ? undefined : (process.env.DB_NAME || 'fluxo_caixa'),
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false,
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
    }),
    AuthModule,
    UsersModule,
    OrigensModule,
    DestinosModule,
    EtiquetasModule,
    TiposPagamentoModule,
    LancamentosModule,
    DashboardModule,
  ],
})
export class AppModule {}
