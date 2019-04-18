import * as NodeCache from 'node-cache';

export class Cache {

    private cache: NodeCache;

    constructor(ttlSeconds: number = 60 * 30) {
        this.cache = new NodeCache({ stdTTL: ttlSeconds, checkperiod: ttlSeconds * 0.2 });
    }

    public set(key: string, obj: any): void {

        this.cache.set(key, obj);
    }

    public get(key: string): Promise<any> {

        return new Promise<any>((resolve: any) => {

            this.cache.get(key, (err: any, value: any) => {

                if (err) {
                    return resolve(undefined);

                } else {

                    if (value === undefined) {

                        return resolve(undefined); // key not found
                    } else {

                        return resolve(value);
                    }
                }
            });
        });
    }

    public delete(keys: any) {
        this.cache.del(keys);
    }

    public flush() {
        this.cache.flushAll();
    }
}