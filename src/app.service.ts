import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { OnModuleInit } from '@nestjs/common'

@Injectable()
export class AppService implements OnModuleInit {
    constructor(private service: ConfigService) {}

    onModuleInit() {
        console.log("hahahahahah" + this.service.get('DATABASE_URL'))
        console.log("hahahahahah" + this.service.get('POSTGRES_HOST'))
        console.log("hahahahahah" + this.service.get('POSTGRES_DB'))
    }

    getHello(): string {
        return 'Hello World!'
    }
}
