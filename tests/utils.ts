'use strict';
import { IMessage } from '../src/interfaces';

export function ValidateResponse(msgResponse: IMessage) {
    expect(msgResponse.header.id === 0).toBeTruthy();
    expect(msgResponse.answers.length > 0).toBeTruthy();
    expect(msgResponse.answers[0].ttl > 0).toBeTruthy();
    expect(msgResponse.answers[0].rdLength > 0).toBeTruthy();
}
