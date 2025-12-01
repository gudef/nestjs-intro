import { AuthConfig } from './../config/auth.config';
import { TypedConfigService } from './../config/typed-config.service';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PasswordService } from './password/password.service';
import { UserService } from './user/user.service';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './roles.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: TypedConfigService) => {
                const auth = config.get<AuthConfig>('auth', { infer: true }); // ✅ type-safe
                if (!auth?.jwt?.secret) {
                    throw new Error('JWT secret is missing (JWT_TOKEN).');
                }

                // ถ้าค่าใน env เป็นตัวเลขล้วน ให้แปลงเป็น number ตามสเปค @nestjs/jwt
                const raw = auth.jwt.expiresIn as unknown as string | number;
                const expiresIn: JwtSignOptions['expiresIn'] =
                    typeof raw === 'number'
                        ? raw
                        : /^\d+$/.test(String(raw))
                            ? Number(raw)
                            : (raw as JwtSignOptions['expiresIn']);

                return {
                    secret: auth.jwt.secret,
                    signOptions: { expiresIn },                 // ✅ ชนิดตรง
                };
            },
        }),
    ],
    providers: [PasswordService, UserService, AuthService, AuthGuard, RolesGuard,
        {
            provide: APP_GUARD,
            useClass: AuthGuard
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard
        },
    ],
    controllers: [AuthController],
})
export class UsersModule { }