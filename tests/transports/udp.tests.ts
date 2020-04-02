'use strict';

import DNSClient from '../../src/DNSClient';
import { ValidateResponse } from '../utils';

import { RecordType, RecordClass } from '../../src/interfaces';

describe('DNS Queries over UDP', () => {
    it('receives query responses', async () => {
        let client = new DNSClient('udp', '1.1.1.1');
        let msg = await client.query({
            name: 'google.com',
            type: RecordType.A,
            qClass: RecordClass.IN
        });
        console.log('message', JSON.stringify(msg));
        ValidateResponse(msg);
    });
});
