import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot(
      isProd
        ? {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            username: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASS || 'YOUR_DB_PASSWORD',
            database: process.env.DB_NAME || 'nestdb',
            autoLoadEntities: true,
            synchronize: false,
          }
        : {
            type: 'sqlite',
            database: process.env.SQLITE_DB_PATH || 'dev.sqlite',
            autoLoadEntities: true,
            synchronize: true,
          },
    ),

    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}


