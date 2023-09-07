import { randomBytes } from 'crypto';

import { BigInteger } from 'jsbn';
import * as sha1 from 'js-sha1';

export class SRP6
{
    public static calculateSRP6Verifier(username: string, password: string, salt?: Buffer): Buffer
    {
        if (!salt)
            salt = randomBytes(32);

        const N: BigInteger = new BigInteger('894B645E89E1535BBDAD5B8B290650530801B18EBFBF5E8FAB3C82872A3E9BB7', 16);
        const g: BigInteger = new BigInteger('7', 16);

        const h1: Buffer = Buffer.from(sha1.arrayBuffer(`${ username }:${ password }`.toUpperCase()));

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        /// @TODO FIX ME - REMOVE ESLINT DISABLE
        const h2: Buffer = Buffer.from(sha1.arrayBuffer(Buffer.concat([salt, h1]))).reverse();

        const h2bigint: BigInteger = new BigInteger(h2.toString('hex'), 16);

        const verifierBigint: BigInteger = g.modPow(h2bigint, N);

        let verifier: Buffer = Buffer.from(verifierBigint.toByteArray()).reverse();
        verifier = verifier.slice(0, 32);
        if (verifier.length != 32)
            verifier = Buffer.concat([verifier], 32);

        return verifier;
    }

    public static GetSRP6RegistrationData(username: string, password: string): Array<Buffer>
    {
        const salt: Buffer = randomBytes(32);

        const verifier: Buffer = this.calculateSRP6Verifier(username, password, salt);

        return [salt, verifier];
    }

    public static verifySRP6(username: string, password: string, salt: Buffer, verifier: Buffer): boolean
    {
        const generated: Buffer = this.calculateSRP6Verifier(username, password, salt);

        return Buffer.compare(generated, verifier) === 0;
    }
}
