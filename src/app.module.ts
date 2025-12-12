import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // Import ConfigService
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

// Use a boolean check for production
const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    // 1. Load configuration first
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Use TypeOrmModule.forRootAsync for dynamic config loading
    TypeOrmModule.forRootAsync({
      // Inject ConfigService to access environment variables reliably
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // --- LOCAL DEVELOPMENT (NODE_ENV != 'production') ---
        if (!isProd) {
          return {
            type: 'sqlite',
            database: configService.get<string>('SQLITE_DB_PATH') || 'dev.sqlite',
            autoLoadEntities: true,
            synchronize: true, // Safe for dev/test
          };
        }

        // --- PRODUCTION DEPLOYMENT (NODE_ENV === 'production') ---

        // Option A: Using individual variables (More flexible but requires validation)
        // This requires you to set DB_HOST, DB_USER, DB_PASS, DB_NAME in the deployment environment.
        const dbHost = configService.get<string>('DB_HOST');
        const dbUser = configService.get<string>('DB_USER');
        const dbPass = configService.get<string>('DB_PASS');
        const dbName = configService.get<string>('DB_NAME');
        const dbPort = configService.get<number>('DB_PORT') || 5432; // Default to 5432 for Postgres

        // *** CRITICAL VALIDATION FIX ***
        // Throw an error if the necessary connection variables are missing in production.
        // This prevents the app from falling back to 'localhost' and causing ECONNREFUSED.
        if (!dbHost || !dbUser || !dbPass || !dbName) {
            throw new Error('FATAL ERROR: Production database connection variables (DB_HOST, DB_USER, etc.) are not set.');
        }

        return {
          type: 'postgres',
          host: dbHost,
          port: dbPort,
          username: dbUser,
          password: dbPass,
          database: dbName,
          autoLoadEntities: true,
          synchronize: false, // Recommended: set to false for production
          
          // CRITICAL: Add SSL configuration for cloud databases (like Render, Heroku)
          // Most cloud providers require SSL connections.
          ssl: isProd ? { rejectUnauthorized: false } : false,
        };

        // Option B: Alternative using DATABASE_URL (Cleanest approach)
        /*
        const dbUrl = configService.get<string>('DATABASE_URL');
        if (!dbUrl) {
           throw new Error('FATAL ERROR: DATABASE_URL environment variable is not set for production.');
        }
        return {
          type: 'postgres',
          url: dbUrl,
          autoLoadEntities: true,
          synchronize: false,
          ssl: isProd ? { rejectUnauthorized: false } : false,
        };
        */
      },
    }),

    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}