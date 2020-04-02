'use strict';

import DNSClient from '../../src/DNSClient';

describe('DNS Queries over HTTPS', () => {

    it('receives query responses', async () => {
        expect.assertions(1);

        let client = new DNSClient('http', 'https://cloudflare-dns.com/dns-query');
        let msg = await client.query({name: 'google.com', type: 1, qClass: 1});
        console.log('message', JSON.stringify(msg));
        expect(msg.header.id).toEqual(0);
    });
});
