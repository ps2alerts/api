import { Column } from 'typeorm';

export default class FacilityFactionControl {
  @Column({
    type: 'number',
    default: 0,
  })
  captures: number;

  @Column({
    type: 'number',
    default: 0,
  })
  defences: number;
}
