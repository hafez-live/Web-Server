import { Module } from '@nestjs/common';

import { DatabaseModule } from '@/database/database.module';

import { PoemService } from './poem.service';
import { PoemController } from './poem.controller';

@Module
({
    imports: [DatabaseModule],
    controllers: [PoemController],
    providers: [PoemService]
})
export class PoemModule
{ }
