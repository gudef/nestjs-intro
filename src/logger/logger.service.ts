import { Injectable } from '@nestjs/common';
import { MessageFormatterService } from './../message-formatter/message-formatter.service';


@Injectable()
export class LoggerService {
    constructor(
        private readonly messageFotmatterService: MessageFormatterService
    ) { }

    log(message: string): string {
        const formattedMessage = this.messageFotmatterService.format(message);
        console.log(message);

        return formattedMessage;
    }
}
