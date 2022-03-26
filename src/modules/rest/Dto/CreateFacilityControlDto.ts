// @See modules/data/entities/instance/instance.facilitycontrol.entity.ts
import {Faction} from '../../data/constants/faction.consts';
import MapControlEmbed from '../../data/entities/instance/mapcontrol.embed.ts';

export class CreateFacilityControlDto {
    instance: string;
    facility: number;
    timestamp: Date;
    oldFaction: Faction;
    newFaction: Faction;
    durationHeld: number;
    isInitial: boolean;
    outfitCaptured?: string | null;
    mapControl: MapControlEmbed;
}
