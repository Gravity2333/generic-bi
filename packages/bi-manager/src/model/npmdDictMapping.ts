import { NPMD_DICT_FLEID_LIST } from "@bi/common";
import { BaseTable } from "@midwayjs/sequelize";
import {
  Column,
  CreatedAt,
  DataType,
  Default,
  DeletedAt,
  IsUUID,
  Model,
  PrimaryKey,
  UpdatedAt,
} from "sequelize-typescript";

@BaseTable({ tableName: "bi_npmd_dict_mapping" })
export default class NpmdDictMapping extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column({ type: DataType.UUIDV4, comment: "ID" })
  id: string;

  @Column({ type: DataType.STRING, comment: "表名" })
  table_name: string;

  @Column({ type: DataType.STRING, comment: "表字段" })
  table_field: string;

  @Column({
    type: DataType.ENUM(...NPMD_DICT_FLEID_LIST),
    comment: "表字段关联到字典中的字段",
  })
  dict_field: string;

  @CreatedAt
  @Column
  created_at: Date;

  @UpdatedAt
  @Column
  updated_at: Date;

  @DeletedAt
  @Column
  deleted_at?: Date;
}
