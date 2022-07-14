import {Controller, Get, Param, ParseIntPipe} from '@nestjs/common';
import {ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {RedisCacheService} from '../../../../services/cache/redis.cache.service';
import * as fs from 'fs';
import path from 'path';

@ApiTags('Census Map Data Provider')
@Controller('census')
export default class RestCensusContinentPolyfillController {
    constructor(
        private readonly cacheService: RedisCacheService,
    ) {}

    @Get('oshur')
    @ApiOperation({summary: 'Return a census replacement for the missing Oshur Data'})
    @ApiResponse({
        status: 200,
        description: 'The Oshur Data',
    })
    async serve(): Promise<string> {
        const key = '/census/oshur-data';

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
            JSON.parse(this.readFile(path.resolve(__dirname, './344-reverse-engineered.json'))),
            1200);
    }

    @Get('oshur-hex')
    @ApiOperation({summary: 'Return a specificly formatted census replacement for Oshur Data'})
    @ApiResponse({
        status: 200,
        description: 'Data used for mapping the Oshur hex overlay',
    })
    async serveHex(): Promise<string> {
        const key = '/census/oshur-hex-data';

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
            JSON.parse(this.readFile(path.resolve(__dirname, './344-mapping-data.json'))),
            1200);
    }

    @Get('regions/:zone/:version')
    @ApiOperation({summary: 'Return a specifically formatted census replacement for continent map data'})
    @ApiResponse({
        status: 200,
        description: 'Data used for mapping a continent\'s hex overlay',
    })
    async serveRegions(
        @Param('zone', ParseIntPipe) zone: number,
            @Param('version') version?: string,
    ): Promise<string> {
        if (!version) {
            version = '1.0';
        }

        const key = `/census/regions/${zone}/${version}`;

        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await this.cacheService.get(key) ?? await this.cacheService.set(
            key,
            // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires
            JSON.parse(this.readFile(path.resolve(__dirname, `../../../data/ps2alerts-constants/maps/regions-${zone}-${version}.json`))),
            1200);
    }

    readFile(filePath: string): string {
        return fs.readFileSync(filePath, {encoding: 'utf8'});
    }
}
