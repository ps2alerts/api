import {BadRequestException, Controller, Get, Param, Query, ServiceUnavailableException} from '@nestjs/common';
import {ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags} from '@nestjs/swagger';
import ProfileService from '../../../services/profile/profile.service';
import SearchIndexService from '../../../services/search.index.service';
import {
    ProfileAlertsPage,
    ProfileMembersPage,
    ProfileQuery,
    ProfileSummary,
    ProfileTimelineRow,
    ProfileType,
    TimelineGranularity,
} from '../../../services/profile/profile.types';
import {OptionalIntPipe} from '../pipes/OptionalIntPipe';
import {World} from '../../data/ps2alerts-constants/world';

const PROFILE_TYPES: ProfileType[] = ['character', 'outfit'];
const GRANULARITIES: TimelineGranularity[] = ['day', 'week', 'month', 'year'];

const COMMON_QUERIES = [
    {name: 'world', required: false, type: Number, description: 'Disambiguates ids shared across platforms or merged servers'},
    {name: 'days', required: false, type: Number, description: 'Only count alerts started within the last N days'},
];

// Player and outfit profile data, computed server-side so the website never has to download a full alert history
@ApiTags('Profiles')
@Controller('profiles')
export default class RestProfileController {
    constructor(
        private readonly profileService: ProfileService,
        private readonly searchIndexService: SearchIndexService,
    ) {}

    @Get(':type/:id')
    @ApiOperation({summary: 'Combat totals per bracket, win rate and alert counts for a character or outfit'})
    @ApiParam({name: 'type', enum: PROFILE_TYPES})
    @ApiQuery(COMMON_QUERIES[0])
    @ApiQuery(COMMON_QUERIES[1])
    @ApiResponse({status: 200, description: 'The profile summary', type: Object})
    async summary(
        @Param('type') type: string,
            @Param('id') id: string,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('days', OptionalIntPipe) days?: number,
    ): Promise<ProfileSummary> {
        return await this.profileService.summary(this.query(type, id, world, days));
    }

    @Get(':type/:id/timeline')
    @ApiOperation({summary: 'Combat totals per bracket bucketed over time for a character or outfit'})
    @ApiParam({name: 'type', enum: PROFILE_TYPES})
    @ApiQuery(COMMON_QUERIES[0])
    @ApiQuery(COMMON_QUERIES[1])
    @ApiQuery({name: 'granularity', required: false, enum: GRANULARITIES, description: 'Bucket size, default month'})
    @ApiResponse({status: 200, description: 'One row per bucket per bracket', type: Object, isArray: true})
    async timeline(
        @Param('type') type: string,
            @Param('id') id: string,
            @Query('granularity') granularity?: string,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('days', OptionalIntPipe) days?: number,
    ): Promise<ProfileTimelineRow[]> {
        const unit = (granularity ?? 'month') as TimelineGranularity;

        if (!GRANULARITIES.includes(unit)) {
            throw new BadRequestException(`granularity must be one of ${GRANULARITIES.join(', ')}`);
        }

        return await this.profileService.timeline(this.query(type, id, world, days), unit);
    }

    @Get(':type/:id/alerts')
    @ApiOperation({summary: 'A page of the alerts a character or outfit has taken part in'})
    @ApiParam({name: 'type', enum: PROFILE_TYPES})
    @ApiQuery(COMMON_QUERIES[0])
    @ApiQuery(COMMON_QUERIES[1])
    @ApiQuery({name: 'page', required: false, type: Number})
    @ApiQuery({name: 'pageSize', required: false, type: Number, description: 'Default 20, max 100'})
    @ApiQuery({name: 'sortBy', required: false, type: String, description: 'instance, kills, deaths, headshots, teamKills, teamKilled, suicides, participants, timeStarted or bracket'})
    @ApiQuery({name: 'order', required: false, enum: ['asc', 'desc']})
    @ApiResponse({status: 200, description: 'Items plus the total row count', type: Object})
    async alerts(
        @Param('type') type: string,
            @Param('id') id: string,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('days', OptionalIntPipe) days?: number,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
    ): Promise<ProfileAlertsPage> {
        return await this.profileService.alerts(
            this.query(type, id, world, days),
            page ?? 1,
            pageSize ?? 20,
            sortBy ?? 'instance',
            order === 'asc' ? 'asc' : 'desc',
        );
    }

    @Get('outfit/:id/members')
    @ApiOperation({summary: 'A page of the characters whose last known outfit is this one'})
    @ApiQuery(COMMON_QUERIES[0])
    @ApiQuery({name: 'page', required: false, type: Number})
    @ApiQuery({name: 'pageSize', required: false, type: Number, description: 'Default 20, max 100'})
    @ApiQuery({name: 'sortBy', required: false, type: String, description: 'kills, deaths, headshots, teamKills, suicides, character.name or character.adjustedBattleRank'})
    @ApiQuery({name: 'order', required: false, enum: ['asc', 'desc']})
    @ApiResponse({status: 200, description: 'Items plus the total member count', type: Object})
    @ApiResponse({status: 503, description: 'The members index is still being built'})
    async members(
        @Param('id') id: string,
            @Query('world', OptionalIntPipe) world?: World,
            @Query('page', OptionalIntPipe) page?: number,
            @Query('pageSize', OptionalIntPipe) pageSize?: number,
            @Query('sortBy') sortBy?: string,
            @Query('order') order?: string,
    ): Promise<ProfileMembersPage> {
        if (!this.searchIndexService.isReady(['outfitMembers'])) {
            throw new ServiceUnavailableException('Outfit members are unavailable while their index is being built');
        }

        return await this.profileService.members(
            this.query('outfit', id, world),
            page ?? 1,
            pageSize ?? 20,
            sortBy ?? 'kills',
            order === 'asc' ? 'asc' : 'desc',
        );
    }

    private query(type: string, id: string, world?: World, days?: number): ProfileQuery {
        if (!PROFILE_TYPES.includes(type as ProfileType)) {
            throw new BadRequestException(`type must be one of ${PROFILE_TYPES.join(', ')}`);
        }

        if (days !== undefined && (days < 1 || days > 3650)) {
            throw new BadRequestException('days must be between 1 and 3650');
        }

        return {type: type as ProfileType, id, world, days};
    }
}
