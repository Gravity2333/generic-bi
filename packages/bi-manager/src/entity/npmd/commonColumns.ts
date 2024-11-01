import { Column, Generated, PrimaryColumn } from "typeorm";
import { EBooleanString } from "../../interface";

export class NpmdCommonColumns {
  @PrimaryColumn()
  @Generated("uuid")
  id: string;

  @Column()
  name: string;

  @Column({
    type: "enum",
    enum: EBooleanString,
    default: EBooleanString.False,
  })
  deleted: EBooleanString;

  @Column("timestamp with time zone", { name: "create_time", nullable: true })
  create_time: Date | null;
}
