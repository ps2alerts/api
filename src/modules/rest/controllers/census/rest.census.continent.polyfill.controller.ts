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

    @Get('regions/:zone/:version')
    @ApiOperation({summary: 'Return a specifically formatted census replacement for continent map data'})
    @ApiResponse({
        status: 200,
        description: 'Census map_region_data polyfill alongside lattice links',
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
