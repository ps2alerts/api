import { Column } from 'typeorm';

export default class FacilityControl {
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
