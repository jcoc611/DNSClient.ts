'use strict';

import DNSClient from '../../src/DNSClient';
import { ValidateResponse } from '../utils';

describe('DNS Queries over TCP', () => {

    it('receives query responses', async () => {
        let client = new DNSClient('tcp', '1.1.1.1');
        let msg = await client.query({name: 'google.com', type: 1, qClass: 1});
        console.log('message', JSON.stringify(msg));
        ValidateResponse(msg);
    });
});
